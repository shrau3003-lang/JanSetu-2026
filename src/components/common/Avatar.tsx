import React from 'react';
import { cn } from '../../lib/utils';
import { UserRole } from '../../types';

export interface AvatarProps {
  name: string;
  src?: string | null;
  role?: UserRole;
  className?: string;
  alt?: string;
}

const initialsOf = (name: string): string => {
  const parts = (name || '').trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'JS';
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

/**
 * Profile picture with a graceful initials fallback.
 * Used wherever a real avatar URL may be missing, so we never show a stock photo
 * of somebody who is not the signed-in user.
 */
export const Avatar: React.FC<AvatarProps> = ({ name, src, role = 'CITIZEN', className, alt }) => {
  const normRole = (role || 'CITIZEN').toString().toUpperCase();

  const fallbackStyle =
    normRole === 'ADMIN'
      ? 'bg-blue-600 text-white border-blue-500'
      : normRole === 'INSTITUTE'
      ? 'bg-indigo-600 text-white border-indigo-500'
      : 'bg-emerald-600 text-white border-emerald-500';

  if (src) {
    return (
      <img
        src={src}
        alt={alt || name}
        className={cn('w-16 h-16 rounded-2xl object-cover border border-slate-200 shadow-sm', className)}
      />
    );
  }

  return (
    <div
      aria-label={alt || name}
      className={cn(
        'w-16 h-16 rounded-2xl flex items-center justify-center font-black text-lg border shadow-sm shrink-0',
        fallbackStyle,
        className
      )}
    >
      {initialsOf(name)}
    </div>
  );
};
