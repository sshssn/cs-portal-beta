import { useState } from 'react';
import { Settings, Upload, RotateCcw, Clock, Mail } from 'lucide-react';
import { AppTabs } from '@/components/ui/app-tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useJobs } from '@/context/JobContext';

type Tab = 'tenant' | 'notification' | 'system';
type ModalTab = 'general' | 'night-shift';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<Tab>('tenant');
  const [modalTab, setModalTab] = useState<ModalTab>('general');
  const [showTenantModal, setShowTenantModal] = useState(false);
  const { resetToDefaults } = useJobs();

  // Tenant settings state
  const [smsNotification, setSmsNotification] = useState(false);
  const [activeApproverFlow, setActiveApproverFlow] = useState(false);
  const [approverEmail, setApproverEmail] = useState('');

  // Night Shift Report State
  const [nightShiftStartTime, setNightShiftStartTime] = useState('07:00');
  const [nightShiftEndTime, setNightShiftEndTime] = useState('11:00');
  const [reportAllJobsOnWeekend, setReportAllJobsOnWeekend] = useState(true);
  const [autoSendDailyReport, setAutoSendDailyReport] = useState(true);
  const [sendReportEmailAt, setSendReportEmailAt] = useState('10:30');
  const [reportToEmail, setReportToEmail] = useState('john@invida.co.uk');
  const [ccEmails, setCcEmails] = useState('sarah@invida.co.uk');
  const [emailSubject, setEmailSubject] = useState('End Shift Report');
  const [emailBody, setEmailBody] = useState(`Dear,

Please find attached the End Shift Report with the following attachments:
- End Shift Report (PDF) - Comprehensive report with job details
- End Shift Report (CSV) - Data export for analysis
- NightShift Notes (PDF) - Active nightshift notes

Best regards`);

  const handleResetData = () => {
    if (window.confirm('This will reset all jobs to default demo data. Are you sure?')) {
      resetToDefaults();
      window.location.reload();
    }
  };

  const tabs: { key: Tab; label: string }[] = [
    { key: 'tenant', label: 'Tenant Setting' },
    { key: 'notification', label: 'Notification' },
    { key: 'system', label: 'System' },
  ];

  const modalTabs: { key: ModalTab; label: string }[] = [
    { key: 'general', label: 'General Settings' },
    { key: 'night-shift', label: 'Night shift Report' },
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
          <div className="mb-6">
            <h2 className="text-base font-semibold text-gray-900">Tenant Management</h2>
            <p className="text-sm text-gray-500">Manage and configure tenants</p>
          </div>
          
          {/* Tenant Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* WorkFlowX Tenant Card */}
            <div className="p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img 
                    src="/workflowx.png" 
                    alt="WorkFlowX" 
                    className="h-10 w-10 rounded-full object-cover"
                  />
                  <span className="font-medium text-gray-900">WorkFlowX</span>
                </div>
                <button 
                  onClick={() => setShowTenantModal(true)}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <Settings className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* WorkFlowX Settings Modal */}
      <Dialog open={showTenantModal} onOpenChange={setShowTenantModal}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold">WorkFlowX Settings</DialogTitle>
            <p className="text-sm text-gray-500">Configure settings for WorkFlowX</p>
          </DialogHeader>

          {/* Modal Tabs */}
          <div className="flex border-b border-gray-200 mb-4">
            {modalTabs.map(tab => (
              <button
                key={tab.key}
                onClick={() => setModalTab(tab.key)}
                className={`px-4 py-2 text-sm font-medium transition-colors ${
                  modalTab === tab.key
                    ? 'text-gray-900 border-b-2 border-gray-900'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* General Settings Tab */}
          {modalTab === 'general' && (
            <div className="space-y-6">
              {/* Tenant Logo */}
              <div>
                <Label className="text-sm font-medium">Tenant Logo</Label>
                <div className="mt-2 flex items-center gap-3">
                  <img 
                    src="/workflowx.png" 
                    alt="Current logo" 
                    className="h-12 w-12 rounded-lg object-cover border border-gray-200"
                  />
                  <span className="text-sm text-gray-500">Current logo</span>
                </div>
                <Button variant="outline" size="sm" className="mt-3 gap-2">
                  <Upload className="h-4 w-4" />
                  Change Logo
                </Button>
                <p className="text-xs text-gray-400 mt-1">PNG, JPG, JPEG, or GIF (max 5MB)</p>
              </div>

              {/* SMS Notification */}
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium">SMS Notification</Label>
                  <p className="text-xs text-gray-500">Enable SMS notifications for this tenant</p>
                </div>
                <Switch 
                  checked={smsNotification} 
                  onCheckedChange={setSmsNotification} 
                />
              </div>

              {/* Active Approver Flow */}
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium">Active Approver Flow</Label>
                  <p className="text-xs text-gray-500">Enable approval workflow for this tenant</p>
                </div>
                <Switch 
                  checked={activeApproverFlow} 
                  onCheckedChange={setActiveApproverFlow} 
                />
              </div>

              {/* Approver Email */}
              <div>
                <Label className="text-sm font-medium">Approver Email</Label>
                <Input
                  placeholder="Enter approver email"
                  value={approverEmail}
                  onChange={(e) => setApproverEmail(e.target.value)}
                  className="mt-1"
                />
                <p className="text-xs text-gray-400 mt-1">Email address of the person who will approve (or reject) requests</p>
              </div>
            </div>
          )}

          {/* Night Shift Report Tab */}
          {modalTab === 'night-shift' && (
            <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-2">
              {/* Night Shift Report Time Range */}
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Clock className="h-4 w-4 text-gray-500" />
                  <Label className="text-sm font-medium">Night Shift Report Time Range</Label>
                </div>
                <p className="text-xs text-gray-500 mb-3">Configure the time range for collecting night shift report data</p>
                
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 flex-1">
                    <Clock className="h-4 w-4 text-gray-400" />
                    <Input
                      type="time"
                      value={nightShiftStartTime}
                      onChange={(e) => setNightShiftStartTime(e.target.value)}
                      className="flex-1"
                    />
                  </div>
                  <span className="text-gray-400">-</span>
                  <div className="flex items-center gap-2 flex-1">
                    <Clock className="h-4 w-4 text-gray-400" />
                    <Input
                      type="time"
                      value={nightShiftEndTime}
                      onChange={(e) => setNightShiftEndTime(e.target.value)}
                      className="flex-1"
                    />
                  </div>
                </div>
                <p className="text-xs text-gray-400 mt-1">From 07:00 the previous day - 11:00 current day (UTC timezone)</p>
              </div>

              {/* Report All Jobs on Weekend */}
              <div className="flex items-center justify-between py-2 border-t border-gray-100">
                <div>
                  <Label className="text-sm font-medium">Report All Jobs on Weekend</Label>
                  <p className="text-xs text-gray-500">Include weekend jobs in the report data range</p>
                </div>
                <Switch 
                  checked={reportAllJobsOnWeekend} 
                  onCheckedChange={setReportAllJobsOnWeekend} 
                />
              </div>

              {/* Auto Send Daily Report Email */}
              <div className="border-t border-gray-100 pt-4">
                <div className="flex items-center gap-2 mb-1">
                  <Mail className="h-4 w-4 text-gray-500" />
                  <Label className="text-sm font-medium">Auto Sent Daily Report Email</Label>
                </div>
                <p className="text-xs text-gray-500 mb-3">Configure automatic daily report sending</p>
                
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-gray-600">Enable auto send</span>
                  <Switch 
                    checked={autoSendDailyReport} 
                    onCheckedChange={setAutoSendDailyReport} 
                  />
                </div>

                <div className="flex items-center gap-3">
                  <Label className="text-sm text-gray-600 whitespace-nowrap">Send Report Email at</Label>
                  <Select value={sendReportEmailAt} onValueChange={setSendReportEmailAt}>
                    <SelectTrigger className="flex-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {['08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '12:00'].map(time => (
                        <SelectItem key={time} value={time}>{time}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <p className="text-xs text-gray-400 mt-1">The report will be sent at this hour every day in UTC timezone</p>
              </div>

              {/* Email Setting */}
              <div className="border-t border-gray-100 pt-4">
                <div className="flex items-center gap-2 mb-1">
                  <Settings className="h-4 w-4 text-gray-500" />
                  <Label className="text-sm font-medium">Email Setting</Label>
                </div>
                <p className="text-xs text-gray-500 mb-4">Used to configure basic email parameters for sending messages</p>

                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium">Report To Email</Label>
                    <Input
                      value={reportToEmail}
                      onChange={(e) => setReportToEmail(e.target.value)}
                      placeholder="Enter email address"
                      className="mt-1"
                    />
                    <p className="text-xs text-gray-400 mt-1">Primary recipient email for automated shift reports</p>
                  </div>

                  <div>
                    <Label className="text-sm font-medium">CC Emails (Optional)</Label>
                    <Input
                      value={ccEmails}
                      onChange={(e) => setCcEmails(e.target.value)}
                      placeholder="Enter CC email addresses"
                      className="mt-1"
                    />
                    <p className="text-xs text-gray-400 mt-1">Comma-separated list of CC recipients</p>
                  </div>

                  <div>
                    <Label className="text-sm font-medium">Email Subject</Label>
                    <Input
                      value={emailSubject}
                      onChange={(e) => setEmailSubject(e.target.value)}
                      placeholder="Enter email subject"
                      className="mt-1"
                    />
                    <p className="text-xs text-gray-400 mt-1">Default subject line for report emails</p>
                  </div>

                  <div>
                    <Label className="text-sm font-medium">Email Body</Label>
                    <Textarea
                      value={emailBody}
                      onChange={(e) => setEmailBody(e.target.value)}
                      placeholder="Enter email body"
                      className="mt-1 min-h-[150px] font-mono text-sm"
                      rows={8}
                    />
                    <p className="text-xs text-gray-400 mt-1">Default email body text (HTML supported)</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setShowTenantModal(false)}>
              Close
            </Button>
            <Button onClick={() => setShowTenantModal(false)}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
