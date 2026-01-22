import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { CalendarIcon, MapPin, ChevronDown, ChevronRight, Users, AlertCircle, ChevronLeft, FileText, User, Phone, Building2 } from 'lucide-react';
import { CreateJobFromTicketData } from '@/types/ticket';
import { Job } from '@/types/job';
import { mockWorkflows, mockPreDefinedInstructions, mockSLAs, mockFlatLocations, getLocationPath } from '@/lib/ticketUtils';
import { useTickets } from '@/contexts/TicketContext';
import { useJobs } from '@/context/JobContext';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { showNotification } from '@/components/ui/toast-notification';
import { oohServiceProviders, oohLocations } from '@/lib/serviceProviderData';

// Map locations with OOH service providers - each location gets service providers based on their location
const mockJobLocations = [
  {
    id: 'loc-1',
    name: 'St Martins House - Manchester',
    address: '123 Oxford Road, Manchester, M1 5QA',
    serviceProviders: oohServiceProviders.filter(sp => sp.location === 'Manchester').map(sp => ({
      id: sp.id,
      name: sp.name,
      phone: sp.phone,
      specialty: sp.specialty
    }))
  },
  {
    id: 'loc-2',
    name: 'Victoria Plaza - Birmingham',
    address: '45 Corporation Street, Birmingham, B2 4TE',
    serviceProviders: oohServiceProviders.filter(sp => sp.location === 'Birmingham').map(sp => ({
      id: sp.id,
      name: sp.name,
      phone: sp.phone,
      specialty: sp.specialty
    }))
  },
  {
    id: 'loc-3',
    name: 'Riverside Campus - London',
    address: '200 Thames Path, London, SE1 9PP',
    serviceProviders: oohServiceProviders.filter(sp => sp.location === 'London').map(sp => ({
      id: sp.id,
      name: sp.name,
      phone: sp.phone,
      specialty: sp.specialty
    }))
  },
  {
    id: 'loc-4',
    name: 'Northern Quarter - Leeds',
    address: '78 Call Lane, Leeds, LS1 6DT',
    serviceProviders: oohServiceProviders.filter(sp => sp.location === 'Leeds').map(sp => ({
      id: sp.id,
      name: sp.name,
      phone: sp.phone,
      specialty: sp.specialty
    }))
  },
  {
    id: 'loc-5',
    name: 'Cathedral Quarter - Bristol',
    address: '15 College Green, Bristol, BS1 5TB',
    serviceProviders: oohServiceProviders.map(sp => ({
      id: sp.id,
      name: sp.name,
      phone: sp.phone,
      specialty: sp.specialty
    })) // Bristol has access to all service providers
  }
];

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

