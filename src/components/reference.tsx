import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Job, Customer, Engineer } from '@/types/job';
import { mockEngineers, mockJobTrades, mockTags, generateJobNumber } from '@/lib/jobUtils';
import { ArrowLeft, ArrowRight, CheckCircle, User, Briefcase, Settings, Users, Check, FileText, Phone, Clock, Calendar, X } from 'lucide-react';

interface JobLogWizardProps {
  customers: Customer[];
  onJobCreate: (job: Omit<Job, 'id'>) => void;
  onCancel: () => void;
}

type WizardStep = 1 | 2 | 3 | 4 | 5;

interface JobFormData {
  customer: string;
  site: string;
  reporterName: string;
  reporterPhone: string;
  reporterEmail: string;
  reporterRelationship: string;
  description: string;
  jobNature: string;
  skillsRequired: string[];
  tags: string[];
  jobOwner: string;
  isEmergency: boolean;
  contactName: string;
  contactPhone: string;
  contactEmail: string;
  contactRelationship: string;
  jobType: 'OOH' | 'CallOut';
  primaryTrade: string;
  responseTime: number;
  priority: Job['priority'];
  availableEngineers: Engineer[];
  selectedEngineer: string;
  callConfirmed: boolean;
  finalEngineer: string;
  jobNumber: string;
}

