


import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Customer, Job, JobAlert } from '@/types/job';
import { getStatusColor, getPriorityColor } from '@/lib/jobUtils';
import { 
  ArrowLeft, 
  Bell, 
  Search, 
  Filter, 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  XCircle,
  User, 
  Building2,
  Briefcase,
  MapPin,
  Calendar,
  Plus
} from 'lucide-react';
import CreateAlertModal from './CreateAlertModal';
import CustomPromptModal from '@/components/ui/custom-prompt-modal';

interface CustomerAlertsPortalProps {
  customer: Customer;
  jobs: Job[];
  onBack: () => void;
  onJobUpdate: (job: Job) => void;
}

export default function CustomerAlertsPortal({ 
  customer, 
  jobs, 
  onBack,
  onJobUpdate
}: CustomerAlertsPortalProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [alertTypeFilter, setAlertTypeFilter] = useState<string>('all');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [customAlerts, setCustomAlerts] = useState<JobAlert[]>([]);
  const [showResolutionModal, setShowResolutionModal] = useState(false);
  const [selectedAlertForResolution, setSelectedAlertForResolution] = useState<JobAlert | null>(null);

  // Filter jobs for this customer
  const customerJobs = jobs.filter(job => job.customer === customer.name);
  
  // Generate alerts for customer jobs
  const generateAlerts = (jobs: Job[]): JobAlert[] => {
    const alerts: JobAlert[] = [];
    
    jobs.forEach(job => {
      // SLA-based alerts
      if (job.status === 'red') {
        alerts.push({
          id: `sla-${job.id}`,
          jobId: job.id,
          type: 'SLA Breach',
          message: `Job ${job.jobNumber} has exceeded SLA time limit`,
          severity: 'high',
          timestamp: new Date(),
          acknowledged: false,
          resolved: false
        });
      }
      
      // Priority-based alerts
      if (job.priority === 'Critical') {
        alerts.push({
          id: `priority-${job.id}`,
          jobId: job.id,
          type: 'Critical Priority',
          message: `Job ${job.jobNumber} is marked as Critical priority`,
          severity: 'high',
          timestamp: new Date(),
          acknowledged: false,
          resolved: false
        });
      }
      
      // Status-based alerts
      if (job.status === 'amber' && job.priority === 'High') {
        alerts.push({
          id: `status-${job.id}`,
          jobId: job.id,
          type: 'High Priority In Progress',
          message: `High priority job ${job.jobNumber} is in progress`,
          severity: 'medium',
      timestamp: new Date(),
          acknowledged: false,
          resolved: false
        });
      }
    });
    
    return alerts;
  };

  const systemAlerts = generateAlerts(customerJobs);
  const allAlerts = [...systemAlerts, ...customAlerts];
  
  // Filter alerts based on search and filters
  const filteredAlerts = allAlerts.filter(alert => {
    const job = customerJobs.find(j => j.id === alert.jobId);
    if (!job) return false;
    
    const matchesSearch = searchTerm === '' || 
      alert.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
      alert.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.jobNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.site.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'unresolved' && !alert.resolved) ||
      (statusFilter === 'resolved' && alert.resolved);
    
    const matchesPriority = priorityFilter === 'all' || 
      (priorityFilter === 'high' && alert.severity === 'high') ||
      (priorityFilter === 'medium' && alert.severity === 'medium') ||
      (priorityFilter === 'low' && alert.severity === 'low');
    
    const matchesAlertType = alertTypeFilter === 'all' || alert.type === alertTypeFilter;
    
    return matchesSearch && matchesStatus && matchesPriority && matchesAlertType;
  });

  // Calculate statistics
  const stats = {
    total: allAlerts.length,
    unresolved: allAlerts.filter(alert => !alert.resolved).length,
    resolved: allAlerts.filter(alert => alert.resolved).length,
    high: allAlerts.filter(alert => alert.severity === 'high').length,
    medium: allAlerts.filter(alert => alert.severity === 'medium').length,
    low: allAlerts.filter(alert => alert.severity === 'low').length
  };



  const handleResolveAlert = (alertId: string, resolution: string) => {
    // Check if it's a custom alert
    if (alertId.startsWith('custom-')) {
      setCustomAlerts(prev => prev.map(alert => 
        alert.id === alertId ? { 
          ...alert, 
          resolved: true,
          resolution: resolution,
          resolvedAt: new Date(),
          resolvedBy: 'Current User'
        } : alert
      ));
    }
    console.log('Resolving alert:', alertId, 'with resolution:', resolution);
  };

  const handleCreateAlert = (alertData: {
    jobId: string;
    type: string;
    message: string;
    severity: 'low' | 'medium' | 'high';
    priority: string;
  }) => {
    const newAlert: JobAlert = {
      id: `custom-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      jobId: alertData.jobId,
      type: alertData.type,
      message: alertData.message,
      severity: alertData.severity,
      timestamp: new Date(),
      acknowledged: false,
      resolved: false
    };

    setCustomAlerts(prev => [...prev, newAlert]);
    console.log('Alert created successfully:', newAlert);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200';
      case 'medium': return 'text-amber-600 bg-amber-50 border-amber-200';
      case 'low': return 'text-blue-600 bg-blue-50 border-blue-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'high': return AlertTriangle;
      case 'medium': return Clock;
      case 'low': return Bell;
      default: return Bell;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{customer.name} - Alerts Portal</h1>
          <p className="text-muted-foreground mt-2">
            Monitor and manage alerts for {customer.name}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            onClick={() => setIsCreateModalOpen(true)} 
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Create Alert
          </Button>
          <Button onClick={onBack} variant="outline" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Customer Details
          </Button>
        </div>
      </div>

      {/* Alert Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-800">Total Alerts</CardTitle>
            <Bell className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-900">{stats.total}</div>
            <p className="text-xs text-blue-700">All alerts</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-red-800">Unresolved</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-900">{stats.unresolved}</div>
            <p className="text-xs text-red-700">Require attention</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-800">Resolved</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-900">{stats.resolved}</div>
            <p className="text-xs text-green-700">Completed</p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Search and Filter Alerts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-3">
              <Search className="text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search alerts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
                  </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="unresolved">Unresolved</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
              </SelectContent>
            </Select>

            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priority</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>

            <Select value={alertTypeFilter} onValueChange={setAlertTypeFilter}>
                                  <SelectTrigger>
                <SelectValue placeholder="Alert Type" />
                                  </SelectTrigger>
                                  <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="SLA Breach">SLA Breach</SelectItem>
                <SelectItem value="Critical Priority">Critical Priority</SelectItem>
                <SelectItem value="High Priority In Progress">High Priority In Progress</SelectItem>
                                  </SelectContent>
                                </Select>
          </div>
        </CardContent>
      </Card>

      {/* Alerts List */}
        <Card>
          <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Customer Alerts ({filteredAlerts.length})
          </CardTitle>
          </CardHeader>
          <CardContent>
          <div className="space-y-4">
            {filteredAlerts.length > 0 ? (
              filteredAlerts.map(alert => {
                const job = customerJobs.find(j => j.id === alert.jobId);
                const SeverityIcon = getSeverityIcon(alert.severity);
                
                return (
                  <div key={alert.id} className={`p-4 border rounded-lg ${getSeverityColor(alert.severity)}`}>
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        <div className="p-2 bg-white/50 rounded-lg">
                          <SeverityIcon className="h-5 w-5" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold">{alert.type}</h3>
                            <Badge variant="outline" className="text-xs">
                              {alert.severity}
                            </Badge>
                            {alert.resolved && (
                              <Badge variant="default" className="bg-green-600 text-xs">
                                Resolved
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm mb-2">{alert.message}</p>
                          {job && (
                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <Briefcase className="h-3 w-3" />
                                <span>{job.jobNumber}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                <span>{job.site}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <User className="h-3 w-3" />
                                <span>{job.engineer}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                <span>{formatTime(alert.timestamp)}</span>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {!alert.resolved && (
                          <Button 
                            size="sm" 
                            variant="default"
                            onClick={() => {
                              setSelectedAlertForResolution(alert);
                              setShowResolutionModal(true);
                            }}
                          >
                            Resolve
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-8">
                <Bell className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-2 text-sm font-semibold text-gray-900">No alerts found</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {allAlerts.length === 0 
                    ? `No alerts for ${customer.name} at this time.`
                    : 'No alerts match your current filters.'
                  }
                </p>
              </div>
            )}
            </div>
          </CardContent>
        </Card>

      {/* Create Alert Modal */}
      <CreateAlertModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        jobs={customerJobs}
        onAlertCreate={handleCreateAlert}
      />

      {/* Resolution Modal */}
      <CustomPromptModal
        isOpen={showResolutionModal}
        onClose={() => {
          setShowResolutionModal(false);
          setSelectedAlertForResolution(null);
        }}
        onSubmit={(resolution) => {
          if (selectedAlertForResolution) {
            handleResolveAlert(selectedAlertForResolution.id, resolution);
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