import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ShieldAlert, 
  CheckCircle, 
  Clock, 
  FileText, 
  Check, 
  X, 
  MapPin, 
  PieChart, 
  Eye,
  Activity,
  Layers,
  BarChart3,
  Filter
} from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { PageHeader } from '../../components/common/PageHeader';
import { StatCard } from '../../components/common/StatCard';
import { DataTable, Column } from '../../components/common/DataTable';
import { Loading } from '../../components/common/Loading';
import { AdminProblemModal } from '../../components/admin/AdminProblemModal';
import { adminService, AdminActivityLog } from '../../services/adminService';
import { Alert } from '../../components/common/Alert';
import { ErrorState } from '../../components/common/ErrorState';
import { ProblemReport, QuickStats } from '../../types';
import { calculatePriorityScore } from '../../lib/priorityCalculator';

export const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();

  const [stats, setStats] = useState<QuickStats>({
    totalProblems: 0,
    pendingVerification: 0,
    highPriority: 0,
    resolved: 0
  });

  const [pendingItems, setPendingItems] = useState<ProblemReport[]>([]);
  const [allProblems, setAllProblems] = useState<ProblemReport[]>([]);
  const [activityLogs, setActivityLogs] = useState<AdminActivityLog[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  // Detail Modal State
  const [selectedProblem, setSelectedProblem] = useState<ProblemReport | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const loadAdminData = async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const [fetchedStats, fetchedPending, fetchedLogs, fetchedAll] = await Promise.all([
        adminService.fetchAdminStats(),
        adminService.fetchPendingProblems(),
        adminService.fetchRecentActivity(),
        adminService.fetchAllProblems()
      ]);
      setStats(fetchedStats);
      setPendingItems(fetchedPending);
      setActivityLogs(fetchedLogs);
      setAllProblems(fetchedAll);
    } catch (err: any) {
      console.error('Error loading Admin Dashboard data:', err);
      setLoadError(err?.message || 'Unable to load the command centre data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  const handleVerify = async (id: string) => {
    setActionError(null);
    try {
      await adminService.verifyProblem(id);
      await loadAdminData();
      navigate('/admin/matching');
    } catch (err) {
      console.error('Error verifying problem:', err);
      setActionError('This report could not be verified. Please try again.');
    }
  };

  const handleVerificationComplete = async () => {
    await loadAdminData();
    navigate('/admin/matching');
  };

  const handleReject = async (id: string) => {
    setActionError(null);
    try {
      await adminService.rejectProblem(id);
      await loadAdminData();
    } catch (err) {
      console.error('Error rejecting problem:', err);
      setActionError('This report could not be rejected. Please try again.');
    }
  };

  const openDetailModal = (problem: ProblemReport) => {
    setSelectedProblem(problem);
    setIsModalOpen(true);
  };

  // Top Priority Queue items sorted by 5-Factor Priority Score
  const priorityQueue = [...allProblems].sort(
    (a, b) => calculatePriorityScore(b).totalScore - calculatePriorityScore(a).totalScore
  ).slice(0, 3);

  const tableColumns: Column<ProblemReport>[] = [
    {
      header: 'ID',
      accessorKey: 'id',
      cell: (item) => <span className="font-mono font-bold text-slate-500">#{item.id}</span>
    },
    {
      header: 'Title',
      accessorKey: 'title',
      cell: (item) => (
        <button
          onClick={() => openDetailModal(item)}
          className="font-semibold text-slate-900 hover:text-blue-600 transition-colors text-left line-clamp-1"
        >
          {item.title}
        </button>
      )
    },
    {
      header: 'Location',
      accessorKey: 'location'
    },
    {
      header: 'Priority',
      cell: (item) => <Badge priority={item.priority} size="sm" />
    },
    {
      header: 'Actions',
      className: 'text-right',
      cell: (item) => (
        <div className="flex items-center justify-end gap-1.5">
          <Button
            variant="ghost"
            size="sm"
            leftIcon={<Eye className="w-3.5 h-3.5" />}
            onClick={() => openDetailModal(item)}
            className="px-2 text-xs text-slate-600"
          >
            Open
          </Button>
          <Button
            variant="success"
            size="sm"
            leftIcon={<Check className="w-3.5 h-3.5" />}
            onClick={() => handleVerify(item.id)}
            className="px-2.5 py-1 text-xs"
          >
            Verify
          </Button>
          <Button
            variant="outline"
            size="sm"
            leftIcon={<X className="w-3.5 h-3.5 text-rose-600" />}
            onClick={() => handleReject(item.id)}
            className="px-2.5 py-1 text-xs text-rose-700 border-rose-200 hover:bg-rose-50"
          >
            Reject
          </Button>
        </div>
      )
    }
  ];

  if (loading) {
    return <Loading fullScreen text="Loading Government Command Center data..." />;
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Page Header */}
      <PageHeader
        title="Government Command Center"
        subtitle="Executive administrative portal for civic issue verification, priority queue management, and departmental routing."
        role="ADMIN"
      />

      {loadError && <ErrorState message={loadError} onRetry={loadAdminData} />}
      {actionError && <Alert variant="error" message={actionError} onDismiss={() => setActionError(null)} />}

      {/* 1. Real Stat Cards Grid (Supabase Dynamic Data) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Problems"
          value={stats.totalProblems}
          subtitle="Real-time civic submissions"
          icon={<FileText className="w-4 h-4" />}
          role="ADMIN"
        />
        <StatCard
          title="Pending Verification"
          value={stats.pendingVerification || 0}
          subtitle="Awaiting officer review"
          icon={<Clock className="w-4 h-4" />}
          role="ADMIN"
        />
        <StatCard
          title="High Priority"
          value={stats.highPriority || 0}
          subtitle="Requires urgent action"
          icon={<ShieldAlert className="w-4 h-4" />}
          role="ADMIN"
        />
        <StatCard
          title="Resolved"
          value={stats.resolved || 0}
          subtitle="Successfully closed issues"
          icon={<CheckCircle className="w-4 h-4" />}
          role="ADMIN"
        />
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column (8 cols): Pending Verification Table & Priority Queue */}
        <div className="lg:col-span-8 space-y-6">
          {/* 2. Pending Verification Section */}
          <DataTable
            title="Pending Verification Queue"
            subtitle="Click 'Open' to inspect AI evaluation, priority score, and visual evidence before approving or rejecting."
            columns={tableColumns}
            data={pendingItems}
            keyExtractor={(item) => item.id}
          />

          {/* 3. Priority Problems Queue Section */}
          <Card className="p-5 border-slate-200/80 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">Priority Problems Queue</h3>
                <p className="text-xs text-slate-500">Top critical issues ordered by 5-Factor Priority Score.</p>
              </div>
              <ShieldAlert className="w-5 h-5 text-rose-600" />
            </div>

            <div className="space-y-3">
              {priorityQueue.map((item) => {
                const scoreRes = calculatePriorityScore(item);
                return (
                  <div key={item.id} className="p-3.5 bg-slate-50/80 rounded-xl border border-slate-200/70 flex items-center justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Badge priority={item.priority} size="sm" />
                        <span className="text-xs font-bold text-slate-900">{item.title}</span>
                      </div>
                      <p className="text-xs text-slate-500">{item.location} • {item.supportersCount} Supporters</p>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <div className="text-right">
                        <span className="text-lg font-black text-slate-900 block leading-none">{scoreRes.totalScore}</span>
                        <span className="text-[9px] text-slate-400 font-bold uppercase">Score</span>
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => openDetailModal(item)}>
                        Review
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>

        {/* Right Column (4 cols): Category Breakdown, Priority Distribution, Map & Activity Log */}
        <div className="lg:col-span-4 space-y-6">
          {/* 4. Problems by Category Breakdown */}
          <Card className="p-5 border-slate-200/80 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">Problems by Category</h3>
              <PieChart className="w-4 h-4 text-slate-400" />
            </div>

            <div className="flex items-center gap-5">
              <div className="relative w-24 h-24 rounded-full border-8 border-blue-600 border-t-emerald-500 border-r-amber-500 border-b-sky-500 flex items-center justify-center shrink-0">
                <span className="text-base font-black text-slate-900">{stats.totalProblems}</span>
              </div>
              <div className="space-y-1.5 text-xs flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-slate-600 font-medium">Water & Sanitation</span>
                  <span className="font-bold text-slate-800">28%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-600 font-medium">Waste Management</span>
                  <span className="font-bold text-slate-800">22%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-600 font-medium">Infrastructure</span>
                  <span className="font-bold text-slate-800">18%</span>
                </div>
              </div>
            </div>
          </Card>

          {/* 5. Priority Distribution Section */}
          <Card className="p-5 border-slate-200/80 space-y-3">
            <h3 className="text-sm font-bold text-slate-900">Priority Distribution</h3>
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between py-1 border-b border-slate-100">
                <span className="font-bold text-rose-700">Critical Priority</span>
                <span className="font-mono font-bold text-slate-800">15%</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-slate-100">
                <span className="font-bold text-amber-700">High Priority</span>
                <span className="font-mono font-bold text-slate-800">35%</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-slate-100">
                <span className="font-bold text-yellow-700">Medium Priority</span>
                <span className="font-mono font-bold text-slate-800">35%</span>
              </div>
              <div className="flex items-center justify-between py-1">
                <span className="font-bold text-emerald-700">Low Priority</span>
                <span className="font-mono font-bold text-slate-800">15%</span>
              </div>
            </div>
          </Card>

          {/* 6. Geographic Overview & Recent Activity Log */}
          <Card className="p-4 border-slate-200/80 space-y-3">
            <h3 className="text-sm font-bold text-slate-900">Geographic Overview</h3>
            <div className="h-32 bg-slate-200/60 rounded-xl overflow-hidden relative flex items-center justify-center">
              <MapPin className="w-6 h-6 text-blue-600" />
            </div>
          </Card>

          <Card className="p-5 border-slate-200/80 space-y-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Activity className="w-4 h-4 text-blue-600" /> Recent Audit Activity
            </h3>
            <div className="space-y-2 text-xs divide-y divide-slate-100">
              {activityLogs.map((log) => (
                <div key={log.id} className="pt-2 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-slate-900 block">{log.action}</span>
                    <span className="text-[10px] text-slate-500">{log.target}</span>
                  </div>
                  <span className="text-[10px] text-slate-400">{log.time}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* Admin Problem Review Detail Drawer / Modal */}
      <AdminProblemModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        problem={selectedProblem}
        onActionComplete={loadAdminData}
        onVerificationComplete={handleVerificationComplete}
      />
    </div>
  );
};
