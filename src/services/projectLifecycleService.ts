import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { localStore } from './localStore';
import { 
  InstituteProject, 
  MilestoneItem, 
  ProjectLifecycleStatus, 
  MilestoneStatus,
  ProjectTeamMember 
} from '../types';

const SEED_PROJECT: InstituteProject = {
  id: 'JS-2026-001',
  title: 'Automated Water Quality Monitoring System',
  problemTitle: 'Water Quality & Turbidity Monitoring in Ward 12',
  location: 'Ranchi, Jharkhand',
  progressPercentage: 65,
  status: 'FIELD_TESTING',
  lifecycleStatus: 'FIELD_TESTING',
  teamMembersCount: 4,
  leadName: 'Dr. A. K. Sharma',
  guideInstitute: 'ABC Institute of Technology',
  image: 'https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?auto=format&fit=crop&w=800&q=80',
  currentMilestone: 'Phase 4: Field Testing & Telemetry',
  nextDeadline: 'Oct 15, 2026',
  teamMembers: [
    { id: 'tm-1', name: 'Aarav Sharma', role: 'Student Team Leader', department: 'Environmental Eng.', avatar: 'AS' },
    { id: 'tm-2', name: 'Khushi Verma', role: 'AI & Data Analyst', department: 'Computer Science', avatar: 'KV' },
    { id: 'tm-3', name: 'Riya Patel', role: 'Hardware Enclosure Engineer', department: 'Mechanical Eng.', avatar: 'RP' },
    { id: 'tm-4', name: 'Om Singh', role: 'IoT Firmware Lead', department: 'Electrical Eng.', avatar: 'OS' }
  ],
  milestones: [
    {
      id: 'm-1',
      name: 'Challenge Acceptance & Governance Charter',
      description: 'Accept community challenge and establish project charter with municipal guidelines.',
      completed: true,
      status: 'APPROVED',
      dueDate: '2026-08-01',
      evidenceText: 'Project Charter signed by ABC Institute Dean & Ranchi Municipal Corporation.',
      evidenceUrl: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=800&q=80',
      submittedAt: '2026-08-01T10:00:00Z',
      reviewedAt: '2026-08-02T12:00:00Z',
      governmentFeedback: 'Charter verified and approved by Municipal Executive Engineer.'
    },
    {
      id: 'm-2',
      name: 'Student R&D Team Assembly',
      description: 'Form interdisciplinary student team across Environmental, CS, and Electronics engineering.',
      completed: true,
      status: 'APPROVED',
      dueDate: '2026-08-15',
      evidenceText: '4 student contributors onboarded with lab access credentials.',
      submittedAt: '2026-08-14T15:30:00Z',
      reviewedAt: '2026-08-15T09:00:00Z',
      governmentFeedback: 'Team allocation approved.'
    },
    {
      id: 'm-3',
      name: 'IoT Sensor Hardware Prototype',
      description: 'Assemble low-cost pH, turbidity, and temperature telemetry node circuit boards.',
      completed: true,
      status: 'APPROVED',
      dueDate: '2026-09-05',
      evidenceText: 'Prototype Node #1 bench calibration completed with 98.4% accuracy.',
      evidenceUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80',
      submittedAt: '2026-09-04T18:00:00Z',
      reviewedAt: '2026-09-05T11:00:00Z',
      governmentFeedback: 'Hardware specifications verified against BIS standards.'
    },
    {
      id: 'm-4',
      name: 'Field Testing & Calibration in Ward 12',
      description: 'Deploy 3 telemetry nodes at Ward 12 water supply outlets for 14-day continuous sampling.',
      completed: false,
      status: 'SUBMITTED_FOR_REVIEW',
      dueDate: '2026-10-15',
      evidenceText: 'Nodes deployed at Subhash Chowk pump house. 72 hours of continuous telemetry logged successfully.',
      evidenceUrl: 'https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?auto=format&fit=crop&w=800&q=80',
      submittedAt: '2026-09-18T09:00:00Z'
    },
    {
      id: 'm-5',
      name: 'Municipal Deployment & Final Handover',
      description: 'Hand over live dashboard telemetry feeds to Ranchi Municipal Water Department.',
      completed: false,
      status: 'PENDING',
      dueDate: '2026-11-30'
    }
  ]
};

/** Updates a milestone inside the locally-stored project that owns it. */
const updateLocalMilestone = (milestoneId: string, patch: Partial<MilestoneItem>): void => {
  const projects = localStore.getProjects();
  const owner = projects.find((p) => (p.milestones || []).some((m) => m.id === milestoneId));
  if (!owner) return;

  const milestones = owner.milestones.map((m) => (m.id === milestoneId ? { ...m, ...patch } : m));
  const completed = milestones.filter((m) => m.completed).length;
  const progressPercentage = milestones.length
    ? Math.round((completed / milestones.length) * 100)
    : owner.progressPercentage;

  localStore.updateProject(owner.id, {
    milestones,
    progressPercentage,
    status: progressPercentage === 100 ? 'COMPLETED' : owner.status
  });
};

