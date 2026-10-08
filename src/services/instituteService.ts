import { supabase, isSupabaseConfigured } from '../lib/supabase';
import {
  Challenge,
  InstituteProject,
  InstituteKPIs,
  ActivityItem,
  DeadlineItem,
  ProblemCategory,
  PriorityLevel,
  ProblemReport,
  ProjectTeamMember
} from '../types';
import { localStore, LocalProject } from './localStore';
import { problemsService, mapProblemRow } from './problemsService';

export interface InstituteDashboardData {
  instituteName: string;
  department: string;
  accreditation: string;
  kpis: InstituteKPIs;
  recommendedChallenges: Challenge[];
  activeProjects: InstituteProject[];
  acceptedChallengeIds: string[];
  impact: {
    citizensImpacted: number;
    problemsSolved: number;
    locationsCovered: number;
    projectsCompleted: number;
  };
  recentActivities: ActivityItem[];
  upcomingDeadlines: DeadlineItem[];
}

export interface InstituteMentor {
  id: string;
  name: string;
  title: string;
  department: string;
  expertise: string[];
  email: string;
  projectsGuided: number;
  avatar: string;
}

const DEFAULT_CHALLENGE_IMAGE =
  'https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?auto=format&fit=crop&w=800&q=80';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Deterministic 80-98 capability score derived from the problem id.
 * Replaces the previous Math.random() score, which changed on every page load.
 */
const deterministicMatchScore = (seed: string): number => {
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  }
  return 80 + (hash % 19);
};

// Fallback seed data used when the platform has no community problems yet.
const SEED_CHALLENGES: Challenge[] = [
  {
    id: 'ch-001',
    title: 'Water Quality Monitoring System',
    category: 'Water & Sanitation',
    location: 'Ranchi, Jharkhand',
    priority: 'high',
    matchPercentage: 94,
    description: 'Deployment of low-cost IoT sensor networks to continuously monitor pH and turbidity levels in municipal water supplies.',
    image: 'https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?auto=format&fit=crop&w=800&q=80',
    tags: ['IoT', 'Water Safety', 'Embedded Systems'],
    requiredSkills: ['Environmental Engineering', 'Water Quality Analysis', 'IoT Sensors', 'Data Science'],
    requiredDepartment: 'Department of Environmental Engineering',
    matchedSkillsChecklist: [
      { name: 'Environmental Engineering', matched: true },
      { name: 'Water Quality Analysis', matched: true },
      { name: 'IoT Sensors', matched: true },
      { name: 'Field Testing', matched: true }
    ],
    status: 'open'
  },
  {
    id: 'ch-002',
    title: 'Smart Waste Sorting & Routing',
    category: 'Waste Management',
    location: 'Dhanbad, Jharkhand',
    priority: 'critical',
    matchPercentage: 88,
    description: 'AI-assisted bin fill-level estimation and dynamic routing algorithms for municipal sanitation vehicles.',
    image: 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&w=800&q=80',
    tags: ['AI Routing', 'Civic Tech', 'Optimization'],
    requiredSkills: ['Computer Science', 'Machine Learning', 'GIS Mapping', 'Logistics'],
    requiredDepartment: 'Department of Computer Science & Engineering',
    matchedSkillsChecklist: [
      { name: 'Computer Science', matched: true },
      { name: 'GIS Mapping', matched: true },
      { name: 'Machine Learning', matched: true },
      { name: 'Logistics', matched: false }
    ],
    status: 'open'
  },
  {
    id: 'ch-003',
    title: 'Solar Microgrid Remote Health Monitoring',
    category: 'Infrastructure',
    location: 'Hazaribagh, Jharkhand',
    priority: 'medium',
    matchPercentage: 82,
    description: 'Hardware telemetry diagnostics for rural solar microgrids supporting primary health centers.',
    image: 'https://images.unsplash.com/photo-1509391365360-2e959784a276?auto=format&fit=crop&w=800&q=80',
    tags: ['Solar Power', 'Telemetry', 'Clean Tech'],
    requiredSkills: ['Electrical Engineering', 'Solar Energy Systems', 'Microcontrollers'],
    requiredDepartment: 'Department of Electrical Engineering',
    matchedSkillsChecklist: [
      { name: 'Electrical Engineering', matched: true },
      { name: 'Solar Energy Systems', matched: true },
      { name: 'Microcontrollers', matched: true },
      { name: 'SCADA Integration', matched: false }
    ],
    status: 'open'
  }
];

