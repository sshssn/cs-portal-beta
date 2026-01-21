import { useState } from 'react';
import { Settings, Upload, X, Search, Clock } from 'lucide-react';
import { AppTabs } from '@/components/ui/app-tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

type Tab = 'tenant' | 'notification' | 'system';
type ModalTab = 'general' | 'night-shift';

interface Tenant {
  id: string;
  name: string;
  logo: string;
  logoPath: string;
  description: string;
}

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<Tab>('tenant');
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);
  const [modalTab, setModalTab] = useState<ModalTab>('general');

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

  // Tenant data
  const tenants: Tenant[] = [
    {
      id: '1',
      name: 'FM4U Ltd',
      logo: 'FM4U',
      logoPath: '/fm4u.png',
      description: 'Configure settings for FM4U Ltd'
    },
    {
      id: '2',
      name: 'Guardian Environmental Services Limited',
      logo: 'GUARD',
      logoPath: '/guardian.jpg',
      description: 'Configure settings for Guardian Environmental Services Limited'
    },
    {
      id: '3',
      name: 'WorkFlowX',
      logo: 'WFX',
      logoPath: '/workflowx.png',
      description: 'Configure settings for WorkFlowX'
    },
  ];

  const tabs: { key: Tab; label: string }[] = [
    { key: 'tenant', label: 'Tenant Setting' },
    { key: 'notification', label: 'Notification' },
    { key: 'system', label: 'System' },
  ];

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex items-center gap-2 mb-2">
        <Settings className="h-5 w-5 text-gray-600" />
        <h1 className="text-lg font-semibold text-gray-900">JobLogic Helpdesk</h1>
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
            <h2 className="text-base font-semibold text-gray-900">Tenant Management</h2>
            <p className="text-sm text-gray-500">Manage and configure tenants.</p>
          </div>

          <div className="grid grid-cols-3 gap-4">
            {tenants.map((tenant) => (
              <div
                key={tenant.id}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg bg-white hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center overflow-hidden border border-gray-200">
                    <img src={tenant.logoPath} alt={tenant.name} className="w-full h-full object-cover" />
                  </div>
                  <span className="font-medium text-gray-900 text-sm truncate max-w-[150px]" title={tenant.name}>{tenant.name}</span>
                </div>
                <button
                  onClick={() => setSelectedTenant(tenant)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <Settings className="h-4 w-4" />
                </button>
              </div>
            ))}
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
          <p className="text-sm text-gray-500 italic">System settings will be configured here.</p>
        </div>
      )}

      {/* Tenant Settings Modal */}
      <Dialog open={!!selectedTenant} onOpenChange={(open) => !open && setSelectedTenant(null)}>
        <DialogContent className="sm:max-w-[600px] p-0 gap-0 overflow-hidden bg-white">
          <DialogHeader className="px-6 py-4 border-b border-gray-100">
            <div className="flex items-start justify-between">
              <div>
                <DialogTitle className="text-lg font-semibold text-gray-900">
                  {selectedTenant?.name} Settings
                </DialogTitle>
                <p className="text-sm text-gray-500 mt-1">
                  {selectedTenant?.description}
                </p>
              </div>
            </div>
          </DialogHeader>

          <div className="px-6 py-4">
            {/* Modal Tabs */}
            <div className="mb-6">
              <AppTabs
                tabs={[
                  { label: 'General Settings', value: 'general' },
                  { label: 'Night shift Report', value: 'night-shift' }
                ]}
                activeTab={modalTab}
                onChange={(val) => setModalTab(val as ModalTab)}
                className="w-full"
              />
            </div>

            {modalTab === 'general' && (
              <div className="space-y-6">
                {/* Logo Section */}
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-3">Tenant Logo</label>
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full border border-gray-200 flex items-center justify-center overflow-hidden bg-white p-1">
                      {selectedTenant && (
                        <img
                          src={selectedTenant.logoPath}
                          alt="Current logo"
                          className="w-full h-full object-contain"
                        />
                      )}
                    </div>
                    <div>
                      <span className="text-sm text-gray-500 block mb-2">Current logo</span>
                    </div>
                  </div>
                  <div className="mt-3">
                    <Button variant="outline" className="h-9 gap-2 text-gray-700 border-gray-300">
                      <Upload className="h-4 w-4" />
                      Change Logo
                    </Button>
                    <p className="text-xs text-gray-400 mt-2">PNG, JPG, JPEG, or GIF (max 5MB)</p>
                  </div>
                </div>

                {/* SMS Notification */}
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base font-medium text-gray-900">SMS Notification</Label>
                    <p className="text-sm text-gray-500">Enable SMS notifications for this tenant</p>
                  </div>
                  <Switch />
                </div>

                {/* Active Approver Flow */}
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base font-medium text-gray-900">Active Approver Flow</Label>
                    <p className="text-sm text-gray-500">Enable approval workflow for this tenant</p>
                  </div>
                  <Switch />
                </div>

                {/* Approver Email */}
                <div>
                  <Label className="text-sm font-medium text-gray-900 mb-2 block">Approver Email</Label>
                  <Input
                    placeholder="Enter approver email"
                    className="bg-white border-gray-200 focus-visible:ring-1 focus-visible:ring-gray-900"
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    Email address of the person who will approve (or reject) requests
                  </p>
                </div>
              </div>
            )}

            {modalTab === 'night-shift' && (
              <div className="space-y-6">
                {/* Add Note Section */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium text-gray-900">Add Night Shift Note</Label>
                    <span className="text-xs text-gray-500">{newNote.length}/500</span>
                  </div>
                  <textarea
                    className="w-full min-h-[120px] p-3 rounded-md border border-gray-200 text-sm focus:outline-none focus:border-gray-400 resize-y"
                    placeholder="Enter details about the night shift..."
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                  />
                  <div className="flex justify-end">
                    <Button
                      size="sm"
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                      onClick={handleAddNote}
                      disabled={!newNote.trim()}
                    >
                      Add Note
                    </Button>
                  </div>
                </div>

                <div className="border-t border-gray-100 my-4"></div>

                {/* Filter & List */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium text-gray-900">Previous Notes</h3>
                    <div className="relative w-48">
                      <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400" />
                      <Input
                        placeholder="Filter notes..."
                        className="h-8 pl-8 text-xs bg-gray-50 border-gray-200"
                        value={noteFilter}
                        onChange={(e) => setNoteFilter(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1 custom-scrollbar">
                    {nightShiftNotes
                      .filter(n => n.text.toLowerCase().includes(noteFilter.toLowerCase()) || n.author.toLowerCase().includes(noteFilter.toLowerCase()))
                      .map((note) => (
                        <div key={note.id} className="bg-gray-50 p-3 rounded-md border border-gray-100">
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="text-xs font-semibold text-gray-700">{note.author}</span>
                            <span className="text-[10px] text-gray-400 flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {note.date}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 leading-relaxed">{note.text}</p>
                        </div>
                      ))}
                    {nightShiftNotes.length === 0 && (
                      <p className="text-center text-gray-400 text-sm py-4">No notes found.</p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3 bg-gray-50/50">
            <Button
              variant="outline"
              onClick={() => setSelectedTenant(null)}
              className="bg-white border-gray-300 hover:bg-gray-50 text-gray-700"
            >
              Close
            </Button>
            <Button className="bg-gray-900 hover:bg-gray-800 text-white">
              Save Changes
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
