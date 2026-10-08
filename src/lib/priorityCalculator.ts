import { ProblemReport } from '../types';
import { AIAnalysisResult } from '../services/aiService';

export interface PriorityScoreBreakdown {
  supportScore: number;     // max 30 points (30% weight)
  severityScore: number;    // max 25 points (25% weight)
  populationScore: number;  // max 20 points (20% weight)
  urgencyScore: number;     // max 15 points (15% weight)
  evidenceScore: number;    // max 10 points (10% weight)
}

export interface PriorityScoreResult {
  totalScore: number; // 0 to 100
  level: 'Low' | 'Medium' | 'High' | 'Critical';
  breakdown: PriorityScoreBreakdown;
}

export function calculatePriorityScore(
  problem: ProblemReport,
  aiAnalysis?: AIAnalysisResult | null
): PriorityScoreResult {
  // 1. Community Support (30% Weight) -> Max 30 points
  // 300+ supporters = 100% of 30 points
  const supporters = problem.supportersCount || 1;
  const supportRaw = Math.min(100, (supporters / 300) * 100);
  const supportScore = Number((supportRaw * 0.30).toFixed(1));

  // 2. Severity (25% Weight) -> Max 25 points
  const severityVal = aiAnalysis?.severity || (problem.priority === 'critical' ? 'High' : problem.priority === 'high' ? 'High' : problem.priority === 'medium' ? 'Medium' : 'Low');
  const severityRaw = severityVal === 'High' ? 100 : severityVal === 'Medium' ? 60 : 30;
  const severityScore = Number((severityRaw * 0.25).toFixed(1));

  // 3. Affected Population (20% Weight) -> Max 20 points
  const popText = (aiAnalysis?.affectedPopulation || '').toLowerCase();
  let popRaw = 50; // default 50%
  if (popText.includes('500') || popText.includes('thousands') || popText.includes('entire')) {
    popRaw = 100;
  } else if (popText.includes('250') || popText.includes('350')) {
    popRaw = 75;
  } else if (popText.includes('100')) {
    popRaw = 50;
  } else {
    popRaw = 30;
  }
  const populationScore = Number((popRaw * 0.20).toFixed(1));

  // 4. Urgency (15% Weight) -> Max 15 points
  const urgencyVal = aiAnalysis?.urgency || (problem.priority === 'critical' ? 'High' : problem.priority === 'high' ? 'High' : problem.priority === 'medium' ? 'Medium' : 'Low');
  const urgencyRaw = urgencyVal === 'High' ? 100 : urgencyVal === 'Medium' ? 60 : 30;
  const urgencyScore = Number((urgencyRaw * 0.15).toFixed(1));

  // 5. Evidence (10% Weight) -> Max 10 points
  // Has photo = 100%, description length > 50 = 100%
  const hasImage = !!problem.imageUrl;
  const hasGoodDesc = (problem.description || '').length > 40;
  const evidenceRaw = hasImage && hasGoodDesc ? 100 : hasImage || hasGoodDesc ? 70 : 40;
  const evidenceScore = Number((evidenceRaw * 0.10).toFixed(1));

  // Total Sum (0-100)
  const totalScore = Math.min(100, Math.round(supportScore + severityScore + populationScore + urgencyScore + evidenceScore));

  // Classification Level
  let level: 'Low' | 'Medium' | 'High' | 'Critical' = 'Low';
  if (totalScore >= 86) {
    level = 'Critical';
  } else if (totalScore >= 61) {
    level = 'High';
  } else if (totalScore >= 31) {
    level = 'Medium';
  } else {
    level = 'Low';
  }

  return {
    totalScore,
    level,
    breakdown: {
      supportScore,
      severityScore,
      populationScore,
      urgencyScore,
      evidenceScore
    }
  };
}
