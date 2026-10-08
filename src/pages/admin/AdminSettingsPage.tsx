import React, { useEffect, useState } from 'react';
import { Settings, Save, RotateCcw, Database, ShieldCheck } from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Select } from '../../components/common/Select';
import { Alert } from '../../components/common/Alert';
import { Modal } from '../../components/common/Modal';
import { useAuth } from '../../context/AuthContext';
import { isSupabaseConfigured } from '../../lib/supabase';
import { localStore } from '../../services/localStore';

const SETTINGS_KEY = 'jansetu.admin.settings.v1';

interface AdminSettings {
  defaultPriorityThreshold: string;
  autoRouteVerified: boolean;
  emailNotifications: boolean;
  duplicateDetection: boolean;
  itemsPerPage: string;
}

const DEFAULTS: AdminSettings = {
  defaultPriorityThreshold: '70',
  autoRouteVerified: true,
  emailNotifications: true,
  duplicateDetection: true,
  itemsPerPage: '25'
};

const Toggle: React.FC<{ label: string; description: string; checked: boolean; onChange: (v: boolean) => void }> = ({
  label, description, checked, onChange
}) => (
  <div className="flex items-start justify-between gap-4 py-3 border-b border-slate-100 last:border-0">
    <div className="space-y-0.5">
      <h4 className="text-sm font-bold text-slate-900">{label}</h4>
      <p className="text-xs text-slate-500">{description}</p>
    </div>
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative w-11 h-6 rounded-full transition-colors shrink-0 ${checked ? 'bg-blue-600' : 'bg-slate-300'}`}
    >
      <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${checked ? 'translate-x-5' : ''}`} />
    </button>
  </div>
);

export const AdminSettingsPage: React.FC = () => {
  const { profile } = useAuth();
  const [settings, setSettings] = useState<AdminSettings>(DEFAULTS);
  const [saved, setSaved] = useState<string | null>(null);
  const [resetOpen, setResetOpen] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(SETTINGS_KEY);
      if (raw) setSettings({ ...DEFAULTS, ...JSON.parse(raw) });
    } catch (err) {
      console.warn('Could not read admin settings:', err);
    }
  }, []);

  const save = () => {
    try {
      window.localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
      setSaved('Your administrative preferences have been saved.');
      window.setTimeout(() => setSaved(null), 3000);
    } catch (err) {
      console.error('Could not save admin settings:', err);
    }
  };

  const resetDemoData = () => {
    localStore.reset();
    setResetOpen(false);
    setSaved('Demo dataset restored. Reload any open portal tab to see the seeded data.');
  };

  return (
    <div className="space-y-6 pb-12 max-w-4xl">
      <PageHeader
        title="Portal Settings"
        subtitle="Configure verification thresholds, routing automation and notification preferences."
        role="ADMIN"
        actions={
          <Button variant="primary" size="sm" leftIcon={<Save className="w-4 h-4" />} onClick={save} className="bg-blue-600 hover:bg-blue-700 shadow-blue-200">
            Save Changes
          </Button>
        }
      />

      {saved && <Alert variant="success" message={saved} onDismiss={() => setSaved(null)} />}

      <Card className="p-5 border-slate-200/80 space-y-4">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
          <ShieldCheck className="w-4 h-4 text-blue-600" /> Officer Account
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Signed in as</span>
            <p className="font-bold text-slate-900">{profile?.full_name || 'Government Officer'}</p>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Email</span>
            <p className="font-bold text-slate-900">{profile?.email || 'Not available'}</p>
          </div>
        </div>
      </Card>

      <Card className="p-5 border-slate-200/80 space-y-2">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3 mb-2">
          <Settings className="w-4 h-4 text-blue-600" /> Verification & Routing
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-3">
          <Select
            label="Priority Score Escalation Threshold"
            value={settings.defaultPriorityThreshold}
            onChange={(e) => setSettings({ ...settings, defaultPriorityThreshold: e.target.value })}
            options={[
              { label: '50 — Escalate most issues', value: '50' },
              { label: '70 — Balanced (recommended)', value: '70' },
              { label: '85 — Only critical issues', value: '85' }
            ]}
          />
          <Select
            label="Rows per table page"
            value={settings.itemsPerPage}
            onChange={(e) => setSettings({ ...settings, itemsPerPage: e.target.value })}
            options={[
              { label: '10 rows', value: '10' },
              { label: '25 rows', value: '25' },
              { label: '50 rows', value: '50' }
            ]}
          />
        </div>

        <Toggle
          label="Auto-route verified problems"
          description="Send verified reports straight to Institute Matching without manual routing."
          checked={settings.autoRouteVerified}
          onChange={(v) => setSettings({ ...settings, autoRouteVerified: v })}
        />
        <Toggle
          label="Duplicate detection"
          description="Flag likely duplicate submissions during the verification review."
          checked={settings.duplicateDetection}
          onChange={(v) => setSettings({ ...settings, duplicateDetection: v })}
        />
        <Toggle
          label="Email notifications"
          description="Notify officers when milestones are submitted for government review."
          checked={settings.emailNotifications}
          onChange={(v) => setSettings({ ...settings, emailNotifications: v })}
        />
      </Card>

      <Card className="p-5 border-slate-200/80 space-y-4">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
          <Database className="w-4 h-4 text-blue-600" /> Data Source
        </h3>
        <div className="flex items-center justify-between gap-4 text-xs">
          <div className="space-y-0.5">
            <h4 className="text-sm font-bold text-slate-900">
              {isSupabaseConfigured() ? 'Supabase (live database)' : 'Demo mode (local browser storage)'}
            </h4>
            <p className="text-slate-500">
              {isSupabaseConfigured()
                ? 'Reports, projects and votes are persisted to your Supabase project.'
                : 'No Supabase credentials detected, so data is stored in this browser only.'}
            </p>
          </div>
          {!isSupabaseConfigured() && (
            <Button variant="outline" size="sm" leftIcon={<RotateCcw className="w-3.5 h-3.5" />} onClick={() => setResetOpen(true)} className="shrink-0">
              Reset Demo Data
            </Button>
          )}
        </div>
      </Card>

      <Modal
        isOpen={resetOpen}
        onClose={() => setResetOpen(false)}
        title="Reset demo data?"
        footer={
          <>
            <Button variant="ghost" onClick={() => setResetOpen(false)}>Cancel</Button>
            <Button variant="danger" onClick={resetDemoData}>Reset Data</Button>
          </>
        }
      >
        <p className="text-sm text-slate-600">
          This removes every locally created report, vote and accepted project, restoring the original
          seeded demo dataset. Supabase data is never affected.
        </p>
      </Modal>
    </div>
  );
};
