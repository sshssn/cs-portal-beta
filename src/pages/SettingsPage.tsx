import { useState } from 'react';
import { Settings, Upload, X, Search, Clock, RotateCcw } from 'lucide-react';
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
import { useJobs } from '@/context/JobContext';

type Tab = 'notification' | 'system';
type ModalTab = 'general' | 'night-shift';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<Tab>('notification');
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

            <div className="p-4 border border-gray-200 rounded-lg">
              <h3 className="text-sm font-medium text-gray-900 mb-2">Tenants</h3>
              <p className="text-sm text-gray-500 mb-3">Connected tenant environments.</p>
              <div className="flex items-center gap-2">
                <div className="px-3 py-1.5 bg-blue-50 border border-blue-200 rounded-md text-sm font-medium text-blue-700">
                  workflowX
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
