import React from 'react';
import { Check, Clock, ChevronRight } from 'lucide-react';
import { ProjectLifecycleStatus } from '../../types';

interface ProjectLifecycleTimelineProps {
  currentStatus: ProjectLifecycleStatus | string;
  className?: string;
}

interface TimelineStep {
  status: ProjectLifecycleStatus;
  label: string;
  sublabel: string;
}

const LIFECYCLE_STEPS: TimelineStep[] = [
  { status: 'ACCEPTED', label: 'Challenge Accepted', sublabel: 'Charter signed' },
  { status: 'TEAM_FORMING', label: 'Team Formed', sublabel: 'Students onboarded' },
  { status: 'IDEATION', label: 'Ideation', sublabel: 'Architecture design' },
  { status: 'PROTOTYPE', label: 'Prototype', sublabel: 'Hardware built' },
  { status: 'FIELD_TESTING', label: 'Field Testing', sublabel: 'Sampling & pilot' },
  { status: 'DEPLOYMENT', label: 'Deployment', sublabel: 'Government handover' },
  { status: 'COMPLETED', label: 'Completed', sublabel: 'Verified & Certified' }
];

export const ProjectLifecycleTimeline: React.FC<ProjectLifecycleTimelineProps> = ({
  currentStatus,
  className = ''
}) => {
  const normStatus = (currentStatus || 'ACCEPTED').toString().toUpperCase();

  // Find index of current status
  const currentIdx = LIFECYCLE_STEPS.findIndex(s => s.status === normStatus);
  const activeIndex = currentIdx >= 0 ? currentIdx : 4; // Default to Field Testing for demo if unmapped

  return (
    <div className={`p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-4 ${className}`}>
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 animate-ping" />
          Project Lifecycle Progress
        </h4>
        <span className="text-xs font-extrabold text-indigo-700 bg-indigo-50 border border-indigo-100 px-3 py-1 rounded-full">
          Stage {activeIndex + 1} of {LIFECYCLE_STEPS.length}: {LIFECYCLE_STEPS[activeIndex].label}
        </span>
      </div>

      {/* Horizontal Step Timeline */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
        {LIFECYCLE_STEPS.map((step, idx) => {
          const isPassed = idx < activeIndex;
          const isCurrent = idx === activeIndex;
          const isUpcoming = idx > activeIndex;

          return (
            <div 
              key={step.status} 
              className={`p-3 rounded-xl border flex flex-col justify-between transition-all ${
                isPassed 
                  ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950' 
                  : isCurrent 
                  ? 'bg-indigo-600 text-white border-indigo-700 shadow-sm ring-2 ring-indigo-200' 
                  : 'bg-slate-50 border-slate-200 text-slate-400'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className={`w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center ${
                  isPassed 
                    ? 'bg-emerald-600 text-white' 
                    : isCurrent 
                    ? 'bg-white text-indigo-700' 
                    : 'bg-slate-200 text-slate-500'
                }`}>
                  {isPassed ? <Check className="w-3.5 h-3.5" /> : isCurrent ? <Clock className="w-3.5 h-3.5" /> : idx + 1}
                </span>

                <span className={`text-[10px] font-bold uppercase tracking-wider ${
                  isPassed ? 'text-emerald-700' : isCurrent ? 'text-indigo-200' : 'text-slate-400'
                }`}>
                  {isPassed ? '✓ Done' : isCurrent ? 'Active' : 'Pending'}
                </span>
              </div>

              <div>
                <h5 className={`text-xs font-bold leading-tight ${
                  isCurrent ? 'text-white' : isPassed ? 'text-slate-900' : 'text-slate-500'
                }`}>
                  {step.label}
                </h5>
                <p className={`text-[10px] mt-0.5 line-clamp-1 ${
                  isCurrent ? 'text-indigo-100' : 'text-slate-400'
                }`}>
                  {step.sublabel}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
