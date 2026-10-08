import React, { useState } from 'react';
import { FileUp, Link as LinkIcon, CheckCircle2, AlertCircle } from 'lucide-react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Textarea } from '../common/Textarea';
import { Input } from '../common/Input';
import { MilestoneItem } from '../../types';

interface SubmitMilestoneModalProps {
  milestone: MilestoneItem | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (milestoneId: string, evidenceText: string, evidenceUrl?: string) => Promise<void>;
}

export const SubmitMilestoneModal: React.FC<SubmitMilestoneModalProps> = ({
  milestone,
  isOpen,
  onClose,
  onSubmit
}) => {
  const [evidenceText, setEvidenceText] = useState('');
  const [evidenceUrl, setEvidenceUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!milestone) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!evidenceText.trim()) {
      setError('Please provide a description of the milestone evidence.');
      return;
    }

    setError('');
    setSubmitting(true);
    await onSubmit(milestone.id || 'm-1', evidenceText, evidenceUrl);
    setSubmitting(false);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Submit Milestone Progress & Evidence" size="md">
      <form onSubmit={handleSubmit} className="space-y-5 text-slate-800">
        
        {/* Milestone Title & Description */}
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Target Deliverable</span>
          <h4 className="text-sm font-bold text-slate-900">{milestone.name}</h4>
          {milestone.description && (
            <p className="text-xs text-slate-600">{milestone.description}</p>
          )}
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2 font-medium">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Evidence Description Input */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-900 block">
            Evidence & Testing Summary <span className="text-rose-500">*</span>
          </label>
          <Textarea
            rows={3}
            value={evidenceText}
            onChange={(e) => setEvidenceText(e.target.value)}
            placeholder="Describe the completed work, test results, hardware telemetry, or lab observations..."
            required
          />
        </div>

        {/* Optional Evidence Image / File Link */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-900 block">
            Evidence Photo or Document URL <span className="text-slate-400 font-normal">(Optional)</span>
          </label>
          <Input
            type="url"
            value={evidenceUrl}
            onChange={(e) => setEvidenceUrl(e.target.value)}
            placeholder="https://images.unsplash.com/... or storage link"
          />
          <p className="text-[11px] text-slate-400">
            Paste a link to photos, lab reports, or telemetry logs for government review.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
          <Button variant="outline" size="sm" onClick={onClose} type="button">
            Cancel
          </Button>
          <Button
            variant="primary"
            size="sm"
            role="INSTITUTE"
            type="submit"
            disabled={submitting}
            className="bg-indigo-600 hover:bg-indigo-700 text-xs font-bold"
          >
            {submitting ? 'Submitting...' : 'Submit Evidence for Government Review'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
