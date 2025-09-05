import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Job, JobAlert, CommunicationEvent, JobNote } from '@/types/job';
import { getStatusColor, getPriorityColor } from '@/lib/jobUtils';
import { UI_CONSTANTS, getCardClasses, getFormClasses, getButtonClasses, getIconClasses } from '@/lib/ui-constants';
import { 
  ArrowLeft, 
  Edit, 
  Save, 
  X, 
  AlertTriangle, 
  Clock, 
  User, 
  MapPin, 
  Phone, 
  Mail,
  Calendar,
  CheckCircle,
  XCircle,
  MessageSquare,
  Edit3,
  Briefcase,
  Wrench,
  FileText,
  Plus,
  Trash2,
  Eye,
  EyeOff,
  Send,
  Tag,
  Package,
  Receipt,
  FileText as FileInvoice,
  Play,
  Pause,
  Square,
  RefreshCw
} from 'lucide-react';
import { loadCommunicationFromStorage, saveCommunicationToStorage, loadNotesFromStorage, saveNotesToStorage } from '@/lib/jobUtils';
import { trackJobUpdate, trackStatusChange, trackAlertCreated, trackAlertResolved } from '@/lib/auditTrailUtils';

interface JobDetailPageProps {
  jobs: Job[];
  onJobUpdate: (updatedJob: Job) => void;
}

