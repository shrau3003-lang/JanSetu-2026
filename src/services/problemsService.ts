import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { ProblemReport, QuickStats, PriorityLevel, ProblemCategory, ProblemStatus } from '../types';
import { localStore, LocalComment } from './localStore';

export type ProblemComment = LocalComment;

export type FeedTab = 'For You' | 'Nearby' | 'Trending' | 'Latest' | string;

const DEFAULT_IMAGE =
  'https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&w=800&q=80';

/** Maps a raw Supabase `problems` row onto the app-level ProblemReport shape. */
export const mapProblemRow = (item: any): ProblemReport => ({
  id: item.id,
  title: item.title,
  description: item.description,
  category: item.category as ProblemCategory,
  priority: item.priority as PriorityLevel,
  status: item.status as ProblemStatus,
  location: item.location,
  supportersCount: item.supporters_count || 0,
  commentsCount: item.comments_count || 0,
  createdAt: item.created_at
    ? new Date(item.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
    : 'Recently',
  createdAtIso: item.created_at || undefined,
  imageUrl: item.image_url || DEFAULT_IMAGE,
  author_id: item.author_id
});

/** Best-effort sortable timestamp; unknown dates sort to the bottom. */
const toTimestamp = (p: ProblemReport): number => {
  const parsed = Date.parse(p.createdAtIso || p.createdAt);
  return Number.isNaN(parsed) ? 0 : parsed;
};

/** Applies tab ordering/filtering consistently for both Supabase and demo datasets. */
const applyTabOrdering = (items: ProblemReport[], tab: FeedTab): ProblemReport[] => {
  const result = [...items];
  switch (tab) {
    case 'Trending':
      return result.sort((a, b) => b.supportersCount - a.supportersCount);
    case 'Nearby':
      // Closest first; entries without a known distance sink to the bottom.
      return result.sort((a, b) => {
        const da = a.distanceKm ?? Number.POSITIVE_INFINITY;
        const db = b.distanceKm ?? Number.POSITIVE_INFINITY;
        if (da === db) return b.supportersCount - a.supportersCount;
        return da - db;
      });
    case 'Latest':
      return result.sort((a, b) => toTimestamp(b) - toTimestamp(a));
    default:
      return result;
  }
};

/** Free-text filter used by the navbar search box. */
export const filterProblemsByQuery = (items: ProblemReport[], query?: string | null): ProblemReport[] => {
  const q = (query || '').trim().toLowerCase();
  if (!q) return items;
  return items.filter(
    (p) =>
      p.title.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      p.location.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q)
  );
};

