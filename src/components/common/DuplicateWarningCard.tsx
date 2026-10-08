import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, Copy, CheckCircle2, XCircle, ArrowRight } from 'lucide-react';
import { Card } from './Card';
import { Button } from './Button';
import { DuplicateDetectionResult } from '../../services/duplicateService';
import { cn } from '../../lib/utils';

export interface DuplicateWarningCardProps {
  result: DuplicateDetectionResult;
  onMarkDuplicate?: (duplicateId: string) => void;
  onDismiss?: () => void;
  className?: string;
}

export const DuplicateWarningCard: React.FC<DuplicateWarningCardProps> = ({
  result,
  onMarkDuplicate,
  onDismiss,
  className
}) => {
  const [actionTaken, setActionTaken] = useState<'marked' | 'dismissed' | null>(null);

  if (!result.isPossibleDuplicate || actionTaken === 'dismissed') {
    return null;
  }

  if (actionTaken === 'marked') {
    return (
      <Card className="p-4 bg-amber-50 border-amber-200 text-xs text-amber-900 flex items-center justify-between">
        <span className="font-semibold flex items-center gap-1.5">
          <Copy className="w-4 h-4 text-amber-600" />
          Marked as duplicate of Report #{result.duplicateProblemId} by Admin.
        </span>
        <button onClick={() => setActionTaken(null)} className="text-amber-700 underline text-[11px]">
          Undo
        </button>
      </Card>
    );
  }

  return (
    <Card className={cn('p-5 bg-gradient-to-r from-amber-50/90 via-orange-50/50 to-white border-amber-300 space-y-3 shadow-sm', className)}>
      <div className="flex items-center justify-between border-b border-amber-200/60 pb-2">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-amber-500 text-white flex items-center justify-center font-bold">
            <AlertTriangle className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-black text-amber-950 uppercase tracking-wider">Possible Duplicate Detected</h4>
            <p className="text-[10px] text-amber-800">Gemini Semantic Match • Advisory Flag</p>
          </div>
        </div>

        <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-amber-200/80 text-amber-900 border border-amber-400">
          {result.confidence}% Confidence
        </span>
      </div>

      <div className="space-y-1.5 text-xs text-amber-900">
        <p className="leading-snug">
          <strong className="font-semibold">Match Reason:</strong> {result.reason}
        </p>

        {result.duplicateProblemId && (
          <div className="flex items-center gap-2 pt-1">
            <span className="text-slate-500 font-medium">Matching Existing Report:</span>
            <Link
              to={`/citizen/problem/${result.duplicateProblemId}`}
              target="_blank"
              className="font-mono font-bold text-amber-800 hover:text-amber-950 underline inline-flex items-center gap-1"
            >
              #{result.duplicateProblemId} ({result.duplicateTitle || 'Existing Issue'}) <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        )}
      </div>

      {/* Admin Decision Controls (Strictly No Auto Delete) */}
      <div className="pt-2 flex items-center justify-between border-t border-amber-200/60">
        <span className="text-[11px] text-slate-500 font-medium">Admin Decision Required:</span>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setActionTaken('dismissed');
              if (onDismiss) onDismiss();
            }}
            className="text-xs border-slate-300 text-slate-700 hover:bg-slate-100"
          >
            Dismiss Warning
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              setActionTaken('marked');
              if (onMarkDuplicate && result.duplicateProblemId) onMarkDuplicate(result.duplicateProblemId);
            }}
            className="text-xs bg-amber-600 hover:bg-amber-700 text-white"
          >
            Mark as Duplicate
          </Button>
        </div>
      </div>
    </Card>
  );
};
