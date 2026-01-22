import { useState } from 'react';
import { Settings, Upload, X, Search, Clock, RotateCcw, Building2, Check } from 'lucide-react';
import { AppTabs } from '@/components/ui/app-tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { SearchInput } from '@/components/ui/search-input';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { useJobs } from '@/context/JobContext';

type Tab = 'tenant' | 'notification' | 'system';
type ModalTab = 'general' | 'night-shift';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<Tab>('tenant');
  const [modalTab, setModalTab] = useState<ModalTab>('general');
  const { resetToDefaults } = useJobs();

  const handleResetData = () => {
    if (window.confirm('This will reset all jobs to default demo data. Are you sure?')) {
      resetToDefaults();
      window.location.reload();
    }
  };

  // Night Shift Report State
  const [nightShiftNotes, setNightShiftNotes] = useState<{ id: string, text: string, date: string, author: string }[]>([
    { id: '1', text: 'Checked all secure access points. No issues found.', date: '2026-01-20 23:00', author: 'John Doe' },
    { id: '2', text: 'Power fluctuation reported in Block B. Investigated and resolved.', date: '2026-01-19 04:15', author: 'Jane Smith' }
  ]);
  const [newNote, setNewNote] = useState('');
  const [noteFilter, setNoteFilter] = useState('');

  const handleAddNote = () => {
    if (!newNote.trim()) return;
    const note = {
      id: Date.now().toString(),
      text: newNote,
      date: new Date().toISOString().replace('T', ' ').substring(0, 16),
      author: 'CurrentUser' // Mock current user
    };
    setNightShiftNotes([note, ...nightShiftNotes]);
    setNewNote('');
  };

  const tabs: { key: Tab; label: string }[] = [
    { key: 'tenant', label: 'Tenant' },
    { key: 'notification', label: 'Notification' },
    { key: 'system', label: 'System' },
  ];

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex items-center gap-2 mb-2">
        <Settings className="h-5 w-5 text-gray-600" />
        <h1 className="text-lg font-semibold text-gray-900">OOH Helpdesk</h1>
      </div>

      {/* Tabs - Global Style */}
      <div className="mb-6">
        <AppTabs
          tabs={tabs.map(t => ({ label: t.label, value: t.key }))}
          activeTab={activeTab}
          onChange={(val) => setActiveTab(val as Tab)}
        />
      </div>

      {/* Tab Content */}
      {activeTab === 'tenant' && (
        <div className="border border-gray-200 rounded-lg bg-white p-6">
          <div className="mb-4">
            <h2 className="text-base font-semibold text-gray-900">Tenant Settings</h2>
            <p className="text-sm text-gray-500">Manage connected tenant environments</p>
          </div>
          
          <div className="space-y-4">
            {/* Active Tenant */}
            <div className="p-4 border border-gray-200 rounded-lg">
              <h3 className="text-sm font-medium text-gray-900 mb-3">Active Tenant</h3>
              <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Building2 className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <div className="font-medium text-blue-900">workflowX</div>
                    <div className="text-xs text-blue-600">Connected • Last sync: Today at 09:45</div>
                  </div>
                </div>
                <Badge className="bg-green-100 text-green-700 border-green-200">
                  <Check className="h-3 w-3 mr-1" />
                  Active
                </Badge>
              </div>
            </div>

            {/* Tenant Configuration */}
            <div className="p-4 border border-gray-200 rounded-lg">
              <h3 className="text-sm font-medium text-gray-900 mb-3">Tenant Configuration</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between py-2 border-b border-gray-100">
                  <div>
                    <div className="text-sm font-medium text-gray-700">Auto-sync data</div>
                    <div className="text-xs text-gray-500">Automatically sync tickets and jobs with tenant</div>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between py-2 border-b border-gray-100">
                  <div>
                    <div className="text-sm font-medium text-gray-700">Receive tenant notifications</div>
                    <div className="text-xs text-gray-500">Get alerts for tenant-level events</div>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between py-2">
                  <div>
                    <div className="text-sm font-medium text-gray-700">Share analytics</div>
                    <div className="text-xs text-gray-500">Share usage analytics with tenant admin</div>
                  </div>
                  <Switch />
                </div>
              </div>
            </div>

            {/* Tenant Info */}
            <div className="p-4 border border-gray-200 rounded-lg">
              <h3 className="text-sm font-medium text-gray-900 mb-3">Tenant Information</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-gray-500">Tenant ID</div>
                  <div className="font-mono text-gray-900">wfx-001-prod</div>
                </div>
                <div>
                  <div className="text-gray-500">Region</div>
                  <div className="text-gray-900">UK West</div>
                </div>
                <div>
                  <div className="text-gray-500">Environment</div>
                  <div className="text-gray-900">Production</div>
                </div>
                <div>
                  <div className="text-gray-500">API Version</div>
                  <div className="text-gray-900">v2.4.1</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'notification' && (
        <div className="border border-gray-200 rounded-lg bg-white p-6">
          <div className="mb-4">
            <h2 className="text-base font-semibold text-gray-900">Notification Settings</h2>
            <p className="text-sm text-gray-500">Configure notification preferences</p>
          </div>
          <p className="text-sm text-gray-500 italic">Notification settings will be configured here.</p>
        </div>
      )}

      {activeTab === 'system' && (
        <div className="border border-gray-200 rounded-lg bg-white p-6">
          <div className="mb-4">
            <h2 className="text-base font-semibold text-gray-900">System Settings</h2>
            <p className="text-sm text-gray-500">Configure system-wide settings</p>
          </div>
          
          <div className="space-y-4">
            <div className="p-4 border border-gray-200 rounded-lg">
              <h3 className="text-sm font-medium text-gray-900 mb-2">Reset Demo Data</h3>
              <p className="text-sm text-gray-500 mb-3">Reset all jobs to default demo data with correct service providers.</p>
              <Button variant="outline" onClick={handleResetData} className="text-red-600 border-red-200 hover:bg-red-50">
                <RotateCcw className="w-4 h-4 mr-2" />
                Reset to Defaults
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
