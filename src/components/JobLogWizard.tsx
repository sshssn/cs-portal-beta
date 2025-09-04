
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Job, Customer, Engineer } from '@/types/job';
import { mockEngineers, mockJobTrades, mockTags, generateJobNumber } from '@/lib/jobUtils';
import { sendEngineerNotification } from '@/lib/engineerNotifications';
import { ArrowLeft, ArrowRight, CheckCircle, User, Briefcase, Settings, Users, Check, FileText, Phone, Clock, Calendar, X, Plus, Trash2, StickyNote, Building2 } from 'lucide-react';
import { UI_CONSTANTS } from '@/lib/ui-constants';

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
  jobType: 'OOH' | 'CallOut';
  primaryTrade: string;
  responseTime: number;
  priority: Job['priority'];
  availableEngineers: Engineer[];
  selectedEngineer: string;
  callConfirmed: boolean;
  finalEngineer: string;
  jobNumber: string;
  preferredStartDateTime: Date;
  preferredEndDateTime: Date;
  targetAttendanceDate: Date | null;
  targetAttendanceTime: string;
  allocatedVisitDate: Date | null;
  allocatedVisitTime: string;
  siteNotes: string[];
}

interface SiteNote {
  id: string;
  text: string;
  timestamp: Date;
  author: string;
}

