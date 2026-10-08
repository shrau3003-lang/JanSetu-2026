import React from 'react';
import { cn } from '../../lib/utils';
import { UserRole } from '../../types';

export interface TabItem {
  id: string;
  label: string;
  count?: number;
  icon?: React.ReactNode;
}

export interface TabsProps {
  items: TabItem[];
  activeTab: string;
  onChange: (tabId: string) => void;
  role?: UserRole;
  variant?: 'pills' | 'underline';
  className?: string;
}

export const Tabs: React.FC<TabsProps> = ({
  items,
  activeTab,
  onChange,
  role = 'CITIZEN',
  variant = 'pills',
  className
}) => {
  const normRole = (role || 'CITIZEN').toString().toUpperCase();

  const getActivePillStyle = () => {
    switch (normRole) {
      case 'ADMIN':
        return 'bg-blue-600 text-white shadow-sm';
      case 'INSTITUTE':
        return 'bg-indigo-600 text-white shadow-sm';
      default:
        return 'bg-emerald-600 text-white shadow-sm';
    }
  };

  const getActiveUnderlineStyle = () => {
    switch (normRole) {
      case 'ADMIN':
        return 'border-blue-600 text-blue-600 font-bold';
      case 'INSTITUTE':
        return 'border-indigo-600 text-indigo-600 font-bold';
      default:
        return 'border-emerald-600 text-emerald-600 font-bold';
    }
  };

  if (variant === 'underline') {
    return (
      <div className={cn('flex items-center gap-6 border-b border-slate-200 text-sm font-medium', className)}>
        {items.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onChange(tab.id)}
              className={cn(
                'py-3 border-b-2 transition-all flex items-center gap-2 -mb-px',
                isActive ? getActiveUnderlineStyle() : 'border-transparent text-slate-500 hover:text-slate-800'
              )}
            >
              {tab.icon}
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span className={cn('px-2 py-0.5 rounded-full text-xs font-semibold', isActive ? 'bg-slate-100 text-slate-800' : 'bg-slate-100 text-slate-500')}>
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div className={cn('inline-flex items-center gap-1.5 p-1 bg-slate-100/80 rounded-2xl border border-slate-200/60', className)}>
      {items.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={cn(
              'px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 flex items-center gap-1.5 select-none',
              isActive ? getActivePillStyle() : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
            )}
          >
            {tab.icon}
            <span>{tab.label}</span>
            {tab.count !== undefined && (
              <span className={cn('px-1.5 py-0.5 rounded-full text-[10px] font-bold', isActive ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-600')}>
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};
