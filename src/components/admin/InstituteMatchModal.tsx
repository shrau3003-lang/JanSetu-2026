import React, { useState } from 'react';
import { 
  Building2, 
  Sparkles, 
  CheckCircle2, 
  MapPin, 
  ShieldCheck, 
  Cpu, 
  Users, 
  Layers,
  Award
} from 'lucide-react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { MatchResult } from '../../lib/instituteMatchEngine';
import { ProblemReport } from '../../types';

interface InstituteMatchModalProps {
  problem: ProblemReport | null;
  matchResult: MatchResult | null;
  isOpen: boolean;
  onClose: () => void;
  onApprove: (problemId: string, matchResult: MatchResult) => Promise<void>;
  isApproved?: boolean;
}

export const InstituteMatchModal: React.FC<InstituteMatchModalProps> = ({
  problem,
  matchResult,
  isOpen,
  onClose,
  onApprove,
  isApproved = false
}) => {
  const [approving, setApproving] = useState(false);

  if (!problem || !matchResult) return null;

  const { institute, matchScore, breakdown, matchedSkillsChecklist, reasons } = matchResult;

  const handleApproveClick = async () => {
    setApproving(true);
    await onApprove(problem.id, matchResult);
    setApproving(false);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Government Official Match Review" size="lg">
      <div className="space-y-6 text-slate-800">
        
        {/* Banner Header */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-850 to-blue-950 text-white space-y-3 relative overflow-hidden shadow-md">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-2">
              <Badge priority={problem.priority} size="sm" />
              <span className="text-xs font-semibold text-blue-300">{problem.category}</span>
            </div>

            <div className="inline-flex items-center gap-1.5 bg-blue-500/20 border border-blue-400/40 text-blue-200 px-3 py-1 rounded-full text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5 text-blue-300" />
              <span>{matchScore}% Capability Match</span>
            </div>
          </div>

          <div>
            <h3 className="text-base font-bold text-white">{problem.title}</h3>
            <p className="text-xs text-slate-300 flex items-center gap-1.5 mt-1">
              <MapPin className="w-3.5 h-3.5 text-blue-400" />
              {problem.location}
            </p>
          </div>
        </div>

        {/* Candidate Institute Details */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-3 shadow-2xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-sm">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-base font-bold text-slate-900">{institute.name}</h4>
                <p className="text-xs text-blue-600 font-medium">{institute.department} • {institute.accreditation}</p>
              </div>
            </div>

            <div className="text-right">
              <span className="text-xl font-extrabold text-blue-700 block">{matchScore}%</span>
              <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Match Index</span>
            </div>
          </div>

          {/* Transparent Matched Skills Checklist */}
          <div className="space-y-2 pt-1">
            <h5 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              Capability Verification Checklist
            </h5>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {matchedSkillsChecklist.map((item, idx) => (
                <div 
                  key={idx} 
                  className={`p-2.5 rounded-lg border flex items-center justify-between ${
                    item.matched 
                      ? 'bg-emerald-50/60 border-emerald-200 text-emerald-900' 
                      : 'bg-slate-50 border-slate-200 text-slate-500'
                  }`}
                >
                  <span className="font-semibold flex items-center gap-2">
                    {item.matched ? (
                      <span className="w-4 h-4 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px] font-bold">✓</span>
                    ) : (
                      <span className="w-4 h-4 rounded-full bg-slate-300 text-slate-600 flex items-center justify-center text-[10px] font-bold">✕</span>
                    )}
                    {item.name}
                  </span>
                  <span className={`text-[10px] font-bold uppercase tracking-wider ${item.matched ? 'text-emerald-700' : 'text-slate-400'}`}>
                    {item.matched ? 'Verified' : 'Missing'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 5-Factor Weighted Formula Breakdown */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
          <h5 className="text-xs font-bold text-slate-900 flex items-center gap-1.5 uppercase tracking-wider">
            <Sparkles className="w-4 h-4 text-blue-600" />
            Weighted Match Formula Breakdown (100% Total)
          </h5>

          <div className="space-y-2 text-xs">
            <div>
              <div className="flex justify-between font-semibold text-slate-700 mb-1">
                <span>1. Skill Match (50% max weight)</span>
                <span className="text-blue-700 font-bold">{breakdown.skillScore} / 50 pts</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2">
                <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${(breakdown.skillScore / 50) * 100}%` }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between font-semibold text-slate-700 mb-1">
                <span>2. Department Alignment (20% max weight)</span>
                <span className="text-blue-700 font-bold">{breakdown.departmentScore} / 20 pts</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2">
                <div className="bg-indigo-600 h-2 rounded-full" style={{ width: `${(breakdown.departmentScore / 20) * 100}%` }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between font-semibold text-slate-700 mb-1">
                <span>3. Problem Category Expertise (15% max weight)</span>
                <span className="text-blue-700 font-bold">{breakdown.categoryScore} / 15 pts</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2">
                <div className="bg-emerald-600 h-2 rounded-full" style={{ width: `${(breakdown.categoryScore / 15) * 100}%` }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between font-semibold text-slate-700 mb-1">
                <span>4. Location & Geographic Proximity (10% max weight)</span>
                <span className="text-blue-700 font-bold">{breakdown.locationScore} / 10 pts</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2">
                <div className="bg-teal-600 h-2 rounded-full" style={{ width: `${(breakdown.locationScore / 10) * 100}%` }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between font-semibold text-slate-700 mb-1">
                <span>5. R&D Capacity Availability (5% max weight)</span>
                <span className="text-blue-700 font-bold">{breakdown.capacityScore} / 5 pts</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2">
                <div className="bg-amber-600 h-2 rounded-full" style={{ width: `${(breakdown.capacityScore / 5) * 100}%` }} />
              </div>
            </div>
          </div>
        </div>

        {/* Match Justifications */}
        <div className="space-y-1.5 text-xs">
          <h5 className="font-bold text-slate-900">Government Decision Factors</h5>
          <ul className="space-y-1">
            {reasons.map((r, i) => (
              <li key={i} className="flex items-center gap-2 text-slate-600 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                {r}
              </li>
            ))}
          </ul>
        </div>

        {/* Modal Actions */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
          <Button variant="outline" size="sm" onClick={onClose}>
            Close
          </Button>

          {isApproved ? (
            <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-200">
              <CheckCircle2 className="w-4 h-4" /> Match Approved & Assigned
            </span>
          ) : (
            <Button
              variant="primary"
              size="sm"
              role="ADMIN"
              onClick={handleApproveClick}
              disabled={approving}
              className="bg-blue-600 hover:bg-blue-700 text-xs font-bold"
            >
              {approving ? 'Approving Match...' : 'Approve & Assign Match'}
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
};
