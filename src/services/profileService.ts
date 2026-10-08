import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { ProblemReport, InstituteProject, UserProfile } from '../types';
import { problemsService } from './problemsService';
import { instituteService } from './instituteService';

export interface CitizenProfileDetails {
  id: string;
  fullName: string;
  email: string;
  avatarUrl?: string;
  location: string;
  reportsCount: number;
  supportedCount: number;
  resolvedCount: number;
  reportsList: ProblemReport[];
  supportedList: ProblemReport[];
}

export interface GovernmentProfileDetails {
  id: string;
  fullName: string;
  email: string;
  avatarUrl?: string;
  department: string;
  roleTitle: string;
  jurisdiction: string;
  badgeNumber: string;
  verifiedStatus: boolean;
}

export interface InstituteProfileDetails {
  id: string;
  instituteName: string;
  email: string;
  avatarUrl?: string;
  description: string;
  location: string;
  accreditation: string;
  departments: string[];
  skills: string[];
  activeProjectsCount: number;
  completedProjectsCount: number;
  citizensImpacted: number;
  projectsList: InstituteProject[];
}

/** Short deterministic badge number derived from the officer's account id. */
const badgeFromId = (id: string): string => {
  let hash = 0;
  for (let i = 0; i < id.length; i += 1) hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  return `GOV-JH-${(hash % 9000) + 1000}`;
};

/**
 * Fetches the `profiles` row for the signed-in user so Supabase remains the source of
 * truth. Falls back to the AuthContext profile, which is always the current user.
 */
const resolveIdentity = async (
  userId?: string,
  authProfile?: UserProfile | null
): Promise<{ fullName: string; email: string; avatarUrl?: string; location?: string }> => {
  let fullName = authProfile?.full_name || 'JanSetu User';
  let email = authProfile?.email || '';
  let avatarUrl = authProfile?.avatar_url;
  let location = authProfile?.location;

  if (isSupabaseConfigured() && userId) {
    try {
      const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle();
      if (error) {
        console.error('profileService: profiles lookup failed:', error);
      } else if (data) {
        fullName = data.full_name || fullName;
        email = data.email || email;
        avatarUrl = data.avatar_url || avatarUrl;
        location = data.location || location;
      }
    } catch (err) {
      console.error('profileService: unexpected profiles lookup error:', err);
    }
  }

  return { fullName, email, avatarUrl, location };
};

export const profileService = {
  /** Citizen profile built from the authenticated identity + their real reports/votes. */
  async getCitizenProfile(userId?: string, authProfile?: UserProfile | null): Promise<CitizenProfileDetails> {
    const identity = await resolveIdentity(userId, authProfile);

    const [reportsRes, supportedRes, statsRes] = await Promise.allSettled([
      problemsService.getMyReports(userId),
      problemsService.getSupportedProblems(userId),
      problemsService.fetchCitizenStats(userId)
    ]);

    const reportsList = reportsRes.status === 'fulfilled' ? reportsRes.value : [];
    const supportedList = supportedRes.status === 'fulfilled' ? supportedRes.value : [];
    const stats = statsRes.status === 'fulfilled' ? statsRes.value : null;

    if (reportsRes.status === 'rejected') console.error('Citizen reports load failed:', reportsRes.reason);
    if (supportedRes.status === 'rejected') console.error('Supported list load failed:', supportedRes.reason);

    return {
      id: userId || authProfile?.id || 'unknown-user',
      fullName: identity.fullName,
      email: identity.email,
      avatarUrl: identity.avatarUrl,
      location: identity.location || 'Location not set',
      reportsCount: stats?.yourReports ?? reportsList.length,
      supportedCount: stats?.supported ?? supportedList.length,
      resolvedCount: reportsList.filter((r) => r.status === 'resolved').length,
      reportsList,
      supportedList
    };
  },

  /** Government officer profile. Identity comes from auth; department metadata is seeded. */
  async getGovernmentProfile(userId?: string, authProfile?: UserProfile | null): Promise<GovernmentProfileDetails> {
    const identity = await resolveIdentity(userId, authProfile);
    const id = userId || authProfile?.id || 'gov-user';

    return {
      id,
      fullName: identity.fullName,
      email: identity.email,
      avatarUrl: identity.avatarUrl,
      department: 'Urban Development & Public Works Department',
      roleTitle: 'State Executive Nodal Officer',
      jurisdiction: identity.location || 'Jharkhand State / Ranchi Municipal Division',
      badgeNumber: badgeFromId(id),
      verifiedStatus: true
    };
  },

  /** Institute profile. Name comes from the institutes table, else the auth profile. */
  async getInstituteProfile(userId?: string, authProfile?: UserProfile | null): Promise<InstituteProfileDetails> {
    const identity = await resolveIdentity(userId, authProfile);

    let instituteName = identity.fullName;
    let accreditation = 'Accreditation not provided';
    let description =
      'Academic research institution collaborating with government departments on verified civic challenges through the JanSetu innovation network.';
    let location = identity.location || 'Jharkhand, India';
    let departments = ['Department of Engineering & Applied Sciences'];

    if (isSupabaseConfigured() && userId) {
      try {
        const { data: inst, error } = await supabase
          .from('institutes')
          .select('*')
          .eq('profile_id', userId)
          .maybeSingle();

        if (error) {
          console.error('profileService: institutes lookup failed:', error);
        } else if (inst) {
          instituteName = inst.name || instituteName;
          accreditation = inst.accreditation || accreditation;
          description = inst.description || description;
          location = inst.location || location;
          if (inst.department) departments = [inst.department];
        }
      } catch (err) {
        console.error('profileService: unexpected institutes lookup error:', err);
      }
    }

    let projectsList: InstituteProject[] = [];
    try {
      projectsList = await instituteService.getInstituteProjects(userId);
    } catch (err) {
      console.error('profileService: institute projects load failed:', err);
    }

    const completedProjectsCount = projectsList.filter(
      (p) => p.status === 'Completed' || p.status === 'COMPLETED'
    ).length;

    // Skill competencies are derived from what the institute is actually working on.
    const skills = Array.from(
      new Set(projectsList.map((p) => p.title.split(' ').slice(0, 2).join(' ')))
    ).slice(0, 6);

    return {
      id: userId || authProfile?.id || 'institute-user',
      instituteName,
      email: identity.email,
      avatarUrl: identity.avatarUrl,
      description,
      location,
      accreditation,
      departments,
      skills:
        skills.length > 0
          ? skills
          : ['Environmental Engineering', 'IoT Sensors', 'Data Science', 'Field Testing'],
      activeProjectsCount: projectsList.length - completedProjectsCount,
      completedProjectsCount,
      citizensImpacted: projectsList.length * 850,
      projectsList
    };
  }
};
