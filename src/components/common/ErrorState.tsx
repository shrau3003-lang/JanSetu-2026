import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Button } from './Button';

export interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  className?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Something went wrong',
  message = 'We encountered an error loading this section. Please check your connection and try again.',
  onRetry,
  className
}) => {
  return (
    <div className={cn('p-6 bg-rose-50/70 border border-rose-200/80 rounded-2xl flex flex-col items-center justify-center text-center my-4', className)}>
      <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mb-3">
        <AlertCircle className="w-5 h-5" />
      </div>
      <h4 className="text-sm font-semibold text-rose-900 mb-1">{title}</h4>
      <p className="text-xs text-rose-700/80 max-w-md mb-4">{message}</p>
      {onRetry && (
        <Button variant="danger" size="sm" leftIcon={<RefreshCw className="w-3.5 h-3.5" />} onClick={onRetry}>
          Try Again
        </Button>
      )}
    </div>
  );
};
