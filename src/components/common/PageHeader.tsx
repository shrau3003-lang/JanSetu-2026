import React from 'react';
import { cn } from '../../lib/utils';
import { UserRole } from '../../types';

export interface PageHeaderProps {
  title: string;
  subtitle?: string;
  role?: UserRole;
  actions?: React.ReactNode;
  breadcrumbs?: { label: string; href?: string }[];
  className?: string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  role = 'CITIZEN',
  actions,
  breadcrumbs,
  className
}) => {
  const normRole = (role || 'CITIZEN').toString().toUpperCase();

  const getRoleAccent = () => {
    switch (normRole) {
      case 'ADMIN':
        return 'text-blue-600';
      case 'INSTITUTE':
        return 'text-indigo-600';
      default:
        return 'text-emerald-600';
    }
  };

  return (
    <div className={cn('flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-200/60 mb-6', className)}>
      <div className="space-y-1">
        {breadcrumbs && breadcrumbs.length > 0 && (
          <nav className="flex items-center gap-1.5 text-xs text-slate-400 font-medium mb-1">
            {breadcrumbs.map((b, idx) => (
              <React.Fragment key={idx}>
                {idx > 0 && <span>/</span>}
                {b.href ? (
                  <a href={b.href} className="hover:text-slate-700 transition-colors">{b.label}</a>
                ) : (
                  <span className="text-slate-600 font-semibold">{b.label}</span>
                )}
              </React.Fragment>
            ))}
          </nav>
        )}
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
          {title}
        </h1>
        {subtitle && <p className="text-xs text-slate-500 max-w-2xl">{subtitle}</p>}
      </div>

      {actions && (
        <div className="flex items-center gap-3 shrink-0">
          {actions}
        </div>
      )}
    </div>
  );
};