export const projectLifecycleService = {
  /**
   * Fetches full project details including milestones, team members, and status
   */
  async getProjectDetails(projectId: string): Promise<InstituteProject> {
    // Demo mode: projects created by accepting a challenge live in the shared store.
    if (!isSupabaseConfigured()) {
      const local = localStore.getProject(projectId);
      if (local) return local;
      return SEED_PROJECT;
    }

    try {
      const { data: dbProject } = await supabase
        .from('projects')
        .select('*, milestones(*), project_members(*)')
        .eq('id', projectId)
        .maybeSingle();

      if (dbProject) {
        const milestones: MilestoneItem[] = (dbProject.milestones || []).map((m: any) => ({
          id: m.id,
          name: m.title,
          description: m.description || 'Milestone deliverable',
          completed: m.completed,
          dueDate: m.due_date,
          status: m.completed ? 'APPROVED' : 'PENDING',
          evidenceText: m.evidence_text,
          evidenceUrl: m.evidence_url
        }));

        const teamMembers: ProjectTeamMember[] = (dbProject.project_members || []).map((tm: any, idx: number) => ({
          id: tm.id,
          name: tm.user_id ? 'Student Contributor' : `Team Member #${idx + 1}`,
          role: tm.role_title || 'Researcher',
          department: 'Engineering',
          avatar: `T${idx + 1}`
        }));

        const completedCount = milestones.filter(m => m.completed).length;
        const progress = milestones.length > 0 ? Math.round((completedCount / milestones.length) * 100) : dbProject.progress_percentage || 50;

        return {
          id: dbProject.id,
          title: dbProject.title,
          problemTitle: 'Community Civic Challenge',
          location: 'Ranchi, Jharkhand',
          progressPercentage: progress,
          status: (dbProject.status as ProjectLifecycleStatus) || 'FIELD_TESTING',
          lifecycleStatus: (dbProject.status as ProjectLifecycleStatus) || 'FIELD_TESTING',
          teamMembersCount: teamMembers.length || 4,
          leadName: dbProject.lead_name || 'Faculty Lead',
          guideInstitute: 'ABC Institute of Technology',
          image: 'https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?auto=format&fit=crop&w=800&q=80',
          currentMilestone: milestones.find(m => !m.completed)?.name || 'Final Deployment',
          nextDeadline: 'Oct 15, 2026',
          milestones,
          teamMembers
        };
      }

      return SEED_PROJECT;
    } catch (err) {
      console.warn('Fallback to seeded project details due to Supabase error:', err);
      return SEED_PROJECT;
    }
  },

  /**
   * Submit milestone evidence (Institute capability)
   */
  async submitMilestoneEvidence(
    milestoneId: string, 
    evidenceText: string, 
    evidenceUrl?: string
  ): Promise<{ success: boolean }> {
    if (!isSupabaseConfigured()) {
      updateLocalMilestone(milestoneId, {
        status: 'SUBMITTED_FOR_REVIEW',
        evidenceText,
        evidenceUrl,
        submittedAt: new Date().toISOString()
      });
      return { success: true };
    }

    try {
      const { error } = await supabase
        .from('milestones')
        .update({
          evidence_text: evidenceText,
          evidence_url: evidenceUrl,
          status: 'SUBMITTED_FOR_REVIEW'
        })
        .eq('id', milestoneId);

      if (error) console.warn('Supabase milestone update warning:', error);
      return { success: true };
    } catch (err) {
      console.warn('Fallback local milestone submission:', err);
      return { success: true };
    }
  },

  /**
   * Government Admin milestone review (Approve / Reject)
   */
  async reviewMilestone(
    milestoneId: string, 
    approved: boolean, 
    feedback?: string
  ): Promise<{ success: boolean }> {
    if (!isSupabaseConfigured()) {
      updateLocalMilestone(milestoneId, {
        completed: approved,
        status: approved ? 'APPROVED' : 'REJECTED',
        governmentFeedback: feedback,
        reviewedAt: new Date().toISOString()
      });
      return { success: true };
    }

    try {
      const { error } = await supabase
        .from('milestones')
        .update({
          completed: approved,
          status: approved ? 'APPROVED' : 'REJECTED',
          government_feedback: feedback
        })
        .eq('id', milestoneId);

      if (error) console.warn('Supabase milestone review warning:', error);
      return { success: true };
    } catch (err) {
      console.warn('Fallback local milestone review:', err);
      return { success: true };
    }
  },

  /**
   * Add a student/faculty member to project team
   */
  async addTeamMember(
    projectId: string, 
    member: { name: string; role: string; department?: string }
  ): Promise<ProjectTeamMember> {
    const newMember: ProjectTeamMember = {
      id: `tm-${Date.now()}`,
      name: member.name,
      role: member.role,
      department: member.department || 'Engineering',
      avatar: member.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase(),
      joinedAt: new Date().toISOString()
    };

    // Demo mode: persist the roster so My Team and refreshes keep the new member.
    if (!isSupabaseConfigured()) {
      const project = localStore.getProject(projectId);
      if (project) {
        const teamMembers = [...(project.teamMembers || []), newMember];
        localStore.updateProject(projectId, { teamMembers, teamMembersCount: teamMembers.length });
      }
      return newMember;
    }

    try {
      const { error } = await supabase.from('project_members').insert({
        project_id: projectId,
        name: member.name,
        role_title: member.role,
        department: member.department || null
      });
      if (error) console.error('Could not persist team member to Supabase:', error);
    } catch (err) {
      console.error('Unexpected error adding team member:', err);
    }

    return newMember;
  }
};
