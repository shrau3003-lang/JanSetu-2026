import { ProblemReport } from '../types';

export interface DuplicateDetectionResult {
  isPossibleDuplicate: boolean;
  confidence: number; // 0 to 100
  reason: string;
  duplicateProblemId?: string;
  duplicateTitle?: string;
}

export const duplicateService = {
  // Simple & fast text-similarity duplicate detector without vector databases
  async checkDuplicate(
    targetProblem: ProblemReport,
    candidateProblems: ProblemReport[]
  ): Promise<DuplicateDetectionResult> {
    // Filter candidate problems (same category, different ID)
    const candidates = candidateProblems.filter(
      (p) => p.id !== targetProblem.id && p.category === targetProblem.category
    );

    if (candidates.length === 0) {
      return {
        isPossibleDuplicate: false,
        confidence: 0,
        reason: 'No similar reports found in this category.'
      };
    }

    const targetWords = (targetProblem.title + ' ' + targetProblem.location + ' ' + targetProblem.description)
      .toLowerCase()
      .split(/\W+/)
      .filter((w) => w.length > 3);

    let highestMatch: ProblemReport | null = null;
    let maxOverlap = 0;

    for (const cand of candidates) {
      const candWords = (cand.title + ' ' + cand.location + ' ' + cand.description)
        .toLowerCase()
        .split(/\W+/)
        .filter((w) => w.length > 3);

      const overlapCount = targetWords.filter((w) => candWords.includes(w)).length;
      if (overlapCount > maxOverlap) {
        maxOverlap = overlapCount;
        highestMatch = cand;
      }
    }

    if (highestMatch && maxOverlap >= 3) {
      const confidence = Math.min(95, 70 + maxOverlap * 5);
      return {
        isPossibleDuplicate: true,
        confidence,
        reason: `Both reports cite "${highestMatch.title}" at "${highestMatch.location}" with overlapping issue descriptors.`,
        duplicateProblemId: highestMatch.id,
        duplicateTitle: highestMatch.title
      };
    }

    return {
      isPossibleDuplicate: false,
      confidence: 15,
      reason: 'Issue appears unique based on title and location analysis.'
    };
  }
};
