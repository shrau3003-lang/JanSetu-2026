import React, { useCallback, useEffect, useState } from 'react';
import { BarChart3, MapPin, RefreshCw } from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { StatCard } from '../../components/common/StatCard';
import { Skeleton } from '../../components/common/Loading';
import { ErrorState } from '../../components/common/ErrorState';
import { JanSetuMap } from '../../components/common/JanSetuMap';
import { ProblemReport } from '../../types';
import { adminService } from '../../services/adminService';

const countBy = <T extends string>(items: ProblemReport[], key: (p: ProblemReport) => T) =>
  items.reduce<Record<string, number>>((acc, p) => {
    const k = key(p);
    acc[k] = (acc[k] || 0) + 1;
    return acc;
  }, {});

export const AdminAnalyticsPage: React.FC = () => {
  const [problems, setProblems] = useState<ProblemReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setProblems(await adminService.fetchAllProblems());
    } catch (err: any) {
      console.error('Error loading analytics data:', err);
      setError(err?.message || 'Unable to load analytics data. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const byCategory = countBy(problems, (p) => p.category);
  const byPriority = countBy(problems, (p) => p.priority);
  const byStatus = countBy(problems, (p) => p.status);
  const total = problems.length || 1;

  const pct = (n: number) => Math.round((n / total) * 100);

  const priorityColors: Record<string, string> = {
    critical: 'bg-rose-500',
    high: 'bg-amber-500',
    medium: 'bg-yellow-400',
    low: 'bg-emerald-500'
  };

  return (
    <div className="space-y-6 pb-12">
      <PageHeader
        title="Map & Analytics"
        subtitle="Geographic distribution and live breakdowns of civic reports across all wards and departments."
        role="ADMIN"
        actions={
          <Button variant="outline" size="sm" leftIcon={<RefreshCw className="w-3.5 h-3.5" />} onClick={load}>
            Refresh
          </Button>
        }
      />

      {loading ? (
        <div className="space-y-4"><Skeleton className="h-96 w-full" /><Skeleton className="h-40 w-full" /></div>
      ) : error ? (
        <ErrorState message={error} onRetry={load} />
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard title="Total Reports" value={problems.length} icon={<BarChart3 className="w-4 h-4" />} role="ADMIN" />
            <StatCard title="Categories" value={Object.keys(byCategory).length} icon={<BarChart3 className="w-4 h-4" />} role="ADMIN" />
            <StatCard title="Locations" value={new Set(problems.map((p) => p.location)).size} icon={<MapPin className="w-4 h-4" />} role="ADMIN" />
            <StatCard title="Total Supporters" value={problems.reduce((a, p) => a + p.supportersCount, 0)} icon={<BarChart3 className="w-4 h-4" />} role="ADMIN" />
          </div>

          <Card className="p-0 overflow-hidden border-slate-200/80">
            <div className="p-4 border-b border-slate-100 flex items-center gap-2 bg-slate-50/50">
              <MapPin className="w-4 h-4 text-blue-600" />
              <h3 className="text-sm font-bold text-slate-900">Geographic Problem Map</h3>
            </div>
            <JanSetuMap problems={problems} role="ADMIN" className="h-96 w-full" />
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <Card className="p-5 border-slate-200/80 space-y-3">
              <h3 className="text-sm font-bold text-slate-900">Problems by Category</h3>
              <div className="space-y-2 text-xs">
                {Object.entries(byCategory).sort((a, b) => b[1] - a[1]).map(([cat, n]) => (
                  <div key={cat} className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-600 font-medium">{cat}</span>
                      <span className="font-bold text-slate-800">{n} ({pct(n)}%)</span>
                    </div>
                    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-600 rounded-full" style={{ width: `${pct(n)}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-5 border-slate-200/80 space-y-3">
              <h3 className="text-sm font-bold text-slate-900">Priority Distribution</h3>
              <div className="space-y-2 text-xs">
                {['critical', 'high', 'medium', 'low'].map((lvl) => (
                  <div key={lvl} className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-600 font-medium capitalize">{lvl}</span>
                      <span className="font-bold text-slate-800">{byPriority[lvl] || 0} ({pct(byPriority[lvl] || 0)}%)</span>
                    </div>
                    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${priorityColors[lvl]}`} style={{ width: `${pct(byPriority[lvl] || 0)}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-5 border-slate-200/80 space-y-3">
              <h3 className="text-sm font-bold text-slate-900">Status Breakdown</h3>
              <div className="space-y-2 text-xs">
                {Object.entries(byStatus).sort((a, b) => b[1] - a[1]).map(([st, n]) => (
                  <div key={st} className="flex items-center justify-between py-1 border-b border-slate-100 last:border-0">
                    <span className="text-slate-600 font-medium uppercase tracking-wider text-[11px]">{st}</span>
                    <span className="font-mono font-bold text-slate-800">{n}</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </>
      )}
    </div>
  );
};
