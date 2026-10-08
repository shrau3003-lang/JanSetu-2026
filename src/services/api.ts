import { ProblemReport, Challenge, InstituteProject, QuickStats } from '../types';

/** Seed timestamps are generated relative to "now" so the Latest tab stays meaningful. */
const hoursAgo = (h: number): string => new Date(Date.now() - h * 60 * 60 * 1000).toISOString();

export const mockProblems: ProblemReport[] = [
  {
    id: '1640',
    title: "Garbage collection hasn't happened in our area for 10 days.",
    description: "The garbage has not been collected in our area for the past 10 days. It is causing foul smell and health issues. There are children and elderly people living here.",
    category: 'Waste Management',
    priority: 'high',
    status: 'pending',
    location: 'Ranchi, Jharkhand',
    distanceKm: 2.3,
    supportersCount: 342,
    commentsCount: 41,
    createdAt: '2 days ago',
    createdAtIso: hoursAgo(48),
    imageUrl: 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&w=800&q=80',
    reportedBy: 'Pooja S.'
  },
  {
    id: '1641',
    title: 'Water shortage in my locality',
    description: 'Irregular supply of drinking water for the last three weeks. Residents are suffering severely.',
    category: 'Water & Sanitation',
    priority: 'medium',
    status: 'verified',
    location: 'Bengaluru, Karnataka',
    distanceKm: 4.1,
    supportersCount: 180,
    commentsCount: 23,
    createdAt: '3 days ago',
    createdAtIso: hoursAgo(72),
    imageUrl: 'https://images.unsplash.com/photo-1541888946425-d0fbb186a5b3?auto=format&fit=crop&w=800&q=80',
    reportedBy: 'Rahul M.'
  },
  {
    id: '1642',
    title: 'Road damage near school',
    description: 'Deep potholes on main school access road causing traffic congestion and risk to school buses.',
    category: 'Infrastructure',
    priority: 'low',
    status: 'in_progress',
    location: 'Indore, Madhya Pradesh',
    distanceKm: 5.8,
    supportersCount: 84,
    commentsCount: 12,
    createdAt: '5 days ago',
    createdAtIso: hoursAgo(120),
    imageUrl: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80',
    reportedBy: 'Vikram T.'
  },
  {
    id: '1644',
    title: 'Air pollution in industrial area',
    description: 'Heavy smoke emissions during night hours exceeding permissible air quality limits.',
    category: 'Environment',
    priority: 'high',
    status: 'pending',
    location: 'Delhi',
    distanceKm: 12.0,
    supportersCount: 512,
    commentsCount: 89,
    createdAt: '1 day ago',
    createdAtIso: hoursAgo(24),
    reportedBy: 'Neha G.'
  },
  {
    id: '1645',
    title: 'Flooding in low lying area',
    description: 'Clogged drainage lines causing severe waterlogging during rain showers.',
    category: 'Infrastructure',
    priority: 'critical',
    status: 'pending',
    location: 'Patna, Bihar',
    distanceKm: 8.4,
    supportersCount: 290,
    commentsCount: 34,
    createdAt: '4 hours ago',
    createdAtIso: hoursAgo(4),
    reportedBy: 'Amit K.'
  }
];

export const mockChallenges: Challenge[] = [
  {
    id: 'ch-1',
    title: 'Water Quality Monitoring',
    category: 'Water & Sanitation',
    location: 'Ranchi, Jharkhand',
    priority: 'high',
    matchPercentage: 94,
    description: 'Deploying IoT sensors and data analytics to ensure safe drinking water in rural areas.',
    tags: ['IoT', 'Environmental'],
    requiredSkills: ['Environmental Engineering', 'Water Quality Analysis', 'IoT Sensors', 'Data Science'],
    requiredDepartment: 'Department of Environmental Engineering',
    matchedSkillsChecklist: [
      { name: 'Environmental Engineering', matched: true },
      { name: 'Water Quality Analysis', matched: true },
      { name: 'IoT Sensors', matched: true },
      { name: 'Field Testing', matched: true }
    ]
  },
  {
    id: 'ch-2',
    title: 'Smart Waste Management',
    category: 'Waste Management',
    location: 'Indore, MP',
    priority: 'high',
    matchPercentage: 88,
    description: 'Automated waste segregation and smart bin alert tracking for municipal collection.',
    tags: ['Electrical', 'Mechanical'],
    requiredSkills: ['Computer Science', 'Machine Learning', 'GIS Mapping', 'Logistics'],
    requiredDepartment: 'Department of Computer Science & Engineering',
    matchedSkillsChecklist: [
      { name: 'Computer Science', matched: true },
      { name: 'GIS Mapping', matched: true },
      { name: 'Machine Learning', matched: true },
      { name: 'Logistics', matched: false }
    ]
  },
  {
    id: 'ch-3',
    title: 'Solar Powered Street Lights',
    category: 'Infrastructure',
    location: 'Jaipur, Rajasthan',
    priority: 'medium',
    matchPercentage: 78,
    description: 'Installing solar micro-grids and smart light dimmers in suburban public parks.',
    tags: ['Renewables', 'Power'],
    requiredSkills: ['Electrical Engineering', 'Solar Energy Systems', 'Microcontrollers'],
    requiredDepartment: 'Department of Electrical Engineering',
    matchedSkillsChecklist: [
      { name: 'Electrical Engineering', matched: true },
      { name: 'Solar Energy Systems', matched: true },
      { name: 'Microcontrollers', matched: true },
      { name: 'SCADA Integration', matched: false }
    ]
  }
];

export const mockInstituteProject: InstituteProject = {
  id: 'JS-2026-001',
  title: 'Water Quality Monitoring System',
  location: 'Ranchi, Jharkhand',
  progressPercentage: 75,
  status: 'In Progress',
  teamMembersCount: 4,
  leadName: 'Aarav Sharma',
  guideInstitute: 'ABC Institute',
  milestones: [
    { name: 'Challenge Accepted', completed: true },
    { name: 'Team Formed', completed: true },
    { name: 'Design & Planning', completed: true },
    { name: 'Prototype', completed: true },
    { name: 'Field Testing', completed: false },
    { name: 'Deployment', completed: false }
  ]
};

export const apiService = {
  getProblems: async () => mockProblems,
  getChallenges: async () => mockChallenges,
  getProject: async () => mockInstituteProject,
  getAdminStats: async (): Promise<QuickStats> => ({
    totalProblems: 1248,
    pendingVerification: 43,
    highPriority: 18,
    resolved: 91
  }),
  getCitizenStats: async (): Promise<QuickStats> => ({
    totalProblems: 132,
    yourReports: 5,
    supported: 12,
    resolved: 8
  })
};
