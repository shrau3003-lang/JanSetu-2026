import React, { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Download, RefreshCw, Search, FileText } from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { DataTable, Column } from '../../components/common/DataTable';
import { Skeleton } from '../../components/common/Loading';
import { EmptyState } from '../../components/common/EmptyState';
import { ErrorState } from '../../components/common/ErrorState';
import { Tabs } from '../../components/common/Tabs';
import { Alert } from '../../components/common/Alert';
import { AdminProblemModal } from '../../components/admin/AdminProblemModal';
import { ProblemReport } from '../../types';
import { adminService } from '../../services/adminService';

const STATUS_TABS = [
  { id: 'all', label: 'All' },
  { id: 'pending', label: 'Pending' },
  { id: 'verified', label: 'Verified' },
  { id: 'in_progress', label: 'In Progress' },
  { id: 'resolved', label: 'Resolved' },
  { id: 'rejected', label: 'Rejected' }
];

export const AdminReportsPage: React.FC = () => {
  const [searchParams] = useSearchParams();

  const [problems, setProblems] = useState<ProblemReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const [statusTab, setStatusTab] = useState('all');
  const [query, setQuery] = useState(searchParams.get('q') || '');

  const [selected, setSelected] = useState<ProblemReport | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setProblems(await adminService.fetchAllProblems());
    } catch (err: any) {
      console.error('Error loading reports:', err);
      setError(err?.message || 'Unable to load civic reports. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { setQuery(searchParams.get('q') || ''); }, [searchParams]);

  const q = query.trim().toLowerCase();
  const visible = problems.filter((p) => {
    const matchesStatus = statusTab === 'all' || p.status === statusTab;
    const matchesQuery =
      !q ||
      p.title.toLowerCase().includes(q) ||
      p.location.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q);
    return matchesStatus && matchesQuery;
  });

  /** Exports the current filtered view as a CSV download. */
  const exportCsv = () => {
    try {
      const header = ['ID', 'Title', 'Category', 'Priority', 'Status', 'Location', 'Supporters', 'Reported'];
      const escape = (v: string) => `"${String(v).replace(/"/g, '""')}"`;
      const rows = visible.map((p) =>
        [p.id, p.title, p.category, p.priority, p.status, p.location, p.supportersCount, p.createdAt]
          .map((v) => escape(String(v)))
          .join(',')
      );
      const blob = new Blob([[header.join(','), ...rows].join('\n')], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `jansetu-reports-${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      setNotice(`Exported ${visible.length} report(s) to CSV.`);
    } catch (err) {
      console.error('CSV export failed:', err);
      setError('The CSV export could not be generated.');
    }
  };

  const columns: Column<ProblemReport>[] = [
    { header: 'ID', accessorKey: 'id', cell: (i) => <span className="font-mono font-bold text-slate-500">#{String(i.id).slice(0, 8)}</span> },
    {
      header: 'Title',
      accessorKey: 'title',
      cell: (i) => (
        <button
          onClick={() => { setSelected(i); setModalOpen(true); }}
          className="font-semibold text-slate-900 hover:text-blue-600 transition-colors text-left line-clamp-1"
        >
          {i.title}
        </button>
      )
    },
    { header: 'Category', accessorKey: 'category' },
    { header: 'Location', accessorKey: 'location' },
    { header: 'Priority', cell: (i) => <Badge priority={i.priority} size="sm" /> },
    { header: 'Status', cell: (i) => <span className="text-xs font-bold uppercase tracking-wider text-slate-600">{i.status}</span> },
    { header: 'Supporters', cell: (i) => <span className="font-mono font-bold">{i.supportersCount}</span> }
  ];

  return (
    <div className="space-y-6 pb-12">
      <PageHeader
        title="Civic Reports"
        subtitle="Complete register of community submissions with filtering, search and CSV export."
        role="ADMIN"
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" leftIcon={<RefreshCw className="w-3.5 h-3.5" />} onClick={load}>
              Refresh
            </Button>
            <Button variant="dark" size="sm" leftIcon={<Download className="w-3.5 h-3.5" />} onClick={exportCsv} disabled={visible.length === 0}>
              Export CSV
            </Button>
          </div>
        }
      />

      {notice && <Alert variant="success" message={notice} onDismiss={() => setNotice(null)} />}

      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <Tabs items={STATUS_TABS} activeTab={statusTab} onChange={setStatusTab} role="ADMIN" />
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search reports by title, location, category..."
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
          />
        </div>
      </div>

      {loading ? (
        <Skeleton className="h-96 w-full" />
      ) : error ? (
        <ErrorState message={error} onRetry={load} />
      ) : visible.length === 0 ? (
        <Card className="p-4 border-slate-200/80">
          <EmptyState icon={<FileText className="w-6 h-6" />} title="No reports match these filters" description="Adjust the status tab or clear the search query." />
        </Card>
      ) : (
        <DataTable
          title={`All Civic Reports (${visible.length})`}
          subtitle="Click a title to open the full review panel with AI analysis and priority score."
          columns={columns}
          data={visible}
          keyExtractor={(i) => i.id}
        />
      )}

      <AdminProblemModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        problem={selected}
        onActionComplete={load}
      />
    </div>
  );
};
