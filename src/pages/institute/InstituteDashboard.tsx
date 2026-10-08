import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Briefcase, 
  Layers, 
  Award, 
  Users, 
  Sparkles, 
  MapPin, 
  Clock, 
  Globe, 
  Check,
  Search,
  ChevronRight,
  Calendar,
  Activity,
  FileCheck,
  ArrowRight,
  TrendingUp,
  Cpu,
  Building2
} from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Alert } from '../../components/common/Alert';
import { ErrorState } from '../../components/common/ErrorState';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { StatCard } from '../../components/common/StatCard';
import { ProgressBar } from '../../components/common/ProgressBar';
import { Loading } from '../../components/common/Loading';
import { EmptyState } from '../../components/common/EmptyState';
import { useAuth } from '../../context/AuthContext';
import { instituteService, InstituteDashboardData } from '../../services/instituteService';
import { MatchExplanationModal } from '../../components/institute/MatchExplanationModal';
import { Challenge } from '../../types';

export const InstituteDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState<InstituteDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [acceptedChallengeIds, setAcceptedChallengeIds] = useState<string[]>([]);
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null);
  const [acceptingId, setAcceptingId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const res = await instituteService.getDashboardData(user?.id);
      setData(res);
      // Accepted state is restored from the projects source of truth, so it
      // survives navigation and a full browser refresh.
      setAcceptedChallengeIds(res.acceptedChallengeIds);
    } catch (err: any) {
      console.error('Failed to load institute dashboard:', err);
      setLoadError(err?.message || 'Unable to load your institute portal. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const handleAcceptChallenge = async (challengeId: string) => {
    if (acceptedChallengeIds.includes(challengeId) || acceptingId) return;

    const challenge = data?.recommendedChallenges.find((c) => c.id === challengeId);
    setAcceptingId(challengeId);
    setActionError(null);
    setSuccessMessage(null);

    try {
      const result = await instituteService.acceptChallenge(challenge || challengeId, user?.id);
      if (result.success) {
        setAcceptedChallengeIds((prev) => (prev.includes(challengeId) ? prev : [...prev, challengeId]));
        setSuccessMessage(
          result.alreadyAccepted
            ? 'This challenge was already accepted - opening the existing project.'
            : 'Challenge accepted. A new project has been created under My Projects.'
        );
        // Refresh KPIs, projects and accepted state before navigating.
        await loadDashboard();
        navigate(`/institute/project/${result.projectId}`);
      }
    } catch (err: any) {
      console.error('Failed to accept challenge:', err);
      setActionError(err?.message || 'The challenge could not be accepted. Please try again.');
    } finally {
      setAcceptingId(null);
    }
  };

  if (loading) {
    return (
      <div className="py-20 flex justify-center">
        <Loading size="lg" text="Loading Institute Innovation Portal..." />
      </div>
    );
  }

  if (loadError || !data) {
    return <ErrorState message={loadError || 'Institute portal data is unavailable.'} onRetry={loadDashboard} />;
  }

  // Filter challenges by search query
  const filteredChallenges = data.recommendedChallenges.filter(ch => 
    ch.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    ch.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
    ch.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
    ch.requiredSkills.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-8 pb-12">
      {successMessage && (
        <Alert variant="success" title="Challenge accepted" message={successMessage} onDismiss={() => setSuccessMessage(null)} />
      )}
      {actionError && (
        <Alert variant="error" title="Could not accept challenge" message={actionError} onDismiss={() => setActionError(null)} />
      )}

      {/* Search Header Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-indigo-100 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 text-white flex items-center justify-center font-bold text-lg shadow-md shadow-indigo-200">
            {data.instituteName.substring(0, 2).toUpperCase()}
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900 leading-tight">{data.instituteName}</h2>
            <p className="text-xs text-indigo-600 font-medium">{data.department} • {data.accreditation}</p>
          </div>
        </div>

        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search challenges, projects, skills..."
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
          />
        </div>
      </div>

      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-900 via-indigo-850 to-slate-900 p-6 sm:p-8 text-white shadow-xl shadow-indigo-950/20">
        <div className="absolute right-0 top-0 -mt-8 -mr-8 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-800/60 border border-indigo-700/60 text-indigo-200 text-xs font-semibold backdrop-blur-sm">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>JanSetu Academic Innovation Hub</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Welcome back, {data.instituteName}!
            </h1>
            <p className="text-sm text-indigo-200/90 leading-relaxed">
              Turn real community challenges into meaningful solutions through collaborative academic R&D.
            </p>
          </div>

          <div className="shrink-0 bg-white/10 backdrop-blur-md border border-white/15 px-4 py-3 rounded-2xl flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-bold text-white tracking-wide">
              {data.kpis.studentContributors} Student Contributors • {data.kpis.activeProjects} Active Projects
            </span>
          </div>
        </div>
      </div>

      {/* Top KPI Section (5 Cards) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        <StatCard
          title="ACTIVE PROJECTS"
          value={data.kpis.activeProjects.toString()}
          subtitle="In engineering pipeline"
          icon={<Briefcase className="w-4 h-4 text-indigo-600" />}
          role="INSTITUTE"
        />
        <StatCard
          title="ONGOING CHALLENGES"
          value={data.kpis.ongoingChallenges.toString()}
          subtitle="Matching department"
          icon={<Layers className="w-4 h-4 text-violet-600" />}
          role="INSTITUTE"
        />
        <StatCard
          title="COMPLETED PROJECTS"
          value={data.kpis.completedProjects.toString()}
          subtitle="Government verified"
          icon={<Award className="w-4 h-4 text-emerald-600" />}
          role="INSTITUTE"
        />
        <StatCard
          title="STUDENT CONTRIBUTORS"
          value={data.kpis.studentContributors.toString()}
          subtitle="Active researchers"
          icon={<Users className="w-4 h-4 text-blue-600" />}
          role="INSTITUTE"
        />
        <StatCard
          title="IMPACT GENERATED"
          value={`${data.kpis.impactGenerated.toLocaleString()}`}
          subtitle="Citizens impacted"
          icon={<Globe className="w-4 h-4 text-teal-600" />}
          role="INSTITUTE"
        />
      </div>

      {/* Main Grid: Recommended Challenges & Project Progress */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column (7 cols): Recommended Challenges */}
        <div className="lg:col-span-7 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-200/80 pb-3">
            <div>
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-indigo-600" />
                Recommended Challenges
              </h3>
              <p className="text-xs text-slate-500">
                Problems that match your institute's capabilities and department expertise.
              </p>
            </div>
            <Link 
              to="/institute/challenges" 
              className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 group"
            >
              View All <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>

          {filteredChallenges.length === 0 ? (
            <EmptyState
              title="No challenges matched"
              description="No community challenges found matching your search criteria."
              actionLabel="Reset Search"
              onAction={() => setSearchQuery('')}
            />
          ) : (
            <div className="space-y-4">
              {filteredChallenges.map((item) => {
                const isAccepted = acceptedChallengeIds.includes(item.id);
                return (
                  <Card key={item.id} className="p-5 border-slate-200/90 hover:border-indigo-300 transition-all hover:shadow-md space-y-4">
                    <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
                      
                      {/* Left thumbnail & content */}
                      <div className="flex items-start gap-4 flex-1">
                        {item.image && (
                          <img 
                            src={item.image} 
                            alt={item.title} 
                            className="w-20 h-20 rounded-xl object-cover shrink-0 border border-slate-200 shadow-sm"
                          />
                        )}
                        <div className="space-y-1.5 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge priority={item.priority} size="sm" />
                            <span className="text-xs text-slate-500 font-semibold">{item.category}</span>
                            <span className="text-[11px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-md">
                              <Building2 className="w-3 h-3 inline mr-1 text-indigo-500" />
                              {item.requiredDepartment}
                            </span>
                          </div>

                          <h4 className="text-base font-bold text-slate-900 hover:text-indigo-600 transition-colors">
                            {item.title}
                          </h4>

                          <p className="text-xs text-slate-600 line-clamp-2">
                            {item.description}
                          </p>

                          <div className="flex items-center gap-3 text-xs text-slate-500 pt-1">
                            <span className="flex items-center gap-1 font-medium">
                              <MapPin className="w-3.5 h-3.5 text-slate-400" /> {item.location}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Right match score & action buttons */}
                      <div className="flex sm:flex-col items-center sm:items-end justify-between self-stretch shrink-0 gap-3 border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100 w-full sm:w-auto">
                        <span className="inline-flex items-center gap-1.5 text-xs font-extrabold text-teal-700 bg-teal-50 border border-teal-200 px-3 py-1 rounded-full shadow-2xs">
                          <Sparkles className="w-3.5 h-3.5 text-teal-600" /> {item.matchPercentage}% Match
                        </span>

                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedChallenge(item)}
                            className="text-xs border-indigo-200 hover:bg-indigo-50 text-indigo-700"
                          >
                            View Challenge
                          </Button>

                          {isAccepted ? (
                            <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl">
                              <Check className="w-3.5 h-3.5" /> Accepted
                            </span>
                          ) : (
                            <Button
                              variant="primary"
                              size="sm"
                              role="INSTITUTE"
                              isLoading={acceptingId === item.id}
                              disabled={acceptingId === item.id}
                              onClick={() => handleAcceptChallenge(item.id)}
                              className="bg-indigo-600 hover:bg-indigo-700 text-xs"
                            >
                              {acceptingId === item.id ? 'Accepting...' : 'Accept Challenge'}
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Required Skills tags footer */}
                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between flex-wrap gap-2 text-xs">
                      <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Required Skills:</span>
                      <div className="flex flex-wrap gap-1.5">
                        {item.requiredSkills.map((skill) => (
                          <span key={skill} className="px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[11px] font-semibold border border-slate-200/60">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column (5 cols): Project Progress, Impact & Activity */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* My Project Progress */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200/80 pb-3">
              <h3 className="text-base font-bold text-slate-900">My Project Progress</h3>
              <Link to="/institute/projects" className="text-xs font-bold text-indigo-600 hover:text-indigo-700">
                View All Projects
              </Link>
            </div>

            {data.activeProjects.length === 0 ? (
              <Card className="p-6 text-center border-dashed border-2 border-slate-200 space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
                  <Briefcase className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-bold text-slate-900">No active projects yet</h4>
                <p className="text-xs text-slate-500">
                  Explore community challenges that match your institute's skills and accept your first research project.
                </p>
                <Link to="/institute/challenges">
                  <Button variant="primary" size="sm" role="INSTITUTE" className="bg-indigo-600 hover:bg-indigo-700 mt-2">
                    Explore Challenges
                  </Button>
                </Link>
              </Card>
            ) : (
              <div className="space-y-4">
                {data.activeProjects.map((proj) => (
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

                    {/* Timeline milestone steps */}
                    <div className="space-y-2 pt-2 border-t border-slate-100 text-xs">
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Milestones Tracker:</span>
                      {proj.milestones.map((m) => (
                        <div key={m.name} className="flex items-center justify-between py-1 border-b border-slate-100/60 last:border-0">
                          <span className="flex items-center gap-2 font-medium text-slate-700">
                            {m.completed ? (
                              <span className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-[10px] font-bold">✓</span>
                            ) : (
                              <span className="w-4 h-4 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center text-[10px] font-bold">○</span>
                            )}
                            {m.name}
                          </span>
                          <span className={`text-[11px] font-bold ${m.completed ? 'text-emerald-600' : 'text-slate-400'}`}>
                            {m.completed ? 'Completed' : m.dueDate ? m.dueDate : 'Pending'}
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

          {/* Impact Overview Section */}
          <Card className="p-5 border-slate-200/90 space-y-4 bg-gradient-to-br from-white via-indigo-50/30 to-white">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Globe className="w-4 h-4 text-emerald-600" />
                Impact Overview
              </h3>
              <span className="text-[11px] font-bold text-slate-400">Cumulative Metrics</span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="p-3 bg-white rounded-xl border border-slate-200/80 shadow-2xs space-y-1">
                <Users className="w-4 h-4 text-indigo-600 mx-auto" />
                <span className="text-lg font-black text-slate-900 block">{data.impact.citizensImpacted.toLocaleString()}</span>
                <span className="text-[10px] font-semibold text-slate-500">Citizens Impacted</span>
              </div>
              <div className="p-3 bg-white rounded-xl border border-slate-200/80 shadow-2xs space-y-1">
                <Check className="w-4 h-4 text-emerald-600 mx-auto" />
                <span className="text-lg font-black text-slate-900 block">{data.impact.problemsSolved}</span>
                <span className="text-[10px] font-semibold text-slate-500">Problems Solved</span>
              </div>
              <div className="p-3 bg-white rounded-xl border border-slate-200/80 shadow-2xs space-y-1">
                <MapPin className="w-4 h-4 text-teal-600 mx-auto" />
                <span className="text-lg font-black text-slate-900 block">{data.impact.locationsCovered}</span>
                <span className="text-[10px] font-semibold text-slate-500">Locations Covered</span>
              </div>
              <div className="p-3 bg-white rounded-xl border border-slate-200/80 shadow-2xs space-y-1">
                <Award className="w-4 h-4 text-violet-600 mx-auto" />
                <span className="text-lg font-black text-slate-900 block">{data.impact.projectsCompleted}</span>
                <span className="text-[10px] font-semibold text-slate-500">Projects Completed</span>
              </div>
            </div>
          </Card>

          {/* Recent Activity Timeline Feed */}
          <Card className="p-5 border-slate-200/90 space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Activity className="w-4 h-4 text-indigo-600" />
              Recent Activity Feed
            </h3>

            <div className="space-y-3 relative before:absolute before:left-3.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
              {data.recentActivities.map((act) => (
                <div key={act.id} className="relative pl-7 space-y-1">
                  <div className="absolute left-2 top-1.5 -translate-x-1/2 w-3.5 h-3.5 rounded-full bg-indigo-600 border-2 border-white ring-2 ring-indigo-100" />
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-900">{act.title}</span>
                    <span className="text-[10px] text-slate-400 shrink-0">{act.timestamp}</span>
                  </div>
                  <p className="text-xs text-slate-600">{act.description}</p>
                  {act.user && (
                    <span className="text-[10px] font-semibold text-indigo-600 block">{act.user}</span>
                  )}
                </div>
              ))}
            </div>
          </Card>

          {/* Upcoming Deadlines */}
          <Card className="p-5 border-slate-200/90 space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-amber-600" />
              Upcoming Project Deadlines
            </h3>

            <div className="space-y-2.5">
              {data.upcomingDeadlines.map((dl) => (
                <div key={dl.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200/70 flex items-center justify-between gap-3 text-xs">
                  <div className="space-y-0.5">
                    <h5 className="font-bold text-slate-900">{dl.title}</h5>
                    <p className="text-[11px] text-slate-500">{dl.projectTitle}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-bold ${
                      dl.status === 'Urgent' 
                        ? 'bg-rose-100 text-rose-700' 
                        : 'bg-indigo-100 text-indigo-700'
                    }`}>
                      {dl.dueDate}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </Card>

        </div>
      </div>

      {/* Match Explanation Modal */}
      <MatchExplanationModal
        challenge={selectedChallenge}
        isOpen={!!selectedChallenge}
        onClose={() => setSelectedChallenge(null)}
        onAccept={handleAcceptChallenge}
        isAccepted={selectedChallenge ? acceptedChallengeIds.includes(selectedChallenge.id) : false}
      />
    </div>
  );
};
