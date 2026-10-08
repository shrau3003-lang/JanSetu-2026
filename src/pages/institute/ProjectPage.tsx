import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  MapPin, 
  CheckCircle2, 
  Clock, 
  Users, 
  Send, 
  FileText, 
  ShieldCheck, 
  UploadCloud, 
  AlertCircle,
  Plus,
  Building2,
  Check,
  X
} from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { ProgressBar } from '../../components/common/ProgressBar';
import { Loading } from '../../components/common/Loading';
import { useAuth } from '../../context/AuthContext';
import { 
  projectLifecycleService 
} from '../../services/projectLifecycleService';
import { 
  InstituteProject, 
  MilestoneItem, 
  ProjectTeamMember 
} from '../../types';
import { ProjectLifecycleTimeline } from '../../components/institute/ProjectLifecycleTimeline';
import { SubmitMilestoneModal } from '../../components/institute/SubmitMilestoneModal';

export const ProjectPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { role } = useAuth();
  const isAdmin = (role || '').toString().toLowerCase() === 'admin';

  const [project, setProject] = useState<InstituteProject | null>(null);
  const [loading, setLoading] = useState(true);

  // Modals & Forms State
  const [selectedMilestone, setSelectedMilestone] = useState<MilestoneItem | null>(null);
  const [submitModalOpen, setSubmitModalOpen] = useState(false);
  const [showAddMember, setShowAddMember] = useState(false);
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberRole, setNewMemberRole] = useState('');
  const [newMemberDept, setNewMemberDept] = useState('');

  // Government Review State
  const [reviewFeedback, setReviewFeedback] = useState('');

  useEffect(() => {
    let isMounted = true;
    const loadProject = async () => {
      setLoading(true);
      const res = await projectLifecycleService.getProjectDetails(id || 'JS-2026-001');
      if (isMounted) {
        setProject(res);
        setLoading(false);
      }
    };
    loadProject();
    return () => { isMounted = false; };
  }, [id]);

  const handleMilestoneSubmit = async (milestoneId: string, evidenceText: string, evidenceUrl?: string) => {
    await projectLifecycleService.submitMilestoneEvidence(milestoneId, evidenceText, evidenceUrl);
    // Update local state
    if (project) {
      const updatedMilestones = project.milestones.map(m => {
        if (m.id === milestoneId) {
          return {
            ...m,
            status: 'SUBMITTED_FOR_REVIEW' as any,
            evidenceText,
            evidenceUrl,
            submittedAt: new Date().toISOString()
          };
        }
        return m;
      });
      setProject({ ...project, milestones: updatedMilestones });
    }
  };

  const handleGovernmentReview = async (milestoneId: string, approved: boolean) => {
    await projectLifecycleService.reviewMilestone(milestoneId, approved, reviewFeedback);
    // Update local state
    if (project) {
      const updatedMilestones = project.milestones.map(m => {
        if (m.id === milestoneId) {
          return {
            ...m,
            completed: approved,
            status: (approved ? 'APPROVED' : 'REJECTED') as any,
            governmentFeedback: reviewFeedback
          };
        }
        return m;
      });

      const completedCount = updatedMilestones.filter(m => m.completed).length;
      const progress = Math.round((completedCount / updatedMilestones.length) * 100);

      setProject({
        ...project,
        progressPercentage: progress,
        milestones: updatedMilestones,
        status: progress === 100 ? 'COMPLETED' : project.status
      });
    }
    setReviewFeedback('');
  };

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemberName.trim() || !newMemberRole.trim() || !project) return;

    const added = await projectLifecycleService.addTeamMember(project.id, {
      name: newMemberName,
      role: newMemberRole,
      department: newMemberDept
    });

    const updatedTeam = [...(project.teamMembers || []), added];
    setProject({
      ...project,
      teamMembers: updatedTeam,
      teamMembersCount: updatedTeam.length
    });

    setNewMemberName('');
    setNewMemberRole('');
    setNewMemberDept('');
    setShowAddMember(false);
  };

  if (loading || !project) {
    return (
      <div className="py-20 flex justify-center">
        <Loading size="lg" text="Loading Project Lifecycle Workspace..." />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Navigation Link */}
      <Link 
        to={isAdmin ? "/admin/projects" : "/institute"} 
        className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to {isAdmin ? 'Admin Projects' : 'Institute Portal'}
      </Link>

      {/* Header Banner */}
      <Card className="p-6 border-slate-200 space-y-4 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-mono text-xs font-bold text-slate-400">PROJECT ID: {project.id}</span>
              <span className="px-3 py-0.5 rounded-full text-xs font-extrabold bg-indigo-600 text-white shadow-2xs">
                {project.status}
              </span>
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">{project.title}</h1>
            <p className="text-xs text-slate-500 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-slate-400" /> {project.location} • Lead Institute: {project.guideInstitute}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <span className="text-2xl font-black text-indigo-700 block">{project.progressPercentage}%</span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Overall Progress</span>
            </div>
          </div>
        </div>

        <ProgressBar value={project.progressPercentage} label="Project Completion" role="INSTITUTE" />
      </Card>

      {/* Visual Step-by-Step Lifecycle Timeline */}
      <ProjectLifecycleTimeline currentStatus={project.status} />

      {/* Grid Layout: Milestones vs Team & Evidence */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left (7 cols): Milestones & Evidence Management */}
        <div className="lg:col-span-7 space-y-6">
          <Card className="p-5 border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">Project Deliverables & Milestones</h3>
                <p className="text-xs text-slate-500">Track milestones, submit testing evidence, and view government approvals.</p>
              </div>
            </div>

            <div className="space-y-4">
              {project.milestones.map((m, idx) => {
                const status = m.status || (m.completed ? 'APPROVED' : 'PENDING');
                const isSubmitted = status === 'SUBMITTED_FOR_REVIEW';
                const isApproved = status === 'APPROVED';
                const isRejected = status === 'REJECTED';

                return (
                  <div 
                    key={m.id || idx} 
                    className={`p-4 rounded-xl border transition-all space-y-3 ${
                      isApproved 
                        ? 'bg-emerald-50/50 border-emerald-200' 
                        : isSubmitted 
                        ? 'bg-amber-50/50 border-amber-200' 
                        : isRejected 
                        ? 'bg-rose-50/50 border-rose-200' 
                        : 'bg-white border-slate-200/90'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 ${
                          isApproved 
                            ? 'bg-emerald-600 text-white' 
                            : isSubmitted 
                            ? 'bg-amber-500 text-white' 
                            : isRejected 
                            ? 'bg-rose-600 text-white' 
                            : 'bg-slate-100 text-slate-500'
                        }`}>
                          {isApproved ? <Check className="w-4 h-4" /> : idx + 1}
                        </div>

                        <div className="space-y-0.5">
                          <h4 className="text-sm font-bold text-slate-900">{m.name}</h4>
                          {m.description && <p className="text-xs text-slate-600">{m.description}</p>}
                        </div>
                      </div>

                      <span className={`text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-md shrink-0 ${
                        isApproved 
                          ? 'bg-emerald-100 text-emerald-800' 
                          : isSubmitted 
                          ? 'bg-amber-100 text-amber-800' 
                          : isRejected 
                          ? 'bg-rose-100 text-rose-800' 
                          : 'bg-slate-100 text-slate-500'
                      }`}>
                        {status.replace(/_/g, ' ')}
                      </span>
                    </div>

                    {/* Submitted Evidence Section */}
                    {m.evidenceText && (
                      <div className="p-3 rounded-lg bg-white border border-slate-200/80 space-y-1 text-xs">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Submitted Evidence:</span>
                        <p className="text-slate-700 font-medium">{m.evidenceText}</p>
                        {m.evidenceUrl && (
                          <a 
                            href={m.evidenceUrl} 
                            target="_blank" 
                            rel="noreferrer" 
                            className="text-xs font-semibold text-indigo-600 hover:underline inline-flex items-center gap-1 pt-1"
                          >
                            <FileText className="w-3.5 h-3.5" /> View Evidence Document/Photo
                          </a>
                        )}
                      </div>
                    )}

                    {/* Government Feedback if reviewed */}
                    {m.governmentFeedback && (
                      <div className="p-2.5 rounded-lg bg-indigo-50 border border-indigo-100 text-xs text-indigo-900">
                        <span className="font-bold block">Government Officer Feedback:</span>
                        <span>{m.governmentFeedback}</span>
                      </div>
                    )}

                    {/* Actions: Institute Submit Evidence vs Admin Review */}
                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                      <span className="text-slate-400 font-medium">Due: {m.dueDate || 'Flexible'}</span>

                      {!isAdmin && !isApproved && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedMilestone(m);
                            setSubmitModalOpen(true);
                          }}
                          className="text-xs border-indigo-200 text-indigo-700 hover:bg-indigo-50"
                        >
                          {m.evidenceText ? 'Update Evidence' : 'Submit Evidence'}
                        </Button>
                      )}

                      {/* Government Admin Review Interface */}
                      {isAdmin && isSubmitted && (
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={reviewFeedback}
                            onChange={(e) => setReviewFeedback(e.target.value)}
                            placeholder="Optional officer feedback..."
                            className="text-xs px-2.5 py-1 rounded-md border border-slate-300 focus:outline-none"
                          />
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => handleGovernmentReview(m.id || 'm-1', true)}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs"
                          >
                            Approve
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleGovernmentReview(m.id || 'm-1', false)}
                            className="border-rose-300 text-rose-700 hover:bg-rose-50 text-xs"
                          >
                            Reject
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>

        {/* Right (5 cols): Team Members & Project Metadata */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Team Members List */}
          <Card className="p-5 border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Users className="w-4 h-4 text-indigo-600" />
                Student & Faculty R&D Team ({project.teamMembers?.length || 0})
              </h3>
              {!isAdmin && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setShowAddMember(!showAddMember)}
                  className="text-xs border-indigo-200 text-indigo-700 hover:bg-indigo-50"
                >
                  <Plus className="w-3.5 h-3.5 inline mr-1" /> Add Member
                </Button>
              )}
            </div>

            {/* Add Member Quick Form */}
            {showAddMember && (
              <form onSubmit={handleAddMember} className="p-3 bg-indigo-50/70 border border-indigo-100 rounded-xl space-y-2 text-xs">
                <h4 className="font-bold text-indigo-900">Add Contributor</h4>
                <input
                  type="text"
                  value={newMemberName}
                  onChange={(e) => setNewMemberName(e.target.value)}
                  placeholder="Full Name (e.g. Aarav Sharma)"
                  className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs"
                  required
                />
                <input
                  type="text"
                  value={newMemberRole}
                  onChange={(e) => setNewMemberRole(e.target.value)}
                  placeholder="Role (e.g. Firmware Lead / AI Analyst)"
                  className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs"
                  required
                />
                <input
                  type="text"
                  value={newMemberDept}
                  onChange={(e) => setNewMemberDept(e.target.value)}
                  placeholder="Department (e.g. Computer Science)"
                  className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs"
                />
                <div className="flex items-center justify-end gap-2 pt-1">
                  <Button variant="outline" size="sm" onClick={() => setShowAddMember(false)} type="button">
                    Cancel
                  </Button>
                  <Button variant="primary" size="sm" role="INSTITUTE" type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-xs">
                    Save Member
                  </Button>
                </div>
              </form>
            )}

            <div className="space-y-2.5">
              {(project.teamMembers || []).map((m) => (
                <div key={m.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center">
                      {m.avatar || m.name.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900">{m.name}</h4>
                      <p className="text-[10px] text-slate-400">{m.department || 'Engineering'}</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-100 px-2.5 py-0.5 rounded-md">
                    {m.role}
                  </span>
                </div>
              ))}
            </div>
          </Card>

          {/* Academic Governance Card */}
          <Card className="p-5 border-slate-200 space-y-3 bg-gradient-to-br from-white via-indigo-50/20 to-white">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              Academic Governance Details
            </h3>

            <div className="space-y-2 text-xs text-slate-600">
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="font-medium text-slate-500">Lead Faculty:</span>
                <span className="font-bold text-slate-900">{project.leadName}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="font-medium text-slate-500">Host Institute:</span>
                <span className="font-bold text-slate-900">{project.guideInstitute}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="font-medium text-slate-500">Next Audit Deadline:</span>
                <span className="font-bold text-indigo-700">{project.nextDeadline || 'Oct 15, 2026'}</span>
              </div>
            </div>
          </Card>

        </div>
      </div>

      {/* Submit Evidence Modal */}
      <SubmitMilestoneModal
        milestone={selectedMilestone}
        isOpen={submitModalOpen}
        onClose={() => setSubmitModalOpen(false)}
        onSubmit={handleMilestoneSubmit}
      />
    </div>
  );
};