export default function JobLogWizard({ customers, onJobCreate, onCancel }: JobLogWizardProps) {
  const [currentStep, setCurrentStep] = useState<WizardStep>(1);
  const [selectedEngineerDetails, setSelectedEngineerDetails] = useState<Engineer | null>(null);
  const [showSiteNotesModal, setShowSiteNotesModal] = useState(false);
  const [siteNotes, setSiteNotes] = useState<SiteNote[]>([
    { id: '1', text: 'Site access via main gate - security code required', timestamp: new Date('2024-01-15T09:00:00'), author: 'Site Manager' },
    { id: '2', text: 'Parking available in visitor bays A1-A5', timestamp: new Date('2024-01-14T14:30:00'), author: 'Facilities Team' },
    { id: '3', text: 'Equipment room key available from reception', timestamp: new Date('2024-01-13T16:45:00'), author: 'Maintenance Lead' }
  ]);
  const [newSiteNote, setNewSiteNote] = useState('');
  
  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      // Only handle if not typing in input fields
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement || event.target instanceof HTMLSelectElement) {
        return;
      }
      
      if (event.key.toLowerCase() === 'n' && !event.ctrlKey && !event.altKey && !event.shiftKey) {
        event.preventDefault();
        if (currentStep < 5 && isStepValid(currentStep)) {
          nextStep();
        }
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [currentStep, isStepValid]);

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
    jobType: 'OOH',
    primaryTrade: '',
    responseTime: 60,
    priority: 'Medium',
    availableEngineers: [],
    selectedEngineer: '',
    callConfirmed: false,
    finalEngineer: '',
    jobNumber: generateJobNumber(),
    preferredStartDateTime: new Date(),
    preferredEndDateTime: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours from now
    targetAttendanceDate: new Date(),
    targetAttendanceTime: new Date().toTimeString().slice(0, 5),
    allocatedVisitDate: new Date(),
    allocatedVisitTime: new Date().toTimeString().slice(0, 5),
    siteNotes: []
  });

  // Validation functions
  const validatePhone = (phone: string): boolean => {
    // UK phone number format: only numbers after +44
    const phoneRegex = /^\+44\d{10}$/;
    return phoneRegex.test(phone);
  };

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const isOutOfHours = (date: Date): boolean => {
    const hour = date.getHours();
    return hour < 8 || hour >= 17; // Before 8am or after 5pm
  };

  const updateFormData = (updates: Partial<JobFormData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  const addSiteNote = () => {
    if (newSiteNote.trim()) {
      const note: SiteNote = {
        id: Date.now().toString(),
        text: newSiteNote.trim(),
        timestamp: new Date(),
        author: 'Current User'
      };
      setSiteNotes(prev => [note, ...prev]);
      setNewSiteNote('');
    }
  };

  const deleteSiteNote = (id: string) => {
    setSiteNotes(prev => prev.filter(note => note.id !== id));
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
      status: 'new',
      priority: formData.priority,
      category: (formData.primaryTrade as any) || 'General',
      jobType: 'Draft',
      targetCompletionTime: 240,
      dateLogged: new Date(),
      dateAccepted: null,
      dateOnSite: null,
      dateCompleted: null,
      contact: {
        name: formData.reporterName,
        number: formData.reporterPhone,
        email: formData.reporterEmail,
        relationship: formData.reporterRelationship
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
      preferredAppointmentDate: formData.preferredStartDateTime,
      startDate: new Date(),
      endDate: null,
      targetAttendanceDate: formData.targetAttendanceDate,
      targetAttendanceTime: formData.targetAttendanceTime,
      allocatedVisitDate: formData.allocatedVisitDate,
      allocatedVisitTime: formData.allocatedVisitTime,
      lockVisitDateTime: false,
      deployToMobile: false,
      isRecurringJob: false,
      completionTimeFromEngineerOnsite: false,
      reason: null
    };

    onJobCreate(draftJob);
    
    // Show info notification
    if (typeof window !== 'undefined' && (window as any).addNotification) {
      (window as any).addNotification({
        type: 'info',
        title: 'Draft Job Created',
        message: `Draft job ${draftJob.jobNumber} has been saved for later completion`
      });
    }
  };

  const handleSubmit = () => {
    const slaTime = getSLATimes(formData.priority, formData.isEmergency);
    
    const newJob: Omit<Job, 'id'> = {
      jobNumber: formData.jobNumber,
      customer: formData.customer,
      site: formData.site,
      description: formData.description,
      engineer: formData.selectedEngineer,
      status: 'allocated',
      priority: formData.priority,
      category: (formData.primaryTrade as any),
      jobType: formData.jobType === 'OOH' ? 'Out of Hours' : 'Call Out',
      targetCompletionTime: formData.responseTime,
      dateLogged: new Date(),
      dateAccepted: null,
      dateOnSite: null,
      dateCompleted: null,
      contact: {
        name: formData.reporterName,
        number: formData.reporterPhone,
        email: formData.reporterEmail,
        relationship: formData.reporterRelationship
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
      preferredAppointmentDate: formData.preferredStartDateTime,
      startDate: new Date(),
      endDate: null,
      targetAttendanceDate: formData.targetAttendanceDate,
      targetAttendanceTime: formData.targetAttendanceTime,
      allocatedVisitDate: formData.allocatedVisitDate,
      allocatedVisitTime: formData.allocatedVisitTime,
      lockVisitDateTime: formData.isEmergency,
      deployToMobile: true,
      isRecurringJob: false,
      completionTimeFromEngineerOnsite: false,
      reason: null
    };

    onJobCreate(newJob);
    
    // Send engineer notification
    if (newJob.engineer && newJob.engineer !== 'Unassigned') {
      sendEngineerNotification(newJob.engineer, `New job ${newJob.jobNumber} has been assigned to you. Customer: ${newJob.customer}, Site: ${newJob.site}`);
    }
    
    // Show success notification
    if (typeof window !== 'undefined' && (window as any).addNotification) {
      (window as any).addNotification({
        type: 'success',
        title: 'Job Created Successfully',
        message: `Job ${newJob.jobNumber} has been created and assigned to ${newJob.engineer}`
      });
    }
  };

  const isStepValid = (step: WizardStep): boolean => {
    switch (step) {
      case 1:
        return !!(formData.customer && formData.site && formData.reporterName && 
                 formData.reporterPhone && formData.reporterEmail && 
                 validatePhone(formData.reporterPhone) && validateEmail(formData.reporterEmail));
      case 2:
        return !!(formData.description && formData.jobNature);
      case 3:
        return !!(formData.jobType && formData.primaryTrade && formData.responseTime && formData.priority);
      case 4:
        return !!(formData.selectedEngineer && formData.callConfirmed && 
                 formData.targetAttendanceDate && formData.targetAttendanceTime && 
                 formData.allocatedVisitDate && formData.allocatedVisitTime);
      case 5:
        return !!(formData.preferredStartDateTime && formData.preferredEndDateTime);
      default:
        return false;
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-6">
      <Card className="w-full border-0 shadow-lg">
        <CardHeader className={`${UI_CONSTANTS.card.header} bg-gradient-to-r from-blue-50 to-indigo-50 border-b-2 border-blue-200`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Briefcase className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <CardTitle className={`${UI_CONSTANTS.typography.title} text-xl`}>Job Log Wizard</CardTitle>
                <p className={`${UI_CONSTANTS.typography.bodyMuted} mt-1`}>Create and manage service jobs efficiently</p>
              </div>
            </div>
            <Button variant="outline" onClick={onCancel} className={`${UI_CONSTANTS.button.outline} border-blue-300 text-blue-700 hover:bg-blue-50`}>
              Cancel
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="p-8 w-full">
          <div className="flex items-center justify-center mb-8">
            {[1, 2, 3, 4, 5].map((step) => (
              <div key={step} className="flex items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold shadow-md transition-all duration-300 ${
                  step < currentStep 
                    ? 'bg-gradient-to-br from-green-500 to-green-600 text-white shadow-green-200' 
                    : step === currentStep 
                      ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-blue-200 scale-105' 
                      : 'bg-gray-100 text-gray-500 border-2 border-gray-200'
                }`}>
                  {step < currentStep ? <Check size={16} /> : step}
                </div>
                {step < 5 && (
                  <div className={`w-12 h-1 mx-2 rounded-full transition-all duration-300 ${
                    step < currentStep ? 'bg-gradient-to-r from-green-400 to-green-500' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
          
          {currentStep === 1 && (
            <div className="space-y-8 w-full">
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-100 rounded-full mb-6">
                  <User className="h-10 w-10 text-blue-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-3">Reporter Details</h2>
                <p className="text-gray-600 text-lg">Who is reporting this job?</p>
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 w-full">
                <div className="bg-gray-50 p-8 rounded-xl border-2 border-gray-200 w-full">
                  <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-3 mb-6">
                    <Building2 className="h-5 w-5 text-blue-600" />
                    Job Location
                  </h3>
                  
                  <div className="space-y-6">
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-3 block">Customer *</label>
                      <Select value={formData.customer} onValueChange={(value) => updateFormData({ customer: value, site: '' })}>
                        <SelectTrigger className="h-14 w-full text-base border-2 border-gray-200 hover:border-blue-300 focus:border-blue-500">
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
                      <label className="text-sm font-medium text-gray-700 mb-3 block">Site *</label>
                      <Select 
                        value={formData.site} 
                        onValueChange={(value) => updateFormData({ site: value })}
                        disabled={!formData.customer}
                      >
                        <SelectTrigger className="h-14 w-full text-base border-2 border-gray-200 hover:border-blue-300 focus:border-blue-500 disabled:opacity-50">
                          <SelectValue placeholder="Select site" />
                        </SelectTrigger>
                        <SelectContent>
                          {formData.customer && customers.length > 0 ? (
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
                </div>

                <div className="bg-blue-50 p-8 rounded-xl border-2 border-blue-200 w-full">
                  <h3 className="text-xl font-semibold text-blue-900 flex items-center gap-3 mb-6">
                    <User className="h-5 w-5 text-blue-600" />
                    Reporter Information
                  </h3>
                  
                  <div className="space-y-6">
                    <div>
                      <label className="text-sm font-medium text-blue-900 mb-3 block">Reporter Name *</label>
                      <Input
                        value={formData.reporterName}
                        onChange={(e) => updateFormData({ reporterName: e.target.value })}
                        placeholder="Enter reporter name"
                        className="h-14 w-full text-base border-2 border-blue-200 hover:border-blue-300 focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium text-blue-900 mb-3 block">Reporter Phone *</label>
                      <div className="flex w-full">
                        <div className="flex-shrink-0 bg-blue-100 px-4 py-3 rounded-l-lg border-2 border-r-0 border-blue-200 flex items-center justify-center">
                          <span className="text-blue-700 font-medium text-base">+44</span>
                        </div>
                        <Input
                          value={formData.reporterPhone.replace('+44', '')}
                          onChange={(e) => {
                            const value = e.target.value.replace(/\D/g, '');
                            if (value.length <= 10) {
                              updateFormData({ reporterPhone: '+44' + value });
                            }
                          }}
                          placeholder="7123456789"
                          className={`h-14 flex-1 text-base rounded-l-none border-l-0 border-2 border-blue-200 hover:border-blue-300 focus:border-blue-500 ${
                            formData.reporterPhone && !validatePhone(formData.reporterPhone) ? 'border-red-500' : ''
                          }`}
                        />
                      </div>
                      {formData.reporterPhone && !validatePhone(formData.reporterPhone) && (
                        <p className="text-red-500 text-sm mt-2">Please enter a valid UK phone number (10 digits after +44)</p>
                      )}
                    </div>

                    <div>
                      <label className="text-sm font-medium text-blue-900 mb-3 block">Reporter Email *</label>
                      <Input
                        value={formData.reporterEmail}
                        onChange={(e) => updateFormData({ reporterEmail: e.target.value })}
                        placeholder="Enter email address"
                        className={`h-14 w-full text-base border-2 border-blue-200 hover:border-blue-300 focus:border-blue-500 ${
                          formData.reporterEmail && !validateEmail(formData.reporterEmail) ? 'border-red-500' : ''
                        }`}
                      />
                      {formData.reporterEmail && !validateEmail(formData.reporterEmail) && (
                        <p className="text-red-500 text-sm mt-2">Please enter a valid email address</p>
                      )}
                    </div>

                    <div>
                      <label className="text-sm font-medium text-blue-900 mb-3 block">Relationship</label>
                      <Input
                        value={formData.reporterRelationship}
                        onChange={(e) => updateFormData({ reporterRelationship: e.target.value })}
                        placeholder="e.g., Facilities Manager"
                        className="h-14 w-full text-base border-2 border-blue-200 hover:border-blue-300 focus:border-blue-500"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className={`${UI_CONSTANTS.spacing.section}`}>
              <div className="text-center mb-6">
                <Briefcase className="mx-auto h-10 w-10 text-blue-600 mb-4" />
                <h2 className={`${UI_CONSTANTS.typography.title} text-lg`}>Job Details</h2>
                <p className={`${UI_CONSTANTS.typography.bodyMuted}`}>Describe the job and requirements</p>
              </div>

              <div className={`${UI_CONSTANTS.spacing.card.content}`}>
                <div className={`${UI_CONSTANTS.spacing.card.field}`}>
                  <label className={`${UI_CONSTANTS.typography.subtitle}`}>Job Description *</label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => updateFormData({ description: e.target.value })}
                    placeholder="Describe the job in detail..."
                    rows={4}
                    className={`${UI_CONSTANTS.form.textarea}`}
                  />
                </div>

                <div className={`${UI_CONSTANTS.spacing.card.field}`}>
                  <label className={`${UI_CONSTANTS.typography.subtitle}`}>Nature of Job *</label>
                  <Select value={formData.jobNature} onValueChange={(value) => updateFormData({ jobNature: value })}>
                    <SelectTrigger className={`h-10 ${UI_CONSTANTS.form.select}`}>
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

                <div className={`${UI_CONSTANTS.spacing.card.field}`}>
                  <label className={`${UI_CONSTANTS.typography.subtitle}`}>Job Owner</label>
                  <Input
                    value={formData.jobOwner}
                    onChange={(e) => updateFormData({ jobOwner: e.target.value })}
                    placeholder="Enter job owner/department (optional)"
                    className={`h-10 ${UI_CONSTANTS.form.input}`}
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="emergency"
                    checked={formData.isEmergency}
                    onCheckedChange={(checked) => updateFormData({ isEmergency: !!checked })}
                  />
                  <label htmlFor="emergency" className={`${UI_CONSTANTS.typography.subtitle}`}>
                    This is an emergency job
                  </label>
                </div>

                <div className={`${UI_CONSTANTS.spacing.card.field}`}>
                  <label className={`${UI_CONSTANTS.typography.subtitle}`}>Job Notes</label>
                  <Textarea
                    placeholder="Add any additional notes, special instructions, or important details about this job..."
                    rows={3}
                    className={`${UI_CONSTANTS.form.textarea}`}
                  />
                </div>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className={`${UI_CONSTANTS.spacing.section}`}>
              <div className="flex items-center justify-between mb-6">
                <div className="text-center flex-1">
                  <Settings className="mx-auto h-10 w-10 text-blue-600 mb-4" />
                  <h2 className={`${UI_CONSTANTS.typography.title} text-lg`}>Job Type & KPI</h2>
                  <p className={`${UI_CONSTANTS.typography.bodyMuted}`}>Configure job type and performance indicators</p>
                </div>
                <Button
                  onClick={() => setShowSiteNotesModal(true)}
                  variant="outline"
                  className={`ml-4 flex items-center gap-2 ${UI_CONSTANTS.button.outline}`}
                >
                  <StickyNote className="h-4 w-4" />
                  Site Notes
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className={`${UI_CONSTANTS.spacing.card.content}`}>
                  <div className={`${UI_CONSTANTS.spacing.card.field}`}>
                    <label className={`${UI_CONSTANTS.typography.subtitle}`}>Job Type *</label>
                    <Select value={formData.jobType} onValueChange={(value: 'OOH' | 'CallOut') => updateFormData({ jobType: value })}>
                      <SelectTrigger className={`h-10 ${UI_CONSTANTS.form.select}`}>
                        <SelectValue placeholder="Select job type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="OOH">Out of Hours (OOH)</SelectItem>
                        <SelectItem value="CallOut">Call Out</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className={`${UI_CONSTANTS.spacing.card.field}`}>
                    <label className={`${UI_CONSTANTS.typography.subtitle}`}>Primary Trade *</label>
                    <Select value={formData.primaryTrade} onValueChange={(value) => updateFormData({ primaryTrade: value })}>
                      <SelectTrigger className={`h-10 ${UI_CONSTANTS.form.select}`}>
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

                <div className={`${UI_CONSTANTS.spacing.card.content}`}>
                  <div className={`${UI_CONSTANTS.spacing.card.field}`}>
                    <label className={`${UI_CONSTANTS.typography.subtitle}`}>Response Time (minutes) *</label>
                    <Input
                      type="number"
                      value={formData.responseTime}
                      onChange={(e) => updateFormData({ responseTime: parseInt(e.target.value) || 60 })}
                      placeholder="Enter response time"
                      className={`h-10 ${UI_CONSTANTS.form.input}`}
                    />
                  </div>

                  <div className={`${UI_CONSTANTS.spacing.card.field}`}>
                    <label className={`${UI_CONSTANTS.typography.subtitle}`}>Priority *</label>
                    <Select value={formData.priority} onValueChange={(value: Job['priority']) => updateFormData({ priority: value })}>
                      <SelectTrigger className={`h-10 ${UI_CONSTANTS.form.select}`}>
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
                <h4 className={`${UI_CONSTANTS.typography.subtitle} text-blue-900 mb-2`}>SLA Times for {formData.priority} Priority</h4>
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
                  <p className={`${UI_CONSTANTS.typography.caption} text-blue-700 mt-2 font-medium`}>
                    ⚠️ Emergency job - Reduced SLA times applied
                  </p>
                )}
              </div>
            </div>
          )}

          {currentStep === 4 && (
            <div className={`${UI_CONSTANTS.spacing.section}`}>
              <div className="text-center mb-6">
                <Users className="mx-auto h-10 w-10 text-blue-600 mb-4" />
                <h2 className={`${UI_CONSTANTS.typography.title} text-lg`}>Engineer Selection</h2>
                <p className={`${UI_CONSTANTS.typography.bodyMuted}`}>Choose an available engineer for this job</p>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg mb-6">
                <h4 className={`${UI_CONSTANTS.typography.subtitle} text-blue-900 mb-2`}>Filtered Engineers ({formData.jobType})</h4>
                <p className={`${UI_CONSTANTS.typography.caption} text-blue-700`}>
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
                              Holiday
                            </Badge>
                          )}
                          {engineer.status === 'travel' && (
                            <Badge variant="secondary" className="text-xs">
                              Not Available
                            </Badge>
                          )}
                          {engineer.status === 'sick' && (
                            <Badge variant="destructive" className="text-xs">
                              <User className="h-3 w-3 mr-1" />
                              Sick Leave
                            </Badge>
                          )}
                          {engineer.status === 'training' && (
                            <Badge variant="outline" className="text-xs">
                              <Briefcase className="h-3 w-3 mr-1" />
                              Training
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

                            {/* Confirmation Checkbox */}
              {formData.selectedEngineer && (
                <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg mt-6">
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
            <div className={`${UI_CONSTANTS.spacing.section}`}>
              <div className="text-center mb-6">
                <CheckCircle className="mx-auto h-10 w-10 text-green-600 mb-4" />
                <h2 className={`${UI_CONSTANTS.typography.title} text-lg`}>Schedule & Allocation</h2>
                <p className={`${UI_CONSTANTS.typography.bodyMuted}`}>Set preferred date/time and allocate visit times</p>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg mb-6">
                <h3 className={`${UI_CONSTANTS.typography.title} mb-4`}>Job Summary</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className={`${UI_CONSTANTS.typography.bodyMuted}`}>Job Number:</span>
                    <span className={`${UI_CONSTANTS.typography.body} ml-2`}>{formData.jobNumber}</span>
                  </div>
                  <div>
                    <span className={`${UI_CONSTANTS.typography.bodyMuted}`}>Customer:</span>
                    <span className={`${UI_CONSTANTS.typography.body} ml-2`}>{formData.customer}</span>
                  </div>
                  <div>
                    <span className={`${UI_CONSTANTS.typography.bodyMuted}`}>Site:</span>
                    <span className={`${UI_CONSTANTS.typography.body} ml-2`}>{formData.site}</span>
                  </div>
                  <div>
                    <span className={`${UI_CONSTANTS.typography.bodyMuted}`}>Priority:</span>
                    <span className={`${UI_CONSTANTS.typography.body} ml-2`}>{formData.priority}</span>
                  </div>
                  <div>
                    <span className={`${UI_CONSTANTS.typography.bodyMuted}`}>Job Type:</span>
                    <span className={`${UI_CONSTANTS.typography.body} ml-2`}>{formData.jobType === 'OOH' ? 'Out of Hours' : 'Call Out'}</span>
                  </div>
                  <div>
                    <span className={`${UI_CONSTANTS.typography.bodyMuted}`}>Primary Trade:</span>
                    <span className={`${UI_CONSTANTS.typography.body} ml-2`}>{formData.primaryTrade}</span>
                  </div>
                </div>
                
                <div className="mt-4">
                  <span className={`${UI_CONSTANTS.typography.bodyMuted}`}>Description:</span>
                  <p className={`${UI_CONSTANTS.typography.body} mt-1`}>{formData.description}</p>
                </div>
              </div>

              <div className={`${UI_CONSTANTS.spacing.card.content}`}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div className={`${UI_CONSTANTS.spacing.card.field}`}>
                    <label className={`${UI_CONSTANTS.typography.subtitle}`}>Preferred Start Date & Time *</label>
                    <Input
                      type="datetime-local"
                      value={formData.preferredStartDateTime.toISOString().slice(0, 16)}
                      onChange={(e) => updateFormData({ preferredStartDateTime: new Date(e.target.value) })}
                      className={`w-full h-10 ${UI_CONSTANTS.form.input}`}
                    />
                    {isOutOfHours(formData.preferredStartDateTime) && (
                      <p className={`${UI_CONSTANTS.typography.caption} text-amber-600 mt-1 font-medium`}>
                        ⚠️ Out of Hours (OOH) may apply - Start time is outside 8am-5pm
                      </p>
                    )}
                  </div>
                  
                  <div className={`${UI_CONSTANTS.spacing.card.field}`}>
                    <label className={`${UI_CONSTANTS.typography.subtitle}`}>Preferred End Date & Time *</label>
                    <Input
                      type="datetime-local"
                      value={formData.preferredEndDateTime.toISOString().slice(0, 16)}
                      onChange={(e) => updateFormData({ preferredEndDateTime: new Date(e.target.value) })}
                      className={`w-full h-10 ${UI_CONSTANTS.form.input}`}
                    />
                    {isOutOfHours(formData.preferredEndDateTime) && (
                      <p className={`${UI_CONSTANTS.typography.caption} text-amber-600 mt-1 font-medium`}>
                        ⚠️ Out of Hours (OOH) may apply - End time is outside 8am-5pm
                      </p>
                    )}
                  </div>
                </div>

                {/* Target Attendance Date & Time */}
                <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg mb-4">
                  <h4 className={`${UI_CONSTANTS.typography.subtitle} text-blue-900 mb-3`}>Target Attendance Date & Time</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className={`${UI_CONSTANTS.spacing.card.field}`}>
                      <label className={`${UI_CONSTANTS.typography.subtitle} mb-2 block`}>Target Date *</label>
                      <Input
                        type="date"
                        value={formData.targetAttendanceDate ? formData.targetAttendanceDate.toISOString().split('T')[0] : ''}
                        onChange={(e) => updateFormData({ targetAttendanceDate: e.target.value ? new Date(e.target.value) : null })}
                        className={`h-12 ${UI_CONSTANTS.form.input} w-full`}
                      />
                    </div>
                    <div className={`${UI_CONSTANTS.spacing.card.field}`}>
                      <label className={`${UI_CONSTANTS.typography.subtitle} mb-2 block`}>Target Time *</label>
                      <Input
                        type="time"
                        value={formData.targetAttendanceTime || ''}
                        onChange={(e) => updateFormData({ targetAttendanceTime: e.target.value })}
                        className={`h-12 ${UI_CONSTANTS.form.input} w-full`}
                      />
                    </div>
                  </div>
                </div>

                {/* Allocated Visit Date & Time */}
                <div className="bg-green-50 border border-green-200 p-4 rounded-lg mb-4">
                  <h4 className={`${UI_CONSTANTS.typography.subtitle} text-green-900 mb-3`}>Allocated Visit Date & Time</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className={`${UI_CONSTANTS.spacing.card.field}`}>
                      <label className={`${UI_CONSTANTS.typography.subtitle} mb-2 block`}>Visit Date *</label>
                      <Input
                        type="date"
                        value={formData.allocatedVisitDate ? formData.allocatedVisitDate.toISOString().split('T')[0] : ''}
                        onChange={(e) => updateFormData({ allocatedVisitDate: e.target.value ? new Date(e.target.value) : null })}
                        className={`h-12 ${UI_CONSTANTS.form.input} w-full`}
                      />
                    </div>
                    <div className={`${UI_CONSTANTS.spacing.card.field}`}>
                      <label className={`${UI_CONSTANTS.typography.subtitle} mb-2 block`}>Visit Time *</label>
                      <Input
                        type="time"
                        value={formData.allocatedVisitTime || ''}
                        onChange={(e) => updateFormData({ allocatedVisitTime: e.target.value })}
                        className={`h-12 ${UI_CONSTANTS.form.input} w-full`}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
                <h4 className={`${UI_CONSTANTS.typography.subtitle} text-green-900 mb-2`}>Ready to Create Job</h4>
                <p className={`${UI_CONSTANTS.typography.caption} text-green-700`}>
                  All information has been collected. Click "Create Job" to finalize the job allocation.
                </p>
              </div>
            </div>
          )}
          
          <div className="flex justify-between mt-10 pt-8 border-t border-gray-200">
            <Button
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 1}
              className="px-6 py-3 h-12 text-base font-medium border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              <ArrowLeft size={18} className="mr-2" />
              Previous
            </Button>
            
            {currentStep === 2 && !formData.isEmergency && (
              <Button
                onClick={handleLogDraftJob}
                disabled={!isStepValid(currentStep)}
                variant="secondary"
                className="px-6 py-3 h-12 text-base font-medium bg-gray-100 text-gray-700 hover:bg-gray-200"
              >
                <FileText size={18} className="mr-2" />
                Log Draft Job
              </Button>
            )}
            
            {currentStep < 5 && (formData.isEmergency || currentStep !== 2) && (
              <Button
                onClick={nextStep}
                disabled={!isStepValid(currentStep)}
                className="px-6 py-3 h-12 text-base font-medium bg-blue-600 hover:bg-blue-700 text-white"
              >
                Next
                <ArrowRight size={18} className="ml-2" />
                <span className="ml-2 text-xs opacity-75">(N)</span>
              </Button>
            )}
            
            {currentStep === 5 && (
              <Button
                onClick={handleSubmit}
                disabled={!isStepValid(currentStep)}
                className="px-6 py-3 h-12 text-base font-medium bg-green-600 hover:bg-green-700 text-white"
              >
                <CheckCircle size={18} className="mr-2" />
                Create Job
                <span className="ml-2 text-xs opacity-75">(N)</span>
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Site Notes Modal */}
      {showSiteNotesModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-[70rem] w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">Site Notes</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowSiteNotesModal(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="space-y-4 mb-6">
              <div className="flex gap-2">
                <Input
                  value={newSiteNote}
                  onChange={(e) => setNewSiteNote(e.target.value)}
                  placeholder="Add a new site note..."
                  onKeyPress={(e) => e.key === 'Enter' && addSiteNote()}
                />
                <Button onClick={addSiteNote} size="sm">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="space-y-3">
              {siteNotes.map((note) => (
                <div key={note.id} className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-gray-900 mb-2">{note.text}</p>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span>By: {note.author}</span>
                        <span>{note.timestamp.toLocaleDateString('en-GB')} {note.timestamp.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteSiteNote(note.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-4 border-t">
              <Button onClick={() => setShowSiteNotesModal(false)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}



      {/* Engineer Details Modal */}
      {selectedEngineerDetails && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-lg w-full mx-4">
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
                      Holiday
                    </Badge>
                  )}
                  {selectedEngineerDetails.status === 'travel' && (
                    <Badge variant="secondary" className="text-xs">
                      Not Available
                    </Badge>
                  )}
                  {selectedEngineerDetails.status === 'sick' && (
                    <Badge variant="destructive" className="text-xs">
                      <User className="h-3 w-3 mr-1" />
                      Sick Leave
                    </Badge>
                  )}
                  {selectedEngineerDetails.status === 'training' && (
                    <Badge variant="outline" className="text-xs">
                      <Briefcase className="h-3 w-3 mr-1" />
                      Training
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

