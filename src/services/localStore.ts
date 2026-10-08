import { ProblemReport, InstituteProject } from '../types';
import { mockProblems } from './api';

/**
 * JanSetu Demo/Mock Data Store
 * ----------------------------
 * Single shared source of truth used by every service when Supabase is NOT configured.
 *
 * Previously each service (problemsService / adminService / instituteService) kept its own
 * private copy of `mockProblems`, so a problem created by a citizen was invisible to the
 * Admin and Institute portals. Everything now reads and writes through this module.
 *
 * Data is persisted to localStorage so a browser refresh keeps the demo state.
 */

const STORAGE_KEY = 'jansetu.demo.store.v1';

export interface LocalComment {
  id: string;
  problem_id: string;
  author_id: string;
  author_name: string;
  author_avatar?: string;
  content: string;
  created_at: string;
}

/** A project created locally by accepting a challenge in demo mode. */
export interface LocalProject extends InstituteProject {
  problemId?: string;
  instituteId?: string;
  createdAt?: string;
}

interface LocalDB {
  problems: ProblemReport[];
  /** vote keys shaped as `${problemId}::${userId}` */
  votes: string[];
  comments: Record<string, LocalComment[]>;
  projects: LocalProject[];
}

const SEED_COMMENTS: Record<string, LocalComment[]> = {
  '1640': [
    {
      id: 'c1',
      problem_id: '1640',
      author_id: 'seed-u1',
      author_name: 'Pooja S.',
      content: 'This is really serious. Please take action soon!',
      created_at: '2 days ago'
    },
    {
      id: 'c2',
      problem_id: '1640',
      author_id: 'seed-u2',
      author_name: 'Rohan V.',
      content: 'We have reported this to the ward officer as well.',
      created_at: '1 day ago'
    }
  ]
};

const createInitialDB = (): LocalDB => ({
  problems: mockProblems.map((p) => ({ ...p })),
  votes: [],
  comments: JSON.parse(JSON.stringify(SEED_COMMENTS)),
  projects: []
});

const isBrowser = (): boolean => typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';

let db: LocalDB | null = null;

const read = (): LocalDB => {
  if (db) return db;

  if (isBrowser()) {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<LocalDB>;
        db = {
          problems: Array.isArray(parsed.problems) && parsed.problems.length > 0
            ? parsed.problems
            : createInitialDB().problems,
          votes: Array.isArray(parsed.votes) ? parsed.votes : [],
          comments: parsed.comments && typeof parsed.comments === 'object' ? parsed.comments : {},
          projects: Array.isArray(parsed.projects) ? parsed.projects : []
        };
        return db;
      }
    } catch (err) {
      console.warn('[localStore] Could not read persisted demo data, starting fresh:', err);
    }
  }

  db = createInitialDB();
  persist();
  return db;
};

const persist = (): void => {
  if (!isBrowser() || !db) return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
  } catch (err) {
    // Quota / private-mode failures must never break the UI — the in-memory copy still works.
    console.warn('[localStore] Could not persist demo data:', err);
  }
};

const voteKey = (problemId: string, userId: string) => `${problemId}::${userId}`;

export const localStore = {
  /* ------------------------------------------------------------------ problems */

  getProblems(): ProblemReport[] {
    return read().problems.map((p) => ({ ...p }));
  },

  getProblem(id: string): ProblemReport | undefined {
    const found = read().problems.find((p) => p.id === id);
    return found ? { ...found } : undefined;
  },

  addProblem(problem: ProblemReport): ProblemReport {
    const store = read();
    if (!store.problems.some((p) => p.id === problem.id)) {
      store.problems.unshift({ ...problem });
      persist();
    }
    return { ...problem };
  },

  updateProblem(id: string, patch: Partial<ProblemReport>): ProblemReport | undefined {
    const store = read();
    const target = store.problems.find((p) => p.id === id);
    if (!target) return undefined;
    Object.assign(target, patch);
    persist();
    return { ...target };
  },

  getProblemsByAuthor(userId?: string): ProblemReport[] {
    if (!userId) return [];
    return read().problems.filter((p) => p.author_id === userId).map((p) => ({ ...p }));
  },

  /* --------------------------------------------------------------------- votes */

  hasVoted(problemId: string, userId: string): boolean {
    return read().votes.includes(voteKey(problemId, userId));
  },

  getVotedProblemIds(userId?: string): string[] {
    if (!userId) return [];
    const suffix = `::${userId}`;
    return read()
      .votes.filter((k) => k.endsWith(suffix))
      .map((k) => k.slice(0, k.length - suffix.length));
  },

  countVotes(userId?: string): number {
    return this.getVotedProblemIds(userId).length;
  },

  toggleVote(problemId: string, userId: string): { supported: boolean; newCount: number } {
    const store = read();
    const key = voteKey(problemId, userId);
    const problem = store.problems.find((p) => p.id === problemId);
    const idx = store.votes.indexOf(key);

    if (idx >= 0) {
      store.votes.splice(idx, 1);
      if (problem) problem.supportersCount = Math.max(0, problem.supportersCount - 1);
    } else {
      store.votes.push(key);
      if (problem) problem.supportersCount += 1;
    }

    persist();
    return { supported: idx < 0, newCount: problem ? problem.supportersCount : 0 };
  },

  /* ------------------------------------------------------------------ comments */

  getComments(problemId: string): LocalComment[] {
    return (read().comments[problemId] || []).map((c) => ({ ...c }));
  },

  addComment(comment: LocalComment): LocalComment {
    const store = read();
    if (!store.comments[comment.problem_id]) {
      store.comments[comment.problem_id] = [];
    }
    store.comments[comment.problem_id].push({ ...comment });

    const problem = store.problems.find((p) => p.id === comment.problem_id);
    if (problem) problem.commentsCount += 1;

    persist();
    return { ...comment };
  },

  /* ------------------------------------------------------------------ projects */

  getProjects(instituteId?: string): LocalProject[] {
    const all = read().projects;
    const filtered = instituteId ? all.filter((p) => !p.instituteId || p.instituteId === instituteId) : all;
    return filtered.map((p) => ({ ...p }));
  },

  getProject(projectId: string): LocalProject | undefined {
    const found = read().projects.find((p) => p.id === projectId);
    return found ? { ...found } : undefined;
  },

  /** Returns the existing project for a problem+institute pair, if any (duplicate guard). */
  findProjectByProblem(problemId: string, instituteId?: string): LocalProject | undefined {
    const found = read().projects.find(
      (p) => p.problemId === problemId && (!instituteId || !p.instituteId || p.instituteId === instituteId)
    );
    return found ? { ...found } : undefined;
  },

  addProject(project: LocalProject): LocalProject {
    const store = read();
    const existing = store.projects.find(
      (p) => p.problemId === project.problemId && p.instituteId === project.instituteId
    );
    if (existing) return { ...existing };

    store.projects.unshift({ ...project });
    persist();
    return { ...project };
  },

  updateProject(projectId: string, patch: Partial<LocalProject>): LocalProject | undefined {
    const store = read();
    const target = store.projects.find((p) => p.id === projectId);
    if (!target) return undefined;
    Object.assign(target, patch);
    persist();
    return { ...target };
  },

  getAcceptedProblemIds(instituteId?: string): string[] {
    return this.getProjects(instituteId)
      .map((p) => p.problemId)
      .filter((id): id is string => Boolean(id));
  },

  /* --------------------------------------------------------------------- admin */

  /** Wipes demo data back to the seeded dataset. Used by Admin → Settings. */
  reset(): void {
    db = createInitialDB();
    persist();
  }
};