export default function JobLogWizard({ customers, onJobCreate, onCancel }: JobLogWizardProps) {
  const [currentStep, setCurrentStep] = useState<WizardStep>(1);
  const [selectedEngineerDetails, setSelectedEngineerDetails] = useState<Engineer | null>(null);
  const [formData, setFormData] = useState<JobFormData>({
    customer: '',
    site: '',
    reporterName: '',
    reporterPhone: '',
    reporterEmail: '',
    reporterRelationship: '',
    description: '',
    jobNature: '',
    skillsRequired: [],
    tags: [],
    jobOwner: '',
    isEmergency: false,
    contactName: '',
    contactPhone: '',
    contactEmail: '',
    contactRelationship: '',
    jobType: 'OOH',
    primaryTrade: '',
    responseTime: 60,
    priority: 'Medium',
    availableEngineers: [],
    selectedEngineer: '',
    callConfirmed: false,
    finalEngineer: '',
    jobNumber: generateJobNumber()
  });

  const updateFormData = (updates: Partial<JobFormData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  const getSLATimes = (priority: Job['priority'], isEmergency: boolean) => {
    if (isEmergency) {
      return { accept: 5, onsite: 15, completed: 30 };
    }
    
    switch (priority) {
      case 'Critical':
        return { accept: 10, onsite: 30, completed: 60 };
      case 'High':
        return { accept: 20, onsite: 60, completed: 120 };
      case 'Medium':
        return { accept: 30, onsite: 90, completed: 180 };
      case 'Low':
        return { accept: 60, onsite: 180, completed: 360 };
      default:
        return { accept: 30, onsite: 90, completed: 180 };
    }
  };

  const nextStep = () => {
    if (currentStep < 5) {
      setCurrentStep((prev) => (prev + 1) as WizardStep);
      
      if (currentStep === 3) {
        const filteredEngineers = mockEngineers.filter(engineer => {
          if (formData.jobType === 'OOH') {
            return engineer.status === 'OOH' || engineer.status === 'On call';
          } else {
            return engineer.status !== 'completed';
          }
        });
        updateFormData({ availableEngineers: filteredEngineers });
      }
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => (prev - 1) as WizardStep);
    }
  };

  const handleLogDraftJob = () => {
    const draftJob: Omit<Job, 'id'> = {
      jobNumber: formData.jobNumber,
      customer: formData.customer,
      site: formData.site,
      description: formData.description,
      engineer: 'Unassigned',
      status: 'amber',
      priority: formData.priority,
      category: formData.primaryTrade || 'General',
      jobType: 'Draft',
      targetCompletionTime: 240,
      dateLogged: new Date(),
      dateAccepted: null,
      dateOnSite: null,
      dateCompleted: null,
      contact: {
        name: formData.contactName,
        number: formData.contactPhone,
        email: formData.contactEmail,
        relationship: formData.contactRelationship
      },
      reporter: {
        name: formData.reporterName,
        number: formData.reporterPhone,
        email: formData.reporterEmail,
        relationship: formData.reporterRelationship
      },
      primaryJobTrade: formData.primaryTrade || 'General',
      secondaryJobTrades: formData.skillsRequired,
      tags: [...formData.tags, 'Draft'],
      customAlerts: {
        acceptSLA: 60,
        onsiteSLA: 240,
        completedSLA: 480
      },
      project: '',
      customerOrderNumber: '',
      referenceNumber: '',
      jobOwner: formData.jobOwner,
      jobRef1: '',
      jobRef2: '',
      requiresApproval: true,
      preferredAppointmentDate: null,
      startDate: new Date(),
      endDate: null,
      lockVisitDateTime: false,
      deployToMobile: false,
      isRecurringJob: false,
      completionTimeFromEngineerOnsite: false,
      reason: null
    };

    onJobCreate(draftJob);
  };

  const handleSubmit = () => {
    const slaTime = getSLATimes(formData.priority, formData.isEmergency);
    
    const newJob: Omit<Job, 'id'> = {
      jobNumber: formData.jobNumber,
      customer: formData.customer,
      site: formData.site,
      description: formData.description,
      engineer: formData.finalEngineer,
      status: 'amber',
      priority: formData.priority,
      category: formData.primaryTrade,
      jobType: formData.jobType === 'OOH' ? 'Out of Hours' : 'Call Out',
      targetCompletionTime: formData.responseTime,
      dateLogged: new Date(),
      dateAccepted: null,
      dateOnSite: null,
      dateCompleted: null,
      contact: {
        name: formData.contactName,
        number: formData.contactPhone,
        email: formData.contactEmail,
        relationship: formData.contactRelationship
      },
      reporter: {
        name: formData.reporterName,
        number: formData.reporterPhone,
        email: formData.reporterEmail,
        relationship: formData.reporterRelationship
      },
      primaryJobTrade: formData.primaryTrade,
      secondaryJobTrades: formData.skillsRequired,
      tags: formData.tags,
      customAlerts: {
        acceptSLA: slaTime.accept,
        onsiteSLA: slaTime.onsite,
        completedSLA: slaTime.completed
      },
      project: '',
      customerOrderNumber: '',
      referenceNumber: '',
      jobOwner: formData.jobOwner,
      jobRef1: '',
      jobRef2: '',
      requiresApproval: false,
      preferredAppointmentDate: null,
      startDate: new Date(),
      endDate: null,
      lockVisitDateTime: formData.isEmergency,
      deployToMobile: true,
      isRecurringJob: false,
      completionTimeFromEngineerOnsite: false,
      reason: null
    };

    onJobCreate(newJob);
  };

  const isStepValid = (step: WizardStep): boolean => {
    switch (step) {
      case 1:
        return !!(formData.customer && formData.site && formData.reporterName);
      case 2:
        return !!(formData.description && formData.jobNature && formData.jobOwner && formData.contactName);
      case 3:
        return !!(formData.jobType && formData.primaryTrade && formData.responseTime && formData.priority);
      case 4:
        return !!(formData.selectedEngineer && formData.callConfirmed);
      case 5:
        return !!(formData.finalEngineer);
      default:
        return false;
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl">Job Log Wizard</CardTitle>
            <Button variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="flex items-center justify-center mb-8">
            {[1, 2, 3, 4, 5].map((step) => (
              <div key={step} className="flex items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium ${
                  step < currentStep 
                    ? 'bg-green-500 text-white' 
                    : step === currentStep 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-gray-200 text-gray-600'
                }`}>
                  {step < currentStep ? <Check size={16} /> : step}
                </div>
                {step < 5 && (
                  <div className={`w-12 h-1 mx-2 ${
                    step < currentStep ? 'bg-green-500' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
          
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <User className="mx-auto h-12 w-12 text-blue-600 mb-4" />
                <h2 className="text-2xl font-bold text-gray-900">Reporter Details</h2>
                <p className="text-muted-foreground">Who is reporting this job?</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-900">Job Location</h3>
                  
                  <div>
                    <label className="text-sm font-medium">Customer *</label>
                    <Select value={formData.customer} onValueChange={(value) => updateFormData({ customer: value, site: '' })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select customer" />
                      </SelectTrigger>
                      <SelectContent>
                        {customers && customers.length > 0 ? customers.map(customer => (
                          <SelectItem key={customer.id} value={customer.name}>
                            {customer.name}
                          </SelectItem>
                        )) : (
                          <SelectItem value="no-customers" disabled>No customers available</SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium">Site *</label>
                    <Select 
                      value={formData.site} 
                      onValueChange={(value) => updateFormData({ site: value })}
                      disabled={!formData.customer}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select site" />
                      </SelectTrigger>
                      <SelectContent>
                        {formData.customer && customers && customers.length > 0 ? (
                          customers
                            .find(c => c.name === formData.customer)?.sites?.map(site => (
                              <SelectItem key={site} value={site}>
                                {site}
                              </SelectItem>
                            )) || <SelectItem value="no-sites" disabled>No sites available</SelectItem>
                        ) : (
                          <SelectItem value="no-sites" disabled>Select customer first</SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-900">Reporter Information</h3>
                  
                  <div>
                    <label className="text-sm font-medium">Reporter Name *</label>
                    <Input
                      value={formData.reporterName}
                      onChange={(e) => updateFormData({ reporterName: e.target.value })}
                      placeholder="Enter reporter name"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium">Reporter Phone</label>
                    <Input
                      value={formData.reporterPhone}
                      onChange={(e) => updateFormData({ reporterPhone: e.target.value })}
                      placeholder="Enter phone number"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium">Reporter Email</label>
                    <Input
                      value={formData.reporterEmail}
                      onChange={(e) => updateFormData({ reporterEmail: e.target.value })}
                      placeholder="Enter email address"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium">Relationship</label>
                    <Input
                      value={formData.reporterRelationship}
                      onChange={(e) => updateFormData({ reporterRelationship: e.target.value })}
                      placeholder="e.g., Facilities Manager"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <Briefcase className="mx-auto h-12 w-12 text-blue-600 mb-4" />
                <h2 className="text-2xl font-bold text-gray-900">Job Details</h2>
                <p className="text-muted-foreground">Describe the job and contact information</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Job Description *</label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => updateFormData({ description: e.target.value })}
                    placeholder="Describe the job in detail..."
                    rows={4}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Nature of Job *</label>
                  <Select value={formData.jobNature} onValueChange={(value) => updateFormData({ jobNature: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select job nature" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="repair">Repair</SelectItem>
                      <SelectItem value="maintenance">Maintenance</SelectItem>
                      <SelectItem value="installation">Installation</SelectItem>
                      <SelectItem value="inspection">Inspection</SelectItem>
                      <SelectItem value="emergency">Emergency</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium">Job Owner *</label>
                  <Input
                    value={formData.jobOwner}
                    onChange={(e) => updateFormData({ jobOwner: e.target.value })}
                    placeholder="Enter job owner/department"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="emergency"
                    checked={formData.isEmergency}
                    onCheckedChange={(checked) => updateFormData({ isEmergency: !!checked })}
                  />
                  <label htmlFor="emergency" className="text-sm font-medium">
                    This is an emergency job
                  </label>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-900 mb-4">Primary Contact Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">Contact Name *</label>
                      <Input
                        value={formData.contactName}
                        onChange={(e) => updateFormData({ contactName: e.target.value })}
                        placeholder="Enter contact name"
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium">Contact Phone</label>
                      <Input
                        value={formData.contactPhone}
                        onChange={(e) => updateFormData({ contactPhone: e.target.value })}
                        placeholder="Enter phone number"
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium">Contact Email</label>
                      <Input
                        value={formData.contactEmail}
                        onChange={(e) => updateFormData({ contactEmail: e.target.value })}
                        placeholder="Enter email address"
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium">Relationship</label>
                      <Input
                        value={formData.contactRelationship}
                        onChange={(e) => updateFormData({ contactRelationship: e.target.value })}
                        placeholder="e.g., Site Manager"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <Settings className="mx-auto h-12 w-12 text-blue-600 mb-4" />
                <h2 className="text-2xl font-bold text-gray-900">Job Type & KPI</h2>
                <p className="text-muted-foreground">Configure job type and performance indicators</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Job Type *</label>
                    <Select value={formData.jobType} onValueChange={(value: 'OOH' | 'CallOut') => updateFormData({ jobType: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select job type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="OOH">Out of Hours (OOH)</SelectItem>
                        <SelectItem value="CallOut">Call Out</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium">Primary Trade *</label>
                    <Select value={formData.primaryTrade} onValueChange={(value) => updateFormData({ primaryTrade: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select primary trade" />
                      </SelectTrigger>
                      <SelectContent>
                        {mockJobTrades && mockJobTrades.length > 0 ? mockJobTrades.map(trade => (
                          <SelectItem key={trade} value={trade}>
                            {trade}
                          </SelectItem>
                        )) : (
                          <SelectItem value="no-trades" disabled>No trades available</SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Response Time (minutes) *</label>
                    <Input
                      type="number"
                      value={formData.responseTime}
                      onChange={(e) => updateFormData({ responseTime: parseInt(e.target.value) || 60 })}
                      placeholder="Enter response time"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium">Priority *</label>
                    <Select value={formData.priority} onValueChange={(value: Job['priority']) => updateFormData({ priority: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Critical">Critical</SelectItem>
                        <SelectItem value="High">High</SelectItem>
                        <SelectItem value="Medium">Medium</SelectItem>
                        <SelectItem value="Low">Low</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">SLA Times for {formData.priority} Priority</h4>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-blue-700 font-medium">Accept SLA:</span>
                    <span className="ml-2">{getSLATimes(formData.priority, formData.isEmergency).accept} minutes</span>
                  </div>
                  <div>
                    <span className="text-blue-700 font-medium">On Site SLA:</span>
                    <span className="ml-2">{getSLATimes(formData.priority, formData.isEmergency).onsite} minutes</span>
                  </div>
                  <div>
                    <span className="text-blue-700 font-medium">Completion SLA:</span>
                    <span className="ml-2">{getSLATimes(formData.priority, formData.isEmergency).completed} minutes</span>
                  </div>
                </div>
                {formData.isEmergency && (
                  <p className="text-sm text-blue-700 mt-2 font-medium">
                    ⚠️ Emergency job - Reduced SLA times applied
                  </p>
                )}
              </div>
            </div>
          )}

          {currentStep === 4 && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <Users className="mx-auto h-12 w-12 text-blue-600 mb-4" />
                <h2 className="text-2xl font-bold text-gray-900">Engineer Selection</h2>
                <p className="text-muted-foreground">Choose an available engineer for this job</p>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg mb-6">
                <h4 className="font-medium text-blue-900 mb-2">Filtered Engineers ({formData.jobType})</h4>
                <p className="text-sm text-blue-700">
                  Showing engineers available for {formData.jobType === 'OOH' ? 'Out of Hours' : 'Call Out'} jobs
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {formData.availableEngineers && formData.availableEngineers.length > 0 ? formData.availableEngineers.map(engineer => (
                  <div
                    key={engineer.name}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      formData.selectedEngineer === engineer.name
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => {
                      updateFormData({ selectedEngineer: engineer.name });
                      setSelectedEngineerDetails(engineer);
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-medium text-gray-900">{engineer.name}</h4>
                          {engineer.isOnHoliday && (
                            <Badge variant="destructive" className="text-xs">
                              <Calendar className="h-3 w-3 mr-1" />
                              On Holiday
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-600">{engineer.email}</p>
                        <p className="text-sm text-gray-600">{engineer.phone}</p>
                        {engineer.shiftTiming && (
                          <div className="flex items-center gap-1 mt-1">
                            <Clock className="h-3 w-3 text-gray-400" />
                            <span className="text-xs text-gray-500">{engineer.shiftTiming}</span>
                          </div>
                        )}
                      </div>
                      <div className="text-right">
                        <Badge variant={engineer.status === 'OOH' || engineer.status === 'On call' ? 'default' : 'secondary'}>
                          {engineer.status}
                        </Badge>
                        <div className="text-xs text-gray-500 mt-1">
                          {engineer.syncStatus}
                        </div>
                      </div>
                    </div>
                  </div>
                )) : (
                  <div className="text-center py-8">
                    <Users className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Engineers Available</h3>
                    <p className="text-sm text-gray-600">
                      No engineers are currently available for {formData.jobType === 'OOH' ? 'Out of Hours' : 'Call Out'} jobs.
                    </p>
                  </div>
                )}
              </div>

              {formData.selectedEngineer && (
                <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="callConfirmed"
                      checked={formData.callConfirmed}
                      onCheckedChange={(checked) => updateFormData({ callConfirmed: !!checked })}
                    />
                    <label htmlFor="callConfirmed" className="text-sm font-medium">
                      I have called {formData.selectedEngineer} and confirmed they can accept this job *
                    </label>
                  </div>
                </div>
              )}
            </div>
          )}

          {currentStep === 5 && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <CheckCircle className="mx-auto h-12 w-12 text-green-600 mb-4" />
                <h2 className="text-2xl font-bold text-gray-900">Job Allocation</h2>
                <p className="text-muted-foreground">Review and finalize the job allocation</p>
              </div>

              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-4">Job Summary</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Job Number:</span>
                    <span className="font-medium ml-2">{formData.jobNumber}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Customer:</span>
                    <span className="font-medium ml-2">{formData.customer}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Site:</span>
                    <span className="font-medium ml-2">{formData.site}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Priority:</span>
                    <span className="font-medium ml-2">{formData.priority}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Job Type:</span>
                    <span className="font-medium ml-2">{formData.jobType === 'OOH' ? 'Out of Hours' : 'Call Out'}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Primary Trade:</span>
                    <span className="font-medium ml-2">{formData.primaryTrade}</span>
                  </div>
                </div>
                
                <div className="mt-4">
                  <span className="text-gray-600">Description:</span>
                  <p className="font-medium mt-1">{formData.description}</p>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Final Engineer Assignment *</label>
                <Select 
                  value={formData.finalEngineer} 
                  onValueChange={(value) => updateFormData({ finalEngineer: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Confirm engineer assignment" />
                  </SelectTrigger>
                  <SelectContent>
                    {formData.selectedEngineer ? (
                      <SelectItem value={formData.selectedEngineer}>
                        {formData.selectedEngineer} (Confirmed)
                      </SelectItem>
                    ) : (
                      <SelectItem value="no-engineer" disabled>No engineer selected</SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
                <h4 className="font-medium text-green-900 mb-2">Ready to Create Job</h4>
                <p className="text-sm text-green-700">
                  All information has been collected. Click "Create Job" to finalize the job allocation.
                </p>
              </div>
            </div>
          )}
          
          <div className="flex justify-between mt-8 pt-6 border-t">
            <Button
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 1}
            >
              <ArrowLeft size={16} className="mr-2" />
              Previous
            </Button>
            
            {currentStep === 2 && !formData.isEmergency && (
              <Button
                onClick={handleLogDraftJob}
                disabled={!isStepValid(currentStep)}
                variant="secondary"
              >
                <FileText size={16} className="mr-2" />
                Log Draft Job
              </Button>
            )}
            
            {currentStep < 5 && (formData.isEmergency || currentStep !== 2) && (
              <Button
                onClick={nextStep}
                disabled={!isStepValid(currentStep)}
              >
                Next
                <ArrowRight size={16} className="ml-2" />
              </Button>
            )}
            
            {currentStep === 5 && (
              <Button
                onClick={handleSubmit}
                disabled={!isStepValid(currentStep)}
              >
                <CheckCircle size={16} className="mr-2" />
                Create Job
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Engineer Details Modal */}
      {selectedEngineerDetails && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Engineer Details</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedEngineerDetails(null)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-gray-900">{selectedEngineerDetails.name}</h4>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant={selectedEngineerDetails.status === 'OOH' || selectedEngineerDetails.status === 'On call' ? 'default' : 'secondary'}>
                    {selectedEngineerDetails.status}
                  </Badge>
                  {selectedEngineerDetails.isOnHoliday && (
                    <Badge variant="destructive" className="text-xs">
                      <Calendar className="h-3 w-3 mr-1" />
                      On Holiday
                    </Badge>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-600">{selectedEngineerDetails.phone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-600">{selectedEngineerDetails.email}</span>
                </div>
                {selectedEngineerDetails.shiftTiming && (
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-600">{selectedEngineerDetails.shiftTiming}</span>
                  </div>
                )}
              </div>

              <div className="flex gap-2 pt-4">
                <Button
                  className="flex-1"
                  onClick={() => {
                    // In a real app, this would initiate a call
                    alert(`Calling ${selectedEngineerDetails.name} at ${selectedEngineerDetails.phone}`);
                  }}
                >
                  <Phone className="h-4 w-4 mr-2" />
                  Call Engineer
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setSelectedEngineerDetails(null)}
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

