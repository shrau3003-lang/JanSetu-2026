import React from 'react';
import { Search, X } from 'lucide-react';
import { cn } from '../../lib/utils';

export interface SearchBarProps extends React.InputHTMLAttributes<HTMLInputElement> {
  onClear?: () => void;
  containerClassName?: string;
}

export const SearchBar = React.forwardRef<HTMLInputElement, SearchBarProps>(
  ({ className, containerClassName, value, onChange, onClear, placeholder = 'Search problems, locations, or categories...', ...props }, ref) => {
    return (
      <div className={cn('relative flex items-center w-full max-w-md', containerClassName)}>
        <Search className="absolute left-3.5 w-4 h-4 text-slate-400 pointer-events-none" />
        <input
          ref={ref}
          type="text"
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={cn(
            'w-full bg-slate-100/80 hover:bg-slate-100 focus:bg-white text-slate-800 border border-transparent focus:border-slate-300 rounded-full py-2 pl-10 pr-9 text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 placeholder:text-slate-400',
            className
          )}
          {...props}
        />
        {value && (
          <button
            type="button"
            onClick={onClear}
            className="absolute right-3 p-1 text-slate-400 hover:text-slate-600 rounded-full focus:outline-none"
            aria-label="Clear search"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    );
  }
);

SearchBar.displayName = 'SearchBar';
