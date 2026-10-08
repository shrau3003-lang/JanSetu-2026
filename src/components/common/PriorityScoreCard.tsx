import React from 'react';
import { Card } from './Card';
import { Badge } from './Badge';
import { ShieldAlert, BarChart3, Users, Clock, Image as ImageIcon, ThumbsUp } from 'lucide-react';
import { calculatePriorityScore, PriorityScoreResult } from '../../lib/priorityCalculator';
import { ProblemReport } from '../../types';
import { AIAnalysisResult } from '../../services/aiService';
import { cn } from '../../lib/utils';

export interface PriorityScoreCardProps {
  problem: ProblemReport;
  aiAnalysis?: AIAnalysisResult | null;
  className?: string;
}

export const PriorityScoreCard: React.FC<PriorityScoreCardProps> = ({
  problem,
  aiAnalysis,
  className
}) => {
  const scoreResult: PriorityScoreResult = calculatePriorityScore(problem, aiAnalysis);
  const { totalScore, level, breakdown } = scoreResult;

  const getLevelBadge = () => {
    switch (level) {
      case 'Critical':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-rose-100 text-rose-800 border border-rose-300">Critical Priority ({totalScore}/100)</span>;
      case 'High':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-amber-100 text-amber-800 border border-amber-300">High Priority ({totalScore}/100)</span>;
      case 'Medium':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-yellow-100 text-yellow-800 border border-yellow-300">Medium Priority ({totalScore}/100)</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-emerald-100 text-emerald-800 border border-emerald-300">Low Priority ({totalScore}/100)</span>;
    }
  };

  return (
    <Card className={cn('p-5 border-slate-200/80 bg-white space-y-4 shadow-sm', className)}>
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-xs">
            <BarChart3 className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-sm font-extrabold text-slate-900">Priority Score Index</h4>
            <p className="text-[10px] text-slate-400">5-Factor Weighted Civic Assessment</p>
          </div>
        </div>

        {getLevelBadge()}
      </div>

      {/* 5 Factors Breakdown List */}
      <div className="space-y-2 text-xs">
        {/* 30% Community Support */}
        <div className="space-y-1">
          <div className="flex justify-between font-semibold text-slate-700 text-[11px]">
            <span className="flex items-center gap-1">
              <ThumbsUp className="w-3 h-3 text-emerald-600" /> Community Support (30%)
            </span>
            <span className="font-mono text-emerald-700">{breakdown.supportScore} / 30 pts</span>
          </div>
          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
            <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${(breakdown.supportScore / 30) * 100}%` }} />
          </div>
        </div>

        {/* 25% Severity */}
        <div className="space-y-1">
          <div className="flex justify-between font-semibold text-slate-700 text-[11px]">
            <span className="flex items-center gap-1">
              <ShieldAlert className="w-3 h-3 text-rose-600" /> Severity Assessment (25%)
            </span>
            <span className="font-mono text-rose-700">{breakdown.severityScore} / 25 pts</span>
          </div>
          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
            <div className="bg-rose-500 h-full rounded-full" style={{ width: `${(breakdown.severityScore / 25) * 100}%` }} />
          </div>
        </div>

        {/* 20% Affected Population */}
        <div className="space-y-1">
          <div className="flex justify-between font-semibold text-slate-700 text-[11px]">
            <span className="flex items-center gap-1">
              <Users className="w-3 h-3 text-blue-600" /> Affected Population (20%)
            </span>
            <span className="font-mono text-blue-700">{breakdown.populationScore} / 20 pts</span>
          </div>
          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
            <div className="bg-blue-500 h-full rounded-full" style={{ width: `${(breakdown.populationScore / 20) * 100}%` }} />
          </div>
        </div>

        {/* 15% Urgency */}
        <div className="space-y-1">
          <div className="flex justify-between font-semibold text-slate-700 text-[11px]">
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3 text-amber-600" /> Urgency Rating (15%)
            </span>
            <span className="font-mono text-amber-700">{breakdown.urgencyScore} / 15 pts</span>
          </div>
          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
            <div className="bg-amber-500 h-full rounded-full" style={{ width: `${(breakdown.urgencyScore / 15) * 100}%` }} />
          </div>
        </div>

        {/* 10% Evidence */}
        <div className="space-y-1">
          <div className="flex justify-between font-semibold text-slate-700 text-[11px]">
            <span className="flex items-center gap-1">
              <ImageIcon className="w-3 h-3 text-purple-600" /> Photo Evidence (10%)
            </span>
            <span className="font-mono text-purple-700">{breakdown.evidenceScore} / 10 pts</span>
          </div>
          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
            <div className="bg-purple-500 h-full rounded-full" style={{ width: `${(breakdown.evidenceScore / 10) * 100}%` }} />
          </div>
        </div>
      </div>
    </Card>
  );
};
