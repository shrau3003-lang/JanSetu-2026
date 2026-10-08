import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Briefcase, MapPin, RefreshCw, Users } from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { StatCard } from '../../components/common/StatCard';
import { ProgressBar } from '../../components/common/ProgressBar';
import { Skeleton } from '../../components/common/Loading';
import { EmptyState } from '../../components/common/EmptyState';
import { ErrorState } from '../../components/common/ErrorState';
import { InstituteProject } from '../../types';
import { instituteService } from '../../services/instituteService';

export const AdminProjectsPage: React.FC = () => {
  const [projects, setProjects] = useState<InstituteProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setProjects(await instituteService.getAllProjects());
    } catch (err: any) {
      console.error('Error loading projects:', err);
      setError(err?.message || 'Unable to load projects. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const completed = projects.filter((p) => p.status === 'Completed' || p.status === 'COMPLETED').length;
  const avgProgress = projects.length
    ? Math.round(projects.reduce((a, p) => a + p.progressPercentage, 0) / projects.length)
    : 0;

  return (
    <div className="space-y-6 pb-12">
      <PageHeader
        title="Government Project Oversight"
        subtitle="Every institute-led civic project, its milestone progress, and deliverables awaiting officer review."
        role="ADMIN"
        actions={
          <Button variant="outline" size="sm" leftIcon={<RefreshCw className="w-3.5 h-3.5" />} onClick={load}>
            Refresh
          </Button>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Projects" value={projects.length} icon={<Briefcase className="w-4 h-4" />} role="ADMIN" />
        <StatCard title="Active" value={projects.length - completed} icon={<Briefcase className="w-4 h-4" />} role="ADMIN" />
        <StatCard title="Completed" value={completed} icon={<Briefcase className="w-4 h-4" />} role="ADMIN" />
        <StatCard title="Avg. Progress" value={`${avgProgress}%`} icon={<Briefcase className="w-4 h-4" />} role="ADMIN" />
      </div>

      {loading ? (
        <div className="space-y-4"><Skeleton className="h-36 w-full" /><Skeleton className="h-36 w-full" /></div>
      ) : error ? (
        <ErrorState message={error} onRetry={load} />
      ) : projects.length === 0 ? (
        <EmptyState icon={<Briefcase className="w-6 h-6" />} title="No projects yet" description="Projects appear here once institutes accept verified community challenges." />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {projects.map((p) => (
            <Card key={p.id} className="p-5 border-slate-200/90 space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <span className="inline-block px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 text-[10px] font-bold uppercase tracking-wider mb-1">
                    {p.status}
                  </span>
                  <h4 className="text-sm font-bold text-slate-900">{p.title}</h4>
                  <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3 h-3 text-slate-400" /> {p.location} • {p.guideInstitute}
                  </p>
                </div>
                <span className="text-xs font-black text-blue-700 bg-blue-50 border border-blue-100 px-2.5 py-1 rounded-xl shrink-0">
                  {p.progressPercentage}%
                </span>
              </div>

              <ProgressBar value={p.progressPercentage} label="Milestone Progress" role="ADMIN" />

              <div className="flex items-center justify-between pt-2 text-xs border-t border-slate-100">
                <span className="text-slate-500 font-medium">
                  <Users className="w-3.5 h-3.5 inline mr-1 text-slate-400" /> {p.teamMembersCount} Members
                </span>
                <Link to={`/admin/project/${p.id}`}>
                  <Button variant="outline" size="sm" className="text-xs">Review Project</Button>
                </Link>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