const SEED_PROJECTS: InstituteProject[] = [
  {
    id: 'proj-001',
    title: 'Automated Water Quality Monitoring',
    problemTitle: 'Contaminated Water Supply in Zone 4',
    location: 'Ranchi, Jharkhand',
    progressPercentage: 75,
    status: 'Field Testing',
    teamMembersCount: 8,
    leadName: 'Dr. A. K. Sharma & Student Team A',
    guideInstitute: 'ABC Institute of Technology',
    image: 'https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?auto=format&fit=crop&w=800&q=80',
    currentMilestone: 'Phase 3: Field Calibration',
    nextDeadline: 'Oct 15, 2026',
    milestones: [
      { id: 'm1', name: 'Challenge Accepted', completed: true, dueDate: '2026-08-01' },
      { id: 'm2', name: 'Team Formed & Proposal Approved', completed: true, dueDate: '2026-08-15' },
      { id: 'm3', name: 'Prototype Hardware Assembled', completed: true, dueDate: '2026-09-05' },
      { id: 'm4', name: 'Field Testing & Calibration', completed: false, dueDate: '2026-10-15' },
      { id: 'm5', name: 'Final Government Deployment', completed: false, dueDate: '2026-11-30' }
    ],
    teamMembers: [
      { id: 'sp1-tm1', name: 'Rohan Gupta', role: 'Student Team Leader', department: 'Environmental Eng.', avatar: 'RG' },
      { id: 'sp1-tm2', name: 'Ananya Roy', role: 'Data Analyst', department: 'Computer Science', avatar: 'AR' },
      { id: 'sp1-tm3', name: 'Devendra Kumar', role: 'IoT Firmware Engineer', department: 'Electrical Eng.', avatar: 'DK' }
    ]
  },
  {
    id: 'proj-002',
    title: 'Urban Plastic Waste Recycler Module',
    problemTitle: 'Unmanaged Plastic Waste at Subhash Chowk',
    location: 'Jamshedpur, Jharkhand',
    progressPercentage: 40,
    status: 'In Progress',
    teamMembersCount: 4,
    leadName: 'Prof. R. Verma & Green Labs',
    guideInstitute: 'ABC Institute of Technology',
    image: 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&w=800&q=80',
    currentMilestone: 'Phase 2: Shredder Prototyping',
    nextDeadline: 'Oct 28, 2026',
    milestones: [
      { id: 'm21', name: 'Challenge Accepted', completed: true, dueDate: '2026-08-20' },
      { id: 'm22', name: 'CAD Design & Material Selection', completed: true, dueDate: '2026-09-10' },
      { id: 'm23', name: 'Mechanical Shredder Assembly', completed: false, dueDate: '2026-10-28' },
      { id: 'm24', name: 'Efficiency Testing', completed: false, dueDate: '2026-11-20' }
    ],
    teamMembers: [
      { id: 'sp2-tm1', name: 'Riya Patel', role: 'Mechanical Design Lead', department: 'Mechanical Eng.', avatar: 'RP' },
      { id: 'sp2-tm2', name: 'Om Singh', role: 'Materials Researcher', department: 'Chemical Eng.', avatar: 'OS' }
    ]
  }
];

const SEED_MENTORS: InstituteMentor[] = [
  {
    id: 'mn-1',
    name: 'Dr. A. K. Sharma',
    title: 'Professor & Faculty Research Lead',
    department: 'Department of Environmental Engineering',
    expertise: ['Water Quality Analysis', 'Environmental Engineering', 'Field Testing'],
    email: 'ak.sharma@abcinstitute.edu.in',
    projectsGuided: 6,
    avatar: 'AS'
  },
  {
    id: 'mn-2',
    name: 'Prof. R. Verma',
    title: 'Associate Professor',
    department: 'Department of Mechanical Engineering',
    expertise: ['Material Science', 'Waste Processing', 'CAD Prototyping'],
    email: 'r.verma@abcinstitute.edu.in',
    projectsGuided: 4,
    avatar: 'RV'
  },
  {
    id: 'mn-3',
    name: 'Dr. Meera Iyer',
    title: 'Head of Department',
    department: 'Department of Computer Science & Engineering',
    expertise: ['Machine Learning', 'GIS Mapping', 'Data Science'],
    email: 'm.iyer@abcinstitute.edu.in',
    projectsGuided: 9,
    avatar: 'MI'
  },
  {
    id: 'mn-4',
    name: 'Dr. S. Bhattacharya',
    title: 'Senior Scientist (Industry Mentor)',
    department: 'Department of Electrical & Electronics Engineering',
    expertise: ['IoT Sensors', 'Solar Energy Systems', 'Embedded Firmware'],
    email: 's.bhattacharya@abcinstitute.edu.in',
    projectsGuided: 3,
    avatar: 'SB'
  }
];

