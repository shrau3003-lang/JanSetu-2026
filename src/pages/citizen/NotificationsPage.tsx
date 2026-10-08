import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Bell, Check, RefreshCw } from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Skeleton } from '../../components/common/Loading';
import { EmptyState } from '../../components/common/EmptyState';
import { ErrorState } from '../../components/common/ErrorState';
import { cn } from '../../lib/utils';
import { useAuth } from '../../context/AuthContext';
import { notificationService, AppNotification } from '../../services/notificationService';

export const NotificationsPage: React.FC = () => {
  const { user, role } = useAuth();
  const [items, setItems] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setItems(await notificationService.getNotifications(user?.id, role || 'CITIZEN'));
    } catch (err) {
      console.error('Error loading notifications:', err);
      setError('We could not load your notifications. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [user?.id, role]);

  useEffect(() => { load(); }, [load]);

  const unread = items.filter((n) => !n.read).length;

  const markAllRead = async () => {
    setItems((prev) => prev.map((n) => ({ ...n, read: true })));
    await Promise.all(items.filter((n) => !n.read).map((n) => notificationService.markAsRead(n.id)));
  };

  return (
    <div className="space-y-6 pb-12">
      <PageHeader
        title="Notifications"
        subtitle="Verification updates, research progress and resolutions on the issues you care about."
        role="CITIZEN"
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" leftIcon={<RefreshCw className="w-3.5 h-3.5" />} onClick={load}>
              Refresh
            </Button>
            {unread > 0 && (
              <Button variant="primary" size="sm" leftIcon={<Check className="w-3.5 h-3.5" />} onClick={markAllRead}>
                Mark all read
              </Button>
            )}
          </div>
        }
      />

      {loading ? (
        <div className="space-y-3">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </div>
      ) : error ? (
        <ErrorState message={error} onRetry={load} />
      ) : items.length === 0 ? (
        <EmptyState icon={<Bell className="w-6 h-6" />} title="No notifications yet" description="Updates about your reports will appear here." />
      ) : (
        <Card className="p-0 overflow-hidden border-slate-200/80">
          <div className="divide-y divide-slate-100">
            {items.map((n) => {
              const body = (
                <div className={cn('p-4 flex items-start gap-3 text-xs transition-colors', !n.read ? 'bg-emerald-50/40' : 'bg-white hover:bg-slate-50')}>
                  <div className={cn('w-2 h-2 rounded-full mt-1.5 shrink-0', !n.read ? 'bg-emerald-500' : 'bg-slate-300')} />
                  <div className="flex-1 space-y-0.5">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="font-bold text-slate-900 text-sm">{n.title}</h4>
                      <span className="text-[10px] text-slate-400 shrink-0">{n.time}</span>
                    </div>
                    <p className="text-slate-600 leading-snug">{n.message}</p>
                  </div>
                </div>
              );
              return n.targetUrl ? (
                <Link key={n.id} to={n.targetUrl} className="block">{body}</Link>
              ) : (
                <div key={n.id}>{body}</div>
              );
            })}
          </div>
        </Card>
      )}
    </div>
  );
};
