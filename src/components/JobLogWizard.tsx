import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Customer, Job } from '@/types/job';
import { mockCustomers } from '@/lib/jobUtils';
import { RefreshCw, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';

interface JobLogWizardProps {
  customers: Customer[];
  onJobCreate: (job: Omit<Job, 'id'>) => void;
  onCancel: () => void;
}

export default function JobLogWizard({ customers, onJobCreate, onCancel }: JobLogWizardProps) {
  // Form state
  const [phone, setPhone] = useState('');
  const [callerName, setCallerName] = useState('');
  const [callerRole, setCallerRole] = useState('Not specified');
  const [tenant, setTenant] = useState('');
  const [customer, setCustomer] = useState('');
  const [site, setSite] = useState('');
  const [problem, setProblem] = useState('');
  const [jobType, setJobType] = useState('');
  const [jobTrade, setJobTrade] = useState('');
  const [priorityType, setPriorityType] = useState<'emergency' | 'standard'>('emergency');
  const [priorityLevel, setPriorityLevel] = useState('');
  const [orderNumber, setOrderNumber] = useState('');
  const [activeTab, setActiveTab] = useState<'notes' | 'jobs'>('notes');

  // Get unique tenants (using customer names as tenants)
  const tenants = useMemo(() => {
    const allCustomers = customers.length > 0 ? customers : mockCustomers;
    return [...new Set(allCustomers.map(c => c.name))];
  }, [customers]);

  // Get sites based on selected customer
  const sites = useMemo(() => {
    const allCustomers = customers.length > 0 ? customers : mockCustomers;
    const selectedCustomer = allCustomers.find(c => c.name === customer);
    return selectedCustomer?.sites || [];
  }, [customer, customers]);

  // Job types
  const jobTypes = ['Reactive', 'Planned', 'Quote', 'Emergency', 'Inspection'];
  const jobTrades = ['Plumbing', 'Electrical', 'HVAC', 'General Maintenance', 'Carpentry', 'Roofing'];

  // Handle form submission
  const handleSubmit = () => {
    const newJob: Omit<Job, 'id'> = {
      jobNumber: `JOB-${Date.now()}`,
      customer: customer,
      site: site,
      description: problem,
      priority: priorityType === 'emergency' ? 'Critical' : 'Medium',
      status: 'new',
      engineer: 'Unassigned',
      dateLogged: new Date(),
      reporter: {
        name: callerName,
        number: phone,
        email: '',
        relationship: callerRole
      },
      contact: {
        name: callerName,
        number: phone,
        email: '',
        relationship: 'Caller'
      },
      jobType: (jobType as any) || 'Reactive',
      category: (jobTrade as any) || 'General',
      tenant: tenant || customer, // Fallback to customer if tenant not selected
      targetCompletionTime: 240, // Default 4 hours
      customAlerts: {
        acceptSLA: 15,
        onsiteSLA: 60,
        completedSLA: 240
      },
      dateAccepted: null,
      dateOnSite: null,
      dateCompleted: null,
      reason: null,
      alerts: []
    };
    onJobCreate(newJob);
  };

  return (
    <div className="space-y-6">
      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column - Caller Details & Problem */}
        <div className="space-y-6">
          {/* Caller Details Section */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Caller Details</h2>
            <div className="space-y-4">
              {/* Phone */}
              <div className="grid grid-cols-[100px_1fr_auto] items-center gap-3">
                <Label className="text-sm text-gray-600">
                  Phone: <span className="text-red-500">*</span>
                </Label>
                <Input
                  placeholder="Enter phone number..."
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="flex-1"
                />
                <Button variant="default" size="sm" className="bg-gray-800 hover:bg-gray-900">
                  Auto Identify
                </Button>
              </div>

              {/* Caller Name */}
              <div className="grid grid-cols-[100px_1fr] items-center gap-3">
                <Label className="text-sm text-gray-600">
                  Caller Name: <span className="text-red-500">*</span>
                </Label>
                <Input
                  placeholder="Enter name..."
                  value={callerName}
                  onChange={(e) => setCallerName(e.target.value)}
                />
              </div>

              {/* Caller Role */}
              <div className="grid grid-cols-[100px_1fr] items-center gap-3">
                <Label className="text-sm text-gray-600">Caller Role:</Label>
                <Input
                  value={callerRole}
                  onChange={(e) => setCallerRole(e.target.value)}
                  className="text-gray-500"
                />
              </div>
            </div>
          </div>

          {/* Problem Description */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label className="text-sm font-medium flex items-center gap-2">
                <FileText className="h-4 w-4" />
                What's the problem? <span className="text-red-500">*</span>
              </Label>
              <span className="text-xs text-gray-400">{problem.length}/1000</span>
            </div>
            <Textarea
              placeholder="Describe the issue in detail..."
              value={problem}
              onChange={(e) => setProblem(e.target.value)}
              className="min-h-[120px] resize-none"
              maxLength={1000}
            />
          </div>

          {/* Job Type & Trade */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-sm text-gray-600 mb-2 block">
                Job Type <span className="text-red-500">*</span>
              </Label>
              <Select value={jobType} onValueChange={setJobType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select job type..." />
                </SelectTrigger>
                <SelectContent>
                  {jobTypes.map(type => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-sm text-gray-600 mb-2 block">Job Trade</Label>
              <Select value={jobTrade} onValueChange={setJobTrade}>
                <SelectTrigger>
                  <SelectValue placeholder="Select trade..." />
                </SelectTrigger>
                <SelectContent>
                  {jobTrades.map(trade => (
                    <SelectItem key={trade} value={trade}>{trade}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Priority */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-sm text-gray-600 mb-2 block">
                Priority <span className="text-red-500">*</span>
              </Label>
              <RadioGroup
                value={priorityType}
                onValueChange={(val) => setPriorityType(val as 'emergency' | 'standard')}
                className="flex items-center gap-3"
              >
                <div className="flex items-center">
                  <RadioGroupItem value="emergency" id="emergency" className="sr-only" />
                  <Label
                    htmlFor="emergency"
                    className={cn(
                      "px-6 py-2.5 border rounded-lg cursor-pointer transition-all text-sm font-medium",
                      priorityType === 'emergency'
                        ? "border-blue-600 text-blue-600 bg-blue-50/50"
                        : "border-gray-200 text-gray-600 hover:bg-gray-50"
                    )}
                  >
                    Emergency
                  </Label>
                </div>
                <div className="flex items-center">
                  <RadioGroupItem value="standard" id="standard" className="sr-only" />
                  <Label
                    htmlFor="standard"
                    className={cn(
                      "px-6 py-2.5 border rounded-lg cursor-pointer transition-all text-sm font-medium",
                      priorityType === 'standard'
                        ? "border-blue-600 text-blue-600 bg-blue-50/50"
                        : "border-gray-200 text-gray-900 hover:bg-gray-50"
                    )}
                  >
                    Standard
                  </Label>
                </div>
              </RadioGroup>
              <div className="mt-2">
                <Select value={priorityLevel} onValueChange={setPriorityLevel}>
                  <SelectTrigger>
                    <SelectValue placeholder="Default Priority (No SLA)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="no-sla">Default Priority (No SLA)</SelectItem>
                    <SelectItem value="4-hour">4 Hour Response</SelectItem>
                    <SelectItem value="24-hour">24 Hour Response</SelectItem>
                    <SelectItem value="48-hour">48 Hour Response</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label className="text-sm text-gray-600 mb-2 block">Order Number</Label>
              <Input
                placeholder="Enter customer PO/Order number (optional)"
                value={orderNumber}
                onChange={(e) => setOrderNumber(e.target.value)}
              />
            </div>
          </div>

          {/* Submit Button */}
          <Button
            onClick={handleSubmit}
            className="w-full h-12 bg-gray-800 hover:bg-gray-900 text-white font-medium"
          >
            Confirm & Create Job
          </Button>
        </div>

        {/* Right Column - Customer & Site */}
        <div className="space-y-6">
          {/* Customer & Site Section */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Customer & Site</h2>
            <div className="space-y-4">
              {/* Tenant */}
              <div className="grid grid-cols-[80px_1fr] items-center gap-3">
                <Label className="text-sm text-blue-600">Tenant:</Label>
                <Select value={tenant} onValueChange={setTenant}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Tenant" />
                  </SelectTrigger>
                  <SelectContent>
                    {tenants.map(t => (
                      <SelectItem key={t} value={t}>{t}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Customer */}
              <div className="grid grid-cols-[80px_1fr] items-center gap-3">
                <Label className="text-sm text-blue-600">Customer:</Label>
                <Select value={customer} onValueChange={setCustomer}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select customer" />
                  </SelectTrigger>
                  <SelectContent>
                    {(customers.length > 0 ? customers : mockCustomers).map(c => (
                      <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Site */}
              <div className="grid grid-cols-[80px_1fr_auto_auto] items-center gap-3">
                <Label className="text-sm text-blue-600">Site:</Label>
                <Select value={site} onValueChange={setSite}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Tenant First" />
                  </SelectTrigger>
                  <SelectContent>
                    {sites.map(s => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button variant="ghost" size="icon" className="h-10 w-10">
                  <RefreshCw className="h-4 w-4 text-gray-400" />
                </Button>
                <Button variant="outline" size="sm" className="text-blue-600">
                  Sync
                </Button>
              </div>
            </div>
          </div>

          {/* Site Notes Section */}
          <Card className="border border-gray-200">
            <CardHeader className="pb-0">
              {/* Tab Switcher */}
              <div className="flex border border-gray-200 rounded-full p-1 bg-gray-50">
                <button
                  onClick={() => setActiveTab('notes')}
                  className={`flex-1 px-4 py-2 text-sm font-medium rounded-full transition-colors ${activeTab === 'notes'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                    }`}
                >
                  Site Notes
                </button>
                <button
                  onClick={() => setActiveTab('jobs')}
                  className={`flex-1 px-4 py-2 text-sm font-medium rounded-full transition-colors ${activeTab === 'jobs'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                    }`}
                >
                  Recent Site Jobs
                </button>
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              {activeTab === 'notes' ? (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Site Notes</h3>
                  <p className="text-sm text-gray-400 italic">
                    Please select a site to view notes
                  </p>
                </div>
              ) : (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Recent Site Jobs</h3>
                  <p className="text-sm text-gray-400 italic">
                    Please select a site to view recent jobs
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