const SEED_ACTIVITIES: ActivityItem[] = [
  {
    id: 'act-1',
    title: 'Student Team Submitted Field Calibration Data',
    description: 'Sensor Node #4 reported 98.2% telemetry accuracy during pilot run.',
    timestamp: '2 hours ago',
    type: 'submission',
    user: 'Rohan Gupta (Lead Student)'
  },
  {
    id: 'act-2',
    title: 'Mentor Reviewed CAD Design',
    description: 'Dr. A. K. Sharma approved structural enclosures for outdoor deployment.',
    timestamp: 'Yesterday',
    type: 'review',
    user: 'Dr. A. K. Sharma (Faculty Lead)'
  },
  {
    id: 'act-3',
    title: 'Government Approved Milestone 2',
    description: 'Ranchi Municipal Corporation verified Phase 2 hardware specification.',
    timestamp: '3 days ago',
    type: 'approval',
    user: 'Municipal Executive Engineer'
  },
  {
    id: 'act-4',
    title: '2 New Student Contributors Joined Team',
    description: 'Ananya Roy and Devendra Kumar joined Project #JS-2026-001.',
    timestamp: '4 days ago',
    type: 'team',
    user: 'Project Coordinator'
  }
];

const SEED_DEADLINES: DeadlineItem[] = [
  {
    id: 'dl-1',
    title: 'Field Testing Telemetry Review',
    projectTitle: 'Automated Water Quality Monitoring',
    dueDate: 'Oct 15, 2026',
    status: 'Urgent'
  },
  {
    id: 'dl-2',
    title: 'Mechanical Shredder Assembly Submission',
    projectTitle: 'Urban Plastic Waste Recycler Module',
    dueDate: 'Oct 28, 2026',
    status: 'Upcoming'
  },
  {
    id: 'dl-3',
    title: 'Quarterly Impact Assessment Report',
    projectTitle: 'JanSetu Innovation Network',
    dueDate: 'Nov 10, 2026',
    status: 'Upcoming'
  }
];

/** Turns a community problem into the Challenge shape used across the Institute portal. */
export const problemToChallenge = (problem: ProblemReport, ai?: any): Challenge => {
  const analysis = ai || {};
  const requiredSkills: string[] =
    Array.isArray(analysis.requiredSkills) && analysis.requiredSkills.length > 0
      ? analysis.requiredSkills
      : [problem.category, 'Data Science', 'Field Testing'];

  return {
    id: problem.id,
    title: problem.title,
    category: (problem.category as ProblemCategory) || 'Environment',
    location: problem.location || 'Jharkhand',
    priority: (problem.priority as PriorityLevel) || 'medium',
    matchPercentage: deterministicMatchScore(problem.id),
    description: problem.description || 'Community challenge awaiting academic R&D collaboration.',
    image: problem.imageUrl || DEFAULT_CHALLENGE_IMAGE,
    tags: [problem.category, 'R&D', 'Civic Impact'],
    requiredSkills,
    requiredDepartment: analysis.suggestedDepartment || `Department of ${problem.category}`,
    matchedSkillsChecklist: requiredSkills.map((s: string, idx: number) => ({ name: s, matched: idx < 3 })),
    status: problem.status
  };
};

/** Merges seed challenges behind the real community challenges, without duplicate ids. */
const mergeWithSeedChallenges = (dynamic: Challenge[]): Challenge[] => {
  const seen = new Set(dynamic.map((c) => c.id));
  return [...dynamic, ...SEED_CHALLENGES.filter((c) => !seen.has(c.id))];
};

