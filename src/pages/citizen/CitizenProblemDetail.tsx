import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  MapPin, 
  Clock, 
  ThumbsUp, 
  MessageSquare, 
  Share2, 
  Send, 
  CheckCircle2, 
  AlertCircle
} from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Loading } from '../../components/common/Loading';
import { Alert } from '../../components/common/Alert';
import { AIAnalysisCard } from '../../components/common/AIAnalysisCard';
import { ProblemReport } from '../../types';
import { problemsService, ProblemComment } from '../../services/problemsService';
import { useAuth } from '../../context/AuthContext';

export const CitizenProblemDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user, profile } = useAuth();

  const [problem, setProblem] = useState<ProblemReport | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Persistent Support State
  const [supported, setSupported] = useState(false);
  const [supportCount, setSupportCount] = useState(0);

  // Persistent Comments State
  const [comments, setComments] = useState<ProblemComment[]>([]);
  const [commentText, setCommentText] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);

  // Image Gallery Thumbnails
  const [activeImage, setActiveImage] = useState<string>('');
  const [actionError, setActionError] = useState<string | null>(null);
  const [shareMessage, setShareMessage] = useState<string | null>(null);

  const loadProblemAndComments = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const [{ problem: probData, hasSupported }, fetchedComments] = await Promise.all([
        problemsService.getProblemDetails(id, user?.id),
        problemsService.fetchComments(id)
      ]);

      if (probData) {
        setProblem(probData);
        setSupportCount(probData.supportersCount);
        setSupported(hasSupported);
        setActiveImage(probData.imageUrl || 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&w=800&q=80');
      }
      setComments(fetchedComments);
    } catch (err) {
      console.error('Error loading problem detail:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProblemAndComments();
  }, [id, user?.id]);

  const handleToggleSupport = async () => {
    if (!problem) return;
    setActionError(null);
    try {
      const userIdToUse = user?.id || 'demo-user';
      const { supported: nowSupported, newCount } = await problemsService.toggleVote(problem.id, userIdToUse);
      setSupported(nowSupported);
      setSupportCount(newCount);
    } catch (err) {
      console.error('Failed to toggle support:', err);
      setActionError('Your support could not be recorded. Please try again.');
    }
  };

  const handleShare = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title: problem?.title || 'JanSetu civic report', url });
        return;
      }
      await navigator.clipboard.writeText(url);
      setShareMessage('Link copied to your clipboard.');
      window.setTimeout(() => setShareMessage(null), 2500);
    } catch (err) {
      console.error('Share failed:', err);
      setActionError('Could not copy the link. You can copy it from the address bar instead.');
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() || !problem) return;

    setSubmittingComment(true);
    try {
      // Comment author is always the signed-in profile.
      const userName = profile?.full_name || 'JanSetu Citizen';
      const userIdToUse = user?.id || 'demo-user';

      const created = await problemsService.addComment(problem.id, userIdToUse, commentText, userName);
      setComments((prev) => [...prev, created]);
      setCommentText('');
    } catch (err: any) {
      console.error('Failed to post comment:', err);
      setActionError(err?.message || 'Your comment could not be posted. Please try again.');
    } finally {
      setSubmittingComment(false);
    }
  };

  const getSeverityLabel = (priority?: string) => {
    if (priority === 'critical' || priority === 'high') return 'High Severity';
    if (priority === 'medium') return 'Medium Severity';
    return 'Low Severity';
  };

  const getUrgencyLabel = (priority?: string) => {
    if (priority === 'critical') return 'Immediate Action Required';
    if (priority === 'high') return 'High Urgency (24-48h)';
    return 'Standard Urgency';
  };

  if (loading) {
    return <Loading fullScreen text="Fetching report & community support data..." />;
  }

  if (!problem) {
    return (
      <div className="text-center p-12 space-y-4">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
        <h2 className="text-xl font-bold text-slate-900">Problem Report Not Found</h2>
        <p className="text-xs text-slate-500">The requested civic issue could not be found or has been removed.</p>
        <Link to="/citizen">
          <Button variant="primary">Return to Feed</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Navigation Back */}
      <Link to="/citizen" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Citizen Feed
      </Link>

      {actionError && <Alert variant="error" message={actionError} onDismiss={() => setActionError(null)} />}
      {shareMessage && <Alert variant="success" message={shareMessage} onDismiss={() => setShareMessage(null)} />}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Problem Details & AI Analysis */}
        <div className="lg:col-span-8 space-y-6">
          <Card className="p-6 border-slate-200/80 space-y-6">
            <div className="space-y-3">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge priority={problem.priority} size="md" />
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{problem.category}</span>
                <span className="text-slate-300">•</span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200 uppercase tracking-wider">
                  Status: {problem.status}
                </span>
              </div>
              <h1 className="text-2xl font-black text-slate-900 leading-tight">
                {problem.title}
              </h1>
              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" /> {problem.location}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-slate-400" /> Reported {problem.createdAt}
                </span>
              </div>
            </div>

            {/* Media Image */}
            <div className="space-y-3">
              <div className="relative rounded-2xl overflow-hidden border border-slate-100 shadow-sm">
                <img
                  src={activeImage}
                  alt={problem.title}
                  className="w-full h-80 object-cover"
                />
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setActiveImage(problem.imageUrl || activeImage)}
                  className={`w-20 h-16 rounded-xl overflow-hidden border-2 transition-all ${
                    activeImage === problem.imageUrl ? 'border-emerald-500 ring-2 ring-emerald-500/20' : 'border-slate-200 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={problem.imageUrl} alt="Thumbnail 1" className="w-full h-full object-cover" />
                </button>
              </div>
            </div>

            {/* Support Bar */}
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <div className="flex items-center gap-3">
                <Button
                  variant={supported ? 'primary' : 'outline'}
                  size="md"
                  leftIcon={<ThumbsUp className={`w-4 h-4 ${supported ? 'fill-white' : ''}`} />}
                  onClick={handleToggleSupport}
                  className="shadow-sm"
                >
                  <span>{supportCount}</span>
                  <span>{supported ? 'Supported' : 'Support Issue'}</span>
                </Button>
                <div className="flex items-center gap-1.5 text-xs text-slate-700 font-bold px-3.5 py-2.5 bg-white rounded-xl border border-slate-200">
                  <MessageSquare className="w-4 h-4 text-emerald-600" />
                  <span>{comments.length} Comments</span>
                </div>
              </div>

              <Button variant="ghost" size="sm" leftIcon={<Share2 className="w-4 h-4" />} onClick={handleShare}>
                Share
              </Button>
            </div>

            {/* Metrics Breakdown Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-slate-50/80 rounded-2xl border border-slate-200/60 text-center">
              <div>
                <span className="text-[11px] text-slate-400 block font-medium">Category</span>
                <span className="text-xs font-bold text-slate-800">{problem.category}</span>
              </div>
              <div>
                <span className="text-[11px] text-slate-400 block font-medium">Severity</span>
                <span className="text-xs font-bold text-amber-600">{getSeverityLabel(problem.priority)}</span>
              </div>
              <div>
                <span className="text-[11px] text-slate-400 block font-medium">Urgency</span>
                <span className="text-xs font-bold text-rose-600">{getUrgencyLabel(problem.priority)}</span>
              </div>
              <div>
                <span className="text-[11px] text-slate-400 block font-medium">Current Status</span>
                <span className="text-xs font-bold text-emerald-700 uppercase">{problem.status}</span>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <h3 className="text-base font-bold text-slate-900">Issue Details</h3>
              <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                {problem.description}
              </p>
            </div>
          </Card>

          {/* Stage 7: Embedded Gemini AI Analysis Card */}
          <AIAnalysisCard
            problemId={problem.id}
            title={problem.title}
            description={problem.description}
            category={problem.category}
            location={problem.location}
          />

          {/* Persistent Comments Section */}
          <Card className="p-6 border-slate-200/80 space-y-5">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-emerald-600" /> Public Discussion ({comments.length})
            </h3>

            <form onSubmit={handleAddComment} className="space-y-3">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Share public update or response..."
                  className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-emerald-500"
                  required
                />
                <Button variant="primary" type="submit" isLoading={submittingComment} leftIcon={<Send className="w-4 h-4" />}>
                  Post
                </Button>
              </div>
            </form>

            <div className="space-y-3 pt-2">
              {comments.length === 0 ? (
                <p className="text-xs text-slate-400 italic text-center py-4">No comments posted yet.</p>
              ) : (
                comments.map((c) => (
                  <div key={c.id} className="p-4 bg-slate-50/80 rounded-2xl border border-slate-100 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-emerald-600 text-white font-bold text-[10px] flex items-center justify-center">
                          {c.author_name ? c.author_name.substring(0, 2).toUpperCase() : 'JS'}
                        </div>
                        <span className="text-xs font-bold text-slate-900">{c.author_name}</span>
                      </div>
                      <span className="text-[10px] text-slate-400">{c.created_at}</span>
                    </div>
                    <p className="text-xs text-slate-700 pl-8">{c.content}</p>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>

        {/* Right Column: Verification Progress Timeline */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="p-5 border-slate-200/80 space-y-4">
            <h3 className="text-sm font-bold text-slate-900">Verification Timeline</h3>
            <div className="space-y-4 text-xs">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 font-bold">
                  ✓
                </div>
                <div>
                  <h4 className="font-bold text-slate-900">Report Submitted</h4>
                  <p className="text-slate-500 text-[11px]">{problem.createdAt}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 font-bold">
                  !
                </div>
                <div>
                  <h4 className="font-bold text-amber-900 uppercase">{problem.status}</h4>
                  <p className="text-slate-500 text-[11px]">Assigned to Municipal Ward Officer</p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
