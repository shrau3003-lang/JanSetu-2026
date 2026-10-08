import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { AIAnalysisCard } from '../common/AIAnalysisCard';
import { PriorityScoreCard } from '../common/PriorityScoreCard';
import { DuplicateWarningCard } from '../common/DuplicateWarningCard';
import { Check, X, Copy, MapPin, Clock, ThumbsUp, ShieldAlert, AlertTriangle } from 'lucide-react';
import { ProblemReport } from '../../types';
import { duplicateService, DuplicateDetectionResult } from '../../services/duplicateService';
import { adminService } from '../../services/adminService';

export interface AdminProblemModalProps {
  isOpen: boolean;
  onClose: () => void;
  problem: ProblemReport | null;
  onActionComplete?: () => void;
  onVerificationComplete?: () => void;
}

export const AdminProblemModal: React.FC<AdminProblemModalProps> = ({
  isOpen,
  onClose,
  problem,
  onActionComplete,
  onVerificationComplete
}) => {
  const [duplicateResult, setDuplicateResult] = useState<DuplicateDetectionResult | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (problem) {
      duplicateService.checkDuplicate(problem, []).then(setDuplicateResult);
    }
  }, [problem]);

  if (!problem) return null;

  const handleVerify = async () => {
    setSubmitting(true);
    try {
      await adminService.verifyProblem(problem.id);
      setSubmitting(false);
      onClose();
      if (onVerificationComplete) {
        onVerificationComplete();
      } else if (onActionComplete) {
        onActionComplete();
      }
    } catch (err) {
      setSubmitting(false);
    }
  };

  const handleReject = async () => {
    setSubmitting(true);
    try {
      await adminService.rejectProblem(problem.id);
      setSubmitting(false);
      onClose();
      if (onActionComplete) onActionComplete();
    } catch (err) {
      setSubmitting(false);
    }
  };

  const handleMarkDuplicate = async (dupId: string) => {
    setSubmitting(true);
    try {
      await adminService.markDuplicateProblem(problem.id, dupId);
      setSubmitting(false);
      onClose();
      if (onActionComplete) onActionComplete();
    } catch (err) {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="xl"
      title={
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs font-bold text-slate-400">#{problem.id}</span>
          <Badge priority={problem.priority} size="sm" />
          <span className="text-sm font-bold text-slate-900">Official Government Review</span>
        </div>
      }
      footer={
        <div className="flex items-center justify-between w-full">
          <div className="text-xs text-slate-500 font-medium">
            AI is advisory only. Official admin approval required.
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              leftIcon={<X className="w-4 h-4 text-rose-600" />}
              onClick={handleReject}
              isLoading={submitting}
              className="text-rose-600 border-rose-200 hover:bg-rose-50"
            >
              Reject Report
            </Button>

            <Button
              variant="success"
              size="sm"
              leftIcon={<Check className="w-4 h-4" />}
              onClick={handleVerify}
              isLoading={submitting}
            >
              Verify & Route Issue
            </Button>
          </div>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Basic Header Info */}
        <div className="space-y-2">
          <h2 className="text-xl font-black text-slate-900 leading-tight">{problem.title}</h2>
          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
            <span className="flex items-center gap-1 font-semibold text-slate-700">
              <MapPin className="w-3.5 h-3.5 text-blue-600" /> {problem.location}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-slate-400" /> Reported {problem.createdAt}
            </span>
            <span className="flex items-center gap-1 font-bold text-emerald-700">
              <ThumbsUp className="w-3.5 h-3.5 text-emerald-600" /> {problem.supportersCount} Supporters
            </span>
          </div>
        </div>

        {/* Media Preview & Description */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
          {problem.imageUrl && (
            <div className="md:col-span-5">
              <img
                src={problem.imageUrl}
                alt={problem.title}
                className="w-full h-48 object-cover rounded-xl border border-slate-200"
              />
            </div>
          )}
          <div className={problem.imageUrl ? 'md:col-span-7' : 'md:col-span-12'}>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-1">Issue Narrative</span>
            <p className="text-xs text-slate-700 bg-slate-50 p-3.5 rounded-xl border border-slate-200/70 leading-relaxed">
              {problem.description}
            </p>
          </div>
        </div>

        {/* Possible Duplicate Alert Card */}
        {duplicateResult && duplicateResult.isPossibleDuplicate && (
          <DuplicateWarningCard
            result={duplicateResult}
            onMarkDuplicate={handleMarkDuplicate}
            onDismiss={() => setDuplicateResult(null)}
          />
        )}

        {/* Grid: 5-Factor Priority Score + Gemini AI Analysis */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <PriorityScoreCard problem={problem} />

          <AIAnalysisCard
            problemId={problem.id}
            title={problem.title}
            description={problem.description}
            category={problem.category}
            location={problem.location}
          />
        </div>
      </div>
    </Modal>
  );
};
