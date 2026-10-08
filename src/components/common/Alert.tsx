import React from 'react';
import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react';
import { cn } from '../../lib/utils';

export type AlertVariant = 'success' | 'error' | 'info';

export interface AlertProps {
  variant?: AlertVariant;
  title?: string;
  message: string;
  onDismiss?: () => void;
  className?: string;
}

/**
 * Small inline status banner, styled to match the existing submission-error panel
 * on the Submit Report page. Used to surface action results (challenge accepted,
 * report failed, etc.) instead of silently swallowing them in the console.
 */
export const Alert: React.FC<AlertProps> = ({ variant = 'info', title, message, onDismiss, className }) => {
  const styles: Record<AlertVariant, string> = {
    success: 'bg-emerald-50 border-emerald-200 text-emerald-800',
    error: 'bg-rose-50 border-rose-200 text-rose-800',
    info: 'bg-sky-50 border-sky-200 text-sky-800'
  };

  const iconStyles: Record<AlertVariant, string> = {
    success: 'text-emerald-600',
    error: 'text-rose-600',
    info: 'text-sky-600'
  };

  const Icon = variant === 'success' ? CheckCircle2 : variant === 'error' ? AlertCircle : Info;

  return (
    <div
      role="status"
      className={cn('p-4 border rounded-2xl flex items-start gap-3 text-xs', styles[variant], className)}
    >
      <Icon className={cn('w-5 h-5 shrink-0 mt-0.5', iconStyles[variant])} />
      <div className="flex-1 space-y-0.5">
        {title && <h4 className="font-bold">{title}</h4>}
        <p className="leading-relaxed">{message}</p>
      </div>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Dismiss message"
          className="p-1 rounded-lg hover:bg-white/60 transition-colors shrink-0"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
};
