import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, MapPin, ChevronDown, ChevronRight, Users, AlertCircle } from 'lucide-react';
import { CreateJobFromTicketData } from '@/types/ticket';
import { mockWorkflows, mockPreDefinedInstructions, mockSLAs } from '@/lib/ticketUtils';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface CreateJobFromTicketModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ticketId: string;
  defaultLocation?: string;
  onCreateJob: (jobData: CreateJobFromTicketData) => void;
}

// Collapsible Section Component
function CollapsibleSection({ 
  title, 
  children, 
  defaultOpen = false,
  variant = 'default'
}: { 
  title: string; 
  children: React.ReactNode; 
  defaultOpen?: boolean;
  variant?: 'default' | 'dark';
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  
  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-full flex items-center justify-between px-4 py-3 text-sm font-medium transition-colors",
          variant === 'dark' 
            ? "bg-slate-700 text-white hover:bg-slate-600" 
            : "bg-gray-50 text-gray-900 hover:bg-gray-100"
        )}
      >
        <span>{title}</span>
        {isOpen ? (
          <ChevronDown className="h-4 w-4" />
        ) : (
          <ChevronRight className="h-4 w-4" />
        )}
      </button>
      {isOpen && (
        <div className="p-4 bg-white border-t border-gray-200">
          {children}
        </div>
      )}
    </div>
  );
}

