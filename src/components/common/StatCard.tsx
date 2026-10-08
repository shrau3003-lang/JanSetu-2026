import React from 'react';
import { cn } from '../../lib/utils';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { Card } from './Card';
import { UserRole } from '../../types';

export interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  trend?: {
    value: string;
    isUp?: boolean;
    label?: string;
  };
  role?: UserRole;
  className?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  trend,
  role = 'CITIZEN',
  className
}) => {
  const normRole = (role || 'CITIZEN').toString().toUpperCase();

  const getIconContainerStyle = () => {
    switch (normRole) {
      case 'ADMIN':
        return 'bg-blue-50 text-blue-600 border border-blue-100';
      case 'INSTITUTE':
        return 'bg-indigo-50 text-indigo-600 border border-indigo-100';
      default:
        return 'bg-emerald-50 text-emerald-600 border border-emerald-100';
    }
  };

  return (
    <Card className={cn('p-5 border-slate-200/80 hover:shadow-md transition-all duration-200', className)}>
      <div className="flex items-start justify-between">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{title}</span>
        <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center shrink-0', getIconContainerStyle())}>
          {icon}
        </div>
      </div>

      <div className="mt-3 flex items-baseline justify-between gap-2">
        <span className="text-3xl font-black text-slate-900 tracking-tight">{value}</span>
        {trend && (
          <span
            className={cn(
              'inline-flex items-center text-xs font-bold px-2 py-0.5 rounded-full border',
              trend.isUp !== false
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : 'bg-rose-50 text-rose-700 border-rose-200'
            )}
          >
            {trend.isUp !== false ? (
              <TrendingUp className="w-3 h-3 mr-1" />
            ) : (
              <TrendingDown className="w-3 h-3 mr-1" />
            )}
            {trend.value}
          </span>
        )}
      </div>

      {(subtitle || trend?.label) && (
        <p className="text-[11px] text-slate-400 mt-1">{subtitle || trend?.label}</p>
      )}
    </Card>
  );
};
