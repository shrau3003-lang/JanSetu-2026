import React, { useState, useEffect, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { 
  Droplets, 
  Trash2, 
  Building, 
  GraduationCap, 
  HeartPulse, 
  Trees, 
  MapPin, 
  ThumbsUp, 
  MessageSquare, 
  Share2, 
  Plus, 
  FileText, 
  CheckCircle,
  Clock,
  Layers,
  Check
} from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { StatCard } from '../../components/common/StatCard';
import { Tabs } from '../../components/common/Tabs';
import { Loading, Skeleton } from '../../components/common/Loading';
import { EmptyState } from '../../components/common/EmptyState';
import { ErrorState } from '../../components/common/ErrorState';
import { Modal } from '../../components/common/Modal';
import { Alert } from '../../components/common/Alert';
import { Input } from '../../components/common/Input';
import { Select } from '../../components/common/Select';
import { Textarea } from '../../components/common/Textarea';
import { useAuth } from '../../context/AuthContext';
import { useModal } from '../../hooks/useModal';
import { ProblemReport, QuickStats, ProblemCategory } from '../../types';
import { problemsService } from '../../services/problemsService';

export type CitizenFeedTab = 'For You' | 'Nearby' | 'Trending' | 'Latest';

export interface CitizenDashboardProps {
  /**
   * Preselects a feed tab so sidebar routes such as /citizen/nearby and
   * /citizen/trending open on the matching dataset instead of the default feed.
   */
  initialTab?: CitizenFeedTab;
  sectionTitle?: string;
  sectionSubtitle?: string;
}

export const CitizenDashboard: React.FC<CitizenDashboardProps> = ({
  initialTab = 'For You',
  sectionTitle,
  sectionSubtitle
}) => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get('q');
  
  const [problems, setProblems] = useState<ProblemReport[]>([]);
  const [stats, setStats] = useState<QuickStats>({
    totalProblems: 0,
    yourReports: 0,
    supported: 0,
    resolved: 0
  });

  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>(initialTab);

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Route changes (sidebar Nearby / Trending) must drive the selected tab.
  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  const reportModal = useModal(false);

  // New Problem Form State
  const [formTitle, setFormTitle] = useState('');
  const [formCategory, setFormCategory] = useState<ProblemCategory>('Water & Sanitation');
  const [formLocation, setFormLocation] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const categories = [
    { name: 'Water & Sanitation', icon: Droplets, color: 'text-sky-600 bg-sky-50' },
    { name: 'Waste Management', icon: Trash2, color: 'text-emerald-600 bg-emerald-50' },
    { name: 'Infrastructure', icon: Building, color: 'text-blue-600 bg-blue-50' },
    { name: 'Education', icon: GraduationCap, color: 'text-purple-600 bg-purple-50' },
    { name: 'Healthcare', icon: HeartPulse, color: 'text-rose-600 bg-rose-50' },
    { name: 'Environment', icon: Trees, color: 'text-teal-600 bg-teal-50' },
  ];

  const loadDashboardData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [fetchedProblems, fetchedStats] = await Promise.all([
        problemsService.fetchProblems(selectedCategory, activeTab, user?.id, searchQuery),
        problemsService.fetchCitizenStats(user?.id)
      ]);
      setProblems(fetchedProblems);
      setStats(fetchedStats);
    } catch (err: any) {
      console.error('Error loading Citizen Dashboard:', err);
      setError('Unable to load the citizen feed. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  }, [selectedCategory, activeTab, user?.id, searchQuery]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  // Support / Vote Toggle
  const handleVoteToggle = async (problemId: string) => {
    setActionError(null);
    try {
      const { newCount } = await problemsService.toggleVote(problemId, user?.id || 'demo-user');
      setProblems((prev) =>
        prev.map((p) => (p.id === problemId ? { ...p, supportersCount: newCount } : p))
      );
      // Supporter count + Supported section + stats all refresh without a page reload.
      const updatedStats = await problemsService.fetchCitizenStats(user?.id);
      setStats(updatedStats);
    } catch (err) {
      console.error('Failed to toggle support:', err);
      setActionError('Your support could not be recorded. Please try again.');
    }
  };

  // Share: copies a direct link to the report.
  const handleShare = async (problemId: string) => {
    const url = `${window.location.origin}/citizen/problem/${problemId}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: 'JanSetu civic report', url });
        return;
      }
      await navigator.clipboard.writeText(url);
      setCopiedId(problemId);
      window.setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error('Share failed:', err);
      setActionError('Could not copy the report link. You can copy it from the address bar instead.');
    }
  };

  // Submit New Problem Report
  const handleCreateReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle || !formLocation || !formDesc) return;

    setSubmitting(true);
    setFormError(null);
    try {
      await problemsService.createProblem(
        {
          title: formTitle,
          category: formCategory,
          location: formLocation,
          description: formDesc
        },
        user?.id
      );

      reportModal.closeModal();

      // Clear Form
      setFormTitle('');
      setFormLocation('');
      setFormDesc('');

      // Refresh the feed + stats so the new report shows up straight away.
      await loadDashboardData();
    } catch (err: any) {
      console.error('Failed to submit report:', err);
      setFormError(err?.message || 'Your report could not be submitted. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 relative pb-16">
      {(sectionTitle || sectionSubtitle) && (
        <div className="space-y-1">
          {sectionTitle && <h1 className="text-xl font-bold text-slate-900 tracking-tight">{sectionTitle}</h1>}
          {sectionSubtitle && <p className="text-xs text-slate-500">{sectionSubtitle}</p>}
        </div>
      )}

      {actionError && (
        <Alert variant="error" message={actionError} onDismiss={() => setActionError(null)} />
      )}

      {searchQuery && (
        <Alert
          variant="info"
          message={`Showing results for â€œ${searchQuery}â€.`}
        />
      )}
      {/* Category Shortcut Pills */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
        {categories.map((cat) => {
          const Icon = cat.icon;
          const isSelected = selectedCategory === cat.name;
          return (
            <button
              key={cat.name}
              onClick={() => setSelectedCategory(isSelected ? null : cat.name)}
              className={`flex flex-col items-center justify-center p-3.5 rounded-2xl border transition-all duration-200 text-center ${
                isSelected
                  ? 'border-emerald-500 bg-emerald-50 ring-2 ring-emerald-500/20 shadow-sm'
                  : 'border-slate-200/80 bg-white hover:border-slate-300 hover:shadow-sm'
              }`}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-2 ${cat.color}`}>
                <Icon className="w-5 h-5" />
              </div>
              <span className="text-xs font-semibold text-slate-700 leading-tight">{cat.name}</span>
            </button>
          );
        })}
      </div>

      {/* Main Grid: Feed on Left (7 cols), Map & Stats on Right (5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Feed */}
        <div className="lg:col-span-7 space-y-4">
          {/* Tabs Filter Bar */}
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <Tabs
              items={[
                { id: 'For You', label: 'For You' },
                { id: 'Nearby', label: 'Nearby' },
                { id: 'Trending', label: 'Trending' },
                { id: 'Latest', label: 'Latest' },
              ]}
              activeTab={activeTab}
              onChange={(tabId) => setActiveTab(tabId)}
              role="CITIZEN"
            />

            {selectedCategory && (
              <button
                onClick={() => setSelectedCategory(null)}
                className="text-xs text-emerald-600 hover:text-emerald-700 font-semibold"
              >
                Clear Filter
              </button>
            )}
          </div>

          {/* Feed Content: Loading / Error / Empty / Real Items */}
          {loading ? (
            <div className="space-y-4">
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-32 w-full" />
            </div>
          ) : error ? (
            <ErrorState message={error} onRetry={loadDashboardData} />
          ) : problems.length === 0 ? (
            <EmptyState
              title="No Civic Problems Found"
              description={selectedCategory ? `No reports under ${selectedCategory} right now.` : "No active civic reports available."}
              actionLabel="Report a Problem"
              onAction={reportModal.openModal}
            />
          ) : (
            <div className="space-y-4">
              {problems.map((problem) => (
                <Card key={problem.id} hoverable className="p-4 border-slate-200/80">
                  <div className="flex flex-col sm:flex-row gap-4">
                    {/* Thumbnail Image */}
                    {problem.imageUrl && (
                      <img
                        src={problem.imageUrl}
                        alt={problem.title}
                        className="w-full sm:w-36 h-28 object-cover rounded-xl shrink-0"
                      />
                    )}

                    {/* Problem Content */}
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                            {problem.category}
                          </span>
                          <span className="text-slate-300">â€¢</span>
                          <Badge priority={problem.priority} size="sm" />
                        </div>
                        <span className="text-[11px] text-slate-400 flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {problem.createdAt}
                        </span>
                      </div>

                      <Link to={`/citizen/problem/${problem.id}`}>
                        <h3 className="text-base font-bold text-slate-900 hover:text-emerald-600 transition-colors leading-snug line-clamp-2">
                          {problem.title}
                        </h3>
                      </Link>

                      <div className="flex items-center gap-3 text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" /> {problem.location}
                        </span>
                      </div>

                      {/* Footer Actions */}
                      <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs text-slate-600">
                        <div className="flex items-center gap-4">
                          <button
                            onClick={() => handleVoteToggle(problem.id)}
                            className="flex items-center gap-1.5 hover:text-emerald-600 font-medium transition-colors"
                          >
                            <ThumbsUp className="w-3.5 h-3.5 text-emerald-600" />
                            <span>{problem.supportersCount} Supporters</span>
                          </button>
                          <Link to={`/citizen/problem/${problem.id}`} className="flex items-center gap-1.5 hover:text-emerald-600 font-medium">
                            <MessageSquare className="w-3.5 h-3.5 text-slate-400" />
                            <span>{problem.commentsCount} Comments</span>
                          </Link>
                        </div>

                        <button
                          onClick={() => handleShare(problem.id)}
                          title="Copy link to this report"
                          aria-label="Share this report"
                          className="p-1 hover:text-slate-900 text-slate-400 flex items-center gap-1"
                        >
                          {copiedId === problem.id ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                              <span className="text-[10px] font-semibold text-emerald-600">Copied</span>
                            </>
                          ) : (
                            <Share2 className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Problem Map & Dynamic Quick Stats */}
        <div className="lg:col-span-5 space-y-6">
          {/* Dynamic Non-Hardcoded Quick Stats Grid */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-slate-900 tracking-tight">Quick Stats</h3>
            <div className="grid grid-cols-2 gap-3">
              <StatCard
                title="Total Problems"
                value={stats.totalProblems}
                icon={<FileText className="w-4 h-4" />}
                role="CITIZEN"
              />
              <StatCard
                title="My Reports"
                value={stats.yourReports || 0}
                icon={<Layers className="w-4 h-4" />}
                role="CITIZEN"
              />
              <StatCard
                title="Supported"
                value={stats.supported || 0}
                icon={<ThumbsUp className="w-4 h-4" />}
                role="CITIZEN"
              />
              <StatCard
                title="Resolved"
                value={stats.resolved || 0}
                icon={<CheckCircle className="w-4 h-4" />}
                role="CITIZEN"
              />
            </div>
          </div>
        </div>
      </div>{/* Interactive Report Problem Modal */}
      <Modal
        isOpen={reportModal.isOpen}
        onClose={reportModal.closeModal}
        title="Report a Civic Problem"
        footer={
          <>
            <Button variant="ghost" onClick={reportModal.closeModal}>
              Cancel
            </Button>
            <Button variant="primary" isLoading={submitting} onClick={handleCreateReport}>
              Submit Report
            </Button>
          </>
        }
      >
        <form onSubmit={handleCreateReport} className="space-y-4">
          {formError && <Alert variant="error" title="Submission failed" message={formError} />}

          <Input
            label="Problem Title"
            placeholder="e.g. Garbage collection hasn't happened in 10 days..."
            value={formTitle}
            onChange={(e) => setFormTitle(e.target.value)}
            required
          />

          <Select
            label="Category"
            value={formCategory}
            onChange={(e) => setFormCategory(e.target.value as ProblemCategory)}
            options={categories.map((c) => ({ label: c.name, value: c.name }))}
          />

          <Input
            label="Location / Landmark"
            placeholder="e.g. Ranchi, Jharkhand"
            value={formLocation}
            onChange={(e) => setFormLocation(e.target.value)}
            leftIcon={<MapPin className="w-4 h-4" />}
            required
          />

          <Textarea
            label="Problem Description"
            placeholder="Explain the problem details..."
            value={formDesc}
            onChange={(e) => setFormDesc(e.target.value)}
            required
          />
        </form>
      </Modal>
    </div>
  );
};