export default function JobDetailPage({ jobs, onJobUpdate }: JobDetailPageProps) {
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();
  const [job, setJob] = useState<Job | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedJob, setEditedJob] = useState<Job | null>(null);
  const [communications, setCommunications] = useState<CommunicationEvent[]>([]);
  const [notes, setNotes] = useState<JobNote[]>([]);
  const [showAddCommunication, setShowAddCommunication] = useState(false);
  const [showAddNote, setShowAddNote] = useState(false);
  const [newCommunication, setNewCommunication] = useState<Partial<CommunicationEvent>>({
    type: 'note',
    direction: 'outbound',
    from: 'Current User',
    to: '',
    content: '',
    status: 'sent',
    priority: 'medium',
    tags: [],
    requiresFollowUp: false
  });
  const [newNote, setNewNote] = useState<Partial<JobNote>>({
    content: '',
    type: 'general',
    visibility: 'internal',
    tags: [],
    requiresAction: false
  });
  const [isSyncing, setIsSyncing] = useState(false);

  // Load communications and notes from localStorage
  useEffect(() => {
    const savedCommunications = loadCommunicationFromStorage();
    const savedNotes = loadNotesFromStorage();
    
    if (jobId) {
      const jobCommunications = savedCommunications.filter(comm => comm.relatedJobId === jobId);
      const jobNotes = savedNotes.filter(note => note.jobId === jobId);
      setCommunications(jobCommunications);
      setNotes(jobNotes);
    }
  }, [jobId]);

  // Debug jobs prop changes
  useEffect(() => {
    console.log('JobDetailPage - jobs prop changed:', jobs);
  }, [jobs]);

  // Save communications and notes to localStorage
  useEffect(() => {
    if (communications.length > 0) {
      saveCommunicationToStorage(communications);
    }
  }, [communications]);

  useEffect(() => {
    if (notes.length > 0) {
      saveNotesToStorage(notes);
    }
  }, [notes]);

  useEffect(() => {
    const foundJob = jobs.find(j => j.id === jobId);
    if (foundJob) {
      setJob(foundJob);
      setEditedJob({ ...foundJob });
      
      // Auto-add communication for job creation/updates
      if (foundJob.dateLogged && foundJob.dateLogged > new Date(Date.now() - 60000)) {
        // Job was created in the last minute
        const creationComm: CommunicationEvent = {
          id: `auto-${Date.now()}`,
          timestamp: foundJob.dateLogged,
          type: 'note',
          direction: 'inbound',
          from: 'System',
          to: 'Current User',
          content: `Job ${foundJob.jobNumber} created via Job Log Wizard`,
          status: 'sent',
          priority: 'medium',
          tags: ['auto', 'creation'],
          relatedJobId: jobId,
          requiresFollowUp: false
        };
        setCommunications(prev => [creationComm, ...prev]);
      }
    }
  }, [jobId, jobs]);

  // Define what fields can be edited based on job status
  const getEditableFields = (status: Job['status']): (keyof Job)[] => {
    // Fields that can be edited regardless of status
    const alwaysEditable: (keyof Job)[] = ['description', 'jobNotes'];
    
    // Fields that can only be edited for new jobs
    const newJobEditable: (keyof Job)[] = [
      'customer', 'site', 'contact', 'reporter', 'priority', 'category',
      'jobType', 'targetCompletionTime', 'customAlerts', 'preferredAppointmentDate',
      'targetAttendanceDate', 'targetAttendanceTime', 'jobOwner', 'tags'
    ];
    
    // Fields that can be edited before job is allocated
    const preAllocationEditable: (keyof Job)[] = [
      'engineer', 'allocatedVisitDate', 'allocatedVisitTime'
    ];
    
    // Return appropriate fields based on status
    switch (status) {
      case 'new':
        return [...alwaysEditable, ...newJobEditable, ...preAllocationEditable];
      case 'allocated':
        return [...alwaysEditable, 'priority', 'engineer', 'allocatedVisitDate', 'allocatedVisitTime'];
      case 'attended':
      case 'awaiting_parts':
      case 'parts_to_fit':
        return [...alwaysEditable, 'priority', 'reason'];
      case 'completed':
      case 'costed':
      case 'reqs_invoice':
        return alwaysEditable;
      default:
        return alwaysEditable;
    }
  };
  
  // Check if a specific field can be edited
  const canEditField = (fieldName: keyof Job): boolean => {
    if (!job) return false;
    const editableFields = getEditableFields(job.status);
    return editableFields.includes(fieldName);
  };

  // Show restricted field warning
  const showRestrictedFieldWarning = (fieldName: string) => {
    showNotification({
      type: 'warning',
      title: 'Field Cannot Be Edited',
      message: `The ${fieldName} field cannot be edited when job status is '${job?.status}'. Contact your supervisor for assistance.`
    });
  };

  const handleSave = () => {
    if (editedJob && job) {
      // Check what changed and add appropriate communications
      const changes: string[] = [];
      
      if (editedJob.description !== job.description) {
        changes.push('Description updated');
      }
      if (editedJob.status !== job.status) {
        changes.push(`Status changed to ${editedJob.status}`);
      }
      if (editedJob.priority !== job.priority) {
        changes.push(`Priority changed to ${editedJob.priority}`);
      }
      if (editedJob.engineer !== job.engineer) {
        changes.push(`Engineer changed to ${editedJob.engineer}`);
      }
      
      // Add audit trail for changes
      if (changes.length > 0) {
        // Track job update in audit trail system
        const auditEvent = trackJobUpdate(editedJob, changes);
        setCommunications(prev => [auditEvent, ...prev]);
        
        // If status changed, add specific audit trail entry
        if (editedJob.status !== job.status) {
          const statusEvent = trackStatusChange(editedJob, job.status, editedJob.status);
          setCommunications(prev => [statusEvent, ...prev]);
        }
      }
      
      onJobUpdate(editedJob);
      setJob(editedJob);
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setEditedJob(job ? { ...job } : null);
    setIsEditing(false);
  };

  const addAlert = (type: JobAlert['type']) => {
    if (!editedJob) return;
    
    const newAlert: JobAlert = {
      id: `alert-${Date.now()}`,
      type,
      message: `Alert triggered for ${type.toLowerCase()} SLA`,
      timestamp: new Date(),
      acknowledged: false
    };
    
    // Track alert creation in audit trail
    const auditEvent = trackAlertCreated(editedJob, newAlert);
    setCommunications(prev => [auditEvent, ...prev]);

    const updatedJob = {
      ...editedJob,
      alerts: [...(editedJob.alerts || []), newAlert]
    };
    
    setEditedJob(updatedJob);
  };

  const acknowledgeAlert = (alertId: string) => {
    if (!editedJob) return;
    
    // Find the alert that's being acknowledged
    const alertToAcknowledge = editedJob.alerts?.find(alert => alert.id === alertId);
    
    const updatedJob = {
      ...editedJob,
      alerts: editedJob.alerts?.map(alert => 
        alert.id === alertId ? { ...alert, acknowledged: true, resolution: 'Alert acknowledged by operator', resolvedAt: new Date() } : alert
      ) || []
    };
    
    setEditedJob(updatedJob);
    
    // Track alert resolution in audit trail if alert was found
    if (alertToAcknowledge) {
      const resolvedAlert = { ...alertToAcknowledge, acknowledged: true, resolution: 'Alert acknowledged by operator', resolvedAt: new Date() };
      const auditEvent = trackAlertResolved(editedJob, resolvedAlert);
      setCommunications(prev => [auditEvent, ...prev]);
    }
  };

  const addCommunication = () => {
    if (newCommunication.content && newCommunication.to) {
      const communication: CommunicationEvent = {
        id: `comm-${Date.now()}`,
        timestamp: new Date(),
        type: newCommunication.type || 'note',
        direction: newCommunication.direction || 'outbound',
        from: newCommunication.from || 'Current User',
        to: newCommunication.to,
        content: newCommunication.content,
        status: 'sent',
        priority: newCommunication.priority || 'medium',
        tags: newCommunication.tags || [],
        relatedJobId: jobId,
        requiresFollowUp: newCommunication.requiresFollowUp || false,
        escalationLevel: newCommunication.escalationLevel,
        resolution: newCommunication.resolution,
        resolvedBy: newCommunication.resolvedBy,
        resolvedAt: newCommunication.resolvedAt
      };
      
      setCommunications(prev => [communication, ...prev]);
      
      // Auto-add communication for communication addition
      const commUpdate: CommunicationEvent = {
        id: `update-${Date.now()}`,
        timestamp: new Date(),
        type: 'status_update',
        direction: 'inbound',
        from: 'System',
        to: 'Current User',
        content: `Communication added: ${newCommunication.type} to ${newCommunication.to}`,
        status: 'sent',
        priority: 'medium',
        tags: ['auto', 'communication'],
        relatedJobId: jobId || '',
        requiresFollowUp: false
      };
      setCommunications(prev => [commUpdate, ...prev]);
      
      setNewCommunication({
        type: 'note',
        direction: 'outbound',
        from: 'Current User',
        to: '',
        content: '',
        status: 'sent',
        priority: 'medium',
        tags: [],
        requiresFollowUp: false
      });
      setShowAddCommunication(false);
    }
  };

  const addNote = () => {
    if (newNote.content) {
      const note: JobNote = {
        id: `note-${Date.now()}`,
        jobId: jobId || '',
        timestamp: new Date(),
        author: 'Current User',
        authorRole: 'Support Engineer',
        content: newNote.content,
        type: newNote.type || 'general',
        visibility: newNote.visibility || 'internal',
        tags: newNote.tags || [],
        requiresAction: newNote.requiresAction || false,
        actionRequired: newNote.actionRequired,
        actionBy: newNote.actionBy,
        actionDueDate: newNote.actionDueDate,
        status: 'active'
      };
      
      setNotes(prev => [note, ...prev]);
      
      // Auto-add communication for note addition
      const noteComm: CommunicationEvent = {
        id: `note-${Date.now()}`,
        timestamp: new Date(),
        type: 'note',
        direction: 'inbound',
        from: 'Current User',
        to: 'System',
        content: `Note added: ${newNote.content.substring(0, 50)}${newNote.content.length > 50 ? '...' : ''}`,
        status: 'sent',
        priority: 'medium',
        tags: ['auto', 'note'],
        relatedJobId: jobId || '',
        requiresFollowUp: false
      };
      setCommunications(prev => [noteComm, ...prev]);
      
      setNewNote({
        content: '',
        type: 'general',
        visibility: 'internal',
        tags: [],
        requiresAction: false
      });
      setShowAddNote(false);
    }
  };

  const deleteCommunication = (id: string) => {
    setCommunications(prev => prev.filter(comm => comm.id !== id));
  };

  const deleteNote = (id: string) => {
    setNotes(prev => prev.filter(note => note.id !== id));
  };

  const handleSyncWithMobile = async () => {
    setIsSyncing(true);
    
    // Simulate API call to sync with engineer mobile app
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Update job status based on engineer's mobile app data
    if (job) {
      const mobileStatuses = ['onsite', 'accepted', 'traveling', 'completed', 'awaiting_parts'];
      const randomStatus = mobileStatuses[Math.floor(Math.random() * mobileStatuses.length)];
      
      // Create a communication event for the sync
      const syncComm: CommunicationEvent = {
        id: `sync-${Date.now()}`,
        timestamp: new Date(),
        type: 'status_update',
        direction: 'inbound',
        from: 'Mobile App',
        to: 'System',
        content: `Synced with engineer mobile app - Status: ${randomStatus}`,
        status: 'sent',
        priority: 'medium',
        tags: ['auto', 'mobile-sync'],
        relatedJobId: jobId || '',
        requiresFollowUp: false
      };
      
      setCommunications(prev => [syncComm, ...prev]);
      
      // Update job status if it's different
      if (randomStatus !== job.status) {
        const updatedJob = { ...job, status: randomStatus as Job['status'] };
        setJob(updatedJob);
        // Don't call onJobUpdate here to prevent duplicate status updates
      }
    }
    
    setIsSyncing(false);
  };

  const getCommunicationIcon = (type: CommunicationEvent['type']) => {
    switch (type) {
      case 'call': return <Phone className="h-3 w-3 text-white" />;
      case 'email': return <Mail className="h-3 w-3 text-white" />;
      case 'sms': return <MessageSquare className="h-3 w-3 text-white" />;
      case 'note': return <FileText className="h-3 w-3 text-white" />;
      case 'status_update': return <Clock className="h-3 w-3 text-white" />;
      case 'escalation': return <AlertTriangle className="h-3 w-3 text-white" />;
      case 'resolution': return <CheckCircle className="h-3 w-3 text-white" />;
      case 'follow_up': return <Calendar className="h-3 w-3 text-white" />;
      default: return <FileText className="h-3 w-3 text-white" />;
    }
  };

  const getCommunicationColor = (type: CommunicationEvent['type'], priority: CommunicationEvent['priority']) => {
    if (priority === 'urgent') return 'bg-red-500';
    if (priority === 'high') return 'bg-orange-500';
    if (type === 'escalation') return 'bg-red-600';
    if (type === 'resolution') return 'bg-green-500';
    return 'bg-blue-500';
  };

  // Job Status Workflow Data
  const jobStatusStages = [
    {
      key: 'new',
      title: 'New Job',
      description: 'Job freshly logged and awaiting allocation',
      icon: <Square className="h-6 w-6" />,
      completedDate: null
    },
    {
      key: 'allocated',
      title: 'Allocated',
      description: 'Job assigned to engineer from back office',
      icon: <User className="h-6 w-6" />,
      completedDate: null
    },
    {
      key: 'attended',
      title: 'Attended',
      description: 'Engineer has travelled to site',
      icon: <Play className="h-6 w-6" />,
      completedDate: null
    },
    {
      key: 'awaiting_parts',
      title: 'Awaiting Parts',
      description: 'Parts required, purchase order raised',
      icon: <Package className="h-6 w-6" />,
      completedDate: null
    },
    {
      key: 'parts_to_fit',
      title: 'Parts to Fit',
      description: 'Parts delivered, ready for fitting',
      icon: <Wrench className="h-6 w-6" />,
      completedDate: null
    },
    {
      key: 'completed',
      title: 'Completed',
      description: 'Job finished by engineer',
      icon: <CheckCircle className="h-6 w-6" />,
      completedDate: null
    },
    {
      key: 'costed',
      title: 'Costed',
      description: 'Job costs reviewed and approved',
      icon: <Receipt className="h-6 w-6" />,
      completedDate: null
    },
    {
      key: 'reqs_invoice',
      title: 'Reqs. Invoice',
      description: 'Ready for invoicing process',
      icon: <FileInvoice className="h-6 w-6" />,
      completedDate: null
    }
  ];

  // Helper functions for job status workflow
  const getJobProgress = (): number => {
    const stageIndex = getCurrentStageIndex();
    return Math.round(((stageIndex + 1) / jobStatusStages.length) * 100);
  };

  const getCurrentStageIndex = (): number => {
    // Map job status to workflow stages
    const statusMap: Record<string, number> = {
      'new': 0,
      'allocated': 1,
      'attended': 2,
      'awaiting_parts': 3,
      'parts_to_fit': 4,
      'completed': 5,
      'costed': 6,
      'reqs_invoice': 7,
      'green': 5, // Completed status
      'amber': 2, // In process status
      'red': 1,   // Issue status
    };
    
    return statusMap[job.status] || 0;
  };

  const getCurrentStageTitle = (): string => {
    // Map job status to workflow stages
    const statusMap: Record<string, string> = {
      'new': 'New Job',
      'allocated': 'Allocated',
      'attended': 'Attended',
      'awaiting_parts': 'Awaiting Parts',
      'parts_to_fit': 'Parts to Fit',
      'completed': 'Completed',
      'costed': 'Costed',
      'reqs_invoice': 'Requires Invoicing',
      'green': 'Completed', // Completed status
      'amber': 'In Process', // In process status
      'red': 'Issue',   // Issue status
    };
    
    return statusMap[job.status] || 'Open';
  };

  const isStageCompleted = (stageKey: string): boolean => {
    const stageIndex = jobStatusStages.findIndex(s => s.key === stageKey);
    const currentIndex = getCurrentStageIndex();
    return stageIndex < currentIndex;
  };

  const isCurrentStage = (stageKey: string): boolean => {
    // Map job status to workflow stages
    const statusMap: Record<string, string> = {
      'new': 'new',
      'allocated': 'allocated',
      'attended': 'attended',
      'awaiting_parts': 'awaiting_parts',
      'parts_to_fit': 'parts_to_fit',
      'completed': 'completed',
      'costed': 'costed',
      'reqs_invoice': 'reqs_invoice',
      'green': 'completed', // Completed status
      'amber': 'attended', // In process status
      'red': 'allocated',   // Issue status
    };
    
    return statusMap[job.status] === stageKey;
  };

  const canMoveToPreviousStage = (): boolean => {
    const currentIndex = getCurrentStageIndex();
    return currentIndex > 0;
  };

  const canMoveToNextStage = (): boolean => {
    const currentIndex = getCurrentStageIndex();
    return currentIndex < jobStatusStages.length - 1;
  };

  const moveToPreviousStage = () => {
    if (canMoveToPreviousStage()) {
      const currentIndex = getCurrentStageIndex();
      const previousStage = jobStatusStages[currentIndex - 1];
      
      // Update the job status
      const updatedJob = { ...job, status: previousStage.key as Job['status'] };
      setJob(updatedJob);
      if (editedJob) {
        setEditedJob(updatedJob);
      }
      
      // Call the parent update function
      onJobUpdate(updatedJob);
      
      // Add a communication event for the status change
      const statusUpdate: CommunicationEvent = {
        id: `status-${Date.now()}`,
        type: 'status_update',
        direction: 'outbound',
        from: 'System',
        to: 'All Users',
        content: `Job status changed to: ${previousStage.title}`,
        status: 'sent',
        priority: 'medium',
        tags: ['status_change', 'workflow'],
        requiresFollowUp: false,
        timestamp: new Date(),
        relatedJobId: job.id
      };
      
      setCommunications(prev => [statusUpdate, ...prev]);
    }
  };

  const moveToNextStage = () => {
    if (canMoveToNextStage()) {
      const currentIndex = getCurrentStageIndex();
      const nextStage = jobStatusStages[currentIndex + 1];
      
      // Update the job status
      const updatedJob = { ...job, status: nextStage.key as Job['status'] };
      setJob(updatedJob);
      if (editedJob) {
        setEditedJob(updatedJob);
      }
      
      // Call the parent update function
      onJobUpdate(updatedJob);
      
      // Add a communication event for the status change
      const statusUpdate: CommunicationEvent = {
        id: `status-${Date.now()}`,
        type: 'status_update',
        direction: 'outbound',
        from: 'System',
        to: 'All Users',
        content: `Job status changed to: ${nextStage.title}`,
        status: 'sent',
        priority: 'medium',
        tags: ['status_change', 'workflow'],
        requiresFollowUp: false,
        timestamp: new Date(),
        relatedJobId: job.id
      };
      
      setCommunications(prev => [statusUpdate, ...prev]);
    }
  };

  if (!job) {
    console.log('JobDetailPage - Job not found, jobId:', jobId, 'jobs:', jobs);
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Job Not Found</h1>
          <p className="text-gray-600 mb-4">Job ID: {jobId}</p>
          <p className="text-gray-600 mb-4">Available jobs: {jobs.length}</p>
          <Button onClick={() => navigate('/')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  const currentJob = isEditing ? editedJob : job;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className={UI_CONSTANTS.layout.container}>
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <Button 
              variant="outline" 
              onClick={() => navigate('/')}
              className="flex items-center"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{job.jobNumber}</h1>
              <p className="text-muted-foreground">{job.description}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {!isEditing ? (
              <Button onClick={() => {
                setIsEditing(true);
                // Show toast explaining edit limitations
                showNotification({
                  type: 'info',
                  title: 'Job Editing Restrictions',
                  message: `Some fields may be locked based on job status (${job.status}). Only authorized fields can be modified.`
                });
              }}>
                <Edit className="mr-2 h-4 w-4" />
                Edit Job
              </Button>
            ) : (
              <>
                <Button variant="outline" onClick={handleCancel}>
                  <X className="mr-2 h-4 w-4" />
                  Cancel
                </Button>
                <Button onClick={handleSave}>
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Main Content - Horizontal Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-7xl mx-auto">
          {/* Job Information - Left Column */}
          <div className="space-y-6">
            {/* Basic Information */}
            <Card className={getCardClasses('hover')}>
              <CardHeader className={UI_CONSTANTS.card.header}>
                <div className="flex items-center justify-between">
                  <CardTitle className={`flex items-center ${UI_CONSTANTS.typography.title}`}>
                    <Briefcase className={`${UI_CONSTANTS.spacing.icon} ${getIconClasses('md', 'primary')}`} />
                    Job Information
                  </CardTitle>
                  <Button
                    onClick={handleSyncWithMobile}
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2 border-green-300 text-green-700 hover:bg-green-50"
                  >
                    <RefreshCw className={`h-4 w-4 ${isSyncing ? 'animate-spin' : ''}`} />
                    {isSyncing ? 'Syncing...' : 'Sync Mobile'}
                  </Button>
                </div>
              </CardHeader>
              <CardContent className={UI_CONSTANTS.card.content}>
                <div className={`grid grid-cols-1 md:grid-cols-2 ${UI_CONSTANTS.spacing.card.grid}`}>
                  <div className={UI_CONSTANTS.spacing.card.field}>
                    <label className={UI_CONSTANTS.typography.subtitle}>Customer</label>
                    {isEditing ? (
                      <Input 
                        value={currentJob?.customer || ''} 
                        onChange={(e) => {
                          if (canEditField('customer')) {
                            setEditedJob(prev => prev ? { ...prev, customer: e.target.value } : null)
                          } else {
                            showRestrictedFieldWarning('Customer');
                          }
                        }}
                        className={`${getFormClasses('input')} ${!canEditField('customer') ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                        disabled={!canEditField('customer')}
                      />
                    ) : (
                      <p className={UI_CONSTANTS.typography.body}>{job.customer}</p>
                    )}
                  </div>
                  <div className={UI_CONSTANTS.spacing.card.field}>
                    <label className={UI_CONSTANTS.typography.subtitle}>Site</label>
                    {isEditing ? (
                      <Input 
                        value={currentJob?.site || ''} 
                        onChange={(e) => {
                          if (canEditField('site')) {
                            setEditedJob(prev => prev ? { ...prev, site: e.target.value } : null)
                          } else {
                            showRestrictedFieldWarning('Site');
                          }
                        }}
                        className={`${getFormClasses('input')} ${!canEditField('site') ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                        disabled={!canEditField('site')}
                      />
                    ) : (
                      <p className={UI_CONSTANTS.typography.body}>{job.site}</p>
                    )}
                  </div>
                  <div className={UI_CONSTANTS.spacing.card.field}>
                    <label className={UI_CONSTANTS.typography.subtitle}>Job Status</label>
                    {isEditing ? (
                      <Select 
                        value={currentJob?.status || 'new'} 
                        onValueChange={(value) => {
                          // Status can only be changed by supervisors or specific workflow actions
                          // For normal edits, we'll show a warning
                          showNotification({
                            type: 'warning',
                            title: 'Status Change Restricted',
                            message: 'Job status can only be changed through workflow actions or by supervisors. Use Previous/Next buttons for status transitions.'
                          });
                        }}
                        disabled={true}
                      >
                        <SelectTrigger className={getFormClasses('select')}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="new">New Job</SelectItem>
                          <SelectItem value="allocated">Allocated to Engineer</SelectItem>
                          <SelectItem value="attended">Engineer Accepted</SelectItem>
                          <SelectItem value="awaiting_parts">Awaiting Parts</SelectItem>
                          <SelectItem value="parts_to_fit">Parts to Fit</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                          <SelectItem value="costed">Costed</SelectItem>
                          <SelectItem value="reqs_invoice">Requires Invoice</SelectItem>
                          <SelectItem value="green">On Track</SelectItem>
                          <SelectItem value="amber">Attention Required</SelectItem>
                          <SelectItem value="red">Critical Issue</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <div className="mt-1">
                        <Badge className="bg-gray-100 text-gray-800 border-gray-200 px-2 py-1 text-xs font-medium border">
                          {job.status === 'new' ? 'New Job' : 
                           job.status === 'allocated' ? 'Allocated to Engineer' : 
                           job.status === 'awaiting_parts' ? 'Awaiting Parts' : 
                           job.status === 'parts_to_fit' ? 'Parts to Fit' : 
                           job.status === 'attended' ? 'Engineer Accepted' : 
                           job.status === 'completed' ? 'Completed' : 
                           job.status === 'costed' ? 'Costed' : 
                           job.status === 'reqs_invoice' ? 'Requires Invoice' : 
                           job.status === 'green' ? 'On Track' : 
                           job.status === 'amber' ? 'Attention Required' : 
                           job.status === 'red' ? 'Critical Issue' : 
                           String(job.status).charAt(0).toUpperCase() + String(job.status).slice(1).replace(/_/g, ' ')}
                        </Badge>
                      </div>
                    )}
                  </div>
                  
                  <div className={UI_CONSTANTS.spacing.card.field}>
                    <label className={UI_CONSTANTS.typography.subtitle}>Visit Status</label>
                    <div className="mt-1">
                      <Badge className="bg-blue-100 text-blue-800 border-blue-200 px-2 py-1 text-xs font-medium border">
                        {(() => {
                          if (job.dateCompleted) return 'Visit Completed';
                          if (job.dateOnSite) return 'On Site';
                          if (job.dateAccepted) return 'En Route';
                          if (job.status === 'allocated') return 'Pending Acceptance';
                          return 'Not Started';
                        })()}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className={UI_CONSTANTS.spacing.card.field}>
                    <label className={UI_CONSTANTS.typography.subtitle}>Engineer</label>
                    {isEditing ? (
                      <Input 
                        value={currentJob?.engineer || ''} 
                        onChange={(e) => setEditedJob(prev => prev ? { ...prev, engineer: e.target.value } : null)}
                        className={getFormClasses('input')}
                      />
                    ) : (
                      <div className={`flex items-center justify-between ${UI_CONSTANTS.spacing.element}`}>
                        <div className="flex items-center gap-2">
                          <User className={getIconClasses('sm', 'primary')} />
                          <span className={UI_CONSTANTS.typography.body}>{job.engineer}</span>
                        </div>

                      </div>
                    )}
                  </div>

                  <div className={UI_CONSTANTS.spacing.card.field}>
                    <label className={UI_CONSTANTS.typography.subtitle}>Priority</label>
                    {isEditing ? (
                      <Select 
                        value={currentJob?.priority || 'Medium'} 
                        onValueChange={(value) => setEditedJob(prev => prev ? { ...prev, priority: value as Job['priority'] } : null)}
                      >
                        <SelectTrigger className={getFormClasses('select')}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Low">Low</SelectItem>
                          <SelectItem value="Medium">Medium</SelectItem>
                          <SelectItem value="High">High</SelectItem>
                          <SelectItem value="Critical">Critical</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <div className="mt-2">
                        <Badge className={`${getPriorityColor(job.priority)} ${UI_CONSTANTS.badge.base}`}>
                          {job.priority}
                        </Badge>
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Category</label>
                    {isEditing ? (
                      <Select 
                        value={currentJob?.category || 'General'} 
                        onValueChange={(value) => setEditedJob(prev => prev ? { ...prev, category: value as Job['category'] } : null)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Electrical">Electrical</SelectItem>
                          <SelectItem value="Mechanical">Mechanical</SelectItem>
                          <SelectItem value="Plumbing">Plumbing</SelectItem>
                          <SelectItem value="HVAC">HVAC</SelectItem>
                          <SelectItem value="General">General</SelectItem>
                          <SelectItem value="Fire Safety">Fire Safety</SelectItem>
                          <SelectItem value="Security Systems">Security Systems</SelectItem>
                          <SelectItem value="Painting">Painting</SelectItem>
                          <SelectItem value="Flooring">Flooring</SelectItem>
                          <SelectItem value="Roofing">Roofing</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <p className="text-gray-900">{job.category}</p>
                    )}
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Start Date</label>
                    {isEditing ? (
                      <Input 
                        type="date"
                        value={currentJob?.startDate ? currentJob.startDate.toISOString().split('T')[0] : ''} 
                        onChange={(e) => setEditedJob(prev => prev ? { ...prev, startDate: e.target.value ? new Date(e.target.value) : null } : null)}
                      />
                    ) : (
                      <p className="text-gray-900">{job.startDate ? job.startDate.toLocaleDateString() : 'Not set'}</p>
                    )}
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">End Date</label>
                    {isEditing ? (
                      <Input 
                        type="date"
                        value={currentJob?.endDate ? currentJob.endDate.toISOString().split('T')[0] : ''} 
                        onChange={(e) => setEditedJob(prev => prev ? { ...prev, endDate: e.target.value ? new Date(e.target.value) : null } : null)}
                      />
                    ) : (
                      <p className="text-gray-900">{job.endDate ? job.endDate.toLocaleDateString() : 'Not set'}</p>
                    )}
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Start Time</label>
                    {isEditing ? (
                      <Input 
                        type="time"
                        value={currentJob?.startDate ? currentJob.startDate.toTimeString().slice(0, 5) : ''} 
                        onChange={(e) => {
                          if (currentJob?.startDate) {
                            const [hours, minutes] = e.target.value.split(':');
                            const newDate = new Date(currentJob.startDate);
                            newDate.setHours(parseInt(hours), parseInt(minutes));
                            setEditedJob(prev => prev ? { ...prev, startDate: newDate } : null);
                          }
                        }}
                      />
                    ) : (
                      <p className="text-gray-900">{job.startDate ? job.startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Not set'}</p>
                    )}
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">End Time</label>
                    {isEditing ? (
                      <Input 
                        type="time"
                        value={currentJob?.endDate ? currentJob.endDate.toTimeString().slice(0, 5) : ''} 
                        onChange={(e) => {
                          if (currentJob?.endDate) {
                            const [hours, minutes] = e.target.value.split(':');
                            const newDate = new Date(currentJob.endDate);
                            newDate.setHours(parseInt(hours), parseInt(minutes));
                            setEditedJob(prev => prev ? { ...prev, endDate: newDate } : null);
                          }
                        }}
                      />
                    ) : (
                      <p className="text-gray-900">{job.endDate ? job.endDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Not set'}</p>
                    )}
                  </div>
                  
                  {/* Target Attendance Date & Time */}
                  <div>
                    <label className="text-sm font-medium text-gray-700">Target Attendance Date</label>
                    {isEditing ? (
                      <Input 
                        type="date"
                        value={currentJob?.targetAttendanceDate ? currentJob.targetAttendanceDate.toISOString().split('T')[0] : ''} 
                        onChange={(e) => setEditedJob(prev => prev ? { ...prev, targetAttendanceDate: e.target.value ? new Date(e.target.value) : null } : null)}
                      />
                    ) : (
                      <p className="text-gray-900">{job.targetAttendanceDate ? job.targetAttendanceDate.toLocaleDateString() : 'Not set'}</p>
                    )}
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Target Attendance Time</label>
                    {isEditing ? (
                      <Input 
                        type="time"
                        value={currentJob?.targetAttendanceTime || ''} 
                        onChange={(e) => setEditedJob(prev => prev ? { ...prev, targetAttendanceTime: e.target.value } : null)}
                      />
                    ) : (
                      <p className="text-gray-900">{job.targetAttendanceTime || 'Not set'}</p>
                    )}
                  </div>
                  
                  {/* Allocated Visit Date & Time */}
                  <div>
                    <label className="text-sm font-medium text-gray-700">Allocated Visit Date</label>
                    {isEditing ? (
                      <Input 
                        type="date"
                        value={currentJob?.allocatedVisitDate ? currentJob.allocatedVisitDate.toISOString().split('T')[0] : ''} 
                        onChange={(e) => setEditedJob(prev => prev ? { ...prev, allocatedVisitDate: e.target.value ? new Date(e.target.value) : null } : null)}
                      />
                    ) : (
                      <p className="text-gray-900">{job.allocatedVisitDate ? job.allocatedVisitDate.toLocaleDateString() : 'Not set'}</p>
                    )}
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Allocated Visit Time</label>
                    {isEditing ? (
                      <Input 
                        type="time"
                        value={currentJob?.allocatedVisitTime || ''} 
                        onChange={(e) => setEditedJob(prev => prev ? { ...prev, allocatedVisitTime: e.target.value } : null)}
                      />
                    ) : (
                      <p className="text-gray-900">{job.allocatedVisitTime || 'Not set'}</p>
                    )}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Description</label>
                  {isEditing ? (
                    <Textarea 
                      value={currentJob?.description || ''} 
                      onChange={(e) => setEditedJob(prev => prev ? { ...prev, description: e.target.value } : null)}
                      rows={3}
                    />
                  ) : (
                    <p className="text-gray-900">{job.description}</p>
                  )}
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Job Notes</label>
                  {isEditing ? (
                    <Textarea 
                      value={currentJob?.jobNotes || ''} 
                      onChange={(e) => setEditedJob(prev => prev ? { ...prev, jobNotes: e.target.value } : null)}
                      rows={4}
                      placeholder="Add any additional notes about the job..."
                    />
                  ) : (
                    <p className="text-gray-900">{job.jobNotes || 'No notes added'}</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Reporter Details */}
            <Card className={getCardClasses('hover')}>
              <CardHeader className={UI_CONSTANTS.card.header}>
                <CardTitle className={`flex items-center ${UI_CONSTANTS.typography.title}`}>
                  <User className={`${UI_CONSTANTS.spacing.icon} ${getIconClasses('md', 'primary')}`} />
                  Reporter Details
                </CardTitle>
              </CardHeader>
              <CardContent className={UI_CONSTANTS.card.content}>
                <div className={`grid grid-cols-1 md:grid-cols-2 ${UI_CONSTANTS.spacing.card.grid}`}>
                  <div className={UI_CONSTANTS.spacing.card.field}>
                    <label className={UI_CONSTANTS.typography.subtitle}>Reporter Name</label>
                    {isEditing ? (
                      <Input 
                        value={currentJob?.reporter.name || ''} 
                        onChange={(e) => setEditedJob(prev => prev ? { 
                          ...prev, 
                          reporter: { ...prev.reporter, name: e.target.value }
                        } : null)}
                        className={getFormClasses('input')}
                      />
                    ) : (
                      <div className={`flex items-center ${UI_CONSTANTS.spacing.element}`}>
                        <User className={getIconClasses('sm', 'primary')} />
                        <span className={UI_CONSTANTS.typography.body}>{job.reporter.name}</span>
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Phone</label>
                    {isEditing ? (
                      <Input 
                        value={currentJob?.reporter.number || ''} 
                        onChange={(e) => setEditedJob(prev => prev ? { 
                          ...prev, 
                          reporter: { ...prev.reporter, number: e.target.value }
                        } : null)}
                      />
                    ) : (
                      <p className="text-gray-900">{job.reporter.number}</p>
                    )}
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Email</label>
                    {isEditing ? (
                      <Input 
                        value={currentJob?.reporter.email || ''} 
                        onChange={(e) => setEditedJob(prev => prev ? { 
                          ...prev, 
                          reporter: { ...prev.reporter, email: e.target.value }
                        } : null)}
                      />
                    ) : (
                      <p className="text-gray-900">{job.reporter.email}</p>
                    )}
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Relationship</label>
                    {isEditing ? (
                      <Input 
                        value={currentJob?.reporter.relationship || ''} 
                        onChange={(e) => setEditedJob(prev => prev ? { 
                          ...prev, 
                          reporter: { ...prev.reporter, relationship: e.target.value }
                        } : null)}
                      />
                    ) : (
                      <p className="text-gray-900">{job.reporter.relationship}</p>
                    )}
                  </div>
                  <div className="col-span-2">
                    <label className="text-sm font-medium text-gray-700">Report Time</label>
                    <p className="text-gray-900">{job.dateLogged ? new Date(job.dateLogged).toLocaleString() : 'Not recorded'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <Card className={getCardClasses('hover')}>
              <CardHeader className={UI_CONSTANTS.card.header}>
                <CardTitle className={`flex items-center ${UI_CONSTANTS.typography.title}`}>
                  <Phone className={`${UI_CONSTANTS.spacing.icon} ${getIconClasses('md', 'primary')}`} />
                  Contact Information
                </CardTitle>
              </CardHeader>
              <CardContent className={UI_CONSTANTS.card.content}>
                <div className={`grid grid-cols-1 md:grid-cols-2 ${UI_CONSTANTS.spacing.card.grid}`}>
                  <div className={UI_CONSTANTS.spacing.card.field}>
                    <label className={UI_CONSTANTS.typography.subtitle}>Contact Name</label>
                    {isEditing ? (
                      <Input 
                        value={currentJob?.contact.name || ''} 
                        onChange={(e) => setEditedJob(prev => prev ? { 
                          ...prev, 
                          contact: { ...prev.contact, name: e.target.value }
                        } : null)}
                        className={getFormClasses('input')}
                      />
                    ) : (
                      <div className={`flex items-center ${UI_CONSTANTS.spacing.element}`}>
                        <User className={getIconClasses('sm', 'primary')} />
                        <span className={UI_CONSTANTS.typography.body}>{job.contact.name}</span>
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Phone</label>
                    {isEditing ? (
                      <Input 
                        value={currentJob?.contact.number || ''} 
                        onChange={(e) => setEditedJob(prev => prev ? { 
                          ...prev, 
                          contact: { ...prev.contact, number: e.target.value }
                        } : null)}
                      />
                    ) : (
                      <p className="text-gray-900">{job.contact.number}</p>
                    )}
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Email</label>
                    {isEditing ? (
                      <Input 
                        value={currentJob?.contact.email || ''} 
                        onChange={(e) => setEditedJob(prev => prev ? { 
                          ...prev, 
                          contact: { ...prev.contact, email: e.target.value }
                        } : null)}
                      />
                    ) : (
                      <p className="text-gray-900">{job.contact.email}</p>
                    )}
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Relationship</label>
                    {isEditing ? (
                      <Input 
                        value={currentJob?.contact.relationship || ''} 
                        onChange={(e) => setEditedJob(prev => prev ? { 
                          ...prev, 
                          contact: { ...prev.contact, relationship: e.target.value }
                        } : null)}
                      />
                    ) : (
                      <p className="text-gray-900">{job.contact.relationship}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Audit Trail and Alerts - Right Column */}
          <div className="space-y-6">
            {/* Alerts Container - Moved to top */}
            {/* Recent Jobs from Same Site */}
            <Card className="border-green-200 bg-green-50">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center justify-between text-lg text-green-900">
                  <div className="flex items-center gap-2">
                    <Briefcase className="h-5 w-5 text-green-600" />
                    Recent Jobs at {job.site}
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                {(() => {
                  // Get recent jobs from the same site, excluding current job
                  const siteJobs = jobs
                    .filter(j => j.site === job.site && j.id !== job.id)
                    .sort((a, b) => new Date(b.dateLogged).getTime() - new Date(a.dateLogged).getTime())
                    .slice(0, 5);
                  
                  if (siteJobs.length === 0) {
                    return (
                      <div className="text-center py-4">
                        <p className="text-sm text-green-700">No other jobs found at this site.</p>
                      </div>
                    );
                  }
                  
                  return (
                    <div className="space-y-2 max-h-[300px] overflow-y-auto">
                      {siteJobs.map(j => (
                        <div 
                          key={j.id} 
                          className="p-3 border border-green-200 rounded-lg bg-white hover:bg-green-50 cursor-pointer"
                          onClick={() => navigate(`/job/${j.id}`)}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-medium text-green-900">{j.jobNumber}</span>
                            <Badge className={`${getStatusColor(j.status)} px-2 py-0.5 text-xs`}>
                              {j.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 mb-2 line-clamp-2">{j.description}</p>
                          <div className="flex items-center justify-between text-xs text-gray-500">
                            <span>{new Date(j.dateLogged).toLocaleDateString()}</span>
                            <Badge variant="outline" className="text-xs">{j.priority}</Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </CardContent>
            </Card>

            {/* Alerts Section */}
            <Card className="border-red-200 bg-red-50">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center justify-between text-lg text-red-900">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-red-600" />
                    Alerts
                  </div>
                  {isEditing && (
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => addAlert('ACCEPTED')}
                      className="border-red-300 text-red-700 hover:bg-red-100"
                    >
                      Add Alert
                    </Button>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                {currentJob?.alerts && currentJob.alerts.length > 0 ? (
                  <div className="space-y-3">
                    {currentJob.alerts.map((alert) => (
                      <div 
                        key={alert.id}
                        className={`p-3 rounded-lg border ${
                          alert.acknowledged 
                            ? 'bg-white border-gray-200' 
                            : 'bg-red-100 border-red-300'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-sm text-red-900">{alert.type}</p>
                            <p className="text-xs text-red-700">{alert.message}</p>
                            <p className="text-xs text-red-600">
                              {alert.timestamp.toLocaleString()}
                            </p>
                          </div>
                          {!alert.acknowledged && isEditing && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => acknowledgeAlert(alert.id)}
                              className="border-red-300 text-red-700 hover:bg-red-100"
                            >
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                          )}
                          {alert.acknowledged && (
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-600" />
                    <p className="text-sm text-green-700 font-medium">No Active Alerts</p>
                    <p className="text-xs text-green-600">All systems running smoothly</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Audit Trail - Renamed from Communications */}
            <Card className="border-blue-200 bg-blue-50">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center justify-between text-lg text-blue-900">
                  <div className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-blue-600" />
                    Audit Trail
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowAddCommunication(true)}
                      className="border-blue-300 text-blue-700 hover:bg-blue-100"
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add Communication
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowAddNote(true)}
                      className="border-blue-300 text-blue-700 hover:bg-blue-100"
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add Note
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0 space-y-4">


                {/* Recent Activity - Enhanced to show all job details, notes, dates, times */}
                {/* Audit Trail Content */}
                <div className="bg-white p-3 rounded-lg border border-blue-200">
                  <h4 className="text-sm font-semibold text-blue-900 mb-3">Audit Trail</h4>
                  <div className="space-y-3 max-h-[600px] overflow-y-auto">
                    {/* Job Creation/Update Events */}
                    {communications
                      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                      .map((item) => (
                        <div key={item.id} className="flex items-start gap-3 p-2 bg-gray-50 rounded text-xs">
                          <div className={`w-2 h-2 rounded-full mt-1.5 ${
                            item.type === 'escalation' ? 'bg-red-500' :
                            item.type === 'resolution' ? 'bg-green-500' :
                            item.type === 'note' ? 'bg-blue-500' :
                            item.type === 'status_update' ? 'bg-orange-500' :
                            'bg-gray-500'
                          }`}></div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium text-gray-900 capitalize">
                                {item.type.replace('_', ' ')}
                              </span>
                              {item.tags.includes('auto') && (
                                <span className="px-1.5 py-0.5 bg-blue-100 text-blue-700 text-xs rounded">Auto</span>
                              )}
                            </div>
                            <p className="text-gray-700 mb-1">{item.content}</p>
                            <div className="flex items-center gap-3 text-xs text-gray-500">
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {new Date(item.timestamp).toLocaleDateString()}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {new Date(item.timestamp).toLocaleTimeString()}
                              </span>
                              <span className="flex items-center gap-1">
                                <User className="h-3 w-3" />
                                {item.from}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    
                    {/* Job Notes */}
                    {notes
                      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                      .map((note) => (
                        <div key={note.id} className="flex items-start gap-3 p-2 bg-blue-50 rounded text-xs border border-blue-200">
                          <div className="w-2 h-2 rounded-full mt-1.5 bg-blue-500"></div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium text-blue-900">Job Note</span>
                              <span className="px-1.5 py-0.5 bg-blue-100 text-blue-700 text-xs rounded capitalize">
                                {note.visibility}
                              </span>
                            </div>
                            <p className="text-blue-800 mb-1">{note.content}</p>
                            <div className="flex items-center gap-3 text-xs text-blue-600">
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {new Date(note.timestamp).toLocaleDateString()}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {new Date(note.timestamp).toLocaleTimeString()}
                              </span>
                              <span className="flex items-center gap-1">
                                <User className="h-3 w-3" />
                                {note.author}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    
                    {communications.length === 0 && notes.length === 0 && (
                      <div className="text-center py-6 text-gray-500">
                        <MessageSquare className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                        <p className="text-sm">No recent activity</p>
                        <p className="text-xs">Activity will appear here as jobs are updated</p>
                      </div>
                    )}
                  </div>
                </div>


              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Add Communication Modal */}
      {showAddCommunication && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">Add Communication Event</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAddCommunication(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Type *</label>
                  <Select value={newCommunication.type} onValueChange={(value: any) => setNewCommunication(prev => ({ ...prev, type: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="call">Call</SelectItem>
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="sms">SMS</SelectItem>
                      <SelectItem value="note">Note</SelectItem>
                      <SelectItem value="status_update">Status Update</SelectItem>
                      <SelectItem value="escalation">Escalation</SelectItem>
                      <SelectItem value="resolution">Resolution</SelectItem>
                      <SelectItem value="follow_up">Follow Up</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-700">Direction *</label>
                  <Select value={newCommunication.direction} onValueChange={(value: any) => setNewCommunication(prev => ({ ...prev, direction: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select direction" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="inbound">Inbound</SelectItem>
                      <SelectItem value="outbound">Outbound</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">From *</label>
                  <Input
                    value={newCommunication.from}
                    onChange={(e) => setNewCommunication(prev => ({ ...prev, from: e.target.value }))}
                    placeholder="Enter sender name"
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-700">To</label>
                  <Input
                    value={newCommunication.to}
                    onChange={(e) => setNewCommunication(prev => ({ ...prev, to: e.target.value }))}
                    placeholder="Enter recipient name"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">Priority</label>
                <Select value={newCommunication.priority} onValueChange={(value: any) => setNewCommunication(prev => ({ ...prev, priority: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">Content *</label>
                <Textarea
                  value={newCommunication.content}
                  onChange={(e) => setNewCommunication(prev => ({ ...prev, content: e.target.value }))}
                  placeholder="Enter communication content..."
                  rows={4}
                />
              </div>

              <div className="flex flex-col space-y-3">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="requiresFollowUp"
                    checked={newCommunication.requiresFollowUp}
                    onChange={(e) => setNewCommunication(prev => ({ ...prev, requiresFollowUp: e.target.checked }))}
                    className="rounded border-gray-300"
                  />
                  <label htmlFor="requiresFollowUp" className="text-sm text-gray-700">
                    Requires follow-up
                  </label>
                </div>
                
                {newCommunication.requiresFollowUp && (
                  <div className="ml-6 space-y-3 bg-blue-50 p-3 rounded-lg border border-blue-100">
                    <label className="text-sm font-medium text-blue-900">Follow-up Date/Time</label>
                    <Input
                      type="datetime-local"
                      value={newCommunication.followUpDate ? new Date(newCommunication.followUpDate).toISOString().slice(0, 16) : ''}
                      onChange={(e) => setNewCommunication(prev => ({ 
                        ...prev, 
                        followUpDate: e.target.value ? new Date(e.target.value) : undefined 
                      }))}
                      className="h-10 w-full border-blue-200 focus:border-blue-500"
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-6 border-t">
              <Button variant="outline" onClick={() => setShowAddCommunication(false)}>
                Cancel
              </Button>
              <Button onClick={addCommunication} disabled={!newCommunication.content || !newCommunication.from}>
                <Send className="h-4 w-4 mr-2" />
                Add Event
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Add Note Modal */}
      {showAddNote && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">Add Job Note</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAddNote(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Type</label>
                  <Select value={newNote.type} onValueChange={(value: any) => setNewNote(prev => ({ ...prev, type: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="general">General</SelectItem>
                      <SelectItem value="technical">Technical</SelectItem>
                      <SelectItem value="customer">Customer</SelectItem>
                      <SelectItem value="internal">Internal</SelectItem>
                      <SelectItem value="escalation">Escalation</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-700">Visibility</label>
                  <Select value={newNote.visibility} onValueChange={(value: any) => setNewNote(prev => ({ ...prev, visibility: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select visibility" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="internal">Internal</SelectItem>
                      <SelectItem value="customer">Customer</SelectItem>
                      <SelectItem value="public">Public</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">Content *</label>
                <Textarea
                  value={newNote.content}
                  onChange={(e) => setNewNote(prev => ({ ...prev, content: e.target.value }))}
                  placeholder="Enter note content..."
                  rows={4}
                />
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="requiresAction"
                  checked={newNote.requiresAction}
                  onChange={(e) => setNewNote(prev => ({ ...prev, requiresAction: e.target.checked }))}
                  className="rounded border-gray-300"
                />
                <label htmlFor="requiresAction" className="text-sm text-gray-700">
                  Requires action
                </label>
              </div>

              {newNote.requiresAction && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Action Required</label>
                    <Input
                      value={newNote.actionRequired || ''}
                      onChange={(e) => setNewNote(prev => ({ ...prev, actionRequired: e.target.value }))}
                      placeholder="Describe action required"
                    />
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-700">Action By</label>
                    <Input
                      value={newNote.actionBy || ''}
                      onChange={(e) => setNewNote(prev => ({ ...prev, actionBy: e.target.value }))}
                      placeholder="Who should take action"
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 pt-6 border-t">
              <Button variant="outline" onClick={() => setShowAddNote(false)}>
                Cancel
              </Button>
              <Button onClick={addNote} disabled={!newNote.content}>
                <FileText className="h-4 w-4 mr-2" />
                Add Note
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