export function CreateJobFromTicketModal({
  open,
  onOpenChange,
  ticketId,
  defaultLocation,
  onCreateJob
}: CreateJobFromTicketModalProps) {
  const [jobData, setJobData] = useState<Partial<CreateJobFromTicketData>>({
    shortDescription: '',
    details: '',
    location: defaultLocation || '',
    team: '',
    priority: '1 - High',
    selectedSLA: 'sla-1',
    workflow: 'CAFM Job - Reactive',
    startJob: 'straight-away',
    specificDate: undefined,
    preDefinedInstruction: 'None'
  });

  const [autoSLA, setAutoSLA] = useState(true);

  const handleInputChange = (field: keyof CreateJobFromTicketData, value: any) => {
    setJobData(prev => ({ ...prev, [field]: value }));
  };

  const handleCreate = (closeAfter: boolean = false) => {
    if (!jobData.shortDescription?.trim() || !jobData.location) {
      return;
    }

    onCreateJob(jobData as CreateJobFromTicketData);
    
    // Reset form
    setJobData({
      shortDescription: '',
      details: '',
      location: defaultLocation || '',
      team: '',
      priority: '1 - High',
      selectedSLA: 'sla-1',
      workflow: 'CAFM Job - Reactive',
      startJob: 'straight-away',
      specificDate: undefined,
      preDefinedInstruction: 'None'
    });
    
    if (closeAfter) {
      onOpenChange(false);
    }
  };

  const isFormValid = jobData.shortDescription?.trim() && jobData.location;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col p-0">
        <DialogHeader className="px-6 py-4 border-b border-gray-100 bg-white">
          <DialogTitle className="text-lg font-semibold text-gray-900">Create Job</DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5 bg-gray-50/50">
          {/* Top Row - Description & Location */}
          <div className="grid grid-cols-2 gap-5">
            {/* Short Description */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">
                Short Description <span className="text-red-500">*</span>
              </label>
              <Input
                placeholder="Enter short description..."
                value={jobData.shortDescription}
                onChange={(e) => handleInputChange('shortDescription', e.target.value)}
                className="h-10"
              />
            </div>

            {/* Location */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">
                Location <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-2">
                <Input
                  value={jobData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  placeholder="Select location..."
                  className="flex-1 h-10 text-sm"
                />
                <Button type="button" variant="outline" size="icon" className="h-10 w-10 shrink-0">
                  <MapPin className="h-4 w-4 text-gray-500" />
                </Button>
              </div>
            </div>
          </div>

          {/* Details */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700">Details</label>
            <Textarea
              placeholder="Enter detailed description..."
              value={jobData.details}
              onChange={(e) => handleInputChange('details', e.target.value)}
              className="min-h-[80px] resize-none"
            />
          </div>

          {/* Pre-defined Instruction */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700">Pre-defined instruction</label>
            <Select
              value={jobData.preDefinedInstruction}
              onValueChange={(value) => handleInputChange('preDefinedInstruction', value)}
            >
              <SelectTrigger className="h-10">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {mockPreDefinedInstructions.map(instruction => (
                  <SelectItem key={instruction} value={instruction}>
                    {instruction}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-gray-500">
              An optional set of standard job instructions to be carried out.
            </p>
          </div>

          {/* Start Job */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700">Start Job</label>
            <div className="grid grid-cols-2 gap-0 border border-gray-200 rounded-lg overflow-hidden">
              <button
                type="button"
                onClick={() => handleInputChange('startJob', 'straight-away')}
                className={cn(
                  "py-2.5 text-sm font-medium transition-colors",
                  jobData.startJob === 'straight-away'
                    ? "bg-gray-900 text-white"
                    : "bg-white text-gray-700 hover:bg-gray-50"
                )}
              >
                Straight away
              </button>
              <button
                type="button"
                onClick={() => handleInputChange('startJob', 'specific-date')}
                className={cn(
                  "py-2.5 text-sm font-medium transition-colors border-l border-gray-200",
                  jobData.startJob === 'specific-date'
                    ? "bg-gray-900 text-white"
                    : "bg-white text-gray-700 hover:bg-gray-50"
                )}
              >
                Specific date
              </button>
            </div>
            {jobData.startJob === 'specific-date' && (
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full h-10 justify-start text-left font-normal mt-2">
                    <CalendarIcon className="mr-2 h-4 w-4 text-gray-500" />
                    {jobData.specificDate ? format(jobData.specificDate, 'PPP') : 'Pick a date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={jobData.specificDate}
                    onSelect={(date) => handleInputChange('specificDate', date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            )}
          </div>

          {/* Team & Priority Row */}
          <div className="grid grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">Team</label>
              <Select
                value={jobData.team}
                onValueChange={(value) => handleInputChange('team', value)}
              >
                <SelectTrigger className="h-10">
                  <SelectValue placeholder="None selected" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  <SelectItem value="maintenance">Maintenance Team</SelectItem>
                  <SelectItem value="electrical">Electrical Team</SelectItem>
                  <SelectItem value="hvac">HVAC Team</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">Priority</label>
              <Select
                value={jobData.priority}
                onValueChange={(value) => handleInputChange('priority', value as any)}
              >
                <SelectTrigger className="h-10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1 - High">1 - High</SelectItem>
                  <SelectItem value="2 - High">2 - High</SelectItem>
                  <SelectItem value="3 - Medium">3 - Medium</SelectItem>
                  <SelectItem value="4 - Low">4 - Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* SLA & Workflow Row */}
          <div className="grid grid-cols-2 gap-5">
            {/* Selected SLA */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700">Selected SLA</label>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500">Auto</span>
                  <Switch checked={autoSLA} onCheckedChange={setAutoSLA} />
                </div>
              </div>
              <Select
                value={jobData.selectedSLA}
                onValueChange={(value) => handleInputChange('selectedSLA', value)}
              >
                <SelectTrigger className="h-10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {mockSLAs.map(sla => (
                    <SelectItem key={sla.id} value={sla.id}>
                      {sla.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Workflow */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">Workflow</label>
              <Select
                value={jobData.workflow}
                onValueChange={(value) => handleInputChange('workflow', value)}
              >
                <SelectTrigger className="h-10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {mockWorkflows.map(workflow => (
                    <SelectItem key={workflow} value={workflow}>
                      {workflow}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Collapsible Sections */}
          <div className="space-y-2 pt-2">
            <CollapsibleSection title="SLA" defaultOpen={false}>
              <div className="space-y-3">
                <p className="text-sm text-gray-600">Selected SLA will be applied to this job.</p>
                <div className="bg-blue-50 border border-blue-100 rounded-lg p-3">
                  <p className="font-medium text-blue-900 text-sm">Healthcare SLA</p>
                  <ul className="mt-2 space-y-1 text-xs text-blue-800">
                    <li>• Ticket opened: 15 minutes</li>
                    <li>• Contain before: 1 hour</li>
                    <li>• Complete before: 4 hours</li>
                  </ul>
                </div>
              </div>
            </CollapsibleSection>

            <CollapsibleSection title="Assignments" variant="dark">
              <div className="space-y-3">
                <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <AlertCircle className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-amber-800">
                    Please create the job before you schedule or assign
                  </p>
                </div>
                <Button variant="outline" className="w-full h-10" disabled>
                  <Users className="mr-2 h-4 w-4" />
                  Schedule / Assign
                </Button>
              </div>
            </CollapsibleSection>

            <CollapsibleSection title="Assets linked to Job" variant="dark">
              <p className="text-sm text-gray-500">No assets linked yet.</p>
            </CollapsibleSection>

            <CollapsibleSection title="Follow-on Jobs" variant="dark">
              <p className="text-sm text-gray-500">No follow-on jobs configured.</p>
            </CollapsibleSection>

            <CollapsibleSection title="Payment Requests & Invoicing" variant="dark">
              <p className="text-sm text-gray-500">Payment configuration will be available after job creation.</p>
            </CollapsibleSection>

            <CollapsibleSection title="Instruction Details" variant="dark">
              <p className="text-sm text-gray-500">
                {jobData.preDefinedInstruction && jobData.preDefinedInstruction !== 'None' 
                  ? jobData.preDefinedInstruction 
                  : 'No instructions specified.'}
              </p>
            </CollapsibleSection>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex items-center justify-end gap-3">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="h-10 px-6">
            Close
          </Button>
          <Button 
            onClick={() => handleCreate(false)} 
            disabled={!isFormValid}
            variant="default"
            className="h-10 px-6 bg-blue-600 hover:bg-blue-700"
          >
            Create
          </Button>
          <Button 
            onClick={() => handleCreate(true)} 
            disabled={!isFormValid} 
            className="h-10 px-6 bg-slate-700 hover:bg-slate-800"
          >
            Create & Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
