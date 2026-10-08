import React, { useState, useEffect, useCallback } from 'react';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { AIAnalysisCard } from '../../components/common/AIAnalysisCard';
import { PriorityScoreCard } from '../../components/common/PriorityScoreCard';
import { DuplicateWarningCard } from '../../components/common/DuplicateWarningCard';
import { PageHeader } from '../../components/common/PageHeader';
import { Check, X, AlertTriangle, RefreshCw } from 'lucide-react';
import { Skeleton } from '../../components/common/Loading';
import { EmptyState } from '../../components/common/EmptyState';
import { ErrorState } from '../../components/common/ErrorState';
import { Alert } from '../../components/common/Alert';
import { ProblemReport } from '../../types';
import { adminService } from '../../services/adminService';
import { duplicateService, DuplicateDetectionResult } from '../../services/duplicateService';

export const ProblemVerificationPage: React.FC = () => {
  const [problems, setProblems] = useState<ProblemReport[]>([]);
  const [duplicateResults, setDuplicateResults] = useState<Record<string, DuplicateDetectionResult>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Pending queue now reflects real citizen submissions, not a static array.
      const pending = await adminService.fetchPendingProblems();
      setProblems(pending);

      const all = await adminService.fetchAllProblems();
      pending.forEach(async (item) => {
        const dupRes = await duplicateService.checkDuplicate(item, all);
        setDuplicateResults((prev) => ({ ...prev, [item.id]: dupRes }));
      });
    } catch (err: any) {
      console.error('Error loading verification queue:', err);
      setError(err?.message || 'Unable to load the verification queue. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleVerify = async (id: string) => {
    setBusyId(id);
    setActionError(null);
    try {
      await adminService.verifyProblem(id);
      setProblems((prev) => prev.filter((item) => item.id !== id));
      setNotice('Report verified and routed to Institute Matching.');
    } catch (err: any) {
      console.error('Verification failed:', err);
      setActionError('This report could not be verified. Please try again.');
    } finally {
      setBusyId(null);
    }
  };

  const handleReject = async (id: string) => {
    setBusyId(id);
    setActionError(null);
    try {
      await adminService.rejectProblem(id);
      setProblems((prev) => prev.filter((item) => item.id !== id));
      setNotice('Report rejected and removed from the queue.');
    } catch (err: any) {
      console.error('Rejection failed:', err);
      setActionError('This report could not be rejected. Please try again.');
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Problem Verification & Routing"
        subtitle="Review community submissions with AI priority score index, duplicate detection, and official routing controls."
        role="ADMIN"
        actions={
          <Button variant="outline" size="sm" leftIcon={<RefreshCw className="w-3.5 h-3.5" />} onClick={load}>
            Refresh
          </Button>
        }
      />

      {notice && <Alert variant="success" message={notice} onDismiss={() => setNotice(null)} />}
      {actionError && <Alert variant="error" message={actionError} onDismiss={() => setActionError(null)} />}
      {error && <ErrorState message={error} onRetry={load} />}
      {loading && <Skeleton className="h-64 w-full" />}
      {!loading && !error && problems.length === 0 && (
        <EmptyState title="Verification queue is clear" description="Every submitted community report has been reviewed." />
      )}

      <div className="space-y-6">
        {problems.map((item) => {
          const dupRes = duplicateResults[item.id];

          return (
            <Card key={item.id} className="p-6 border-slate-200/80 space-y-6">
              {/* Header Info & Actions */}
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-slate-400">#{item.id}</span>
                    <Badge priority={item.priority} size="sm" />
                    <span className="text-xs text-slate-500 font-semibold">{item.category}</span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">{item.title}</h3>
                  <div className="text-xs text-slate-500 flex items-center gap-2">
                    <span>Location: {item.location}</span>
                    <span>•</span>
                    <span>Supporters: {item.supportersCount}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <Button
                    variant="success"
                    size="sm"
                    leftIcon={<Check className="w-4 h-4" />}
                    isLoading={busyId === item.id}
                    disabled={busyId === item.id}
                    onClick={() => handleVerify(item.id)}
                  >
                    Verify & Route Issue
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    leftIcon={<X className="w-4 h-4 text-rose-600" />}
                    disabled={busyId === item.id}
                    onClick={() => handleReject(item.id)}
                    className="text-rose-600 border-rose-200 hover:bg-rose-50"
                  >
                    Reject
                  </Button>
                </div>
              </div>

              {/* Stage 8 Part B: Duplicate Detection Warning (If Any Candidate Found) */}
              {dupRes && dupRes.isPossibleDuplicate && (
                <DuplicateWarningCard
                  result={dupRes}
                  onMarkDuplicate={(dupId) => console.log(`Marked #${item.id} as duplicate of #${dupId}`)}
                  onDismiss={() => console.log(`Dismissed duplicate warning for #${item.id}`)}
                />
              )}

              {/* Grid: 5-Factor Priority Score Card + Gemini AI Analysis Card */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Stage 8 Part A: Priority Score Engine (0-100) */}
                <PriorityScoreCard problem={item} />

                {/* Stage 7: Gemini AI Evaluation Card */}
                <AIAnalysisCard
                  problemId={item.id}
                  title={item.title}
                  description={item.description}
                  category={item.category}
                  location={item.location}
                />
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