export default function CreateJobFromTicketPage() {
  const { ticketId } = useParams<{ ticketId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { tickets, updateTicket } = useTickets();
  const { addJob } = useJobs();
  
  const defaultLocation = searchParams.get('location') || '';
  const ticket = tickets.find(t => t.id === ticketId);
  
  // State for selecting multiple tickets
  const [selectedTicketIds, setSelectedTicketIds] = useState<string[]>(ticketId ? [ticketId] : []);
  const [showTicketSelector, setShowTicketSelector] = useState(false);

  // Map ticket priority to job priority
  function mapTicketPriorityToJob(ticketPriority?: string): '1 - High' | '2 - High' | '3 - Medium' | '4 - Low' {
    if (!ticketPriority) return '2 - High';
    if (ticketPriority.toLowerCase().includes('critical') || ticketPriority === '1 - High') return '1 - High';
    if (ticketPriority.toLowerCase().includes('high') || ticketPriority === '2 - High') return '2 - High';
    if (ticketPriority.toLowerCase().includes('medium') || ticketPriority === '3 - Medium') return '3 - Medium';
    return '4 - Low';
  }

  // Helper function to find matching job location from ticket location
  const findMatchingJobLocation = (ticketLocationIds: string[] | undefined) => {
    if (!ticketLocationIds || ticketLocationIds.length === 0) return null;
    
    // Get location names from ticket
    for (const locId of ticketLocationIds) {
      const ticketLocation = mockFlatLocations.find(l => l.id === locId);
      if (ticketLocation) {
        const locationPath = getLocationPath(locId);
        // Try to find a matching job location by name
        const matchingJobLoc = mockJobLocations.find(jobLoc => 
          locationPath.toLowerCase().includes(jobLoc.name.split(' - ')[0].toLowerCase()) ||
          jobLoc.name.toLowerCase().includes(ticketLocation.name.toLowerCase()) ||
          ticketLocation.name.toLowerCase().includes(jobLoc.name.split(' - ')[0].toLowerCase())
        );
        if (matchingJobLoc) return matchingJobLoc;
      }
    }
    
    // If no match found, return the first job location as default
    return mockJobLocations[0];
  };

  // Get initial location from ticket
  const initialLocation = findMatchingJobLocation(ticket?.locations);

  const [jobData, setJobData] = useState<Partial<CreateJobFromTicketData>>({
    shortDescription: ticket?.shortDescription || '',
    details: ticket?.longDescription || '',
    location: initialLocation?.name || defaultLocation,
    team: '',
    priority: mapTicketPriorityToJob(ticket?.priority),
    selectedSLA: ticket?.slaId || 'sla-1',
    workflow: 'CAFM Job - Reactive',
    startJob: 'straight-away',
    specificDate: undefined,
    preDefinedInstruction: 'None'
  });
  const [selectedLocationId, setSelectedLocationId] = useState<string>(initialLocation?.id || '');
  const [selectedServiceProviderId, setSelectedServiceProviderId] = useState<string>('');

  // Get service providers for selected location
  const selectedLocationData = mockJobLocations.find(loc => loc.id === selectedLocationId);
  const availableServiceProviders = selectedLocationData?.serviceProviders || [];

  // Update form when ticket data changes
  useEffect(() => {
    if (ticket) {
      // Find matching job location from ticket locations
      const matchedLocation = findMatchingJobLocation(ticket.locations);
      
      setJobData({
        shortDescription: ticket.shortDescription || '',
        details: ticket.longDescription || '',
        location: matchedLocation?.name || defaultLocation,
        team: '',
        priority: mapTicketPriorityToJob(ticket.priority),
        selectedSLA: ticket.slaId || 'sla-1',
        workflow: 'CAFM Job - Reactive',
        startJob: 'straight-away',
        specificDate: undefined,
        preDefinedInstruction: 'None'
      });
      
      // Set the selected location ID
      if (matchedLocation) {
        setSelectedLocationId(matchedLocation.id);
      }
    }
  }, [ticket?.id]);

  const handleInputChange = (field: keyof CreateJobFromTicketData, value: any) => {
    setJobData(prev => ({ ...prev, [field]: value }));
  };

  const handleCreate = () => {
    if (!jobData.shortDescription?.trim() || !jobData.location || !ticket) {
      return;
    }

    // Create the new job
    const jobNumber = `JOB-${Date.now().toString().slice(-6)}`;
    const priorityMapping: Record<string, Job['priority']> = {
      '1 - High': 'Critical',
      '2 - High': 'High',
      '3 - Medium': 'Medium',
      '4 - Low': 'Low'
    };

    // Get selected service provider name if any
    const selectedProvider = availableServiceProviders.find(p => p.id === selectedServiceProviderId);
    const assignedEngineer = selectedProvider ? selectedProvider.name : 'Unassigned';

    // Get all selected ticket references
    const selectedTickets = tickets.filter(t => selectedTicketIds.includes(t.id));
    const ticketRefs = selectedTickets.map(t => t.reference);

    const newJob: Job = {
      id: `job-${Date.now()}`,
      jobNumber,
      ticketReference: ticket.reference, // Primary ticket reference
      ticketReferences: ticketRefs, // All linked tickets
      customer: selectedLocationData?.name.split(' - ')[0] || jobData.location.split(' > ')[0] || 'Unknown',
      tenant: selectedLocationData?.name.split(' - ')[0] || jobData.location.split(' > ')[0] || 'Unknown',
      site: jobData.location,
      engineer: assignedEngineer,
      contact: {
        name: ticket.reportedBy?.name || '',
        number: ticket.reportedBy?.phone || '',
        email: ticket.reportedBy?.email || '',
        relationship: 'Reporter'
      },
      reporter: {
        name: ticket.reportedBy?.name || '',
        number: ticket.reportedBy?.phone || '',
        email: ticket.reportedBy?.email || '',
        relationship: 'Reporter'
      },
      status: selectedProvider ? 'allocated' : 'new',
      priority: priorityMapping[jobData.priority || '2 - High'] || 'High',
      dateLogged: new Date(),
      dateAccepted: null,
      dateOnSite: null,
      dateCompleted: null,
      description: jobData.shortDescription || '',
      jobType: 'Out of Hours',
      category: 'General',
      targetCompletionTime: 240, // 4 hours default
      reason: null,
      customAlerts: {
        acceptSLA: 15,
        onsiteSLA: 60,
        completedSLA: 240
      },
      alerts: [],
      jobNotes: jobData.details || ''
    };

    // Add job to context
    addJob(newJob);

    // Update ALL selected tickets with job reference
    selectedTicketIds.forEach(tId => {
      const linkedTicket = tickets.find(t => t.id === tId);
      if (linkedTicket) {
        updateTicket(tId, {
          jobs: [...(linkedTicket.jobs || []), newJob.id],
          timeline: [
            ...(linkedTicket.timeline || []),
            {
              id: `timeline-${Date.now()}-${tId}`,
              type: 'job_created',
              title: `Job ${jobNumber} created`,
              timestamp: new Date(),
              author: 'Current User',
              status: 'completed'
            }
          ]
        });
      }
    });

    // Show success notification
    const ticketCount = selectedTicketIds.length;
    showNotification({
      type: 'success',
      title: 'Job Created Successfully',
      message: `Job ${jobNumber} has been created and linked to ${ticketCount} ticket${ticketCount > 1 ? 's' : ''}`
    });

    // Navigate back to ticket detail
    navigate(`/ticket/${ticketId}`);
  };

  // Validation - require all mandatory fields
  const isFormValid = jobData.shortDescription?.trim() && 
                      jobData.details?.trim() && 
                      selectedLocationId && 
                      selectedServiceProviderId &&
                      jobData.startJob &&
                      jobData.team &&
                      jobData.selectedSLA &&
                      jobData.workflow;

  if (!ticket) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-gray-500">Ticket not found</p>
          <Button variant="outline" onClick={() => navigate('/tickets')} className="mt-4">
            Back to Tickets
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <button 
          onClick={() => navigate('/tickets')} 
          className="hover:text-gray-900 transition-colors"
        >
          Ticket Manager
        </button>
        <span>/</span>
        <button 
          onClick={() => navigate(`/ticket/${ticketId}`)} 
          className="hover:text-gray-900 transition-colors"
        >
          {ticket.reference}
        </button>
        <span>/</span>
        <span className="text-gray-900 font-medium">Create Job</span>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(`/ticket/${ticketId}`)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronLeft className="h-5 w-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-xl font-semibold text-gray-900">Create Job</h1>
            <p className="text-sm text-gray-500">Creating job from ticket {ticket.reference}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* Multiple Ticket Selection */}
          <div className="flex items-center gap-2 flex-wrap">
            {selectedTicketIds.map(tId => {
              const t = tickets.find(x => x.id === tId);
              return t ? (
                <div key={tId} className="flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 rounded-lg border border-blue-200 text-sm">
                  <FileText className="h-3 w-3" />
                  <span className="font-medium">{t.reference}</span>
                  {selectedTicketIds.length > 1 && (
                    <button
                      onClick={() => setSelectedTicketIds(prev => prev.filter(id => id !== tId))}
                      className="ml-1 hover:bg-blue-100 rounded p-0.5"
                    >
                      <span className="text-blue-500 hover:text-blue-700 text-xs">×</span>
                    </button>
                  )}
                </div>
              ) : null;
            })}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowTicketSelector(!showTicketSelector)}
            className="gap-1"
          >
            <FileText className="h-4 w-4" />
            {showTicketSelector ? 'Hide Tickets' : 'Link More Tickets'}
          </Button>
        </div>
      </div>

      {/* Ticket Selector Panel */}
      {showTicketSelector && (
        <Card className="border-blue-200 bg-blue-50/30">
          <CardHeader className="pb-2">
            <h3 className="text-sm font-medium text-gray-700">Select Additional Tickets to Link</h3>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 max-h-[200px] overflow-y-auto">
              {tickets
                .filter(t => t.status !== 'Closed' && t.status !== 'Resolved')
                .map(t => (
                  <div
                    key={t.id}
                    onClick={() => {
                      if (selectedTicketIds.includes(t.id)) {
                        if (selectedTicketIds.length > 1) {
                          setSelectedTicketIds(prev => prev.filter(id => id !== t.id));
                        }
                      } else {
                        setSelectedTicketIds(prev => [...prev, t.id]);
                      }
                    }}
                    className={cn(
                      "p-2 rounded-lg border cursor-pointer transition-colors",
                      selectedTicketIds.includes(t.id)
                        ? "bg-blue-100 border-blue-300"
                        : "bg-white border-gray-200 hover:border-blue-200"
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={selectedTicketIds.includes(t.id)}
                        onChange={() => {}}
                        className="rounded"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="font-medium text-sm text-gray-900">{t.reference}</div>
                        <div className="text-xs text-gray-500 truncate">{t.shortDescription}</div>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Form */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Form */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <h3 className="font-semibold text-gray-900">Job Details</h3>
            </CardHeader>
            <CardContent className="space-y-5">
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
                <Select
                  value={selectedLocationId}
                  onValueChange={(value) => {
                    setSelectedLocationId(value);
                    setSelectedServiceProviderId(''); // Reset service provider when location changes
                    const loc = mockJobLocations.find(l => l.id === value);
                    if (loc) {
                      handleInputChange('location', loc.name);
                    }
                  }}
                >
                  <SelectTrigger className="h-10">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-gray-500" />
                      <SelectValue placeholder="Select location..." />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    {mockJobLocations.map(location => (
                      <SelectItem key={location.id} value={location.id}>
                        <div className="flex flex-col">
                          <span className="font-medium">{location.name}</span>
                          <span className="text-xs text-gray-500">{location.address}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Details */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700">
                  Details <span className="text-red-500">*</span>
                </label>
                <Textarea
                  placeholder="Enter detailed description..."
                  value={jobData.details}
                  onChange={(e) => handleInputChange('details', e.target.value)}
                  className="min-h-[100px] resize-none"
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
              </div>

              {/* Start Job */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700">
                  Start Job <span className="text-red-500">*</span>
                </label>
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
                  <label className="text-sm font-medium text-gray-700">
                    Team <span className="text-red-500">*</span>
                  </label>
                  <Select
                    value={jobData.team}
                    onValueChange={(value) => handleInputChange('team', value)}
                  >
                    <SelectTrigger className="h-10">
                      <SelectValue placeholder="Select team..." />
                    </SelectTrigger>
                    <SelectContent>
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
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-gray-700">
                    SLA Selection <span className="text-red-500">*</span>
                  </label>
                  <Select
                    value={jobData.selectedSLA}
                    onValueChange={(value) => handleInputChange('selectedSLA', value)}
                  >
                    <SelectTrigger className="h-10">
                      <SelectValue placeholder="Select SLA..." />
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

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-gray-700">
                    Workflow <span className="text-red-500">*</span>
                  </label>
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
            </CardContent>
          </Card>

          {/* Collapsible Sections */}
          <div className="space-y-2">
            <CollapsibleSection title="SLA Details" defaultOpen={false}>
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
          </div>
        </div>

        {/* Right Column - Summary */}
        <div className="space-y-6">
          <Card className="sticky top-6">
            <CardHeader>
              <h3 className="font-semibold text-gray-900">Job Summary</h3>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="text-xs text-gray-500">Source Ticket</div>
                <div className="text-sm font-medium text-blue-600">{ticket.reference}</div>
              </div>

              {jobData.shortDescription && (
                <div>
                  <div className="text-xs text-gray-500">Description</div>
                  <div className="text-sm font-medium text-gray-900">{jobData.shortDescription}</div>
                </div>
              )}

              {jobData.location && (
                <div>
                  <div className="text-xs text-gray-500">Location</div>
                  <div className="text-sm text-gray-700">{jobData.location}</div>
                </div>
              )}

              {jobData.priority && (
                <div>
                  <div className="text-xs text-gray-500">Priority</div>
                  <div className="text-sm text-gray-700">{jobData.priority}</div>
                </div>
              )}

              {selectedServiceProviderId && (
                <div>
                  <div className="text-xs text-gray-500">Assigned To</div>
                  <div className="text-sm text-green-700 font-medium">
                    {availableServiceProviders.find(p => p.id === selectedServiceProviderId)?.name}
                  </div>
                </div>
              )}

              <div className="pt-4 border-t space-y-2">
                <Button 
                  onClick={handleCreate} 
                  disabled={!isFormValid}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  Create Job
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => navigate(`/ticket/${ticketId}`)}
                  className="w-full"
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Assignments Section */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-blue-600" />
                <h3 className="font-semibold text-gray-900">Assignments <span className="text-red-500">*</span></h3>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {!selectedLocationId ? (
                <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <AlertCircle className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-amber-800">
                    Please select a location to see available service providers
                  </p>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Building2 className="h-4 w-4" />
                    <span>Providers for <strong>{selectedLocationData?.name}</strong></span>
                  </div>
                  
                  <div className="space-y-2">
                    {availableServiceProviders.map(provider => (
                      <div
                        key={provider.id}
                        onClick={() => setSelectedServiceProviderId(provider.id)}
                        className={cn(
                          "p-3 border rounded-lg cursor-pointer transition-all",
                          selectedServiceProviderId === provider.id
                            ? "border-blue-500 bg-blue-50 ring-1 ring-blue-500"
                            : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                        )}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={cn(
                              "w-8 h-8 rounded-full flex items-center justify-center",
                              selectedServiceProviderId === provider.id
                                ? "bg-blue-100 text-blue-600"
                                : "bg-gray-100 text-gray-600"
                            )}>
                              <User className="h-4 w-4" />
                            </div>
                            <div>
                              <div className="font-medium text-sm text-gray-900">{provider.name}</div>
                              <div className="text-xs text-gray-500">{provider.specialty}</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <Phone className="h-3 w-3" />
                            {provider.phone}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {selectedServiceProviderId && (
                    <div className="flex items-center gap-2 p-2 bg-green-50 border border-green-200 rounded-lg">
                      <Users className="h-4 w-4 text-green-600" />
                      <span className="text-sm text-green-800">
                        {availableServiceProviders.find(p => p.id === selectedServiceProviderId)?.name} will be assigned
                      </span>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Sticky Footer - Validation Status */}
      <div className="sticky bottom-4 bg-white/95 backdrop-blur border rounded-lg p-4 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              {isFormValid ? (
                <div className="h-2 w-2 bg-green-500 rounded-full" />
              ) : (
                <div className="h-2 w-2 bg-amber-500 rounded-full" />
              )}
              <span className="text-sm text-gray-600">
                {isFormValid ? 'Ready to create job' : 'Complete required fields'}
              </span>
            </div>
            {!isFormValid && (
              <div className="flex flex-wrap gap-2 text-xs">
                {!jobData.shortDescription?.trim() && (
                  <span className="px-2 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded">
                    Short description
                  </span>
                )}
                {!jobData.details?.trim() && (
                  <span className="px-2 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded">
                    Details
                  </span>
                )}
                {!selectedLocationId && (
                  <span className="px-2 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded">
                    Location
                  </span>
                )}
                {!selectedServiceProviderId && (
                  <span className="px-2 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded">
                    Service provider
                  </span>
                )}
                {!jobData.startJob && (
                  <span className="px-2 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded">
                    Start Job
                  </span>
                )}
                {!jobData.team && (
                  <span className="px-2 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded">
                    Team
                  </span>
                )}
                {!jobData.selectedSLA && (
                  <span className="px-2 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded">
                    SLA Selection
                  </span>
                )}
                {!jobData.workflow && (
                  <span className="px-2 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded">
                    Workflow
                  </span>
                )}
              </div>
            )}
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => navigate(`/ticket/${ticketId}`)}>
              Cancel
            </Button>
            <Button 
              onClick={handleCreate} 
              disabled={!isFormValid} 
              className="gap-2 bg-blue-600 hover:bg-blue-700"
            >
              Create Job
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
