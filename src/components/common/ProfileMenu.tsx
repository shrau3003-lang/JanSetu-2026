import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { User, LogOut, Shield, Building, Users, ChevronDown } from 'lucide-react';
import { cn } from '../../lib/utils';
import { UserRole } from '../../types';

export const ProfileMenu: React.FC = () => {
  const { profile, role, signOut, switchMockRole } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const normRole = (role || profile?.role || 'CITIZEN').toString().toUpperCase() as UserRole;

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  const handleSwitchRole = (newRole: UserRole) => {
    switchMockRole(newRole);
    setIsOpen(false);
    const dest = newRole === 'ADMIN' ? '/admin' : newRole === 'INSTITUTE' ? '/institute' : '/citizen';
    navigate(dest);
  };

  const getRoleBadgeStyle = () => {
    switch (normRole) {
      case 'ADMIN':
        return 'bg-blue-600 text-white';
      case 'INSTITUTE':
        return 'bg-indigo-600 text-white';
      default:
        return 'bg-emerald-600 text-white';
    }
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-1 rounded-full hover:bg-slate-100 transition-colors focus:outline-none"
      >
        <div className={cn('w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs shadow-sm', getRoleBadgeStyle())}>
          {profile?.full_name ? profile.full_name.substring(0, 2).toUpperCase() : 'JS'}
        </div>
        <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-200 z-50 overflow-hidden animate-scaleUp">
          <div className="p-4 border-b border-slate-100 bg-slate-50/70">
            <h4 className="font-bold text-slate-900 text-sm truncate">{profile?.full_name || 'JanSetu User'}</h4>
            <p className="text-xs text-slate-500 truncate">{profile?.email || 'user@jansetu.org'}</p>
            <div className="mt-2">
              <span className={cn('px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider', getRoleBadgeStyle())}>
                Role: {normRole}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="p-1">
            <button
              onClick={handleSignOut}
              className="w-full flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

