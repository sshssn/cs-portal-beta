import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Job, JobAlert } from '@/types/job';
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
  Wrench
} from 'lucide-react';

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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Job Details */}
          <div className="lg:col-span-2 space-y-6">
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


          </div>

          {/* Sidebar */}
          <div className={UI_CONSTANTS.layout.sidebar}>
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

            {/* Communication Timeline */}
            <Card className={`${getCardClasses('hover')} max-h-80 overflow-y-auto`}>
              <CardHeader className="pb-3">
                <CardTitle className={`flex items-center justify-between ${UI_CONSTANTS.typography.title}`}>
                  <div className="flex items-center">
                    <MessageSquare className={`${UI_CONSTANTS.spacing.icon} ${getIconClasses('md', 'primary')}`} />
                    Communication Timeline
                  </div>
                  {isEditing && (
                    <Button 
                      size="sm" 
                      variant="outline"
                      className={`h-6 px-2 text-xs ${getButtonClasses('outline')}`}
                      onClick={() => {/* Add new communication event */}}
                    >
                      Add Event
                    </Button>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="relative">
                  {/* Timeline Line */}
                  <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200"></div>
                  
                  {/* Timeline Events */}
                  <div className="space-y-3">
                    {/* Event 1: CSAT Survey Submitted */}
                    <div className="relative flex items-start space-x-3 group">
                      <div className="relative z-10 flex items-center justify-center w-6 h-6 bg-pink-500 rounded shadow-sm transform group-hover:scale-105 transition-all duration-200">
                        <Edit3 className="h-3 w-3 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <h4 className="text-xs font-semibold text-gray-900">CSAT survey submitted</h4>
                          <div className="flex items-center space-x-1">
                            <img 
                              src="https://media.istockphoto.com/id/2182163332/photo/smiling-young-asian-woman-with-crossed-arms-looking-at-camera-standing-isolated-on-blue.webp?a=1&b=1&s=612x612&w=0&k=20&c=R584HttneLO13Uz6mXUl3vSi99isb9WdGBapZUdYuPg=" 
                              alt="Julie Chen" 
                              className="w-5 h-5 rounded-full ring-1 ring-pink-200 shadow-sm"
                            />
                            <span className="text-xs text-gray-600">By Julie Chen</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Event 2: Problem Resolved */}
                    <div className="relative flex items-start space-x-3 group">
                      <div className="relative z-10 flex items-center justify-center w-6 h-6 bg-green-500 rounded shadow-sm transform group-hover:scale-105 transition-all duration-200">
                        <CheckCircle className="h-3 w-3 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <h4 className="text-xs font-semibold text-gray-900">Problem resolved</h4>
                          <div className="flex items-center space-x-1">
                            <img 
                              src="https://media.istockphoto.com/id/2217239132/photo/senior-male-engineer-uses-tablet-and-blueprints-to-plan-warehouse-construction-work.webp?a=1&b=1&s=612x612&w=0&k=20&c=dthqmw9a1HFdfeah_NsUWdexdFZw52icis8_p6M0RLo=" 
                              alt="Nathan Bennett" 
                              className="w-5 h-5 rounded-full ring-1 ring-green-200 shadow-sm"
                            />
                            <span className="text-xs text-gray-600">By Nathan Bennett</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Event 3: Follow Up */}
                    <div className="relative flex items-start space-x-3 group">
                      <div className="relative z-10 flex items-center justify-center w-6 h-6 bg-blue-500 rounded shadow-sm transform group-hover:scale-105 transition-all duration-200">
                        <Mail className="h-3 w-3 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <h4 className="text-xs font-semibold text-gray-900">Follow up</h4>
                          <div className="flex items-center space-x-1">
                            <img 
                              src="https://media.istockphoto.com/id/2182163332/photo/smiling-young-asian-woman-with-crossed-arms-looking-at-camera-standing-isolated-on-blue.webp?a=1&b=1&s=612x612&w=0&k=20&c=R584HttneLO13Uz6mXUl3vSi99isb9WdGBapZUdYuPg=" 
                              alt="Julie Chen" 
                              className="w-5 h-5 rounded-full ring-1 ring-blue-200 shadow-sm"
                            />
                            <span className="text-xs text-gray-600">From Julie Chen</span>
                          </div>
                        </div>
                        <div className="bg-blue-50 border border-blue-200 rounded p-2 mb-1">
                          <p className="text-xs text-gray-700 mb-1 font-medium">Re: Leaking pipe in the basement</p>
                          <p className="text-xs text-gray-600 mb-1">Thanks Nathan for resolving this plumbing issue so quickly.</p>
                          <p className="text-xs text-gray-600">The pipe is now properly sealed and no more leaks.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>


          </div>
        </div>
      </div>
    </div>
  );
}


