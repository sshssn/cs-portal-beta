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
  Square
} from 'lucide-react';
import { loadCommunicationFromStorage, saveCommunicationToStorage, loadNotesFromStorage, saveNotesToStorage } from '@/lib/jobUtils';

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
    }
  }, [jobId, jobs]);

  const handleSave = () => {
    if (editedJob) {
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

    const updatedJob = {
      ...editedJob,
      alerts: [...(editedJob.alerts || []), newAlert]
    };
    
    setEditedJob(updatedJob);
  };

  const acknowledgeAlert = (alertId: string) => {
    if (!editedJob) return;
    
    const updatedJob = {
      ...editedJob,
      alerts: editedJob.alerts?.map(alert => 
        alert.id === alertId ? { ...alert, acknowledged: true } : alert
      ) || []
    };
    
    setEditedJob(updatedJob);
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
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Job Not Found</h1>
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
              <Button onClick={() => setIsEditing(true)}>
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

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
          {/* Main Job Details */}
          <div className="lg:col-span-3 space-y-6">
            {/* Basic Information */}
            <Card className={getCardClasses('hover')}>
              <CardHeader className={UI_CONSTANTS.card.header}>
                <CardTitle className={`flex items-center ${UI_CONSTANTS.typography.title}`}>
                  <Briefcase className={`${UI_CONSTANTS.spacing.icon} ${getIconClasses('md', 'primary')}`} />
                  Job Information
                </CardTitle>
              </CardHeader>
              <CardContent className={UI_CONSTANTS.card.content}>
                <div className={`grid grid-cols-1 md:grid-cols-2 ${UI_CONSTANTS.spacing.card.grid}`}>
                  <div className={UI_CONSTANTS.spacing.card.field}>
                    <label className={UI_CONSTANTS.typography.subtitle}>Customer</label>
                    {isEditing ? (
                      <Input 
                        value={currentJob?.customer || ''} 
                        onChange={(e) => setEditedJob(prev => prev ? { ...prev, customer: e.target.value } : null)}
                        className={getFormClasses('input')}
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
                        onChange={(e) => setEditedJob(prev => prev ? { ...prev, site: e.target.value } : null)}
                        className={getFormClasses('input')}
                      />
                    ) : (
                      <p className={UI_CONSTANTS.typography.body}>{job.site}</p>
                    )}
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
                      <div className={`flex items-center ${UI_CONSTANTS.spacing.element}`}>
                        <User className={getIconClasses('sm', 'primary')} />
                        <span className={UI_CONSTANTS.typography.body}>{job.engineer}</span>
                      </div>
                    )}
                  </div>
                  <div className={UI_CONSTANTS.spacing.card.field}>
                    <label className={UI_CONSTANTS.typography.subtitle}>Status</label>
                    {isEditing ? (
                      <Select 
                        value={currentJob?.status || 'amber'} 
                        onValueChange={(value) => setEditedJob(prev => prev ? { ...prev, status: value as Job['status'] } : null)}
                      >
                        <SelectTrigger className={getFormClasses('select')}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="green">Green</SelectItem>
                          <SelectItem value="amber">Amber</SelectItem>
                          <SelectItem value="red">Red</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <div className="mt-1">
                        <Badge className={`${getStatusColor(job.status)} ${UI_CONSTANTS.badge.base}`}>
                          {job.status === 'green' ? 'Completed' : 
                           job.status === 'amber' ? 'In Process' : 
                           job.status === 'red' ? 'Issue' : 
                           job.status === 'OOH' ? 'Out of Hours' :
                           job.status === 'On call' ? 'On Call' :
                           job.status === 'travel' ? 'Traveling' :
                           job.status === 'require_revisit' ? 'Requires Revisit' :
                           job.status === 'sick' ? 'Sick Leave' :
                           job.status === 'training' ? 'Training' :
                           String(job.status).toUpperCase()}
                        </Badge>
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
                      <Badge className={`${getPriorityColor(job.priority)} ${UI_CONSTANTS.badge.base}`}>
                        {job.priority}
                      </Badge>
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

            {/* Alerts */}
            <Card className={getCardClasses('hover')}>
              <CardHeader className={UI_CONSTANTS.card.header}>
                <CardTitle className={`flex items-center justify-between ${UI_CONSTANTS.typography.title}`}>
                  <div className="flex items-center">
                    <div className="relative">
                      <AlertTriangle className={`${UI_CONSTANTS.spacing.icon} ${getIconClasses('md', 'error')}`} />
                      {currentJob?.alerts && currentJob.alerts.filter(alert => !alert.acknowledged).length > 0 && (
                        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                          {currentJob.alerts.filter(alert => !alert.acknowledged).length}
                        </span>
                      )}
                    </div>
                    Alerts
                  </div>
                  {isEditing && (
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => addAlert('ACCEPTED')}
                      className={getButtonClasses('outline')}
                    >
                      Add Alert
                    </Button>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {currentJob?.alerts && currentJob.alerts.length > 0 ? (
                  <div className="space-y-3">
                    {currentJob.alerts.map((alert) => (
                      <div 
                        key={alert.id}
                        className={`p-3 rounded-lg border ${
                          alert.acknowledged 
                            ? 'bg-gray-50 border-gray-200' 
                            : 'bg-red-50 border-red-200'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-sm">{alert.type}</p>
                            <p className="text-xs text-gray-600">{alert.message}</p>
                            <p className="text-xs text-gray-500">
                              {alert.timestamp.toLocaleString()}
                            </p>
                          </div>
                          {!alert.acknowledged && isEditing && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => acknowledgeAlert(alert.id)}
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
                  <p className="text-gray-500 text-sm">No alerts for this job</p>
                )}
              </CardContent>
            </Card>

            {/* Alerts */}
            <Card className="col-span-full">
              <CardHeader className={UI_CONSTANTS.card.header}>
                <CardTitle className={`flex items-center justify-between ${UI_CONSTANTS.typography.title}`}>
                  <div className="flex items-center">
                    <div className="relative">
                      <AlertTriangle className={`${UI_CONSTANTS.spacing.icon} ${getIconClasses('md', 'error')}`} />
                      {currentJob?.alerts && currentJob.alerts.filter(alert => !alert.acknowledged).length > 0 && (
                        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                          {currentJob.alerts.filter(alert => !alert.acknowledged).length}
                        </span>
                      )}
                    </div>
                    Alerts
                  </div>
                  {isEditing && (
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => addAlert('ACCEPTED')}
                      className={getButtonClasses('outline')}
                    >
                      Add Alert
                    </Button>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {currentJob?.alerts && currentJob.alerts.length > 0 ? (
                  <div className="space-y-3">
                    {currentJob.alerts.map((alert) => (
                      <div 
                        key={alert.id}
                        className={`p-3 rounded-lg border ${
                          alert.acknowledged 
                            ? 'bg-gray-50 border-gray-200' 
                            : 'bg-red-50 border-red-200'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-sm">{alert.type}</p>
                            <p className="text-xs text-gray-600">{alert.message}</p>
                            <p className="text-xs text-gray-500">
                              {alert.timestamp.toLocaleString()}
                            </p>
                          </div>
                          {!alert.acknowledged && isEditing && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => acknowledgeAlert(alert.id)}
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
                  <p className="text-gray-500 text-sm">No alerts for this job</p>
                )}
              </CardContent>
            </Card>

            {/* Communication Timeline */}
            <Card className="col-span-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Communication Timeline & Job Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                {/* Job Status Workflow */}
                <Card className="bg-gradient-to-br from-slate-50 to-blue-50 border-blue-200">
                  <CardHeader className="pb-6">
                    <CardTitle className="flex items-center gap-3 text-2xl text-gray-900">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <Clock className="h-6 w-6 text-blue-600" />
                      </div>
                      Job Status Workflow
                    </CardTitle>
                    <p className="text-muted-foreground">Track the progression of this job through its lifecycle stages</p>
                  </CardHeader>
                  <CardContent className="space-y-8">
                    {/* Enhanced Status Progress Bar */}
                    <div className="bg-white p-6 rounded-xl border border-blue-200 shadow-sm">
                      <div className="flex items-center justify-between mb-4">
                        <div className="space-y-1">
                          <span className="text-lg font-semibold text-gray-900">Progress Overview</span>
                          <p className="text-sm text-gray-600">Job completion status and current stage</p>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-blue-600">{getJobProgress()}%</div>
                          <div className="text-sm text-gray-500">Stage {getCurrentStageIndex() + 1} of 8</div>
                        </div>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                        <div 
                          className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-500 shadow-sm min-w-[2px]" 
                          style={{ width: `${Math.max(getJobProgress(), 2)}%` }}
                        ></div>
                      </div>
                      <div className="flex justify-between mt-2 text-xs text-gray-500">
                        <span>New Job</span>
                        <span>Reqs. Invoice</span>
                      </div>
                    </div>

                    {/* Status Stages - Better Layout */}
                    <div className="space-y-6">
                      <h3 className="text-lg font-semibold text-gray-900 text-center">Workflow Stages</h3>
                      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-6">
                        {jobStatusStages.map((stage, index) => {
                          const isCompleted = isStageCompleted(stage.key);
                          const isCurrent = isCurrentStage(stage.key);
                          
                          return (
                            <div 
                              key={stage.key}
                              className={`relative p-6 rounded-xl border-2 transition-all duration-300 hover:shadow-lg ${
                                isCompleted 
                                  ? 'border-green-300 bg-green-50 shadow-md' 
                                  : isCurrent 
                                  ? 'border-blue-400 bg-blue-50 shadow-lg ring-2 ring-blue-200' 
                                  : 'border-gray-200 bg-white hover:border-gray-300'
                              }`}
                            >
                              {/* Stage Number */}
                              <div className={`absolute -top-4 left-6 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shadow-lg ${
                                isCompleted 
                                  ? 'bg-green-500 text-white' 
                                  : isCurrent 
                                  ? 'bg-blue-500 text-white' 
                                  : 'bg-gray-400 text-white'
                              }`}>
                                {index + 1}
                              </div>
                              
                              {/* Stage Icon */}
                              <div className={`w-16 h-16 rounded-xl flex items-center justify-center mb-4 ${
                                isCompleted 
                                  ? 'bg-green-100 text-green-600' 
                                  : isCurrent 
                                  ? 'bg-blue-100 text-blue-600' 
                                  : 'bg-gray-100 text-gray-400'
                              }`}>
                                {stage.icon}
                              </div>
                              
                              {/* Stage Title */}
                              <h4 className={`font-bold text-base mb-2 ${
                                isCompleted 
                                  ? 'text-green-800' 
                                  : isCurrent 
                                  ? 'text-blue-800' 
                                  : 'text-gray-700'
                              }`}>
                                {stage.title}
                              </h4>
                              
                              {/* Stage Description */}
                              <p className={`text-sm leading-relaxed mb-4 ${
                                isCompleted 
                                  ? 'text-green-700' 
                                  : isCurrent 
                                  ? 'text-blue-700' 
                                  : 'text-gray-600'
                              }`}>
                                {stage.description}
                              </p>
                              
                              {/* Status Badge */}
                              <div className="mb-3">
                                <Badge 
                                  variant={isCompleted ? 'default' : isCurrent ? 'secondary' : 'outline'}
                                  className={`text-sm px-3 py-1 ${
                                    isCompleted 
                                      ? 'bg-green-100 text-green-800 border-green-200' 
                                      : isCurrent 
                                      ? 'bg-blue-100 text-blue-800 border-blue-200' 
                                      : 'bg-gray-100 text-gray-600 border-gray-200'
                                  }`}
                                >
                                  {isCompleted ? '✓ Completed' : isCurrent ? '🔄 In Progress' : '⏳ Pending'}
                                </Badge>
                              </div>
                              
                              {/* Current Stage Indicator */}
                              {isCurrent && (
                                <div className="absolute -top-3 -right-3 w-6 h-6 bg-blue-500 rounded-full animate-pulse shadow-lg"></div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Enhanced Stage Navigation */}
                    <div className="bg-white p-6 rounded-xl border border-blue-200 shadow-sm">
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <div className="text-sm font-medium text-gray-700">Current Status</div>
                          <div className="text-lg font-semibold text-blue-600">{getCurrentStageTitle()}</div>
                        </div>
                        <div className="flex gap-3">
                          <Button
                            variant="outline"
                            size="lg"
                            onClick={moveToPreviousStage}
                            disabled={!canMoveToPreviousStage()}
                            className="px-6"
                          >
                            ← Previous Stage
                          </Button>
                          <Button
                            variant="default"
                            size="lg"
                            onClick={moveToNextStage}
                            disabled={!canMoveToNextStage()}
                            className="px-6 bg-blue-600 hover:bg-blue-700"
                          >
                            Next Stage →
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Current Status */}
                <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h4 className="text-lg font-semibold text-blue-900 mb-2">Current Job Status</h4>
                  <div className="flex items-center gap-3">
                    <div className={`w-6 h-6 rounded-full ${
                      job.status === 'completed' || job.status === 'costed' || job.status === 'reqs_invoice' 
                        ? 'bg-green-500' 
                        : 'bg-orange-500'
                    }`}></div>
                    <span className="text-lg font-semibold text-blue-900">
                      {job.status === 'new' && 'New Job'}
                      {job.status === 'allocated' && 'Allocated'}
                      {job.status === 'attended' && 'Attended'}
                      {job.status === 'awaiting_parts' && 'Awaiting Parts'}
                      {job.status === 'parts_to_fit' && 'Parts to Fit'}
                      {job.status === 'completed' && 'Completed'}
                      {job.status === 'costed' && 'Costed'}
                      {job.status === 'reqs_invoice' && 'Requires Invoicing'}
                      {!['new', 'allocated', 'attended', 'awaiting_parts', 'parts_to_fit', 'completed', 'costed', 'reqs_invoice'].includes(job.status) && 'Open'}
                    </span>
                  </div>
                </div>

                {/* Communication Events and Notes */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-lg font-semibold text-gray-900">Communication Events & Notes</h4>
                    <div className="flex gap-2">
                      <Button 
                        onClick={() => setShowAddCommunication(true)} 
                        variant="outline" 
                        size="sm"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Communication
                      </Button>
                      <Button 
                        onClick={() => setShowAddNote(true)} 
                        variant="outline" 
                        size="sm"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Note
                      </Button>
                    </div>
                  </div>

                  {/* Combined Timeline */}
                  <div className="space-y-3">
                    {[...communications, ...notes]
                      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                      .map((item, index) => (
                        <div key={item.id} className="flex gap-3 p-3 bg-gray-50 rounded-lg">
                          <div className="flex-shrink-0">
                            {getCommunicationIcon(item.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-sm font-medium text-gray-900">
                                {item.type === 'note' ? 'Job Note' : 'Communication Event'}
                              </span>
                              <span className="text-xs text-gray-500">
                                {new Date(item.timestamp).toLocaleString()}
                              </span>
                              {item.type !== 'note' && (
                                <Badge 
                                  variant={item.priority === 'urgent' ? 'destructive' : 'secondary'}
                                  className="text-xs"
                                >
                                  {item.priority}
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-gray-700 mb-2">
                              {item.content}
                            </p>
                            <div className="flex items-center gap-4 text-xs text-gray-500">
                              <span>By: {item.author || 'System'}</span>
                              {item.type !== 'note' && item.direction && (
                                <span>Direction: {item.direction}</span>
                              )}
                              {item.type === 'note' && item.visibility && (
                                <span>Visibility: {item.visibility}</span>
                              )}
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => item.type === 'note' ? deleteNote(item.id) : deleteCommunication(item.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    
                    {communications.length === 0 && notes.length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        <MessageSquare className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                        <p className="text-sm">No communication events or notes yet</p>
                        <p className="text-xs">Add the first communication event or note to start tracking this job</p>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>


          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Additional sidebar content can go here */}
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


