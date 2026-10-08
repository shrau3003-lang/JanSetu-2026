import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '../../lib/utils';

export interface LoadingProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  fullScreen?: boolean;
  className?: string;
}

export const Loading: React.FC<LoadingProps> = ({
  size = 'md',
  text = 'Loading details...',
  fullScreen = false,
  className
}) => {
  const sizeMap = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  const content = (
    <div className={cn('flex flex-col items-center justify-center gap-3 p-6 text-slate-500', className)}>
      <Loader2 className={cn('animate-spin text-emerald-600', sizeMap[size])} />
      {text && <p className="text-xs font-medium text-slate-500 animate-pulse">{text}</p>}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm">
        {content}
      </div>
    );
  }

  return content;
};

export const Skeleton: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <div className={cn('animate-pulse bg-slate-200/80 rounded-lg', className)} />
  );
};
