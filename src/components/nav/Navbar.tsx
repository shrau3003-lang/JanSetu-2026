import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Menu } from 'lucide-react';
import { SearchBar } from '../common/SearchBar';
import { Button } from '../common/Button';
import { NotificationsPopover } from '../common/NotificationsPopover';
import { ProfileMenu } from '../common/ProfileMenu';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types';

export interface NavbarProps {
  role: UserRole;
  title?: string;
  subtitle?: string;
  onToggleMobileSidebar?: () => void;
  onRequestReport?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  role,
  title,
  subtitle,
  onToggleMobileSidebar,
  onRequestReport
}) => {
  const [searchVal, setSearchVal] = useState('');
  const navigate = useNavigate();
  const { profile } = useAuth();
  const normRole = (role || 'CITIZEN').toString().toUpperCase();

  // Greeting always reflects the signed-in account, never a hardcoded name.
  const fullName = profile?.full_name?.trim();
  const firstName = fullName ? fullName.split(' ')[0] : '';

  const getRoleTitle = () => {
    if (title) return title;
    switch (normRole) {
      case 'ADMIN':
        return `Good morning, ${firstName || 'Officer'}! 👋`;
      case 'INSTITUTE':
        return `Welcome back, ${fullName || 'Institute'}! 🎓`;
      default:
        return `Good morning, ${firstName || 'Citizen'}! 👋`;
    }
  };

  /** Navbar search routes to the screen that can actually filter by the query. */
  const runSearch = (raw: string = searchVal) => {
    const q = raw.trim();
    const dest =
      normRole === 'ADMIN'
        ? '/admin/reports'
        : normRole === 'INSTITUTE'
        ? '/institute/challenges'
        : '/citizen';
    navigate(q ? `${dest}?q=${encodeURIComponent(q)}` : dest);
  };

  const getRoleSubtitle = () => {
    if (subtitle) return subtitle;
    switch (normRole) {
      case 'ADMIN':
        return "Here's what's happening with civic issues nationwide.";
      case 'INSTITUTE':
        return 'Together we turn real-world problems into innovative solutions.';
      default:
        return 'Together we can create a better, safer and cleaner tomorrow.';
    }
  };

  return (
    <header className="sticky top-0 z-10 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 md:px-6 py-3 flex items-center justify-between gap-4">
      {/* Left: Mobile Sidebar Toggle + Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleMobileSidebar}
          className="lg:hidden p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors focus:outline-none"
          aria-label="Open sidebar navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <h2 className="text-base md:text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            {getRoleTitle()}
          </h2>
          <p className="text-[11px] md:text-xs text-slate-500 hidden sm:block">{getRoleSubtitle()}</p>
        </div>
      </div>

      {/* Center Search bar */}
      <div className="hidden md:flex flex-1 justify-center max-w-md">
        <SearchBar
          value={searchVal}
          onChange={(e) => setSearchVal(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') runSearch();
          }}
          onClear={() => {
            setSearchVal('');
            runSearch('');
          }}
        />
      </div>

      {/* Right Action Tools */}
      <div className="flex items-center gap-2 md:gap-3">
        {/* Quick Report Button for Citizen */}
        {normRole === 'CITIZEN' && (
          <Button
            variant="primary"
            size="sm"
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={onRequestReport}
            className="shadow-sm hidden sm:inline-flex"
          >
            Report Problem
          </Button>
        )}

        {/* Notifications Popover */}
        <NotificationsPopover />

        {/* User Profile Menu */}
        <ProfileMenu />
      </div>
    </header>
  );
};
