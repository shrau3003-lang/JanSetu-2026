import { ProblemReport, ProblemCategory } from '../types';

export interface InstituteCapability {
  id: string;
  name: string;
  department: string;
  accreditation: string;
  location: string;
  skills: string[];
  categories: ProblemCategory[];
  activeProjectsCount: number;
  maxCapacity: number;
  verified: boolean;
}

export interface SkillMatchCheckitem {
  name: string;
  matched: boolean;
}

export interface MatchResult {
  institute: InstituteCapability;
  matchScore: number; // 0 - 100
  breakdown: {
    skillScore: number;      // max 50
    departmentScore: number; // max 20
    categoryScore: number;   // max 15
    locationScore: number;   // max 10
    capacityScore: number;   // max 5
  };
  matchedSkillsChecklist: SkillMatchCheckitem[];
  reasons: string[];
}

/**
 * Stage 11 - JanSetu Institute Match Engine
 * 
 * Strict Weighted Match Formula:
 * - Skill Match: 50%
 * - Department Match: 20%
 * - Category Match: 15%
 * - Location Match: 10%
 * - Capacity: 5%
 */
export function calculateInstituteMatch(
  problem: ProblemReport & { requiredSkills?: string[]; requiredDepartment?: string; ai_analysis?: any },
  institute: InstituteCapability
): MatchResult {
  // Extract required skills from problem AI analysis or category fallbacks
  const aiSkills: string[] = problem.ai_analysis?.requiredSkills || problem.requiredSkills || [];
  const requiredSkills = aiSkills.length > 0 ? aiSkills : [
    problem.category,
    'Environmental Engineering',
    'IoT Sensors',
    'Field Testing'
  ];

  const requiredDepartment = problem.ai_analysis?.suggestedDepartment || problem.requiredDepartment || `Department of ${problem.category}`;

  // 1. Skill Match (50% max)
  const instituteSkillsLower = (institute.skills || []).map(s => s.toLowerCase());
  let matchedSkillCount = 0;
  const matchedSkillsChecklist: SkillMatchCheckitem[] = [];

  requiredSkills.forEach(reqSkill => {
    const isMatch = instituteSkillsLower.some(instSkill => 
      instSkill.includes(reqSkill.toLowerCase()) || reqSkill.toLowerCase().includes(instSkill)
    );
    if (isMatch) {
      matchedSkillCount++;
    }
    matchedSkillsChecklist.push({
      name: reqSkill,
      matched: isMatch
    });
  });

  const skillRatio = requiredSkills.length > 0 ? matchedSkillCount / requiredSkills.length : 0.8;
  const skillScore = Math.round(skillRatio * 50);

  // 2. Department Match (20% max)
  let departmentScore = 0;
  const instDeptLower = (institute.department || '').toLowerCase();
  const reqDeptLower = requiredDepartment.toLowerCase();

  if (instDeptLower === reqDeptLower) {
    departmentScore = 20;
  } else if (
    instDeptLower.includes(reqDeptLower) || 
    reqDeptLower.includes(instDeptLower) ||
    instDeptLower.includes('engineering') && reqDeptLower.includes('engineering')
  ) {
    departmentScore = 16; // 80% partial dept match
  } else {
    departmentScore = 10; // general technical department baseline
  }

  // 3. Category Match (15% max)
  const isCatMatched = (institute.categories || []).some(
    cat => cat.toLowerCase() === problem.category.toLowerCase()
  );
  const categoryScore = isCatMatched ? 15 : 9;

  // 4. Location Match (10% max)
  let locationScore = 0;
  const probLocLower = (problem.location || '').toLowerCase();
  const instLocLower = (institute.location || '').toLowerCase();

  if (probLocLower.includes(instLocLower) || instLocLower.includes(probLocLower)) {
    locationScore = 10; // Same city/district
  } else if (probLocLower.includes('jharkhand') && instLocLower.includes('jharkhand')) {
    locationScore = 8; // Same state
  } else {
    locationScore = 4; // Neighboring region
  }

  // 5. Capacity Match (5% max)
  const capacityRatio = Math.max(0, (institute.maxCapacity - institute.activeProjectsCount) / institute.maxCapacity);
  const capacityScore = Math.round(capacityRatio * 5);

  // Total Score (0–100)
  const rawTotal = skillScore + departmentScore + categoryScore + locationScore + capacityScore;
  const matchScore = Math.min(99, Math.max(40, rawTotal)); // Clamped 40-99%

  // Transparent match reasons
  const reasons: string[] = [];
  if (skillRatio >= 0.75) reasons.push(`High Skill Alignment (${matchedSkillCount}/${requiredSkills.length} skills matched)`);
  if (departmentScore >= 16) reasons.push(`Specialized ${institute.department}`);
  if (isCatMatched) reasons.push(`Expertise in ${problem.category}`);
  if (locationScore >= 8) reasons.push(`Geographical Proximity (${institute.location})`);
  if (capacityScore >= 4) reasons.push(`Lab & Research Capacity Available`);

  return {
    institute,
    matchScore,
    breakdown: {
      skillScore,
      departmentScore,
      categoryScore,
      locationScore,
      capacityScore
    },
    matchedSkillsChecklist,
    reasons
  };
}
