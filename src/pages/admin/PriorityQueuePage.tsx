import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { PageHeader } from '../../components/common/PageHeader';
import { PriorityScoreCard } from '../../components/common/PriorityScoreCard';
import { ArrowUpRight, RefreshCw } from 'lucide-react';
import { Skeleton } from '../../components/common/Loading';
import { EmptyState } from '../../components/common/EmptyState';
import { ErrorState } from '../../components/common/ErrorState';
import { ProblemReport } from '../../types';
import { adminService } from '../../services/adminService';
import { calculatePriorityScore } from '../../lib/priorityCalculator';

export const PriorityQueuePage: React.FC = () => {
  const navigate = useNavigate();
  const [problems, setProblems] = useState<ProblemReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setProblems(await adminService.fetchAllProblems());
    } catch (err: any) {
      console.error('Error loading priority queue:', err);
      setError(err?.message || 'Unable to load the priority queue. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  // Sort problems by calculated Priority Score (0-100) descending
  const sortedProblems = [...problems].sort(
    (a, b) => calculatePriorityScore(b).totalScore - calculatePriorityScore(a).totalScore
  );

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Automated Priority Queue" subtitle="Loading prioritised civic issues..." role="ADMIN" />
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Automated Priority Queue"
        subtitle="Issues dynamically sorted by the 5-factor Priority Score formula (Support, Severity, Population, Urgency, Evidence)."
        role="ADMIN"
        actions={
          <Button variant="outline" size="sm" leftIcon={<RefreshCw className="w-3.5 h-3.5" />} onClick={load}>
            Refresh
          </Button>
        }
      />

      {error && <ErrorState message={error} onRetry={load} />}

      {!error && sortedProblems.length === 0 && (
        <EmptyState title="Queue is empty" description="No civic reports are awaiting prioritisation right now." />
      )}

      <div className="space-y-6">
        {sortedProblems.map((p) => {
          const scoreResult = calculatePriorityScore(p);

          return (
            <Card key={p.id} className="p-6 border-l-4 border-l-rose-500 border-slate-200/80 space-y-4">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-100 pb-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-slate-400">#{p.id}</span>
                    <Badge priority={p.priority} size="sm" />
                    <span className="text-xs text-slate-500 font-semibold">{p.category}</span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">{p.title}</h3>
                  <p className="text-xs text-slate-600">{p.location} • {p.supportersCount} Supporters</p>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-right">
                    <span className="text-2xl font-black text-slate-900 block leading-none">{scoreResult.totalScore}</span>
                    <span className="text-[10px] text-slate-400 uppercase font-bold">Priority Score</span>
                  </div>

                  <Button
                    variant="secondary"
                    size="sm"
                    rightIcon={<ArrowUpRight className="w-4 h-4" />}
                    onClick={() => navigate('/admin/matching')}
                  >
                    Assign to Institute
                  </Button>
                </div>
              </div>

              {/* 5-Factor Score Breakdown */}
              <PriorityScoreCard problem={p} />
            </Card>
          );
        })}
      </div>
    </div>
  );
};
