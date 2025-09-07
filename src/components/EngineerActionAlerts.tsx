import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Job, Engineer } from '@/types/job';
import { mockEngineers } from '@/lib/jobUtils';
import { toast } from '@/components/ui/sonner';
import CustomPromptModal from '@/components/ui/custom-prompt-modal';
import { 
  User, 
  MapPin, 
  Phone, 
  Mail, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  X,
  Check,
  Calendar,
  Briefcase,
  Bell
} from 'lucide-react';

interface EngineerActionAlert {
  id: string;
  type: 'ENGINEER_ACCEPT' | 'ENGINEER_ONSITE';
  jobId: string;
  jobNumber: string;
  customer: string;
  site: string;
  engineer: string;
  priority: Job['priority'];
  status: Job['status'];
  timestamp: Date;
  acknowledged: boolean;
  resolved: boolean;
  resolvedBy?: string;
  resolvedAt?: Date;
  resolution?: string;
}

interface EngineerActionAlertsProps {
  jobs: Job[];
  onJobUpdate: (job: Job) => void;
}

export default function EngineerActionAlerts({ jobs, onJobUpdate }: EngineerActionAlertsProps) {
  const [selectedAlert, setSelectedAlert] = useState<EngineerActionAlert | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(() => 
    localStorage.getItem('engineerAlerts_activeTab') || 'active'
  );
  const [showNotificationsDropdown, setShowNotificationsDropdown] = useState(false);
  const [alerts, setAlerts] = useState<EngineerActionAlert[]>([]);
  const [showResolutionModal, setShowResolutionModal] = useState(false);
  
  // Save activeTab to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('engineerAlerts_activeTab', activeTab);
  }, [activeTab]);
  
  // Generate alerts when jobs change
  useEffect(() => {
    const newAlerts = generateEngineerActionAlerts();
    
    // Preserve resolved alerts and auto-resolve accepted jobs
    setAlerts(prevAlerts => {
      const resolvedAlerts = prevAlerts.filter(alert => alert.resolved);
      
      // Auto-resolve alerts for jobs that have been accepted or are onsite
      const autoResolvedAlerts = newAlerts.map(alert => {
        const job = jobs.find(j => j.id === alert.jobId);
        if (!job) return alert;
        
        // Auto-resolve accept alerts if job is accepted
        if (alert.type === 'ENGINEER_ACCEPT' && job.dateAccepted) {
          return {
            ...alert,
            resolved: true,
            resolvedBy: 'System',
            resolvedAt: job.dateAccepted,
            resolution: 'Job automatically accepted by engineer'
          };
        }
        
        // Auto-resolve onsite alerts if engineer is onsite
        if (alert.type === 'ENGINEER_ONSITE' && job.dateOnSite) {
          return {
            ...alert,
            resolved: true,
            resolvedBy: 'System',
            resolvedAt: job.dateOnSite,
            resolution: 'Engineer automatically arrived on site'
          };
        }
        
        return alert;
      });
      
      // Filter out alerts that are now resolved
      const activeAlerts = autoResolvedAlerts.filter(alert => !alert.resolved);
      
      // Combine with existing resolved alerts, avoiding duplicates
      const allResolvedAlerts = [...resolvedAlerts];
      autoResolvedAlerts.forEach(alert => {
        if (alert.resolved && !allResolvedAlerts.some(existing => 
          existing.jobId === alert.jobId && existing.type === alert.type
        )) {
          allResolvedAlerts.push(alert);
        }
      });
      
      return [...allResolvedAlerts, ...activeAlerts];
    });
  }, [jobs]);

  // Handle clicking outside notifications dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showNotificationsDropdown && !(event.target as Element).closest('.notifications-dropdown')) {
        setShowNotificationsDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showNotificationsDropdown]);

  // Generate Engineer Action Alerts from jobs
  const generateEngineerActionAlerts = (): EngineerActionAlert[] => {
    const alerts: EngineerActionAlert[] = [];
    
    jobs.forEach(job => {
      // Engineer Accept Alert - when job is allocated but not accepted
      // Also check if job is not already in attended status to prevent repeated acceptions
      if (job.status === 'allocated' && !job.dateAccepted && job.status !== 'attended') {
        alerts.push({
          id: `engineer-accept-${job.id}`,
          type: 'ENGINEER_ACCEPT',
          jobId: job.id,
          jobNumber: job.jobNumber,
          customer: job.customer,
          site: job.site,
          engineer: job.engineer,
          priority: job.priority,
          status: job.status,
          timestamp: job.dateLogged,
          acknowledged: false,
          resolved: false
        });
      }

      // Engineer Onsite Alert - when job is accepted but engineer not on site
      // Only show if job is not already completed
      if (job.dateAccepted && !job.dateOnSite && job.status !== 'completed') {
        alerts.push({
          id: `engineer-onsite-${job.id}`,
          type: 'ENGINEER_ONSITE',
          jobId: job.id,
          jobNumber: job.jobNumber,
          customer: job.customer,
          site: job.site,
          engineer: job.engineer,
          priority: job.priority,
          status: job.status,
          timestamp: job.dateAccepted,
          acknowledged: false,
          resolved: false
        });
      }
    });

    return alerts.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  };

  const activeAlerts = alerts.filter(alert => !alert.resolved);
  const resolvedAlerts = alerts.filter(alert => alert.resolved);

  const getAlertIcon = (type: EngineerActionAlert['type']) => {
    switch (type) {
      case 'ENGINEER_ACCEPT':
        return <User className="h-5 w-5 text-blue-600" />;
      case 'ENGINEER_ONSITE':
        return <MapPin className="h-5 w-5 text-green-600" />;
      default:
        return <AlertTriangle className="h-5 w-5 text-gray-600" />;
    }
  };

  const getAlertColor = (type: EngineerActionAlert['type']) => {
    switch (type) {
      case 'ENGINEER_ACCEPT':
        return 'bg-blue-50 border-blue-200 hover:bg-blue-100';
      case 'ENGINEER_ONSITE':
        return 'bg-green-50 border-green-200 hover:bg-green-100';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const getAlertTitle = (type: EngineerActionAlert['type']) => {
    switch (type) {
      case 'ENGINEER_ACCEPT':
        return 'Engineer Accept Alert';
      case 'ENGINEER_ONSITE':
        return 'Engineer Onsite Alert';
      default:
        return 'Alert';
    }
  };

  const getAlertDescription = (type: EngineerActionAlert['type'], jobNumber: string) => {
    switch (type) {
      case 'ENGINEER_ACCEPT':
        return `Engineer needs to accept job ${jobNumber}`;
      case 'ENGINEER_ONSITE':
        return `Engineer needs to arrive on site for job ${jobNumber}`;
      default:
        return 'Action required';
    }
  };

  const handleAlertClick = (alert: EngineerActionAlert) => {
    setSelectedAlert(alert);
    setIsDetailModalOpen(true);
  };

  const handleCallEngineer = (engineerName: string) => {
    const engineer = mockEngineers.find(e => e.name === engineerName);
    if (engineer) {
      window.open(`tel:${engineer.phone}`, '_self');
    }
  };

  const handleResolveAlert = (alertId: string, resolution: string) => {
    const alert = alerts.find(a => a.id === alertId);
    if (alert) {
      const job = jobs.find(j => j.id === alert.jobId);
      if (job) {
        const updatedJob = { ...job };
        
        if (alert.type === 'ENGINEER_ACCEPT') {
          updatedJob.dateAccepted = new Date();
          updatedJob.status = 'attended';
        } else if (alert.type === 'ENGINEER_ONSITE') {
          updatedJob.dateOnSite = new Date();
          updatedJob.status = 'attended';
        }
        
        // Update alerts state immediately
        setAlerts(prevAlerts => 
          prevAlerts.map(a => 
            a.id === alertId 
              ? { 
                  ...a, 
                  resolved: true, 
                  resolvedBy: 'Current User', 
                  resolvedAt: new Date(), 
                  resolution 
                }
              : a
          )
        );
        
        // Update the job
        onJobUpdate(updatedJob);
        
        // Job update will trigger useEffect to regenerate alerts while preserving resolved ones
        
        // Show success toast notification to engineer
        toast.success('Job Status Updated', {
          description: `Job ${job.jobNumber} has been ${alert.type === 'ENGINEER_ACCEPT' ? 'accepted' : 'marked as onsite'} successfully.`,
          duration: 5000
        });
        
        // Show global notification to relevant teams
        toast.info('Engineer Action Completed', {
          description: `${alert.engineer} has ${alert.type === 'ENGINEER_ACCEPT' ? 'accepted' : 'arrived onsite for'} job ${job.jobNumber} at ${job.site}.`,
          duration: 7000
        });
        
        // Auto-dismiss container and close modals ONLY after successful resolution
        setTimeout(() => {
          setIsDetailModalOpen(false);
          setSelectedAlert(null);
          setShowResolutionModal(false);
          setShowNotificationsDropdown(false);
        }, 1000); // Small delay to show the success notification
      } else {
        // Job not found - show error
        toast.error('Error', {
          description: 'Job not found. Please try again.',
          duration: 5000
        });
      }
    } else {
      // Alert not found - show error
      toast.error('Error', {
        description: 'Alert not found. Please try again.',
        duration: 5000
      });
    }
  };

  const getEngineerDetails = (engineerName: string): Engineer | null => {
    return mockEngineers.find(e => e.name === engineerName) || null;
  };

  const getPriorityColor = (priority: Job['priority']) => {
    switch (priority) {
      case 'Critical':
        return 'bg-red-600 text-white';
      case 'High':
        return 'bg-orange-500 text-white';
      case 'Medium':
        return 'bg-yellow-500 text-white';
      case 'Low':
        return 'bg-green-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  const renderAlertCard = (alert: EngineerActionAlert) => (
    <Card 
      key={alert.id} 
      className={`${getAlertColor(alert.type)} cursor-pointer transition-all duration-200 hover:shadow-md border-2`}
      onClick={() => handleAlertClick(alert)}
    >
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 mt-1">
            {getAlertIcon(alert.type)}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-3">
              <h3 className="font-semibold text-lg text-gray-900">
                {getAlertTitle(alert.type)}
              </h3>
              <Badge className={`${getPriorityColor(alert.priority)} text-xs font-medium`}>
                {alert.priority}
              </Badge>
            </div>
            
            <p className="text-gray-700 mb-4 text-base">
              {getAlertDescription(alert.type, alert.jobNumber)}
            </p>
            
            <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 mb-3">
              <div>
                <span className="font-medium text-gray-700">Job:</span>
                <p className="text-gray-900 font-mono">{alert.jobNumber}</p>
              </div>
              <div>
                <span className="font-medium text-gray-700">Engineer:</span>
                <p className="text-gray-900">{alert.engineer}</p>
              </div>
              <div>
                <span className="font-medium text-gray-700">Customer:</span>
                <p className="text-gray-900">{alert.customer}</p>
              </div>
              <div>
                <span className="font-medium text-gray-700">Site:</span>
                <p className="text-gray-900">{alert.site}</p>
              </div>
            </div>
            
            {/* Job Status */}
            <div className="mb-3">
              <span className="font-medium text-gray-700 text-sm">Job Status:</span>
              {(() => {
                const job = jobs.find(j => j.id === alert.jobId);
                if (!job) return <span className="text-gray-500 ml-2">Unknown</span>;
                
                const getStatusDisplay = (status: string) => {
                  switch (status) {
                    case 'new': return 'New Job';
                    case 'allocated': return 'Allocated';
                    case 'attended': return 'Accepted';
                    case 'awaiting_parts': return 'Awaiting Parts';
                    case 'parts_to_fit': return 'Parts to Fit';
                    case 'completed': return 'Completed';
                    case 'costed': return 'Costed';
                    case 'reqs_invoice': return 'Requires Invoice';
                    case 'green': return 'On Track';
                    case 'amber': return 'Attention';
                    case 'red': return 'Critical';
                    default: return status.charAt(0).toUpperCase() + status.slice(1).replace(/_/g, ' ');
                  }
                };

                const getStatusColor = (status: string) => {
                  switch (status) {
                    case 'new': return 'bg-blue-100 text-blue-800 border-blue-200';
                    case 'allocated': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
                    case 'attended': return 'bg-green-100 text-green-800 border-green-200';
                    case 'awaiting_parts': return 'bg-orange-100 text-orange-800 border-orange-200';
                    case 'parts_to_fit': return 'bg-purple-100 text-purple-800 border-purple-200';
                    case 'completed': return 'bg-green-600 text-white border-green-700';
                    case 'costed': return 'bg-blue-600 text-white border-blue-700';
                    case 'reqs_invoice': return 'bg-indigo-600 text-white border-indigo-700';
                    case 'green': return 'bg-green-100 text-green-800 border-green-200';
                    case 'amber': return 'bg-amber-100 text-amber-800 border-amber-200';
                    case 'red': return 'bg-red-100 text-red-800 border-red-200';
                    default: return 'bg-gray-100 text-gray-800 border-gray-200';
                  }
                };

                return (
                  <Badge className={`${getStatusColor(job.status)} ml-2 px-2 py-1 text-xs font-medium border`}>
                    {getStatusDisplay(job.status)}
                  </Badge>
                );
              })()}
            </div>

            {/* Visit Status */}
            <div className="mb-3">
              <span className="font-medium text-gray-700 text-sm">Visit Status:</span>
              {(() => {
                const job = jobs.find(j => j.id === alert.jobId);
                if (!job) return <span className="text-gray-500 ml-2">Unknown</span>;
                
                const getVisitStatusDisplay = (job: Job) => {
                  if (job.dateCompleted) return 'Visit Completed';
                  if (job.dateOnSite) return 'On Site';
                  if (job.dateAccepted) return 'En Route';
                  if (job.status === 'allocated') return 'Pending Acceptance';
                  return 'Not Started';
                };

                const getVisitStatusColor = (job: Job) => {
                  if (job.dateCompleted) return 'bg-green-100 text-green-800 border-green-200';
                  if (job.dateOnSite) return 'bg-blue-100 text-blue-800 border-blue-200';
                  if (job.dateAccepted) return 'bg-orange-100 text-orange-800 border-orange-200';
                  if (job.status === 'allocated') return 'bg-yellow-100 text-yellow-800 border-yellow-200';
                  return 'bg-gray-100 text-gray-800 border-gray-200';
                };

                return (
                  <Badge className={`${getVisitStatusColor(job)} ml-2 px-2 py-1 text-xs font-medium border`}>
                    {getVisitStatusDisplay(job)}
                  </Badge>
                );
              })()}
            </div>
            
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Clock className="h-4 w-4" />
              <span>{alert.timestamp.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
             {/* Header */}
       <div className="flex items-center justify-between">
         <div>
           <h2 className="text-3xl font-bold text-gray-900">Engineer Action Alerts</h2>
           <p className="text-muted-foreground mt-2 text-lg">
             Monitor engineer job acceptance and onsite status
           </p>
         </div>
         
         <div className="flex items-center gap-6">
                       {/* Notification Bell */}
            <div className="relative">
              <Button 
                onClick={() => setShowNotificationsDropdown(!showNotificationsDropdown)} 
                variant="outline" 
                className="relative flex items-center gap-2 hover:bg-gray-50 transition-colors"
              >
                <Bell className="h-5 w-5 text-gray-600" />
                <span className="text-gray-700 font-medium">Notifications</span>
                {activeAlerts.length > 0 && (
                  <Badge 
                    variant="destructive" 
                    className="absolute -top-2 -right-2 h-6 w-6 flex items-center justify-center p-0 text-xs font-bold"
                  >
                    {activeAlerts.length > 99 ? '99+' : activeAlerts.length}
                  </Badge>
                )}
              </Button>

              {/* Notifications Dropdown */}
              {showNotificationsDropdown && (
                <div 
                  className="notifications-dropdown fixed right-0 top-16 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-[9999]"
                  onClick={(e) => e.stopPropagation()}
                  style={{ pointerEvents: 'all' }}
                >
                  <div className="p-4 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-gray-900">Engineer Alerts</h3>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowNotificationsDropdown(false)}
                        className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                      >
                        Close
                      </Button>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      {activeAlerts.length} alert{activeAlerts.length !== 1 ? 's' : ''} requiring attention
                    </p>
                  </div>
                  
                  <div className="max-h-96 overflow-y-auto overscroll-contain" style={{ pointerEvents: 'auto' }}>
                    {activeAlerts.length === 0 ? (
                      <div className="p-4 text-center text-gray-500">
                        <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-500" />
                        <p className="text-sm">No active alerts</p>
                        <p className="text-xs">All engineers have accepted their jobs and are on site</p>
                      </div>
                    ) : (
                      <div className="divide-y divide-gray-100">
                        {activeAlerts.slice(0, 5).map((alert) => (
                          <div 
                            key={alert.id}
                            className="p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                            onClick={() => {
                              handleAlertClick(alert);
                              setShowNotificationsDropdown(false);
                            }}
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <Badge 
                                    variant={alert.priority === 'Critical' ? 'destructive' : 'secondary'}
                                    className="text-xs"
                                  >
                                    {alert.priority}
                                  </Badge>
                                  <span className="text-xs text-gray-500">
                                    {alert.timestamp.toLocaleDateString()}
                                  </span>
                                </div>
                                <h4 className="text-sm font-medium text-gray-900 mb-1">
                                  {alert.customer} - {alert.site}
                                </h4>
                                <p className="text-xs text-gray-600 mb-1">
                                  Job Number: {alert.jobNumber}
                                </p>
                                <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                                  {getAlertDescription(alert.type, alert.jobNumber)}
                                </p>
                                <div className="flex items-center gap-2 text-xs text-gray-500">
                                  <MapPin className="h-3 w-3" />
                                  <span>{alert.site}</span>
                                  <span>•</span>
                                  <User className="h-3 w-3" />
                                  <span>{alert.engineer}</span>
                                </div>
                                
                                {/* Visit Status in notifications */}
                                <div className="flex items-center gap-2 mt-1">
                                  <span className="text-xs text-gray-500">Status:</span>
                                  {(() => {
                                    const job = jobs.find(j => j.id === alert.jobId);
                                    if (!job) return <span className="text-gray-400">Unknown</span>;
                                    
                                    const getStatusDisplay = (status: string) => {
                                      switch (status) {
                                        case 'new': return 'New';
                                        case 'allocated': return 'Allocated';
                                        case 'attended': return 'Accepted';
                                        case 'awaiting_parts': return 'Awaiting Parts';
                                        case 'parts_to_fit': return 'Parts to Fit';
                                        case 'completed': return 'Completed';
                                        case 'costed': return 'Costed';
                                        case 'reqs_invoice': return 'Requires Invoice';
                                        case 'green': return 'On Track';
                                        case 'amber': return 'Attention';
                                        case 'red': return 'Critical';
                                        default: return status.charAt(0).toUpperCase() + status.slice(1).replace(/_/g, ' ');
                                      }
                                    };

                                    const getStatusColor = (status: string) => {
                                      switch (status) {
                                        case 'new': return 'bg-blue-500 text-white';
                                        case 'allocated': return 'bg-yellow-500 text-white';
                                        case 'attended': return 'bg-green-500 text-white';
                                        case 'awaiting_parts': return 'bg-orange-500 text-white';
                                        case 'parts_to_fit': return 'bg-purple-500 text-white';
                                        case 'completed': return 'bg-green-600 text-white';
                                        case 'costed': return 'bg-blue-600 text-white';
                                        case 'reqs_invoice': return 'bg-indigo-600 text-white';
                                        case 'green': return 'bg-green-500 text-white';
                                        case 'amber': return 'bg-amber-500 text-white';
                                        case 'red': return 'bg-red-500 text-white';
                                        default: return 'bg-gray-500 text-white';
                                      }
                                    };

                                    return (
                                      <Badge className={`${getStatusColor(job.status)} px-2 py-0.5 text-xs font-medium`}>
                                        {getStatusDisplay(job.status)}
                                      </Badge>
                                    );
                                  })()}
                                </div>
                              </div>
                              <div className="ml-3">
                                <div className={`w-3 h-3 rounded-full ${
                                  alert.type === 'ENGINEER_ACCEPT' ? 'bg-blue-500' : 'bg-green-500'
                                }`} />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
           
           {/* Stats */}
           <div className="flex items-center gap-6">
             <div className="text-center">
               <div className="text-2xl font-bold text-blue-600">{activeAlerts.length}</div>
               <div className="text-sm text-gray-600">Active Alerts</div>
             </div>
             <div className="text-center">
               <div className="text-2xl font-bold text-green-600">{resolvedAlerts.length}</div>
               <div className="text-sm text-gray-600">Resolved</div>
             </div>
           </div>
         </div>
       </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="active" className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Active Alerts ({activeAlerts.length})
          </TabsTrigger>
          <TabsTrigger value="resolved" className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            Resolved ({resolvedAlerts.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-4">
          {activeAlerts.length === 0 ? (
            <Card className="bg-green-50 border-2 border-green-200">
              <CardContent className="p-8 text-center">
                <CheckCircle className="mx-auto h-16 w-16 text-green-600 mb-4" />
                <h3 className="text-xl font-semibold text-green-800 mb-2">All Engineer Alerts Resolved</h3>
                <p className="text-green-700 text-lg">Great job! All engineers have accepted their jobs and are on site.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {activeAlerts.map(renderAlertCard)}
            </div>
          )}
        </TabsContent>

        <TabsContent value="resolved" className="space-y-4">
                     {resolvedAlerts.length === 0 ? (
             <Card className="bg-gray-50 border-2 border-gray-200">
               <CardContent className="p-8 text-center">
                 <CheckCircle className="mx-auto h-16 w-16 text-gray-600 mb-4" />
                 <h3 className="text-xl font-semibold text-gray-800 mb-2">No Resolved Alerts</h3>
                 <p className="text-gray-700 text-lg">Resolved alerts will appear here once you start resolving them.</p>
               </CardContent>
             </Card>
           ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {resolvedAlerts.map(alert => (
                <Card key={alert.id} className="bg-gray-50 border-2 border-gray-200 opacity-75">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 mt-1">
                        {getAlertIcon(alert.type)}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-3">
                          <h3 className="font-semibold text-lg text-gray-700">
                            {getAlertTitle(alert.type)}
                          </h3>
                          <Badge className="bg-green-600 text-white text-xs font-medium">
                            Resolved
                          </Badge>
                        </div>
                        
                        <p className="text-gray-600 mb-4 text-base">
                          {getAlertDescription(alert.type, alert.jobNumber)}
                        </p>
                        
                        <div className="grid grid-cols-2 gap-4 text-sm text-gray-500 mb-3">
                          <div>
                            <span className="font-medium">Job:</span>
                            <p className="font-mono">{alert.jobNumber}</p>
                          </div>
                          <div>
                            <span className="font-medium">Engineer:</span>
                            <p>{alert.engineer}</p>
                          </div>
                          <div>
                            <span className="font-medium">Resolved by:</span>
                            <p>{alert.resolvedBy || 'Unknown'}</p>
                          </div>
                          <div>
                            <span className="font-medium">Resolved at:</span>
                            <p>{alert.resolvedAt?.toLocaleString() || 'Unknown'}</p>
                          </div>
                        </div>
                        
                        {alert.resolution && (
                          <div className="bg-white p-3 rounded border">
                            <span className="font-medium text-gray-700">Resolution:</span>
                            <p className="text-gray-600 mt-1">{alert.resolution}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Engineer Details Modal */}
      <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3 text-xl">
              {selectedAlert && getAlertIcon(selectedAlert.type)}
              {selectedAlert && getAlertTitle(selectedAlert.type)}
            </DialogTitle>
          </DialogHeader>
          
          {selectedAlert && (
            <div className="space-y-6">
              {/* Job Information */}
              <Card className="bg-gray-50 border-2 border-gray-200">
                <CardHeader>
                  <CardTitle className="text-lg text-gray-900">Job Details</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-gray-700">Job Number:</span>
                      <p className="text-gray-900 font-mono">{selectedAlert.jobNumber}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Priority:</span>
                      <Badge className={`${getPriorityColor(selectedAlert.priority)} ml-2`}>
                        {selectedAlert.priority}
                      </Badge>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Customer:</span>
                      <p className="text-gray-900">{selectedAlert.customer}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Site:</span>
                      <p className="text-gray-900">{selectedAlert.site}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Visit Status */}
              <Card className="bg-amber-50 border-2 border-amber-200">
                <CardHeader>
                  <CardTitle className="text-lg text-amber-900">Visit Status</CardTitle>
                </CardHeader>
                <CardContent>
                  {(() => {
                    const job = jobs.find(j => j.id === selectedAlert.jobId);
                    if (!job) return <p className="text-red-600">Job not found</p>;
                    
                    const getStatusDisplay = (status: string) => {
                      switch (status) {
                        case 'new': return 'New Job';
                        case 'allocated': return 'Allocated to Engineer';
                        case 'attended': return 'Engineer Accepted';
                        case 'awaiting_parts': return 'Awaiting Parts';
                        case 'parts_to_fit': return 'Parts to Fit';
                        case 'completed': return 'Completed';
                        case 'costed': return 'Costed';
                        case 'reqs_invoice': return 'Requires Invoice';
                        case 'green': return 'On Track';
                        case 'amber': return 'Attention Required';
                        case 'red': return 'Critical';
                        default: return status.charAt(0).toUpperCase() + status.slice(1).replace(/_/g, ' ');
                      }
                    };

                    const getStatusColor = (status: string) => {
                      switch (status) {
                        case 'new': return 'bg-blue-100 text-blue-800 border-blue-200';
                        case 'allocated': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
                        case 'attended': return 'bg-green-100 text-green-800 border-green-200';
                        case 'awaiting_parts': return 'bg-orange-100 text-orange-800 border-orange-200';
                        case 'parts_to_fit': return 'bg-purple-100 text-purple-800 border-purple-200';
                        case 'completed': return 'bg-green-600 text-white border-green-700';
                        case 'costed': return 'bg-blue-600 text-white border-blue-700';
                        case 'reqs_invoice': return 'bg-indigo-600 text-white border-indigo-700';
                        case 'green': return 'bg-green-100 text-green-800 border-green-200';
                        case 'amber': return 'bg-amber-100 text-amber-800 border-amber-200';
                        case 'red': return 'bg-red-100 text-red-800 border-red-200';
                        default: return 'bg-gray-100 text-gray-800 border-gray-200';
                      }
                    };

                    return (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-amber-900">Current Status:</span>
                          <Badge className={`${getStatusColor(job.status)} px-3 py-1 text-sm font-medium border`}>
                            {getStatusDisplay(job.status)}
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="font-medium text-amber-900">Date Logged:</span>
                            <p className="text-amber-800">{job.dateLogged.toLocaleDateString()}</p>
                          </div>
                          <div>
                            <span className="font-medium text-amber-900">Date Accepted:</span>
                            <p className="text-amber-800">
                              {job.dateAccepted ? job.dateAccepted.toLocaleDateString() : 'Not yet accepted'}
                            </p>
                          </div>
                          <div>
                            <span className="font-medium text-amber-900">Date On Site:</span>
                            <p className="text-amber-800">
                              {job.dateOnSite ? job.dateOnSite.toLocaleDateString() : 'Not yet on site'}
                            </p>
                          </div>
                          <div>
                            <span className="font-medium text-amber-900">Date Completed:</span>
                            <p className="text-amber-800">
                              {job.dateCompleted ? job.dateCompleted.toLocaleDateString() : 'Not yet completed'}
                            </p>
                          </div>
                        </div>

                        {job.dateAccepted && (
                          <div className="bg-green-50 border border-green-200 p-3 rounded-lg">
                            <div className="flex items-center gap-2 text-green-800">
                              <CheckCircle className="h-4 w-4" />
                              <span className="font-medium">Engineer accepted job on {job.dateAccepted.toLocaleDateString()}</span>
                            </div>
                          </div>
                        )}

                        {job.dateOnSite && (
                          <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg">
                            <div className="flex items-center gap-2 text-blue-800">
                              <MapPin className="h-4 w-4" />
                              <span className="font-medium">Engineer arrived on site on {job.dateOnSite.toLocaleDateString()}</span>
                            </div>
                          </div>
                        )}

                        {job.dateCompleted && (
                          <div className="bg-green-50 border border-green-200 p-3 rounded-lg">
                            <div className="flex items-center gap-2 text-green-800">
                              <CheckCircle className="h-4 w-4" />
                              <span className="font-medium">Job completed on {job.dateCompleted.toLocaleDateString()}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </CardContent>
              </Card>

              {/* Engineer Information */}
              <Card className="bg-blue-50 border-2 border-blue-200">
                <CardHeader>
                  <CardTitle className="text-lg text-blue-900">Engineer Details</CardTitle>
                </CardHeader>
                <CardContent>
                  {(() => {
                    const engineer = getEngineerDetails(selectedAlert.engineer);
                    if (!engineer) {
                      return <p className="text-red-600">Engineer information not found</p>;
                    }
                    
                    return (
                      <div className="space-y-4">
                        <div className="flex items-center gap-4">
                          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                            <User className="h-8 w-8 text-blue-600" />
                          </div>
                          <div>
                            <h4 className="text-xl font-semibold text-blue-900">{engineer.name}</h4>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="secondary" className="text-blue-700 bg-blue-100">
                                {engineer.status}
                              </Badge>
                              {engineer.isOnHoliday && (
                                <Badge variant="destructive" className="text-xs">
                                  <Calendar className="h-3 w-3 mr-1" />
                                  Holiday
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="flex items-center gap-3">
                            <Phone className="h-5 w-5 text-blue-600" />
                            <span className="text-blue-900 font-medium">{engineer.phone}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <Mail className="h-5 w-5 text-blue-600" />
                            <span className="text-blue-900 font-medium">{engineer.email}</span>
                          </div>
                          {engineer.shiftTiming && (
                            <div className="flex items-center gap-3">
                              <Clock className="h-5 w-5 text-blue-600" />
                              <span className="text-blue-900 font-medium">{engineer.shiftTiming}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-3">
                            <Briefcase className="h-5 w-5 text-blue-600" />
                            <Badge variant={engineer.isOnHoliday ? 'destructive' : 'secondary'}>
                              {engineer.isOnHoliday ? 'On Holiday' : 'Available'}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </CardContent>
              </Card>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-6 border-t-2 border-gray-200">
                <div className="flex items-center gap-4">
                  <Button
                    onClick={() => {
                      const engineer = getEngineerDetails(selectedAlert.engineer);
                      if (engineer) {
                        handleCallEngineer(engineer.name);
                      }
                    }}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 h-12 text-base font-medium"
                  >
                    <Phone className="h-5 w-5 mr-2" />
                    Call Engineer
                  </Button>
                  
                  <Button
                    onClick={() => {
                      const engineer = getEngineerDetails(selectedAlert.engineer);
                      if (engineer) {
                        window.open(`mailto:${engineer.email}`, '_blank');
                      }
                    }}
                    variant="outline"
                    className="border-2 border-blue-200 text-blue-700 hover:bg-blue-50 px-6 py-3 h-12 text-base font-medium"
                  >
                    <Mail className="h-5 w-5 mr-2" />
                    Email Engineer
                  </Button>
                </div>
                
                <Button
                  onClick={() => setShowResolutionModal(true)}
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 h-12 text-base font-medium"
                >
                  <Check className="h-5 w-5 mr-2" />
                  Resolve Alert
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Resolution Modal */}
      <CustomPromptModal
        isOpen={showResolutionModal}
        onClose={() => setShowResolutionModal(false)}
        onSubmit={(resolution) => {
          if (selectedAlert) {
            handleResolveAlert(selectedAlert.id, resolution);
          }
        }}
        title="Resolve Alert"
        message="Please enter resolution notes for this alert:"
        placeholder="Enter resolution details..."
        type="textarea"
        submitText="Resolve Alert"
        cancelText="Cancel"
        icon="success"
        required={true}
        maxLength={500}
      />
    </div>
  );
}

