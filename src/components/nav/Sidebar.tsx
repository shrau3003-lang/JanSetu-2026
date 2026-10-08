import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Home, 
  MapPin, 
  TrendingUp, 
  FileText, 
  MessageSquare, 
  User, 
  CheckSquare, 
  Layers, 
  Building2, 
  BarChart3, 
  Settings, 
  Award, 
  Users, 
  Briefcase,
  ShieldAlert,
  Sparkles,
  ThumbsUp,
  Bell,
  X
} from 'lucide-react';
import { UserRole } from '../../types';
import { cn } from '../../lib/utils';

export interface SidebarProps {
  role: UserRole;
  onCloseMobile?: () => void;
  className?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({ role, onCloseMobile, className }) => {
  const normRole = (role || 'CITIZEN').toString().toLowerCase();

  const getNavItems = () => {
    switch (normRole) {
      case 'admin':
        return [
          { label: 'Dashboard', path: '/admin', icon: Home },
          { label: 'Problem Verification', path: '/admin/verification', icon: CheckSquare },
          { label: 'Priority Queue', path: '/admin/queue', icon: ShieldAlert },
          { label: 'Institute Matching', path: '/admin/matching', icon: Layers },
          { label: 'Projects', path: '/admin/projects', icon: Briefcase },
          { label: 'Map & Analytics', path: '/admin/analytics', icon: BarChart3 },
          { label: 'Reports', path: '/admin/reports', icon: FileText },
          { label: 'Settings', path: '/admin/settings', icon: Settings },
        ];
      case 'institute':
        return [
          { label: 'Dashboard', path: '/institute', icon: Home },
          { label: 'Available Challenges', path: '/institute/challenges', icon: Layers },
          { label: 'My Projects', path: '/institute/projects', icon: Briefcase },
          { label: 'My Team', path: '/institute/team', icon: Users },
          { label: 'Mentors', path: '/institute/mentors', icon: Building2 },
          { label: 'Certificates', path: '/institute/certificates', icon: Award },
          { label: 'Impact', path: '/institute/impact', icon: BarChart3 },
          { label: 'Institute Profile', path: '/institute/profile', icon: User },
        ];
      default: // citizen (Matching Stage 4 requested specification)
        return [
          { label: 'Home', path: '/citizen', icon: Home },
          { label: 'Nearby', path: '/citizen/nearby', icon: MapPin },
          { label: 'Trending', path: '/citizen/trending', icon: TrendingUp },
          { label: 'My Reports', path: '/citizen/reports', icon: FileText },
          { label: 'Supported', path: '/citizen/supported', icon: ThumbsUp },
          { label: 'Notifications', path: '/citizen/notifications', icon: Bell },
          { label: 'Profile', path: '/citizen/profile', icon: User },
        ];
    }
  };

  const navItems = getNavItems();

  const getThemeStyles = () => {
    switch (normRole) {
      case 'admin':
        return {
          container: 'bg-slate-900 text-slate-300 border-r border-slate-800',
          logoBg: 'bg-blue-600 text-white',
          title: 'text-white font-bold',
          subTitle: 'text-blue-400 text-[10px]',
          activeItem: 'bg-blue-600 text-white font-semibold shadow-sm shadow-blue-900/50',
          inactiveItem: 'text-slate-400 hover:bg-slate-800/80 hover:text-white',
          footerText: 'text-slate-500'
        };
      case 'institute':
        return {
          container: 'bg-white text-slate-700 border-r border-indigo-100/80',
          logoBg: 'bg-indigo-600 text-white',
          title: 'text-slate-900 font-bold',
          subTitle: 'text-indigo-600 text-[10px]',
          activeItem: 'bg-indigo-50 text-indigo-700 font-semibold border-r-4 border-indigo-600',
          inactiveItem: 'text-slate-600 hover:bg-slate-50 hover:text-indigo-600',
          footerText: 'text-slate-400'
        };
      default: // citizen
        return {
          container: 'bg-white text-slate-700 border-r border-slate-200/80',
          logoBg: 'bg-emerald-500 text-white',
          title: 'text-slate-900 font-bold',
          subTitle: 'text-emerald-600 text-[10px]',
          activeItem: 'bg-emerald-50 text-emerald-700 font-semibold border-r-4 border-emerald-600',
          inactiveItem: 'text-slate-600 hover:bg-slate-50 hover:text-emerald-600',
          footerText: 'text-slate-400'
        };
    }
  };

  const theme = getThemeStyles();

  return (
    <aside className={cn('w-64 flex flex-col shrink-0 h-screen sticky top-0 select-none z-20', theme.container, className)}>
      {/* Brand Header */}
      <div className="p-5 flex items-center justify-between border-b border-inherit">
        <div className="flex items-center gap-3">
          <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center font-black text-lg shadow-sm', theme.logoBg)}>
            JS
          </div>
          <div>
            <h1 className={cn('text-lg leading-tight tracking-tight', theme.title)}>JanSetu</h1>
            <p className={cn('uppercase font-medium tracking-wider', theme.subTitle)}>
              {normRole === 'admin' ? 'Government Portal' : normRole === 'institute' ? 'Institute Portal' : 'Citizen Platform'}
            </p>
          </div>
        </div>

        {onCloseMobile && (
          <button onClick={onCloseMobile} className="lg:hidden p-1 text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={onCloseMobile}
              end={item.path === `/` || item.path === `/${normRole}`}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm transition-all duration-150',
                  isActive ? theme.activeItem : theme.inactiveItem
                )
              }
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Footer Branding Slogan */}
      <div className="p-4 border-t border-inherit text-center">
        <div className="flex items-center justify-center gap-1.5 text-xs mb-1">
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          <span className={cn('font-semibold text-[11px] uppercase tracking-wider', theme.footerText)}>
            {normRole === 'admin'
              ? 'Working for A Better Tomorrow'
              : normRole === 'institute'
              ? 'Innovate. Collaborate. Impact.'
              : 'Stronger Communities. Brighter Future.'}
          </span>
        </div>
      </div>
    </aside>
  );
};
