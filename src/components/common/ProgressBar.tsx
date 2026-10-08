import React from 'react';
import { cn } from '../../lib/utils';
import { UserRole } from '../../types';

export interface ProgressBarProps {
  value: number; // 0 to 100
  label?: string;
  showPercentage?: boolean;
  size?: 'sm' | 'md' | 'lg';
  role?: UserRole;
  className?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  label,
  showPercentage = true,
  size = 'md',
  role = 'CITIZEN',
  className
}) => {
  const normRole = (role || 'CITIZEN').toString().toUpperCase();
  const clampedValue = Math.min(100, Math.max(0, value));

  const heights = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-4'
  };

  const getBarColor = () => {
    switch (normRole) {
      case 'ADMIN':
        return 'bg-gradient-to-r from-blue-600 to-sky-500';
      case 'INSTITUTE':
        return 'bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-500';
      default:
        return 'bg-gradient-to-r from-emerald-500 to-teal-600';
    }
  };

  return (
    <div className={cn('w-full space-y-1.5', className)}>
      {(label || showPercentage) && (
        <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
          {label && <span>{label}</span>}
          {showPercentage && <span className="font-mono">{clampedValue}%</span>}
        </div>
      )}
      <div className={cn('w-full bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200/60', heights[size])}>
        <div
          className={cn('h-full rounded-full transition-all duration-500 ease-out', getBarColor())}
          style={{ width: `${clampedValue}%` }}
        />
      </div>
    </div>
  );
};
