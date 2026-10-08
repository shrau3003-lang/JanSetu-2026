import React, { useCallback, useEffect, useState } from 'react';
import { Building2, Mail, RefreshCw, Award } from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Skeleton } from '../../components/common/Loading';
import { EmptyState } from '../../components/common/EmptyState';
import { ErrorState } from '../../components/common/ErrorState';
import { useAuth } from '../../context/AuthContext';
import { instituteService, InstituteMentor } from '../../services/instituteService';

export const MentorsPage: React.FC = () => {
  const { user } = useAuth();
  const [mentors, setMentors] = useState<InstituteMentor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setMentors(await instituteService.getMentors(user?.id));
    } catch (err: any) {
      console.error('Error loading mentors:', err);
      setError(err?.message || 'Unable to load mentors. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => { load(); }, [load]);

  return (
    <div className="space-y-6 pb-12">
      <PageHeader
        title="Mentors"
        subtitle="Faculty leads and industry mentors guiding your institute's civic innovation projects."
        role="INSTITUTE"
        actions={
          <Button variant="outline" size="sm" leftIcon={<RefreshCw className="w-3.5 h-3.5" />} onClick={load}>
            Refresh
          </Button>
        }
      />

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Skeleton className="h-44 w-full" /><Skeleton className="h-44 w-full" />
        </div>
      ) : error ? (
        <ErrorState message={error} onRetry={load} />
      ) : mentors.length === 0 ? (
        <EmptyState icon={<Building2 className="w-6 h-6" />} title="No mentors listed" description="Mentors assigned to your institute will appear here." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {mentors.map((m) => (
            <Card key={m.id} className="p-5 border-slate-200/90 space-y-4">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white font-bold flex items-center justify-center shrink-0 shadow-sm">
                  {m.avatar}
                </div>
                <div className="space-y-0.5 flex-1">
                  <h3 className="text-sm font-bold text-slate-900">{m.name}</h3>
                  <p className="text-xs text-indigo-600 font-semibold">{m.title}</p>
                  <p className="text-[11px] text-slate-500 flex items-center gap-1">
                    <Building2 className="w-3 h-3 text-slate-400" /> {m.department}
                  </p>
                </div>
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-1 rounded-md shrink-0">
                  <Award className="w-3 h-3" /> {m.projectsGuided} guided
                </span>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {m.expertise.map((e) => (
                  <span key={e} className="px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[11px] font-semibold border border-slate-200/60">
                    {e}
                  </span>
                ))}
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-slate-500 flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-slate-400" /> {m.email}
                </span>
                <a href={`mailto:${m.email}`}>
                  <Button variant="outline" size="sm" className="text-xs border-indigo-200 text-indigo-700 hover:bg-indigo-50">
                    Contact
                  </Button>
                </a>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
