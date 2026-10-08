export type UserRole = 'CITIZEN' | 'ADMIN' | 'INSTITUTE' | 'citizen' | 'admin' | 'institute';

export interface UserProfile {
  id: string;
  full_name: string;
  email: string;
  role: UserRole;
  avatar_url?: string;
  phone?: string;
  location?: string;
  created_at?: string;
}

export type PriorityLevel = 'critical' | 'high' | 'medium' | 'low';

export type ProblemCategory = 
  | 'Water & Sanitation'
  | 'Waste Management'
  | 'Infrastructure'
  | 'Education'
  | 'Healthcare'
  | 'Environment';

export type ProblemStatus = 'reported' | 'pending' | 'verified' | 'in_progress' | 'resolved' | 'rejected';

export interface ProblemReport {
  id: string;
  title: string;
  description: string;
  category: ProblemCategory;
  priority: PriorityLevel;
  status: ProblemStatus;
  location: string;
  distanceKm?: number;
  supportersCount: number;
  commentsCount: number;
  /** Human readable label shown in the UI (e.g. "2 days ago", "18 Sep"). */
  createdAt: string;
  /** Machine sortable ISO timestamp, used for the "Latest" ordering. */
  createdAtIso?: string;
  imageUrl?: string;
  reportedBy?: string;
  author_id?: string;
}

export interface Challenge {
  id: string;
  title: string;
  category: ProblemCategory;
  location: string;
  priority: PriorityLevel;
  matchPercentage: number;
  description: string;
  image?: string;
  tags: string[];
  requiredSkills: string[];
  requiredDepartment: string;
  matchedSkillsChecklist: { name: string; matched: boolean }[];
  status?: string;
}

export type ProjectLifecycleStatus = 
  | 'ACCEPTED' 
  | 'TEAM_FORMING' 
  | 'IDEATION' 
  | 'PROTOTYPE' 
  | 'FIELD_TESTING' 
  | 'DEPLOYMENT' 
  | 'COMPLETED';

export type MilestoneStatus = 'PENDING' | 'SUBMITTED_FOR_REVIEW' | 'APPROVED' | 'REJECTED';

export interface MilestoneItem {
  id?: string;
  name: string;
  description?: string;
  completed: boolean;
  dueDate?: string;
  status?: MilestoneStatus;
  evidenceText?: string;
  evidenceUrl?: string;
  submittedAt?: string;
  reviewedAt?: string;
  governmentFeedback?: string;
}

export interface ProjectTeamMember {
  id: string;
  name: string;
  role: string;
  department?: string;
  avatar?: string;
  joinedAt?: string;
}

export interface InstituteProject {
  id: string;
  title: string;
  problemTitle?: string;
  location: string;
  progressPercentage: number;
  status: 'Planning' | 'In Progress' | 'Field Testing' | 'Completed' | 'Pending Review' | 'Cancelled' | ProjectLifecycleStatus;
  lifecycleStatus?: ProjectLifecycleStatus;
  teamMembersCount: number;
  leadName: string;
  guideInstitute: string;
  image?: string;
  currentMilestone?: string;
  nextDeadline?: string;
  milestones: MilestoneItem[];
  teamMembers?: ProjectTeamMember[];
}

export interface InstituteKPIs {
  activeProjects: number;
  ongoingChallenges: number;
  completedProjects: number;
  studentContributors: number;
  impactGenerated: number;
}

export interface ActivityItem {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  type: 'submission' | 'review' | 'approval' | 'team' | 'milestone';
  user?: string;
}

export interface DeadlineItem {
  id: string;
  title: string;
  projectTitle: string;
  dueDate: string;
  status: 'Upcoming' | 'Urgent' | 'Submitted';
}

export interface QuickStats {
  totalProblems: number;
  yourReports?: number;
  supported?: number;
  resolved: number;
  pendingVerification?: number;
  highPriority?: number;
}

