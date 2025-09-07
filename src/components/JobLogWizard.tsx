
import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Job, Customer, Engineer } from '@/types/job';
import { mockEngineers, mockJobTrades, mockTags, generateJobNumber, mockSiteEngineersMapping, mockJobs } from '@/lib/jobUtils';
import { sendEngineerNotification } from '@/lib/engineerNotifications';
import { ArrowLeft, ArrowRight, CheckCircle, User, Briefcase, Settings, Users, Check, FileText, Phone, Clock, Calendar, X, Plus, Trash2, StickyNote, Building2 } from 'lucide-react';
import { UI_CONSTANTS } from '@/lib/ui-constants';
import { showNotification } from '@/components/ui/toast-notification';

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
  jobTitle: string;
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
  // Local storage keys - declare first
  const STORAGE_KEY = 'jobLogWizardData';
  const SITE_ENGINEERS_KEY = 'siteEngineersMapping';
  
  // Get the last saved step from local storage or default to step 1
  const [currentStep, setCurrentStep] = useState<WizardStep>(() => {
    const savedData = localStorage.getItem(STORAGE_KEY);
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        // If we have a saved step, use it (ensure it's a valid step number 1-5)
        if (parsed.currentStep && parsed.currentStep >= 1 && parsed.currentStep <= 5) {
          return parsed.currentStep as WizardStep;
        }
      } catch (error) {
        console.error('Error parsing saved step data:', error);
      }
    }
    return 1; // Default to step 1 if no saved data
  });
  const [selectedEngineerDetails, setSelectedEngineerDetails] = useState<Engineer | null>(null);
  const [showSiteNotesModal, setShowSiteNotesModal] = useState(false);
  const [siteNotes, setSiteNotes] = useState<SiteNote[]>([
    { id: '1', text: 'Site access via main gate - security code required', timestamp: new Date('2024-01-15T09:00:00'), author: 'Site Manager' },
    { id: '2', text: 'Parking available in visitor bays A1-A5', timestamp: new Date('2024-01-14T14:30:00'), author: 'Facilities Team' },
    { id: '3', text: 'Equipment room key available from reception', timestamp: new Date('2024-01-13T16:45:00'), author: 'Maintenance Lead' }
  ]);
  const [newSiteNote, setNewSiteNote] = useState('');
  
  
  // State for recent jobs
  const [recentJobs, setRecentJobs] = useState<Job[]>([]);
  
  // Validation functions
  const validatePhone = (phone: string): boolean => {
    if (!phone) return false;
    
    // Match phone numbers with or without formatting
    // Allows formats like: 07123456789, 555-123-4567, etc.
    const phoneRegex = /^[0-9()+\- ]{7,20}$/;
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

  const isStepValid = (step: WizardStep): boolean => {
    switch (step) {
      case 1: {
        // Only require customer, site, and reporter name
        // Phone and email are now optional
        const isValid = !!(formData.customer && formData.site && formData.reporterName);
        const hasPhone = !!formData.reporterPhone;
        const hasEmail = !!formData.reporterEmail;
        
        // If phone is provided, it must be valid
        if (hasPhone && !validatePhone(formData.reporterPhone)) {
          return false;
        }
        
        // If email is provided, it must be valid
        if (hasEmail && !validateEmail(formData.reporterEmail)) {
          return false;
        }
        
        return isValid;
      }
      case 2:
        return !!(formData.jobTitle && formData.description && formData.jobNature);
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

  const [formData, setFormData] = useState<JobFormData>(() => {
    // Load from local storage on component mount
    const savedData = localStorage.getItem(STORAGE_KEY);
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        // Convert date strings back to Date objects
        return {
          ...parsed,
          preferredStartDateTime: new Date(parsed.preferredStartDateTime || Date.now()),
          preferredEndDateTime: new Date(parsed.preferredEndDateTime || Date.now() + 2 * 60 * 60 * 1000),
          targetAttendanceDate: parsed.targetAttendanceDate ? new Date(parsed.targetAttendanceDate) : new Date(),
          allocatedVisitDate: parsed.allocatedVisitDate ? new Date(parsed.allocatedVisitDate) : new Date(),
        };
      } catch (error) {
        console.error('Error parsing saved form data:', error);
      }
    }
    
    // Default values
    return {
      customer: '',
      site: '',
      reporterName: '',
      reporterPhone: '',
      reporterEmail: '',
      reporterRelationship: '',
      jobTitle: '',
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
    };
  });

  const updateFormData = (updates: Partial<JobFormData>) => {
    setFormData(prev => {
      const newData = { ...prev, ...updates };
      // Save to local storage including current step and timestamp
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        ...newData,
        currentStep: currentStep,
        lastSaved: Date.now() // Add timestamp for when this was saved
      }));
      return newData;
    });
  };
  
  // Update localStorage whenever step changes
  useEffect(() => {
    // Save current step to localStorage
    const savedData = localStorage.getItem(STORAGE_KEY);
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        localStorage.setItem(STORAGE_KEY, JSON.stringify({
          ...parsed,
          currentStep: currentStep
        }));
      } catch (error) {
        console.error('Error updating step in localStorage:', error);
      }
    }
  }, [currentStep]);

  // Memoize site relevance calculation to prevent flickering
  const siteRelevanceMap = useMemo(() => {
    const relevanceMap = new Map<string, { frequency: number; label: string; color: string }>();
    
    // Pre-calculate all site relevances
    customers.forEach(customer => {
      customer.sites.forEach(site => {
        if (!relevanceMap.has(site)) {
          const siteJobs = mockJobs.filter(job => job.site === site).length;
          
          if (siteJobs >= 10) {
            relevanceMap.set(site, { frequency: siteJobs, label: 'Very Frequent', color: 'bg-slate-100 text-slate-800' });
          } else if (siteJobs >= 5) {
            relevanceMap.set(site, { frequency: siteJobs, label: 'Frequent', color: 'bg-blue-100 text-blue-800' });
          } else if (siteJobs >= 2) {
            relevanceMap.set(site, { frequency: siteJobs, label: 'Occasional', color: 'bg-slate-100 text-slate-800' });
          } else if (siteJobs === 1) {
            relevanceMap.set(site, { frequency: siteJobs, label: 'First Visit', color: 'bg-slate-100 text-slate-800' });
          } else {
            relevanceMap.set(site, { frequency: siteJobs, label: 'New Site', color: 'bg-slate-100 text-slate-800' });
          }
        }
      });
    });
    
    return relevanceMap;
  }, [customers, mockJobs]);

  // Memoize site options to prevent unnecessary re-renders
  const siteOptions = useMemo(() => {
    if (!customers.length) return [];
    
    if (formData.customer) {
      // If customer is selected, show only their sites
      const customer = customers.find(c => c.name === formData.customer);
      return customer?.sites?.map(site => ({
        value: site,
        label: site,
        relevance: siteRelevanceMap.get(site) || { frequency: 0, label: 'New Site', color: 'bg-slate-100 text-slate-800' }
      })) || [];
    } else {
      // If no customer selected, show ALL sites with their customer name
      return customers.flatMap(customer => 
        customer.sites.map(site => ({
          value: site,
          label: site,
          customer: customer.name,
          relevance: siteRelevanceMap.get(site) || { frequency: 0, label: 'New Site', color: 'bg-slate-100 text-slate-800' }
        }))
      );
    }
  }, [customers, formData.customer, siteRelevanceMap]);

  // Memoize customer options to prevent unnecessary re-renders
  const customerOptions = useMemo(() => {
    if (!customers.length) return [];
    
    return customers.map(customer => {
      const customerJobs = mockJobs.filter(job => job.customer === customer.name).length;
      let relevance;
      
      if (customerJobs >= 20) {
        relevance = { frequency: customerJobs, label: 'High Volume', color: 'bg-slate-100 text-slate-800' };
      } else if (customerJobs >= 10) {
        relevance = { frequency: customerJobs, label: 'Regular', color: 'bg-blue-100 text-blue-800' };
      } else if (customerJobs >= 5) {
        relevance = { frequency: customerJobs, label: 'Occasional', color: 'bg-slate-100 text-slate-800' };
      } else if (customerJobs >= 1) {
        relevance = { frequency: customerJobs, label: 'Returning', color: 'bg-slate-100 text-slate-800' };
      } else {
        relevance = { frequency: customerJobs, label: 'New Customer', color: 'bg-slate-100 text-slate-800' };
      }
      
      return {
        id: customer.id,
        name: customer.name,
        relevance
      };
    });
  }, [customers, mockJobs]);

  // Get site-specific engineers
  const getSiteEngineers = (site: string): Engineer[] => {
    if (!site) return [];

    // First try to get from mock data
    const siteEngineers = mockSiteEngineersMapping[site] || [];

    if (siteEngineers.length > 0) {
      // Filter engineers based on job type and availability
      return mockEngineers.filter(engineer => {
        const isSiteEngineer = siteEngineers.includes(engineer.name);
        if (formData.jobType === 'OOH') {
          return isSiteEngineer && (engineer.status === 'OOH' || engineer.status === 'On call');
        } else {
          return isSiteEngineer && engineer.status !== 'completed';
        }
      });
    }

    // Fallback to all available engineers if no site-specific mapping
    return mockEngineers.filter(engineer => {
      if (formData.jobType === 'OOH') {
        return engineer.status === 'OOH' || engineer.status === 'On call';
      } else {
        return engineer.status !== 'completed';
      }
    });
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
        // Get site-specific engineers or general available engineers
        const siteEngineers = formData.site ? getSiteEngineers(formData.site) : mockEngineers.filter(engineer => {
          if (formData.jobType === 'OOH') {
            return engineer.status === 'OOH' || engineer.status === 'On call';
          } else {
            return engineer.status !== 'completed';
          }
        });
        updateFormData({ availableEngineers: siteEngineers });

        // Show notification about available engineers
        if (siteEngineers.length > 0) {
          const siteText = formData.site ? `for ${formData.site}` : 'generally available';
          showNotification({
            type: 'success',
            title: 'Engineers Available',
            message: `${siteEngineers.length} engineer(s) available ${siteText}: ${siteEngineers.map(e => e.name).join(', ')}`,
            duration: 2000
          });
        } else {
          const siteText = formData.site ? `for ${formData.site}` : 'generally';
          showNotification({
            type: 'warning',
            title: 'No Engineers Available',
            message: `No engineers are currently available ${siteText}. Please check engineer availability.`,
            duration: 2000
          });
        }
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
    showNotification({
      type: 'info',
      title: 'Draft Job Created',
      message: `Draft job ${draftJob.jobNumber} has been saved for later completion`,
      duration: 5000
    });
    
    // Clear local storage after draft job creation
    localStorage.removeItem(STORAGE_KEY);
  };

  useEffect(() => {
    // Update recent jobs whenever site changes
    if (formData.site) {
      const siteJobs = mockJobs
        .filter(job => job.site === formData.site)
        .sort((a, b) => new Date(b.dateLogged).getTime() - new Date(a.dateLogged).getTime())
        .slice(0, 5);
      setRecentJobs(siteJobs);
    } else {
      setRecentJobs([]);
    }
  }, [formData.site]);

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
    showNotification({
      type: 'success',
      title: 'Job Created Successfully',
      message: `Job ${newJob.jobNumber} has been created and assigned to ${newJob.engineer}`,
      duration: 5000
    });
    
    // Clear local storage after successful job creation
    localStorage.removeItem(STORAGE_KEY);
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-6">
      {/* Draft Job Notification */}
      {localStorage.getItem(STORAGE_KEY) && (
        <div className="mb-4 p-4 bg-amber-50 border border-amber-200 rounded-lg shadow-sm max-w-md mx-auto">
          <div className="flex items-center gap-2 mb-2">
            <FileText className="h-5 w-5 text-amber-600" />
            <h3 className="font-medium text-amber-900">Draft Job In Progress</h3>
          </div>
          <p className="text-sm text-amber-800 mb-2">Resume your unfinished job creation</p>
          <div className="text-xs text-amber-700">
            Last edited: {new Date(JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}').lastSaved || Date.now()).toLocaleString()}
          </div>
        </div>
      )}
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
            <Button 
              variant="outline" 
              onClick={() => {
                // Clear local storage when canceling
                localStorage.removeItem(STORAGE_KEY);
                onCancel();
              }} 
              className={`${UI_CONSTANTS.button.outline} border-blue-300 text-blue-700 hover:bg-blue-50`}
            >
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
                      <Select
                        key="customer-select"
                        value={formData.customer}
                        onValueChange={(value) => {
                          updateFormData({ customer: value, site: '' });
                        }}
                      >
                        <SelectTrigger className="h-14 w-full text-base border-2 border-gray-200 hover:border-blue-300 focus:border-blue-500">
                          <SelectValue placeholder="Select customer" />
                        </SelectTrigger>
                        <SelectContent className="max-h-60">
                          {customerOptions.length > 0 ? customerOptions.map(customer => (
                            <SelectItem key={customer.id} value={customer.name}>
                              <div className="flex items-center justify-between w-full">
                                <span>{customer.name}</span>
                                <Badge className={`ml-2 text-xs ${customer.relevance.color}`}>
                                  {customer.relevance.label}
                                </Badge>
                              </div>
                            </SelectItem>
                          )) : (
                            <SelectItem value="no-customers" disabled>No customers available</SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                      {formData.customer && (
                        <div className="mt-2">
                          {(() => {
                            const customer = customerOptions.find(c => c.name === formData.customer);
                            const relevance = customer?.relevance || { frequency: 0, label: 'New Customer', color: 'bg-slate-100 text-slate-800' };
                            return (
                              <Badge className={`text-xs ${relevance.color}`}>
                                {relevance.label} ({relevance.frequency} previous jobs)
                              </Badge>
                            );
                          })()}
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-3 block">Site *</label>
                      <Select
                        key={`site-select-${formData.customer}`}
                        value={formData.site}
                        onValueChange={(value) => {
                          // Find customer for this site and update both site and customer
                          let foundCustomer = null;
                          
                          for (const customer of customers) {
                            if (customer.sites.includes(value)) {
                              foundCustomer = customer;
                              break;
                            }
                          }
                          
                          if (foundCustomer) {
                            // Update both site and customer
                            updateFormData({ 
                              site: value,
                              customer: foundCustomer.name 
                            });
                          } else {
                            updateFormData({ site: value });
                          }
                        }}
                      >
                        <SelectTrigger className="h-14 w-full text-base border-2 border-gray-200 hover:border-blue-300 focus:border-blue-500">
                          <SelectValue placeholder="Select site" />
                        </SelectTrigger>
                        <SelectContent className="max-h-60">
                          {siteOptions.length > 0 ? (
                            siteOptions.map(option => (
                              <SelectItem key={option.value} value={option.value}>
                                <div className="flex items-center justify-between w-full">
                                  <div className="flex flex-col">
                                    <span>{option.label}</span>
                                    {option.customer && (
                                      <span className="text-xs text-gray-500">{option.customer}</span>
                                    )}
                                  </div>
                                  <Badge className={`ml-2 text-xs ${option.relevance.color}`}>
                                    {option.relevance.label}
                                  </Badge>
                                </div>
                              </SelectItem>
                            ))
                          ) : (
                            <SelectItem value="no-sites" disabled>
                              {formData.customer ? 'No sites available for this customer' : 'No sites available'}
                            </SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                      {formData.site && (
                        <>
                          <div className="mt-2">
                            {(() => {
                              const relevance = siteRelevanceMap.get(formData.site) || { frequency: 0, label: 'New Site', color: 'bg-slate-100 text-slate-800' };
                              return (
                                <Badge className={`text-xs ${relevance.color}`}>
                                  {relevance.label} ({relevance.frequency} previous jobs)
                                </Badge>
                              );
                            })()}
                          </div>
                          
                          <div className="mt-4 border-t border-gray-200 pt-4">
                            <h4 className="text-sm font-medium text-gray-700 mb-2">Recent Jobs for {formData.site}</h4>
                            {(() => {
                              const siteJobs = mockJobs
                                .filter(job => job.site === formData.site)
                                .sort((a, b) => new Date(b.dateLogged).getTime() - new Date(a.dateLogged).getTime())
                                .slice(0, 5);
                                
                              if (siteJobs.length === 0) {
                                return <p className="text-xs text-gray-500">No recent jobs found for this site.</p>;
                              }
                              
                              return (
                                <div className="space-y-2 max-h-48 overflow-y-auto bg-gray-50 p-2 rounded-lg">
                                  {siteJobs.map(job => (
                                    <div key={job.id} className="border border-gray-200 rounded p-2 bg-white text-xs">
                                      <div className="flex justify-between items-center mb-1">
                                        <span className="font-medium">{job.jobNumber}</span>
                                        <Badge className="text-[10px]" variant="outline">{job.status}</Badge>
                                      </div>
                                      <p className="text-gray-700 truncate">{job.description}</p>
                                      <div className="flex justify-between items-center mt-1 text-gray-500">
                                        <span>{new Date(job.dateLogged).toLocaleDateString()}</span>
                                        <span>{job.priority}</span>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              );
                            })()}
                          </div>
                        </>
                      )}
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
                      <label className="text-sm font-medium text-blue-900 mb-3 block">Reporter Phone <span className="text-xs text-gray-500">(Optional)</span></label>
                      <div className="w-full">
                        <Input
                          value={formData.reporterPhone}
                          onChange={(e) => updateFormData({ reporterPhone: e.target.value })}
                          placeholder="Phone Number"
                          className={`h-14 w-full text-base border-2 border-blue-200 hover:border-blue-300 focus:border-blue-500 ${
                            formData.reporterPhone && !validatePhone(formData.reporterPhone) ? 'border-red-500' : ''
                          }`}
                        />
                      </div>
                      {formData.reporterPhone && !validatePhone(formData.reporterPhone) && (
                        <p className="text-red-500 text-sm mt-2">Please enter a valid international phone number or leave empty</p>
                      )}
                    </div>

                    <div>
                      <label className="text-sm font-medium text-blue-900 mb-3 block">Reporter Email <span className="text-xs text-gray-500">(Optional)</span></label>
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
                  <label className={`${UI_CONSTANTS.typography.subtitle}`}>Job Title *</label>
                  <Input
                    value={formData.jobTitle}
                    onChange={(e) => updateFormData({ jobTitle: e.target.value })}
                    placeholder="Enter a short, descriptive job title"
                    className={`h-10 ${UI_CONSTANTS.form.input}`}
                    maxLength={100}
                  />
                </div>

                <div className={`${UI_CONSTANTS.spacing.card.field}`}>
                  <label className={`${UI_CONSTANTS.typography.subtitle}`}>Job Description * <span className="text-xs text-gray-500">({1000 - formData.description.length} characters remaining)</span></label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => {
                      if (e.target.value.length <= 1000) {
                        updateFormData({ description: e.target.value });
                      }
                    }}
                    placeholder="Describe the job in detail... (max 1000 characters)"
                    rows={4}
                    className={`${UI_CONSTANTS.form.textarea} ${formData.description.length > 900 ? 'border-amber-300' : ''} ${formData.description.length > 950 ? 'border-red-300' : ''}`}
                    maxLength={1000}
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