export const problemsService = {
  /** Fetch problems from Supabase, or from the shared demo store when not configured. */
  async fetchProblems(
    category?: string | null,
    tab: FeedTab = 'For You',
    _userId?: string,
    query?: string | null
  ): Promise<ProblemReport[]> {
    if (!isSupabaseConfigured()) {
      let result = localStore.getProblems();
      if (category) result = result.filter((p) => p.category === category);
      return filterProblemsByQuery(applyTabOrdering(result, tab), query);
    }

    try {
      let dbQuery = supabase.from('problems').select('*');

      if (category) {
        dbQuery = dbQuery.eq('category', category);
      }

      if (tab === 'Trending') {
        dbQuery = dbQuery.order('supporters_count', { ascending: false });
      } else {
        dbQuery = dbQuery.order('created_at', { ascending: false });
      }

      const { data, error } = await dbQuery;

      if (error) {
        console.error('Supabase fetchProblems error:', error);
        throw new Error('Unable to load community reports right now.');
      }

      const mapped = (data || []).map(mapProblemRow);
      return filterProblemsByQuery(applyTabOrdering(mapped, tab), query);
    } catch (err) {
      console.error('Error in fetchProblems:', err);
      throw err instanceof Error ? err : new Error('Unable to load community reports right now.');
    }
  },

  /** Reports authored by the signed-in citizen. */
  async getMyReports(userId?: string): Promise<ProblemReport[]> {
    if (!userId) return [];

    if (!isSupabaseConfigured()) {
      return localStore.getProblemsByAuthor(userId);
    }

    const { data, error } = await supabase
      .from('problems')
      .select('*')
      .eq('author_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Supabase getMyReports error:', error);
      throw new Error('Unable to load your reports right now.');
    }

    return (data || []).map(mapProblemRow);
  },

  /** Problems the signed-in citizen has supported (voted on). */
  async getSupportedProblems(userId?: string): Promise<ProblemReport[]> {
    if (!userId) return [];

    if (!isSupabaseConfigured()) {
      const ids = new Set(localStore.getVotedProblemIds(userId));
      return localStore.getProblems().filter((p) => ids.has(p.id));
    }

    const { data: votes, error: voteErr } = await supabase
      .from('votes')
      .select('problem_id')
      .eq('user_id', userId);

    if (voteErr) {
      console.error('Supabase getSupportedProblems (votes) error:', voteErr);
      throw new Error('Unable to load the problems you supported.');
    }

    const ids = (votes || []).map((v: any) => v.problem_id).filter(Boolean);
    if (ids.length === 0) return [];

    const { data, error } = await supabase.from('problems').select('*').in('id', ids);

    if (error) {
      console.error('Supabase getSupportedProblems (problems) error:', error);
      throw new Error('Unable to load the problems you supported.');
    }

    return (data || []).map(mapProblemRow);
  },

  /** Fetch single problem details + whether the active user already supported it. */
  async getProblemDetails(
    id: string,
    userId?: string
  ): Promise<{ problem: ProblemReport | null; hasSupported: boolean }> {
    if (!isSupabaseConfigured()) {
      const local = localStore.getProblem(id) || null;
      return {
        problem: local,
        hasSupported: userId ? localStore.hasVoted(id, userId) : false
      };
    }

    try {
      const { data, error } = await supabase.from('problems').select('*').eq('id', id).maybeSingle();

      if (error) {
        console.error('Supabase getProblemDetails error:', error);
        throw new Error('Unable to load this report right now.');
      }

      if (!data) {
        return { problem: null, hasSupported: false };
      }

      let hasVoted = false;
      if (userId) {
        const { data: voteData } = await supabase
          .from('votes')
          .select('id')
          .eq('problem_id', id)
          .eq('user_id', userId)
          .maybeSingle();
        if (voteData) hasVoted = true;
      }

      return { problem: mapProblemRow(data), hasSupported: hasVoted };
    } catch (err) {
      console.error('Error in getProblemDetails:', err);
      throw err instanceof Error ? err : new Error('Unable to load this report right now.');
    }
  },

  /** Fetch comments for a problem. */
  async fetchComments(problemId: string): Promise<ProblemComment[]> {
    if (!isSupabaseConfigured()) {
      return localStore.getComments(problemId);
    }

    try {
      const { data, error } = await supabase
        .from('comments')
        .select(`
          id,
          problem_id,
          author_id,
          content,
          created_at,
          profiles:author_id ( full_name, avatar_url )
        `)
        .eq('problem_id', problemId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Supabase fetchComments error:', error);
        return [];
      }

      return (data || []).map((c: any) => {
        const prof = Array.isArray(c.profiles) ? c.profiles[0] : c.profiles;
        return {
          id: c.id,
          problem_id: c.problem_id,
          author_id: c.author_id,
          author_name: prof?.full_name || 'JanSetu Citizen',
          author_avatar: prof?.avatar_url,
          content: c.content,
          created_at: new Date(c.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
        };
      });
    } catch (err) {
      console.error('Error fetching comments:', err);
      return [];
    }
  },

  /** Add a comment. `userName` comes from the authenticated profile - never hardcoded. */
  async addComment(
    problemId: string,
    userId: string,
    content: string,
    userName: string
  ): Promise<ProblemComment> {
    const displayName = userName || 'JanSetu Citizen';

    if (!isSupabaseConfigured()) {
      return localStore.addComment({
        id: 'comm-' + Date.now(),
        problem_id: problemId,
        author_id: userId,
        author_name: displayName,
        content,
        created_at: 'Just now'
      });
    }

    const { data, error } = await supabase
      .from('comments')
      .insert([{ problem_id: problemId, author_id: userId, content }])
      .select(`
        id,
        problem_id,
        author_id,
        content,
        created_at,
        profiles:author_id ( full_name, avatar_url )
      `)
      .single();

    if (error || !data) {
      console.error('Error adding comment to Supabase:', error);
      throw new Error('Your comment could not be posted. Please try again.');
    }

    const { data: prob } = await supabase
      .from('problems')
      .select('comments_count')
      .eq('id', problemId)
      .maybeSingle();

    await supabase
      .from('problems')
      .update({ comments_count: (prob?.comments_count || 0) + 1 })
      .eq('id', problemId);

    const prof = Array.isArray((data as any).profiles) ? (data as any).profiles[0] : (data as any).profiles;

    return {
      id: data.id,
      problem_id: data.problem_id,
      author_id: data.author_id,
      author_name: prof?.full_name || displayName,
      author_avatar: prof?.avatar_url,
      content: data.content,
      created_at: 'Just now'
    };
  },

  /** Support / un-support toggle for a single user. */
  async toggleVote(problemId: string, userId: string): Promise<{ supported: boolean; newCount: number }> {
    if (!isSupabaseConfigured()) {
      return localStore.toggleVote(problemId, userId);
    }

    try {
      const { data: existing } = await supabase
        .from('votes')
        .select('id')
        .eq('problem_id', problemId)
        .eq('user_id', userId)
        .maybeSingle();

      const { data: prob } = await supabase
        .from('problems')
        .select('supporters_count')
        .eq('id', problemId)
        .maybeSingle();

      if (existing) {
        await supabase.from('votes').delete().eq('id', existing.id);
        const updated = Math.max(0, (prob?.supporters_count || 1) - 1);
        await supabase.from('problems').update({ supporters_count: updated }).eq('id', problemId);
        return { supported: false, newCount: updated };
      }

      await supabase.from('votes').insert([{ problem_id: problemId, user_id: userId }]);
      const updated = (prob?.supporters_count || 0) + 1;
      await supabase.from('problems').update({ supporters_count: updated }).eq('id', problemId);
      return { supported: true, newCount: updated };
    } catch (err) {
      console.error('Error in toggleVote:', err);
      throw new Error('Your support could not be recorded. Please try again.');
    }
  },

  /** Live citizen stat counters. */
  async fetchCitizenStats(userId?: string): Promise<QuickStats> {
    if (!isSupabaseConfigured()) {
      const problems = localStore.getProblems();
      return {
        totalProblems: problems.length,
        yourReports: userId ? problems.filter((p) => p.author_id === userId).length : 0,
        supported: localStore.countVotes(userId),
        resolved: problems.filter((p) => p.status === 'resolved').length
      };
    }

    try {
      const { count: totalProblems } = await supabase
        .from('problems')
        .select('*', { count: 'exact', head: true });
      const { count: resolved } = await supabase
        .from('problems')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'resolved');

      let myReports = 0;
      let supported = 0;

      if (userId) {
        const { count: mine } = await supabase
          .from('problems')
          .select('*', { count: 'exact', head: true })
          .eq('author_id', userId);
        const { count: sup } = await supabase
          .from('votes')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', userId);
        myReports = mine || 0;
        supported = sup || 0;
      }

      return {
        totalProblems: totalProblems || 0,
        yourReports: myReports,
        supported,
        resolved: resolved || 0
      };
    } catch (err) {
      console.error('Error fetching citizen stats:', err);
      return { totalProblems: 0, yourReports: 0, supported: 0, resolved: 0 };
    }
  },

  /** Create a simple report (used by the quick-report modal). */
  async createProblem(
    report: {
      title: string;
      description: string;
      category: ProblemCategory;
      location: string;
      priority?: PriorityLevel;
      imageUrl?: string;
    },
    userId?: string
  ): Promise<ProblemReport> {
    return this.createFullProblemReport(
      { ...report, latitude: 23.3441, longitude: 85.3096 },
      userId
    );
  },

  /** Full report submission (map coordinates + photo evidence). */
  async createFullProblemReport(
    report: {
      title: string;
      description: string;
      category: ProblemCategory;
      location: string;
      latitude: number;
      longitude: number;
      priority?: PriorityLevel;
      imageFile?: File | null;
      imageUrl?: string;
      evidenceNotes?: string;
    },
    userId?: string
  ): Promise<ProblemReport> {
    let finalImageUrl = report.imageUrl || DEFAULT_IMAGE;

    if (report.imageFile) {
      finalImageUrl = await this.uploadProblemMedia(report.imageFile);
    }

    if (!isSupabaseConfigured()) {
      const createdItem: ProblemReport = {
        id: 'prob-' + Date.now(),
        title: report.title,
        description: report.description,
        category: report.category,
        priority: report.priority || 'medium',
        status: 'pending',
        location: report.location,
        distanceKm: 0.5,
        supportersCount: 1,
        commentsCount: 0,
        createdAt: 'Just now',
        createdAtIso: new Date().toISOString(),
        imageUrl: finalImageUrl,
        author_id: userId
      };
      // Written to the shared demo store so the Admin queue and the Institute
      // "Available Challenges" page both pick it up immediately.
      localStore.addProblem(createdItem);
      if (userId) localStore.toggleVote(createdItem.id, userId);
      return createdItem;
    }

    const payload = {
      title: report.title,
      description: report.description,
      category: report.category,
      location: report.location,
      latitude: report.latitude,
      longitude: report.longitude,
      priority: report.priority || 'medium',
      status: 'pending',
      image_url: finalImageUrl,
      author_id: userId,
      supporters_count: 1
    };

    const { data, error } = await supabase.from('problems').insert([payload]).select().single();

    if (error || !data) {
      console.error('Supabase createFullProblemReport error:', error);
      throw new Error('Your report could not be saved. Please check your connection and try again.');
    }

    return mapProblemRow(data);
  },

  /** Supabase Storage upload with a local object-URL fallback in demo mode. */
  async uploadProblemMedia(file: File): Promise<string> {
    if (!isSupabaseConfigured()) {
      return URL.createObjectURL(file);
    }

    const fileExt = file.name.split('.').pop();
    const fileName = `reports/${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;

    const { error } = await supabase.storage
      .from('problems-media')
      .upload(fileName, file, { cacheControl: '3600', upsert: true });

    if (error) {
      console.error('Supabase storage upload failed, using local preview URL instead:', error);
      return URL.createObjectURL(file);
    }

    const { data: publicData } = supabase.storage.from('problems-media').getPublicUrl(fileName);
    return publicData.publicUrl;
  }
};
