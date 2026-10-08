import React from 'react';
import { cn } from '../../lib/utils';
import { PriorityLevel, ProblemStatus } from '../../types';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'critical' | 'high' | 'medium' | 'low' | 'success' | 'warning' | 'info' | 'neutral' | 'purple';
  priority?: PriorityLevel;
  status?: ProblemStatus;
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({
  className,
  variant,
  priority,
  status,
  size = 'md',
  children,
  ...props
}) => {
  let resolvedVariant = variant || 'neutral';

  if (priority) {
    switch (priority) {
      case 'critical':
        resolvedVariant = 'critical';
        break;
      case 'high':
        resolvedVariant = 'high';
        break;
      case 'medium':
        resolvedVariant = 'medium';
        break;
      case 'low':
        resolvedVariant = 'low';
        break;
    }
  } else if (status) {
    switch (status) {
      case 'resolved':
      case 'verified':
        resolvedVariant = 'success';
        break;
      case 'pending':
      case 'reported':
        resolvedVariant = 'warning';
        break;
      case 'in_progress':
        resolvedVariant = 'purple';
        break;
      case 'rejected':
        resolvedVariant = 'critical';
        break;
    }
  }

  const variants = {
    critical: 'bg-rose-50 text-rose-700 border-rose-200/60 ring-rose-500/10',
    high: 'bg-amber-50 text-amber-800 border-amber-200/80 ring-amber-500/10',
    medium: 'bg-orange-50 text-orange-700 border-orange-200/60 ring-orange-500/10',
    low: 'bg-emerald-50 text-emerald-700 border-emerald-200/60 ring-emerald-500/10',
    success: 'bg-teal-50 text-teal-700 border-teal-200/60 ring-teal-500/10',
    warning: 'bg-yellow-50 text-yellow-800 border-yellow-200/80 ring-yellow-500/10',
    info: 'bg-sky-50 text-sky-700 border-sky-200/60 ring-sky-500/10',
    purple: 'bg-indigo-50 text-indigo-700 border-indigo-200/60 ring-indigo-500/10',
    neutral: 'bg-slate-100 text-slate-700 border-slate-200 ring-slate-500/10',
  };

  const sizes = {
    sm: 'px-2 py-0.5 text-[11px]',
    md: 'px-2.5 py-1 text-xs'
  };

  const priorityLabels: Record<PriorityLevel, string> = {
    critical: 'Critical Priority',
    high: 'High Priority',
    medium: 'Medium Priority',
    low: 'Low Priority'
  };

  const content = children || (priority ? priorityLabels[priority] : status);

  return (
    <span
      className={cn(
        'inline-flex items-center font-semibold rounded-full border ring-1 ring-inset transition-colors duration-150',
        variants[resolvedVariant],
        sizes[size],
        className
      )}
      {...props}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70 mr-1.5 inline-block" />
      {content}
    </span>
  );
};
