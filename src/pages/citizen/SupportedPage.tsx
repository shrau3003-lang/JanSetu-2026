import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ThumbsUp, RefreshCw } from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader';
import { Button } from '../../components/common/Button';
import { Skeleton } from '../../components/common/Loading';
import { EmptyState } from '../../components/common/EmptyState';
import { ErrorState } from '../../components/common/ErrorState';
import { Alert } from '../../components/common/Alert';
import { ProblemListCard } from '../../components/citizen/ProblemListCard';
import { useAuth } from '../../context/AuthContext';
import { ProblemReport } from '../../types';
import { problemsService } from '../../services/problemsService';

export const SupportedPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [items, setItems] = useState<ProblemReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setItems(await problemsService.getSupportedProblems(user?.id));
    } catch (err) {
      console.error('Error loading supported problems:', err);
      setError('We could not load the problems you supported. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => { load(); }, [load]);

  const handleToggle = async (problemId: string) => {
    setActionError(null);
    try {
      await problemsService.toggleVote(problemId, user?.id || 'demo-user');
      await load();
    } catch (err) {
      console.error('Failed to remove support:', err);
      setActionError('Your support could not be updated. Please try again.');
    }
  };

  return (
    <div className="space-y-6 pb-12">
      <PageHeader
        title="Supported Problems"
        subtitle="Civic issues you have backed. Removing your support updates the supporter count instantly."
        role="CITIZEN"
        actions={
          <Button variant="outline" size="sm" leftIcon={<RefreshCw className="w-3.5 h-3.5" />} onClick={load}>
            Refresh
          </Button>
        }
      />

      {actionError && <Alert variant="error" message={actionError} onDismiss={() => setActionError(null)} />}

      {loading ? (
        <div className="space-y-4">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      ) : error ? (
        <ErrorState message={error} onRetry={load} />
      ) : items.length === 0 ? (
        <EmptyState
          icon={<ThumbsUp className="w-6 h-6" />}
          title="You have not supported any problems yet"
          description="Supporting a report raises its priority score so government officers act on it sooner."
          actionLabel="Browse Community Feed"
          onAction={() => navigate('/citizen')}
        />
      ) : (
        <div className="space-y-4">
          {items.map((p) => (
            <ProblemListCard key={p.id} problem={p} supported onToggleSupport={handleToggle} />
          ))}
        </div>
      )}
    </div>
  );
};
