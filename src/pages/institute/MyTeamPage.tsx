import React, { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Users, RefreshCw } from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Skeleton } from '../../components/common/Loading';
import { EmptyState } from '../../components/common/EmptyState';
import { ErrorState } from '../../components/common/ErrorState';
import { useAuth } from '../../context/AuthContext';
import { ProjectTeamMember } from '../../types';
import { instituteService } from '../../services/instituteService';

type RosterMember = ProjectTeamMember & { projectTitle: string; projectId: string };

export const MyTeamPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [roster, setRoster] = useState<RosterMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setRoster(await instituteService.getTeamMembers(user?.id));
    } catch (err: any) {
      console.error('Error loading team roster:', err);
      setError(err?.message || 'Unable to load your team roster. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => { load(); }, [load]);

  const byProject = roster.reduce<Record<string, RosterMember[]>>((acc, m) => {
    (acc[m.projectTitle] = acc[m.projectTitle] || []).push(m);
    return acc;
  }, {});

  return (
    <div className="space-y-6 pb-12">
      <PageHeader
        title="My Team"
        subtitle="Student and faculty contributors across all of your institute's active research projects."
        role="INSTITUTE"
        actions={
          <Button variant="outline" size="sm" leftIcon={<RefreshCw className="w-3.5 h-3.5" />} onClick={load}>
            Refresh
          </Button>
        }
      />

      {loading ? (
        <div className="space-y-4"><Skeleton className="h-40 w-full" /><Skeleton className="h-40 w-full" /></div>
      ) : error ? (
        <ErrorState message={error} onRetry={load} />
      ) : roster.length === 0 ? (
        <EmptyState
          icon={<Users className="w-6 h-6" />}
          title="No team members yet"
          description="Open a project and use “Add Member” to onboard student and faculty contributors."
          actionLabel="Go to My Projects"
          onAction={() => navigate('/institute/projects')}
        />
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Card className="p-4 text-center border-slate-200/80">
              <span className="text-2xl font-black text-slate-900 block">{roster.length}</span>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Total Members</span>
            </Card>
            <Card className="p-4 text-center border-slate-200/80">
              <span className="text-2xl font-black text-slate-900 block">{Object.keys(byProject).length}</span>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Projects Staffed</span>
            </Card>
            <Card className="p-4 text-center border-slate-200/80">
              <span className="text-2xl font-black text-slate-900 block">
                {new Set(roster.map((m) => m.department || 'Engineering')).size}
              </span>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Departments</span>
            </Card>
            <Card className="p-4 text-center border-slate-200/80">
              <span className="text-2xl font-black text-slate-900 block">
                {new Set(roster.map((m) => m.role)).size}
              </span>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Distinct Roles</span>
            </Card>
          </div>

          {Object.entries(byProject).map(([projectTitle, members]) => (
            <Card key={projectTitle} className="p-5 border-slate-200/90 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Users className="w-4 h-4 text-indigo-600" /> {projectTitle} ({members.length})
                </h3>
                <Link to={`/institute/project/${members[0].projectId}`} className="text-xs font-bold text-indigo-600 hover:text-indigo-700">
                  Open Project
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {members.map((m) => (
                  <div key={m.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                        {m.avatar || m.name.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900">{m.name}</h4>
                        <p className="text-[10px] text-slate-400">{m.department || 'Engineering'}</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-100 px-2.5 py-0.5 rounded-md shrink-0">
                      {m.role}
                    </span>
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
