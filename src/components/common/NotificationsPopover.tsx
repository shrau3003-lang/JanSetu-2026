import React, { useState, useRef, useEffect } from 'react';
import { Bell, Check, Trash2, Clock, Sparkles } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Button } from './Button';
import { useAuth } from '../../context/AuthContext';
import { notificationService, AppNotification } from '../../services/notificationService';

export const NotificationsPopover: React.FC = () => {
  const { user, role } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  useEffect(() => {
    let isMounted = true;
    const loadNotifs = async () => {
      const data = await notificationService.getNotifications(user?.id, role || 'CITIZEN');
      if (isMounted) setNotifications(data);
    };
    loadNotifs();
    return () => { isMounted = false; };
  }, [user, role]);

  const popoverRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  return (
    <div className="relative" ref={popoverRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors focus:outline-none"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-rose-500 rounded-full ring-2 ring-white animate-pulse" />
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-slate-200 z-50 overflow-hidden animate-scaleUp">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-emerald-600" />
              <h3 className="text-sm font-bold text-slate-900">Notifications</h3>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700">
                  {unreadCount} new
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                className="text-xs text-emerald-600 hover:text-emerald-700 font-semibold"
              >
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
            {notifications.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-400">No notifications</div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  className={cn(
                    'p-3.5 transition-colors flex items-start gap-3 text-xs',
                    !n.read ? 'bg-emerald-50/30 font-medium' : 'bg-white text-slate-600'
                  )}
                >
                  <div className={cn('w-2 h-2 rounded-full mt-1.5 shrink-0', !n.read ? 'bg-emerald-500' : 'bg-slate-300')} />
                  <div className="flex-1 space-y-0.5">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-slate-900">{n.title}</h4>
                      <span className="text-[10px] text-slate-400">{n.time}</span>
                    </div>
                    <p className="text-slate-600 leading-snug">{n.message}</p>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="p-2 border-t border-slate-100 text-center bg-slate-50/50">
            <span className="text-[11px] font-medium text-slate-400">JanSetu Notification Center</span>
          </div>
        </div>
      )}
    </div>
  );
};
