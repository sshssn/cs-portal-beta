import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Job, JobAlert } from '@/types/job';
import { mockJobs } from '@/lib/jobUtils';
import { 
  Bell, 
  Search, 
  Filter, 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  XCircle,
  ArrowLeft,
  Eye,
  Check,
  X,
  Plus
} from 'lucide-react';
import CreateAlertModal from './CreateAlertModal';

interface GlobalAlertsPortalProps {
  onBack: () => void;
  onJobUpdate: (job: Job) => void;
}

interface SystemAlert extends JobAlert {
  jobId: string;
  jobNumber: string;
  customer: string;
  site: string;
  engineer: string;
  priority: Job['priority'];
  status: Job['status'];
  resolved: boolean;
  resolvedBy?: string;
  resolvedAt?: Date;
  resolution?: string;
}

export default function GlobalAlertsPortal({ onBack, onJobUpdate }: GlobalAlertsPortalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [alertTypeFilter, setAlertTypeFilter] = useState<string>('all');
  const [resolvedFilter, setResolvedFilter] = useState<string>('unresolved');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [customAlerts, setCustomAlerts] = useState<SystemAlert[]>([]);

  // Generate system alerts from jobs
  const generateSystemAlerts = (): SystemAlert[] => {
    const alerts: SystemAlert[] = [];
    
    mockJobs.forEach(job => {
      // Generate alerts based on job status and timing
      const now = new Date();
      const timeSinceLogged = now.getTime() - job.dateLogged.getTime();
      const timeSinceAccepted = job.dateAccepted ? now.getTime() - job.dateAccepted.getTime() : null;
      const timeSinceOnSite = job.dateOnSite ? now.getTime() - job.dateOnSite.getTime() : null;

      // ACCEPTED SLA Alert
      if (!job.dateAccepted && timeSinceLogged > job.customAlerts.acceptSLA * 60000) {
        alerts.push({
          id: `accept-${job.id}`,
          type: 'ACCEPTED',
          message: `Job ${job.jobNumber} has not been accepted within SLA (${job.customAlerts.acceptSLA} minutes)`,
          timestamp: new Date(job.dateLogged.getTime() + job.customAlerts.acceptSLA * 60000),
          acknowledged: false,
          jobId: job.id,
          jobNumber: job.jobNumber,
          customer: job.customer,
          site: job.site,
          engineer: job.engineer,
          priority: job.priority,
          status: job.status,
          resolved: false
        });
      }

      // ONSITE SLA Alert
      if (job.dateAccepted && !job.dateOnSite && timeSinceAccepted && timeSinceAccepted > job.customAlerts.onsiteSLA * 60000) {
        alerts.push({
          id: `onsite-${job.id}`,
          type: 'ONSITE',
          message: `Job ${job.jobNumber} engineer has not arrived on site within SLA (${job.customAlerts.onsiteSLA} minutes)`,
          timestamp: new Date(job.dateAccepted.getTime() + job.customAlerts.onsiteSLA * 60000),
          acknowledged: false,
          jobId: job.id,
          jobNumber: job.jobNumber,
          customer: job.customer,
          site: job.site,
          engineer: job.engineer,
          priority: job.priority,
          status: job.status,
          resolved: false
        });
      }

      // COMPLETED SLA Alert
      if (job.dateOnSite && !job.dateCompleted && timeSinceOnSite && timeSinceOnSite > job.customAlerts.completedSLA * 60000) {
        alerts.push({
          id: `completed-${job.id}`,
          type: 'COMPLETED',
          message: `Job ${job.jobNumber} has not been completed within SLA (${job.customAlerts.completedSLA} minutes)`,
          timestamp: new Date(job.dateOnSite.getTime() + job.customAlerts.completedSLA * 60000),
          acknowledged: false,
          jobId: job.id,
          jobNumber: job.jobNumber,
          customer: job.customer,
          site: job.site,
          engineer: job.engineer,
          priority: job.priority,
          status: job.status,
          resolved: false
        });
      }

      // OVERDUE Alert for red status jobs
      if (job.status === 'red' && !job.dateCompleted) {
        alerts.push({
          id: `overdue-${job.id}`,
          type: 'OVERDUE',
          message: `Job ${job.jobNumber} is overdue and requires immediate attention`,
          timestamp: new Date(job.dateLogged.getTime() + job.targetCompletionTime * 60000),
          acknowledged: false,
          jobId: job.id,
          jobNumber: job.jobNumber,
          customer: job.customer,
          site: job.site,
          engineer: job.engineer,
          priority: job.priority,
          status: job.status,
          resolved: false
        });
      }
    });

    return alerts.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  };

  const [alerts, setAlerts] = useState<SystemAlert[]>(generateSystemAlerts());
  const allAlerts = [...alerts, ...customAlerts];

  const filteredAlerts = allAlerts.filter(alert => {
    const matchesSearch = 
      alert.jobNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      alert.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      alert.site.toLowerCase().includes(searchQuery.toLowerCase()) ||
      alert.engineer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      alert.message.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || alert.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || alert.priority === priorityFilter;
    const matchesAlertType = alertTypeFilter === 'all' || alert.type === alertTypeFilter;
    const matchesResolved = resolvedFilter === 'all' || 
      (resolvedFilter === 'resolved' && alert.resolved) ||
      (resolvedFilter === 'unresolved' && !alert.resolved);
    
    return matchesSearch && matchesStatus && matchesPriority && matchesAlertType && matchesResolved;
  });

  const handleResolveAlert = (alertId: string, resolution: string) => {
    // Check if it's a custom alert
    if (alertId.startsWith('custom-')) {
      setCustomAlerts(prev => prev.map(alert => 
        alert.id === alertId 
          ? { 
              ...alert, 
              resolved: true, 
              resolvedBy: 'Current User', 
              resolvedAt: new Date(),
              resolution 
            }
          : alert
      ));
    } else {
      setAlerts(prev => prev.map(alert => 
        alert.id === alertId 
          ? { 
              ...alert, 
              resolved: true, 
              resolvedBy: 'Current User', 
              resolvedAt: new Date(),
              resolution 
            }
          : alert
      ));
    }
  };

  const handleCreateAlert = (alertData: {
    jobId: string;
    type: string;
    message: string;
    severity: 'low' | 'medium' | 'high';
    priority: string;
  }) => {
    const job = mockJobs.find(j => j.id === alertData.jobId);
    if (!job) return;

    const newAlert: SystemAlert = {
      id: `custom-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      jobId: alertData.jobId,
      jobNumber: job.jobNumber,
      customer: job.customer,
      site: job.site,
      engineer: job.engineer,
      priority: job.priority,
      status: job.status,
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



  const getAlertIcon = (type: JobAlert['type']) => {
    switch (type) {
      case 'ACCEPTED':
        return <Clock className="h-4 w-4 text-amber-600" />;
      case 'ONSITE':
        return <AlertTriangle className="h-4 w-4 text-orange-600" />;
      case 'COMPLETED':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'OVERDUE':
        return <Bell className="h-4 w-4 text-red-600" />;
      default:
        return <Bell className="h-4 w-4 text-gray-600" />;
    }
  };

  const getAlertColor = (type: JobAlert['type']) => {
    switch (type) {
      case 'ACCEPTED':
        return 'bg-amber-50 border-amber-200';
      case 'ONSITE':
        return 'bg-orange-50 border-orange-200';
      case 'COMPLETED':
        return 'bg-red-50 border-red-200';
      case 'OVERDUE':
        return 'bg-red-50 border-red-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const stats = {
    total: allAlerts.length,
    unresolved: allAlerts.filter(a => !a.resolved).length,
    resolved: allAlerts.filter(a => a.resolved).length,
    critical: allAlerts.filter(a => a.priority === 'Critical' && !a.resolved).length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Global Alerts Portal</h1>
          <p className="text-muted-foreground mt-2">
            Monitor and manage all system alerts across all customers and jobs
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
            Back to Dashboard
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-800">Total Alerts</CardTitle>
            <Bell className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-900">{stats.total}</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-red-800">Unresolved</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-900">{stats.unresolved}</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-800">Resolved</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-900">{stats.resolved}</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-800">Critical</CardTitle>
            <XCircle className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-900">{stats.critical}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={16} />
              <Input
                placeholder="Search alerts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Job Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="green">Completed</SelectItem>
                <SelectItem value="amber">In Progress</SelectItem>
                <SelectItem value="red">Issues</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priority</SelectItem>
                <SelectItem value="Critical">Critical</SelectItem>
                <SelectItem value="High">High</SelectItem>
                <SelectItem value="Medium">Medium</SelectItem>
                <SelectItem value="Low">Low</SelectItem>
              </SelectContent>
            </Select>

            <Select value={alertTypeFilter} onValueChange={setAlertTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Alert Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="ACCEPTED">Accept SLA</SelectItem>
                <SelectItem value="ONSITE">Onsite SLA</SelectItem>
                <SelectItem value="COMPLETED">Complete SLA</SelectItem>
                <SelectItem value="OVERDUE">Overdue</SelectItem>
              </SelectContent>
            </Select>

            <Select value={resolvedFilter} onValueChange={setResolvedFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Resolution" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="unresolved">Unresolved</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
                <SelectItem value="all">All</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Alerts List */}
      <div className="space-y-4">
        {filteredAlerts.map((alert) => (
          <Card key={alert.id} className={`${getAlertColor(alert.type)} ${alert.resolved ? 'opacity-75' : ''}`}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4 flex-1">
                  <div className="flex items-center gap-2">
                    {getAlertIcon(alert.type)}
                    <Badge variant={alert.priority === 'Critical' ? 'destructive' : 'secondary'}>
                      {alert.priority}
                    </Badge>
                    <Badge variant="outline">
                      {alert.type}
                    </Badge>
                    {alert.resolved && (
                      <Badge variant="default" className="bg-green-600">
                        Resolved
                      </Badge>
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg mb-2">{alert.message}</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-muted-foreground">
                      <div>
                        <span className="font-medium">Job:</span> {alert.jobNumber}
                      </div>
                      <div>
                        <span className="font-medium">Customer:</span> {alert.customer}
                      </div>
                      <div>
                        <span className="font-medium">Site:</span> {alert.site}
                      </div>
                      <div>
                        <span className="font-medium">Engineer:</span> {alert.engineer}
                      </div>
                    </div>
                    <div className="mt-2 text-sm text-muted-foreground">
                      <span className="font-medium">Alert Time:</span> {alert.timestamp.toLocaleString()}
                    </div>
                    {alert.resolved && (
                      <div className="mt-2 text-sm text-green-700">
                        <span className="font-medium">Resolved by:</span> {alert.resolvedBy} on {alert.resolvedAt?.toLocaleString()}
                        {alert.resolution && (
                          <div className="mt-1">
                            <span className="font-medium">Resolution:</span> {alert.resolution}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-2 ml-4">
                  {!alert.resolved && (
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => {
                        const resolution = prompt('Enter resolution notes:');
                        if (resolution) {
                          handleResolveAlert(alert.id, resolution);
                        }
                      }}
                    >
                      <Check className="h-4 w-4 mr-1" />
                      Resolve
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {filteredAlerts.length === 0 && (
        <div className="text-center py-12">
          <Bell className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-2 text-sm font-semibold text-gray-900">No alerts found</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {searchQuery || statusFilter !== 'all' || priorityFilter !== 'all' || alertTypeFilter !== 'all' || resolvedFilter !== 'unresolved'
              ? 'Try adjusting your search or filter criteria.'
              : 'All alerts have been resolved. Great job!'}
          </p>
        </div>
      )}

      {/* Create Alert Modal */}
      <CreateAlertModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        jobs={mockJobs}
        onAlertCreate={handleCreateAlert}
      />
    </div>
  );
}
