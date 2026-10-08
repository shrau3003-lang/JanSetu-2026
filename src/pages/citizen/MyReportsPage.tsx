import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Plus, RefreshCw } from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader';
import { Button } from '../../components/common/Button';
import { Skeleton } from '../../components/common/Loading';
import { EmptyState } from '../../components/common/EmptyState';
import { ErrorState } from '../../components/common/ErrorState';
import { Tabs } from '../../components/common/Tabs';
import { ProblemListCard } from '../../components/citizen/ProblemListCard';
import { useAuth } from '../../context/AuthContext';
import { ProblemReport } from '../../types';
import { problemsService } from '../../services/problemsService';

const STATUS_TABS = [
  { id: 'all', label: 'All' },
  { id: 'pending', label: 'Pending' },
  { id: 'verified', label: 'Verified' },
  { id: 'in_progress', label: 'In Progress' },
  { id: 'resolved', label: 'Resolved' }
];

export const MyReportsPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [reports, setReports] = useState<ProblemReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusTab, setStatusTab] = useState('all');

  const loadReports = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await problemsService.getMyReports(user?.id);
      setReports(data);
    } catch (err) {
      console.error('Error loading My Reports:', err);
      setError('We could not load the reports you submitted. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    loadReports();
  }, [loadReports]);

  const visible = statusTab === 'all' ? reports : reports.filter((r) => r.status === statusTab);

  return (
    <div className="space-y-6 pb-12">
      <PageHeader
        title="My Reports"
        subtitle="Every civic problem you have submitted, with its current verification and resolution status."
        role="CITIZEN"
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
              onClick={loadReports}
            >
              Refresh
            </Button>
            <Button
              variant="primary"
              size="sm"
              leftIcon={<Plus className="w-4 h-4" />}
              onClick={() => navigate('/citizen/report/new')}
            >
              Report Problem
            </Button>
          </div>
        }
      />

      <Tabs items={STATUS_TABS} activeTab={statusTab} onChange={setStatusTab} role="CITIZEN" />

      {loading ? (
        <div className="space-y-4">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      ) : error ? (
        <ErrorState message={error} onRetry={loadReports} />
      ) : visible.length === 0 ? (
        <EmptyState
          icon={<FileText className="w-6 h-6" />}
          title={reports.length === 0 ? 'You have not reported anything yet' : 'No reports in this status'}
          description={
            reports.length === 0
              ? 'Report a civic problem in your area and track its verification journey right here.'
              : 'Try a different status filter to see your other submissions.'
          }
          actionLabel={reports.length === 0 ? 'Report a Problem' : undefined}
          onAction={reports.length === 0 ? () => navigate('/citizen/report/new') : undefined}
        />
      ) : (
        <div className="space-y-4">
          {visible.map((problem) => (
            <ProblemListCard key={problem.id} problem={problem} />
          ))}
        </div>
      )}
    </div>
  );
};