const buildProjectFromChallenge = (
  challenge: Challenge,
  instituteId: string,
  instituteName: string
): LocalProject => {
  const now = new Date();
  const due = (days: number) =>
    new Date(now.getTime() + days * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

  return {
    id: 'proj-' + Date.now(),
    title: challenge.title,
    problemTitle: challenge.title,
    location: challenge.location,
    progressPercentage: 10,
    status: 'ACCEPTED',
    lifecycleStatus: 'ACCEPTED',
    teamMembersCount: 0,
    leadName: 'Student Research Lead',
    guideInstitute: instituteName,
    image: challenge.image || DEFAULT_CHALLENGE_IMAGE,
    currentMilestone: 'Phase 1: Team Formation',
    nextDeadline: due(30),
    problemId: challenge.id,
    instituteId,
    createdAt: now.toISOString(),
    teamMembers: [],
    milestones: [
      { id: `ms-${Date.now()}-1`, name: 'Challenge Accepted', completed: true, status: 'APPROVED', dueDate: due(0) },
      { id: `ms-${Date.now()}-2`, name: 'Team Formation & Proposal', completed: false, status: 'PENDING', dueDate: due(14) },
      { id: `ms-${Date.now()}-3`, name: 'Design & Prototype', completed: false, status: 'PENDING', dueDate: due(45) },
      { id: `ms-${Date.now()}-4`, name: 'Field Testing', completed: false, status: 'PENDING', dueDate: due(75) },
      { id: `ms-${Date.now()}-5`, name: 'Deployment & Handover', completed: false, status: 'PENDING', dueDate: due(110) }
    ]
  };
};

export const instituteService = {
  /**
   * Resolves the institute row id (Supabase) or the profile id (demo mode) for the signed-in user.
   * Returns null when the account has no institute record yet.
   */
  async resolveInstituteId(userId?: string): Promise<string | null> {
    if (!isSupabaseConfigured()) {
      return userId || 'demo-institute';
    }

    let targetUserId = userId;
    if (!targetUserId) {
      const { data: authData } = await supabase.auth.getUser();
      targetUserId = authData?.user?.id;
    }
    if (!targetUserId) return null;

    const { data, error } = await supabase
      .from('institutes')
      .select('id')
      .eq('profile_id', targetUserId)
      .maybeSingle();

    if (error) {
      console.error('Error resolving institute id:', error);
      return null;
    }

    return data?.id || null;
  },

  async getInstituteIdentity(userId?: string): Promise<{
    instituteId: string | null;
    instituteName: string;
    department: string;
    accreditation: string;
  }> {
    let instituteName = 'ABC Institute of Technology';
    let department = 'School of Engineering & Innovation';
    let accreditation = 'NAAC A++ Accredited';
    let instituteId: string | null = userId || null;

    if (!isSupabaseConfigured() || !userId) {
      return { instituteId, instituteName, department, accreditation };
    }

    try {
      const { data: instData } = await supabase
        .from('institutes')
        .select('*')
        .eq('profile_id', userId)
        .maybeSingle();

      if (instData) {
        instituteId = instData.id;
        instituteName = instData.name || instituteName;
        department = instData.department || department;
        accreditation = instData.accreditation || accreditation;
      } else {
        instituteId = null;
        const { data: profData } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('id', userId)
          .maybeSingle();
        if (profData?.full_name) instituteName = profData.full_name;
      }
    } catch (err) {
      console.error('Error loading institute identity:', err);
    }

    return { instituteId, instituteName, department, accreditation };
  },

  /**
   * Community challenges = the actual community problems.
   * Supabase mode reads the `problems` table; demo mode reads the shared local store.
   * Seed challenges are appended behind them so the page is never empty.
   */
  async getAvailableChallenges(): Promise<Challenge[]> {
    if (!isSupabaseConfigured()) {
      const problems = localStore
        .getProblems()
        .filter((p) => p.status !== 'rejected' && p.status !== 'resolved');
      return mergeWithSeedChallenges(problems.map((p) => problemToChallenge(p)));
    }

    const { data, error } = await supabase
      .from('problems')
      .select('*')
      .not('status', 'in', '("rejected","resolved")')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Supabase getAvailableChallenges error:', error);
      throw new Error('Unable to load community challenges right now.');
    }

    const dynamic = (data || []).map((row: any) => problemToChallenge(mapProblemRow(row), row.ai_analysis));
    return mergeWithSeedChallenges(dynamic);
  },

  /** Problem ids already accepted by this institute (source of the persistent Accepted state). */
  async getAcceptedChallengeIds(userId?: string): Promise<string[]> {
    if (!isSupabaseConfigured()) {
      return localStore.getAcceptedProblemIds(userId);
    }

    const instituteId = await this.resolveInstituteId(userId);
    if (!instituteId) return [];

    const { data, error } = await supabase
      .from('projects')
      .select('problem_id')
      .eq('institute_id', instituteId);

    if (error) {
      console.error('Supabase getAcceptedChallengeIds error:', error);
      return [];
    }

    return (data || []).map((row: any) => row.problem_id).filter(Boolean);
  },

  /** Projects belonging to the signed-in institute. */
  async getInstituteProjects(userId?: string): Promise<InstituteProject[]> {
    if (!isSupabaseConfigured()) {
      const local = localStore.getProjects(userId);
      return [...local, ...SEED_PROJECTS];
    }

    const instituteId = await this.resolveInstituteId(userId);
    const identity = await this.getInstituteIdentity(userId);

    let query = supabase
      .from('projects')
      .select('*, milestones(*), project_members(*)')
      .order('created_at', { ascending: false });

    if (instituteId) {
      query = query.eq('institute_id', instituteId);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Supabase getInstituteProjects error:', error);
      throw new Error('Unable to load your institute projects right now.');
    }

    if (!data || data.length === 0) return [];

    return data.map((p: any) => {
      const milestones = p.milestones || [];
      const completedCount = milestones.filter((m: any) => m.completed).length;
      const progress =
        milestones.length > 0
          ? Math.round((completedCount / milestones.length) * 100)
          : p.progress_percentage || 10;

      return {
        id: p.id,
        title: p.title,
        problemTitle: p.problem_title || 'Community Civic Challenge',
        location: p.location || 'Jharkhand',
        progressPercentage: progress,
        status: p.status || 'ACCEPTED',
        lifecycleStatus: p.status,
        teamMembersCount: p.project_members?.length || 0,
        leadName: p.lead_name || 'Faculty Research Lead',
        guideInstitute: identity.instituteName,
        image: p.image_url || DEFAULT_CHALLENGE_IMAGE,
        currentMilestone: milestones.find((m: any) => !m.completed)?.title || 'Final Review',
        nextDeadline: milestones.find((m: any) => !m.completed)?.due_date,
        milestones: milestones.map((m: any) => ({
          id: m.id,
          name: m.title,
          completed: m.completed,
          dueDate: m.due_date
        })),
        teamMembers: (p.project_members || []).map((tm: any, idx: number) => ({
          id: tm.id,
          name: tm.name || `Team Member #${idx + 1}`,
          role: tm.role_title || 'Researcher',
          department: tm.department || 'Engineering',
          avatar: `T${idx + 1}`
        }))
      } as InstituteProject;
    });
  },

  /** Flattened team roster across every project of the institute. */
  async getTeamMembers(userId?: string): Promise<(ProjectTeamMember & { projectTitle: string; projectId: string })[]> {
    const projects = await this.getInstituteProjects(userId);
    const roster: (ProjectTeamMember & { projectTitle: string; projectId: string })[] = [];

    projects.forEach((project) => {
      (project.teamMembers || []).forEach((member) => {
        roster.push({ ...member, projectTitle: project.title, projectId: project.id });
      });
    });

    return roster;
  },

  /** Faculty & industry mentors available to guide institute projects. */
  async getMentors(_userId?: string): Promise<InstituteMentor[]> {
    return SEED_MENTORS;
  },

  /** Complete dashboard payload for the Institute portal. */
  async getDashboardData(userId?: string): Promise<InstituteDashboardData> {
    const identity = await this.getInstituteIdentity(userId);

    const [challengesRes, projectsRes, acceptedRes] = await Promise.allSettled([
      this.getAvailableChallenges(),
      this.getInstituteProjects(userId),
      this.getAcceptedChallengeIds(userId)
    ]);

    const recommendedChallenges =
      challengesRes.status === 'fulfilled' ? challengesRes.value : SEED_CHALLENGES;
    const projectsFromSource = projectsRes.status === 'fulfilled' ? projectsRes.value : [];
    const acceptedChallengeIds = acceptedRes.status === 'fulfilled' ? acceptedRes.value : [];

    if (challengesRes.status === 'rejected') {
      console.error('Dashboard challenges failed, using seed data:', challengesRes.reason);
    }
    if (projectsRes.status === 'rejected') {
      console.error('Dashboard projects failed:', projectsRes.reason);
    }

    // Supabase accounts with no projects yet still get the illustrative seed projects,
    // exactly as the original dashboard did.
    const activeProjects = projectsFromSource.length > 0 ? projectsFromSource : SEED_PROJECTS;

    const completedCount = activeProjects.filter(
      (p) => p.status === 'Completed' || p.status === 'COMPLETED'
    ).length;
    const activeCount = activeProjects.length - completedCount;
    const studentContributors = activeProjects.reduce((acc, p) => acc + (p.teamMembersCount || 0), 0);

    return {
      instituteName: identity.instituteName,
      department: identity.department,
      accreditation: identity.accreditation,
      kpis: {
        activeProjects: activeCount,
        ongoingChallenges: recommendedChallenges.length,
        completedProjects: completedCount,
        studentContributors,
        impactGenerated: 3450
      },
      recommendedChallenges,
      activeProjects,
      acceptedChallengeIds,
      impact: {
        citizensImpacted: 3450,
        problemsSolved: completedCount + 2,
        locationsCovered: new Set(activeProjects.map((p) => p.location)).size,
        projectsCompleted: completedCount
      },
      recentActivities: SEED_ACTIVITIES,
      upcomingDeadlines: SEED_DEADLINES
    };
  },

  /**
   * Accept a challenge and turn it into an active institute project.
   * Never creates a duplicate project for the same (problem_id, institute_id) pair.
   */
  async acceptChallenge(
    challenge: Challenge | string,
    userId?: string
  ): Promise<{ success: boolean; projectId: string; alreadyAccepted: boolean }> {
    const challengeId = typeof challenge === 'string' ? challenge : challenge.id;

    // Resolve the full challenge payload so the created project carries real metadata.
    let resolved: Challenge | undefined = typeof challenge === 'string' ? undefined : challenge;
    if (!resolved) {
      const all = await this.getAvailableChallenges();
      resolved = all.find((c) => c.id === challengeId);
    }

    if (!resolved) {
      throw new Error('This challenge could not be found. Please refresh and try again.');
    }

    const identity = await this.getInstituteIdentity(userId);

    /* ----------------------------------------------------------- demo mode */
    if (!isSupabaseConfigured()) {
      const instituteId = userId || 'demo-institute';
      const existing = localStore.findProjectByProblem(challengeId, instituteId);
      if (existing) {
        return { success: true, projectId: existing.id, alreadyAccepted: true };
      }

      const created = localStore.addProject(
        buildProjectFromChallenge(resolved, instituteId, identity.instituteName)
      );
      return { success: true, projectId: created.id, alreadyAccepted: false };
    }

    /* ------------------------------------------------------- supabase mode */
    const instituteId = await this.resolveInstituteId(userId);
    if (!instituteId) {
      throw new Error(
        'No institute profile is linked to this account yet. Please complete your institute registration before accepting challenges.'
      );
    }

    // Seed/demo challenge ids are not real problem rows, so they cannot be stored
    // in the problem_id foreign key column.
    const problemId = UUID_RE.test(challengeId) ? challengeId : null;

    if (problemId) {
      const { data: duplicate, error: dupErr } = await supabase
        .from('projects')
        .select('id')
        .eq('problem_id', problemId)
        .eq('institute_id', instituteId)
        .maybeSingle();

      if (dupErr) {
        console.error('Duplicate project lookup failed:', dupErr);
      }

      if (duplicate?.id) {
        return { success: true, projectId: duplicate.id, alreadyAccepted: true };
      }
    }

    const { data, error } = await supabase
      .from('projects')
      .insert({
        institute_id: instituteId,
        title: resolved.title,
        problem_id: problemId,
        status: 'ACCEPTED',
        progress_percentage: 10,
        lead_name: 'Student Research Lead'
      })
      .select()
      .single();

    if (error || !data?.id) {
      console.error('Error accepting challenge in Supabase:', error);
      console.error('Supabase error JSON:', JSON.stringify(error, null, 2));
      throw new Error('The challenge could not be accepted. Please try again in a moment.');
    }

    return { success: true, projectId: data.id, alreadyAccepted: false };
  },

  /** Convenience accessor used by the Admin Projects screen. */
  async getAllProjects(): Promise<InstituteProject[]> {
    if (!isSupabaseConfigured()) {
      return [...localStore.getProjects(), ...SEED_PROJECTS];
    }
    return this.getInstituteProjects(undefined);
  },

  /** Exposed so other screens can reuse the community problem feed consistently. */
  async getCommunityProblems(): Promise<ProblemReport[]> {
    return problemsService.fetchProblems(null, 'Latest');
  }
};

export { SEED_CHALLENGES, SEED_PROJECTS };
