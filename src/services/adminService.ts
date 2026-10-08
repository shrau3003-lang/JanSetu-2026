import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { ProblemReport, QuickStats } from '../types';
import { localStore } from './localStore';
import { mapProblemRow } from './problemsService';

export interface AdminActivityLog {
  id: string;
  action: string;
  target: string;
  user: string;
  time: string;
  type: 'verify' | 'reject' | 'duplicate' | 'route';
}

// Demo data now comes from the shared local store so problems reported by a citizen
// immediately show up in the Government verification queue.
let activityLogs: AdminActivityLog[] = [
  { id: 'a1', action: 'Verified Issue', target: 'Road damage near school', user: 'Admin Officer', time: '10m ago', type: 'verify' },
  { id: 'a2', action: 'Routed to Institute', target: 'Water Quality Monitoring', user: 'Dept Lead', time: '1h ago', type: 'route' },
  { id: 'a3', action: 'Marked Duplicate', target: 'Water shortage Sector 4', user: 'Admin Officer', time: '2h ago', type: 'duplicate' }
];

/** Stat counters derived from the shared demo store. */
const localStats = (): QuickStats => {
  const problems = localStore.getProblems();
  return {
    totalProblems: problems.length,
    pendingVerification: problems.filter((p) => p.status === 'pending').length,
    highPriority: problems.filter((p) => p.priority === 'high' || p.priority === 'critical').length,
    resolved: problems.filter((p) => p.status === 'resolved').length
  };
};

export const adminService = {
  // Real dynamic non-hardcoded stats counters from Supabase
  async fetchAdminStats(): Promise<QuickStats> {
    if (!isSupabaseConfigured()) {
      return localStats();
    }

    try {
      const { count: totalProblems } = await supabase.from('problems').select('*', { count: 'exact', head: true });
      const { count: pendingVerification } = await supabase.from('problems').select('*', { count: 'exact', head: true }).eq('status', 'pending');
      const { count: highPriority } = await supabase.from('problems').select('*', { count: 'exact', head: true }).in('priority', ['high', 'critical']);
      const { count: resolved } = await supabase.from('problems').select('*', { count: 'exact', head: true }).eq('status', 'resolved');

      return {
        totalProblems: totalProblems || 0,
        pendingVerification: pendingVerification || 0,
        highPriority: highPriority || 0,
        resolved: resolved || 0
      };
    } catch (err) {
      console.error('Error fetching admin stats:', err);
      return localStats();
    }
  },

  // Fetch pending problems for verification table
  async fetchPendingProblems(): Promise<ProblemReport[]> {
    if (!isSupabaseConfigured()) {
      return localStore.getProblems().filter((p) => p.status === 'pending');
    }

    const { data, error } = await supabase
      .from('problems')
      .select('*')
      .eq('status', 'pending')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Supabase fetchPendingProblems error:', error);
      throw new Error('Unable to load the verification queue right now.');
    }

    return (data || []).map(mapProblemRow);
  },

  // Every problem on the platform (Admin reports & analytics screens)
  async fetchAllProblems(): Promise<ProblemReport[]> {
    if (!isSupabaseConfigured()) {
      return localStore.getProblems();
    }

    const { data, error } = await supabase
      .from('problems')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Supabase fetchAllProblems error:', error);
      throw new Error('Unable to load civic reports right now.');
    }

    return (data || []).map(mapProblemRow);
  },

  // Official Admin Action: Verify Problem
  async verifyProblem(problemId: string, officerName: string = 'Admin Officer'): Promise<void> {
    if (isSupabaseConfigured()) {
      const { error } = await supabase
        .from('problems')
        .update({ status: 'verified' })
        .eq('id', problemId);

      if (error) {
        console.error('Error verifying problem in Supabase:', error);
        throw error;
      }
    }

    const p = localStore.updateProblem(problemId, { status: 'verified' });

    activityLogs.unshift({
      id: 'act-' + Date.now(),
      action: 'Verified Issue',
      target: p?.title || `Report #${problemId}`,
      user: officerName,
      time: 'Just now',
      type: 'verify'
    });
  },

  // Official Admin Action: Reject Problem
  async rejectProblem(problemId: string, officerName: string = 'Admin Officer'): Promise<void> {
    if (isSupabaseConfigured()) {
      const { error } = await supabase
        .from('problems')
        .update({ status: 'rejected' })
        .eq('id', problemId);

      if (error) {
        console.error('Error rejecting problem in Supabase:', error);
        throw error;
      }
    }

    const p = localStore.updateProblem(problemId, { status: 'rejected' });

    activityLogs.unshift({
      id: 'act-' + Date.now(),
      action: 'Rejected Issue',
      target: p?.title || `Report #${problemId}`,
      user: officerName,
      time: 'Just now',
      type: 'reject'
    });
  },

  // Official Admin Action: Mark as Duplicate
  async markDuplicateProblem(problemId: string, duplicateOfId?: string, officerName: string = 'Admin Officer'): Promise<void> {
    if (isSupabaseConfigured()) {
      const { error } = await supabase
        .from('problems')
        .update({ status: 'rejected' })
        .eq('id', problemId);

      if (error) {
        console.error('Error marking duplicate in Supabase:', error);
        throw error;
      }
    }

    const p = localStore.updateProblem(problemId, { status: 'rejected' });

    activityLogs.unshift({
      id: 'act-' + Date.now(),
      action: 'Marked Duplicate',
      target: p?.title || `Report #${problemId}`,
      user: officerName,
      time: 'Just now',
      type: 'duplicate'
    });
  },

  // Fetch recent activity audit logs
  async fetchRecentActivity(): Promise<AdminActivityLog[]> {
    return activityLogs;
  }
};
