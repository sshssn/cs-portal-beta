import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ArrowLeft, Save, Clock, AlertTriangle, User, Check, ChevronsUpDown, Phone, Mail, Building2, Zap, FileText } from 'lucide-react';
import { JobFormData, Reporter, JobContact, Engineer } from '@/types/job';
import { mockEngineers, mockJobTrades, getEngineerStatusColor } from '@/lib/jobUtils';
import { cn } from '@/lib/utils';

interface JobLogFormProps {
  customerData: {
    customer: string;
    site: string;
    reporter: Reporter;
  };
  onSave: (jobData: JobFormData) => void;
  onBack: () => void;
}

export default function JobLogForm({ customerData, onSave, onBack }: JobLogFormProps) {
  const [jobData, setJobData] = useState<Partial<JobFormData>>({
    description: '',
    jobType: 'Call Out',
    category: 'Electrical',
    priority: 'High',
    targetCompletionTime: 240,
    engineer: '',
    primaryJobTrade: '',
    secondaryJobTrades: [],
    customAlerts: {
      acceptSLA: 30,
      onsiteSLA: 120,
      completedSLA: 240
    },
    contact: {
      name: customerData.reporter.name,
      number: customerData.reporter.number,
      email: customerData.reporter.email,
      relationship: customerData.reporter.relationship
    }
  });

  const [engineerOpen, setEngineerOpen] = useState(false);
  const [primaryTradeOpen, setPrimaryTradeOpen] = useState(false);

  const isFormValid = jobData.description?.trim() !== '' && jobData.contact?.name && jobData.contact?.number;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isFormValid) {
      const completeJobData: JobFormData = {
        ...customerData,
        ...jobData as JobFormData
      };
      onSave(completeJobData);
    }
  };

  const handleInputChange = (field: string, value: string | number | boolean | Date | null | string[]) => {
    setJobData(prev => ({ ...prev, [field]: value }));
  };

  const handleContactChange = (field: keyof JobContact, value: string) => {
    setJobData(prev => ({
      ...prev,
      contact: {
        ...prev.contact!,
        [field]: value
      }
    }));
  };

  const handleCustomAlertChange = (field: string, value: number) => {
    setJobData(prev => ({
      ...prev,
      customAlerts: {
        ...prev.customAlerts!,
        [field]: value
      }
    }));
  };

  const selectedEngineer = mockEngineers.find(eng => eng.name === jobData.engineer);

  const priorityColors = {
    'Low': 'bg-slate-100 text-slate-700 border-slate-300',
    'Medium': 'bg-blue-100 text-blue-700 border-blue-300',
    'High': 'bg-amber-100 text-amber-700 border-amber-300',
    'Critical': 'bg-red-100 text-red-700 border-red-300'
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <Button variant="ghost" size="icon" onClick={onBack} className="h-8 w-8">
            <ArrowLeft size={18} />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Create New Job</h1>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Building2 size={14} />
              <span>{customerData.customer}</span>
              <span>•</span>
              <span>{customerData.site}</span>
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Main Info Card */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-4 border-b bg-gray-50/50">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <FileText size={18} className="text-blue-600" />
              Job Information
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-5">
            {/* Description - Most Important */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">
                Description <span className="text-red-500">*</span>
              </Label>
              <Textarea
                placeholder="Describe the issue in detail..."
                value={jobData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={3}
                className="resize-none text-base"
                required
              />
            </div>

            {/* Priority & Type Row */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium flex items-center gap-1">
                  <AlertTriangle size={14} className="text-amber-500" />
                  Priority
                </Label>
                <Select value={jobData.priority} onValueChange={(v) => handleInputChange('priority', v)}>
                  <SelectTrigger className={cn("h-11", priorityColors[jobData.priority as keyof typeof priorityColors])}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Low">Low</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="High">High</SelectItem>
                    <SelectItem value="Critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">Job Type</Label>
                <Select value={jobData.jobType} onValueChange={(v) => handleInputChange('jobType', v)}>
                  <SelectTrigger className="h-11">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Emergency">Emergency</SelectItem>
                    <SelectItem value="Call Out">Call Out</SelectItem>
                    <SelectItem value="Repair">Repair</SelectItem>
                    <SelectItem value="Maintenance">Maintenance</SelectItem>
                    <SelectItem value="Inspection">Inspection</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Category & Trade Row */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Category</Label>
                <Select value={jobData.category} onValueChange={(v) => handleInputChange('category', v)}>
                  <SelectTrigger className="h-11">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Electrical">Electrical</SelectItem>
                    <SelectItem value="Plumbing">Plumbing</SelectItem>
                    <SelectItem value="HVAC">HVAC</SelectItem>
                    <SelectItem value="Mechanical">Mechanical</SelectItem>
                    <SelectItem value="Fire Safety">Fire Safety</SelectItem>
                    <SelectItem value="General">General</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">Trade</Label>
                <Popover open={primaryTradeOpen} onOpenChange={setPrimaryTradeOpen}>
                  <PopoverTrigger asChild>
                    <Button variant="outline" role="combobox" className="w-full justify-between h-11 font-normal">
                      {jobData.primaryJobTrade || "Select trade..."}
                      <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0">
                    <Command>
                      <CommandInput placeholder="Search..." />
                      <CommandEmpty>No trade found.</CommandEmpty>
                      <CommandGroup>
                        {mockJobTrades.map((trade) => (
                          <CommandItem key={trade} onSelect={() => { handleInputChange('primaryJobTrade', trade); setPrimaryTradeOpen(false); }}>
                            <Check className={cn("mr-2 h-4 w-4", jobData.primaryJobTrade === trade ? "opacity-100" : "opacity-0")} />
                            {trade}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Service Provider & SLA Card */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-4 border-b bg-gray-50/50">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Zap size={18} className="text-amber-500" />
              Assignment & SLA
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-5">
            {/* Service Provider */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Service Provider</Label>
              <Popover open={engineerOpen} onOpenChange={setEngineerOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline" role="combobox" className="w-full justify-between h-11 font-normal">
                    {selectedEngineer ? (
                      <div className="flex items-center gap-2">
                        <div className={cn("w-2 h-2 rounded-full", getEngineerStatusColor(selectedEngineer.status))} />
                        <span>{selectedEngineer.name}</span>
                        <Badge variant="outline" className="text-xs ml-2">{selectedEngineer.status.replace('_', ' ')}</Badge>
                      </div>
                    ) : (
                      "Select service provider..."
                    )}
                    <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0">
                  <Command>
                    <CommandInput placeholder="Search..." />
                    <CommandEmpty>No service provider found.</CommandEmpty>
                    <CommandGroup>
                      {mockEngineers.map((engineer) => (
                        <CommandItem key={engineer.name} onSelect={() => { handleInputChange('engineer', engineer.name); setEngineerOpen(false); }}>
                          <Check className={cn("mr-2 h-4 w-4", jobData.engineer === engineer.name ? "opacity-100" : "opacity-0")} />
                          <div className="flex items-center gap-2 flex-1">
                            <div className={cn("w-2 h-2 rounded-full", getEngineerStatusColor(engineer.status))} />
                            <span>{engineer.name}</span>
                            <Badge variant="outline" className="text-xs ml-auto">{engineer.status.replace('_', ' ')}</Badge>
                          </div>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            {/* SLA Times - Compact */}
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label className="text-xs font-medium text-gray-500">Accept SLA</Label>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    min="5"
                    max="120"
                    value={jobData.customAlerts?.acceptSLA || 30}
                    onChange={(e) => handleCustomAlertChange('acceptSLA', parseInt(e.target.value) || 30)}
                    className="h-10 text-center"
                  />
                  <span className="text-xs text-gray-500">min</span>
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-medium text-gray-500">On-Site SLA</Label>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    min="15"
                    max="480"
                    value={jobData.customAlerts?.onsiteSLA || 120}
                    onChange={(e) => handleCustomAlertChange('onsiteSLA', parseInt(e.target.value) || 120)}
                    className="h-10 text-center"
                  />
                  <span className="text-xs text-gray-500">min</span>
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-medium text-gray-500">Complete SLA</Label>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    min="30"
                    max="1440"
                    value={jobData.customAlerts?.completedSLA || 240}
                    onChange={(e) => handleCustomAlertChange('completedSLA', parseInt(e.target.value) || 240)}
                    className="h-10 text-center"
                  />
                  <span className="text-xs text-gray-500">min</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact Card */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-4 border-b bg-gray-50/50">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <User size={18} className="text-green-600" />
              Site Contact
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  placeholder="Contact name"
                  value={jobData.contact?.name || ''}
                  onChange={(e) => handleContactChange('name', e.target.value)}
                  className="h-11"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium flex items-center gap-1">
                  <Phone size={12} />
                  Phone <span className="text-red-500">*</span>
                </Label>
                <Input
                  type="tel"
                  placeholder="Phone number"
                  value={jobData.contact?.number || ''}
                  onChange={(e) => handleContactChange('number', e.target.value)}
                  className="h-11"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium flex items-center gap-1">
                  <Mail size={12} />
                  Email
                </Label>
                <Input
                  type="email"
                  placeholder="Email address"
                  value={jobData.contact?.email || ''}
                  onChange={(e) => handleContactChange('email', e.target.value)}
                  className="h-11"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">Role</Label>
                <Input
                  placeholder="e.g. Site Manager"
                  value={jobData.contact?.relationship || ''}
                  onChange={(e) => handleContactChange('relationship', e.target.value)}
                  className="h-11"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-2">
          <Button type="button" variant="outline" onClick={onBack} className="flex-1 h-12">
            Cancel
          </Button>
          <Button
            type="submit"
            className="flex-1 h-12 bg-green-600 hover:bg-green-700 text-white font-semibold"
            disabled={!isFormValid}
          >
            <Save size={18} className="mr-2" />
            Create Job
          </Button>
        </div>
      </form>
    </div>
  );
}