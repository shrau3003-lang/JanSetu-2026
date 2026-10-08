import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { MapPin, Sparkles, Check, RefreshCw, Search } from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Alert } from '../../components/common/Alert';
import { Skeleton } from '../../components/common/Loading';
import { EmptyState } from '../../components/common/EmptyState';
import { ErrorState } from '../../components/common/ErrorState';
import { Tabs } from '../../components/common/Tabs';
import { MatchExplanationModal } from '../../components/institute/MatchExplanationModal';
import { useAuth } from '../../context/AuthContext';
import { Challenge } from '../../types';
import { instituteService } from '../../services/instituteService';

const CATEGORY_TABS = [
  { id: 'all', label: 'All' },
  { id: 'Water & Sanitation', label: 'Water' },
  { id: 'Waste Management', label: 'Waste' },
  { id: 'Infrastructure', label: 'Infrastructure' },
  { id: 'Environment', label: 'Environment' },
  { id: 'Healthcare', label: 'Healthcare' }
];

export const AvailableChallengesPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [acceptedIds, setAcceptedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /** Id of the challenge currently being accepted, so only that button spins. */
  const [acceptingId, setAcceptingId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [lastProjectId, setLastProjectId] = useState<string | null>(null);

  const [categoryTab, setCategoryTab] = useState('all');
  const [query, setQuery] = useState(searchParams.get('q') || '');

  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Community challenges come from the real problems data (Supabase or the shared
      // demo store), never from a static mockChallenges array.
      const [list, accepted] = await Promise.all([
        instituteService.getAvailableChallenges(),
        instituteService.getAcceptedChallengeIds(user?.id)
      ]);
      setChallenges(list);
      setAcceptedIds(accepted);
    } catch (err: any) {
      console.error('Error loading available challenges:', err);
      setError(err?.message || 'Unable to load community challenges. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    setQuery(searchParams.get('q') || '');
  }, [searchParams]);

  const handleAccept = async (challenge: Challenge) => {
    if (acceptedIds.includes(challenge.id) || acceptingId) return;

    setAcceptingId(challenge.id);
    setActionError(null);
    setSuccessMessage(null);

    try {
      const result = await instituteService.acceptChallenge(challenge, user?.id);

      if (result.success) {
        setAcceptedIds((prev) => (prev.includes(challenge.id) ? prev : [...prev, challenge.id]));
        setLastProjectId(result.projectId);
        setSuccessMessage(
          result.alreadyAccepted
            ? `Your institute has already accepted “${challenge.title}”. Opening the existing project instead of creating a duplicate.`
            : `“${challenge.title}” accepted. A new project has been created under My Projects.`
        );
        // Refresh accepted state from the source of truth (projects table / local store).
        const accepted = await instituteService.getAcceptedChallengeIds(user?.id);
        setAcceptedIds(accepted);
      }
    } catch (err: any) {
      console.error('Failed to accept challenge:', err);
      // Button is restored automatically so the user can retry.
      setActionError(err?.message || 'The challenge could not be accepted. Please try again.');
    } finally {
      setAcceptingId(null);
    }
  };

  const visible = challenges.filter((c) => {
    const matchesCategory = categoryTab === 'all' || c.category === categoryTab;
    const q = query.trim().toLowerCase();
    const matchesQuery =
      !q ||
      c.title.toLowerCase().includes(q) ||
      c.description.toLowerCase().includes(q) ||
      c.location.toLowerCase().includes(q) ||
      c.requiredSkills.some((s) => s.toLowerCase().includes(q));
    return matchesCategory && matchesQuery;
  });

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Available Innovation Challenges</h1>
          <p className="text-xs text-slate-500">
            Live civic problems reported by the community and released for academic &amp; R&amp;D collaboration.
          </p>
        </div>
        <Button variant="outline" size="sm" leftIcon={<RefreshCw className="w-3.5 h-3.5" />} onClick={load}>
          Refresh
        </Button>
      </div>

      {successMessage && (
        <Alert
          variant="success"
          title="Challenge accepted"
          message={successMessage}
          onDismiss={() => setSuccessMessage(null)}
        />
      )}
      {actionError && (
        <Alert variant="error" title="Could not accept challenge" message={actionError} onDismiss={() => setActionError(null)} />
      )}
      {successMessage && lastProjectId && (
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" onClick={() => navigate(`/institute/project/${lastProjectId}`)}>
            Open Project
          </Button>
          <Button variant="outline" size="sm" onClick={() => navigate('/institute/projects')}>
            Go to My Projects
          </Button>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <Tabs items={CATEGORY_TABS} activeTab={categoryTab} onChange={setCategoryTab} role="INSTITUTE" />
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search challenges, skills, locations..."
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
          />
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Skeleton className="h-52 w-full" />
          <Skeleton className="h-52 w-full" />
          <Skeleton className="h-52 w-full" />
          <Skeleton className="h-52 w-full" />
        </div>
      ) : error ? (
        <ErrorState message={error} onRetry={load} />
      ) : visible.length === 0 ? (
        <EmptyState
          title="No matching challenges"
          description="No community challenges match the current filters. Community reports appear here as soon as citizens submit them."
          actionLabel="Clear filters"
          onAction={() => { setCategoryTab('all'); setQuery(''); }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {visible.map((c) => {
            const isAccepted = acceptedIds.includes(c.id);
            const isAccepting = acceptingId === c.id;

            return (
              <Card key={c.id} className="p-5 border-slate-200/80 space-y-4 flex flex-col">
                <div className="flex items-center justify-between">
                  <Badge priority={c.priority} size="sm" />
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-teal-600 bg-teal-50 px-2.5 py-1 rounded-full">
                    <Sparkles className="w-3 h-3" /> {c.matchPercentage}% Match
                  </span>
                </div>

                {c.image && (
                  <img src={c.image} alt={c.title} className="w-full h-32 object-cover rounded-xl border border-slate-100" />
                )}

                <div className="space-y-1">
                  <h3 className="text-base font-bold text-slate-900">{c.title}</h3>
                  <p className="text-xs text-slate-500 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" /> {c.location}
                  </p>
                  <p className="text-[11px] font-semibold text-indigo-700">{c.requiredDepartment}</p>
                </div>

                <p className="text-xs text-slate-600 line-clamp-3 flex-1">{c.description}</p>

                <div className="flex flex-wrap gap-1.5">
                  {c.requiredSkills.slice(0, 4).map((s) => (
                    <span key={s} className="px-2 py-0.5 rounded bg-slate-100 text-[10px] font-semibold text-slate-600">
                      {s}
                    </span>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-slate-100 gap-2">
                  <div className="flex items-center gap-1">
                    {c.tags.slice(0, 2).map((t) => (
                      <span key={t} className="px-2 py-0.5 rounded bg-slate-100 text-[10px] font-semibold text-slate-600">
                        {t}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedChallenge(c)}
                      className="text-xs border-indigo-200 text-indigo-700 hover:bg-indigo-50"
                    >
                      View Challenge
                    </Button>

                    {isAccepted ? (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl">
                        <Check className="w-3.5 h-3.5" /> Accepted
                      </span>
                    ) : (
                      <Button
                        variant="secondary"
                        size="sm"
                        isLoading={isAccepting}
                        disabled={isAccepting}
                        onClick={() => handleAccept(c)}
                      >
                        {isAccepting ? 'Accepting...' : 'Accept Challenge'}
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <MatchExplanationModal
        challenge={selectedChallenge}
        isOpen={!!selectedChallenge}
        onClose={() => setSelectedChallenge(null)}
        onAccept={(id) => {
          const target = challenges.find((c) => c.id === id);
          if (target) handleAccept(target);
        }}
        isAccepted={selectedChallenge ? acceptedIds.includes(selectedChallenge.id) : false}
      />
    </div>
  );
};
