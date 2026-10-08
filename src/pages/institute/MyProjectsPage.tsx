import React, { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Briefcase, MapPin, Users, RefreshCw } from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { ProgressBar } from '../../components/common/ProgressBar';
import { Skeleton } from '../../components/common/Loading';
import { EmptyState } from '../../components/common/EmptyState';
import { ErrorState } from '../../components/common/ErrorState';
import { Tabs } from '../../components/common/Tabs';
import { useAuth } from '../../context/AuthContext';
import { InstituteProject } from '../../types';
import { instituteService } from '../../services/instituteService';

const TABS = [
  { id: 'all', label: 'All Projects' },
  { id: 'active', label: 'Active' },
  { id: 'completed', label: 'Completed' }
];

export const MyProjectsPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [projects, setProjects] = useState<InstituteProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState('all');

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setProjects(await instituteService.getInstituteProjects(user?.id));
    } catch (err: any) {
      console.error('Error loading institute projects:', err);
      setError(err?.message || 'Unable to load your projects. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => { load(); }, [load]);

  const isCompleted = (p: InstituteProject) => p.status === 'Completed' || p.status === 'COMPLETED';
  const visible = projects.filter((p) => (tab === 'all' ? true : tab === 'completed' ? isCompleted(p) : !isCompleted(p)));

  return (
    <div className="space-y-6 pb-12">
      <PageHeader
        title="My Projects"
        subtitle="Research projects your institute has accepted, with live milestone progress and deadlines."
        role="INSTITUTE"
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" leftIcon={<RefreshCw className="w-3.5 h-3.5" />} onClick={load}>
              Refresh
            </Button>
            <Button variant="secondary" size="sm" onClick={() => navigate('/institute/challenges')}>
              Explore Challenges
            </Button>
          </div>
        }
      />

      <Tabs items={TABS} activeTab={tab} onChange={setTab} role="INSTITUTE" />

      {loading ? (
        <div className="space-y-4">
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-40 w-full" />
        </div>
      ) : error ? (
        <ErrorState message={error} onRetry={load} />
      ) : visible.length === 0 ? (
        <EmptyState
          icon={<Briefcase className="w-6 h-6" />}
          title="No projects yet"
          description="Accept a community challenge and it will appear here as an active research project."
          actionLabel="Explore Challenges"
          onAction={() => navigate('/institute/challenges')}
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {visible.map((proj) => (
            <Card key={proj.id} className="p-5 border-slate-200/90 space-y-4 hover:border-indigo-200 transition-all">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <span className="inline-block px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 text-[10px] font-bold uppercase tracking-wider mb-1">
                    {proj.status}
                  </span>
                  <h4 className="text-sm font-bold text-slate-900">{proj.title}</h4>
                  <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3 h-3 text-slate-400" /> {proj.location}
                  </p>
                </div>
                <span className="text-xs font-black text-indigo-700 bg-indigo-50 border border-indigo-100 px-2.5 py-1 rounded-xl shrink-0">
                  {proj.progressPercentage}%
                </span>
              </div>

              <ProgressBar value={proj.progressPercentage} label="Milestone Progress" role="INSTITUTE" />

              <div className="space-y-1.5 pt-2 border-t border-slate-100 text-xs">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Milestones</span>
                {proj.milestones.slice(0, 5).map((m) => (
                  <div key={m.id || m.name} className="flex items-center justify-between py-0.5">
                    <span className="flex items-center gap-2 font-medium text-slate-700">
                      <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold ${m.completed ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-400'}`}>
                        {m.completed ? '✓' : '○'}
                      </span>
                      {m.name}
                    </span>
                    <span className={`text-[11px] font-bold ${m.completed ? 'text-emerald-600' : 'text-slate-400'}`}>
                      {m.completed ? 'Completed' : m.dueDate || 'Pending'}
                    </span>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between pt-2 text-xs border-t border-slate-100">
                <span className="text-slate-500 font-medium">
                  <Users className="w-3.5 h-3.5 inline mr-1 text-slate-400" />
                  {proj.teamMembersCount} Team Members
                </span>
                <Link to={`/institute/project/${proj.id}`}>
                  <Button variant="outline" size="sm" className="text-xs border-indigo-200 text-indigo-700 hover:bg-indigo-50">
                    View Project
                  </Button>
                </Link>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
