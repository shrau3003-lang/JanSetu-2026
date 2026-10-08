import React from 'react';
import { Sparkles, Check, X, Building2, Cpu, MapPin } from 'lucide-react';
import { Challenge } from '../../types';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';

interface MatchExplanationModalProps {
  challenge: Challenge | null;
  isOpen: boolean;
  onClose: () => void;
  onAccept: (challengeId: string) => void;
  isAccepted: boolean;
}

export const MatchExplanationModal: React.FC<MatchExplanationModalProps> = ({
  challenge,
  isOpen,
  onClose,
  onAccept,
  isAccepted
}) => {
  if (!challenge) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Challenge AI Capability Match" size="lg">
      <div className="space-y-6">
        {/* Banner Header */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-900 via-indigo-850 to-slate-900 text-white space-y-3 relative overflow-hidden shadow-md">
          <div className="absolute right-3 top-3 opacity-10 pointer-events-none">
            <Sparkles className="w-32 h-32 text-indigo-400" />
          </div>

          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-2">
              <Badge priority={challenge.priority} size="sm" />
              <span className="text-xs font-semibold text-indigo-200">{challenge.category}</span>
            </div>

            <div className="inline-flex items-center gap-1.5 bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 px-3 py-1 rounded-full text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>{challenge.matchPercentage}% Match</span>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-bold text-white">{challenge.title}</h3>
            <p className="text-xs text-indigo-200/90 flex items-center gap-1.5 mt-1">
              <MapPin className="w-3.5 h-3.5 text-indigo-300" />
              {challenge.location}
            </p>
          </div>
        </div>

        {/* Match Explanation Box */}
        <div className="p-4 rounded-xl bg-indigo-50/60 border border-indigo-100 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              Why this challenge matches your institute
            </h4>
            <span className="text-xs font-bold text-indigo-700 bg-indigo-100 px-2.5 py-0.5 rounded-md">
              {challenge.matchPercentage}% Capability Score
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            {challenge.matchedSkillsChecklist.map((item, idx) => (
              <div 
                key={idx} 
                className={`p-2.5 rounded-lg border flex items-center justify-between ${
                  item.matched 
                    ? 'bg-white border-emerald-200 text-slate-800' 
                    : 'bg-slate-50 border-slate-200 text-slate-500'
                }`}
              >
                <span className="font-semibold flex items-center gap-2">
                  {item.matched ? (
                    <span className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-[10px] font-bold">✓</span>
                  ) : (
                    <span className="w-4 h-4 rounded-full bg-slate-200 text-slate-500 flex items-center justify-center text-[10px] font-bold">✕</span>
                  )}
                  {item.name}
                </span>
                <span className={`text-[10px] font-bold uppercase tracking-wider ${item.matched ? 'text-emerald-600' : 'text-slate-400'}`}>
                  {item.matched ? 'Matched' : 'Optional'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Required Department & Description */}
        <div className="space-y-3 text-xs">
          <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl border border-slate-200/80">
            <Building2 className="w-4 h-4 text-indigo-600 shrink-0" />
            <div>
              <span className="font-bold text-slate-900 block">Recommended Department:</span>
              <span className="text-slate-600">{challenge.requiredDepartment}</span>
            </div>
          </div>

          <div>
            <h5 className="font-bold text-slate-900 mb-1">Problem Details & Scope</h5>
            <p className="text-slate-600 leading-relaxed bg-white p-3 rounded-xl border border-slate-200/80">
              {challenge.description}
            </p>
          </div>

          <div>
            <h5 className="font-bold text-slate-900 mb-1.5">Required Technical Domains</h5>
            <div className="flex flex-wrap gap-1.5">
              {challenge.requiredSkills.map((skill, i) => (
                <span key={i} className="px-2.5 py-1 rounded-md bg-indigo-50 text-indigo-700 font-semibold text-[11px] border border-indigo-100">
                  <Cpu className="w-3 h-3 inline mr-1 text-indigo-500" />
                  {skill}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
          <Button variant="outline" size="sm" onClick={onClose}>
            Close
          </Button>

          {isAccepted ? (
            <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">
              <Check className="w-4 h-4" /> Challenge Accepted
            </span>
          ) : (
            <Button
              variant="primary"
              size="sm"
              role="INSTITUTE"
              onClick={() => {
                onAccept(challenge.id);
                onClose();
              }}
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              Accept Challenge
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
};
