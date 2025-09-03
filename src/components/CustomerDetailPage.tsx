import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Customer, Job } from '@/types/job';
import { getStatusColor, getPriorityColor } from '@/lib/jobUtils';
import { 
  ArrowLeft, 
  Building2, 
  Phone, 
  Mail, 
  MapPin,
  Users,
  Briefcase,
  Clock,
  CheckCircle,
  AlertTriangle,
  User,
  Calendar,
  Bell
} from 'lucide-react';

interface CustomerDetailPageProps {
  customer: Customer;
  jobs: Job[];
  onBack: () => void;
  onJobClick: (job: Job) => void;
  onAlertsClick: () => void;
}

export default function CustomerDetailPage({ 
  customer, 
  jobs, 
  onBack, 
  onJobClick,
  onAlertsClick
}: CustomerDetailPageProps) {
  // Filter jobs for this customer
  const customerJobs = jobs.filter(job => job.customer === customer.name);
  
  // Calculate statistics
  const stats = {
    total: customerJobs.length,
    active: customerJobs.filter(job => job.status === 'amber' || job.status === 'red').length,
    completed: customerJobs.filter(job => job.status === 'green').length,
    critical: customerJobs.filter(job => job.priority === 'Critical').length,
    overdue: customerJobs.filter(job => job.status === 'red').length
  };

  const getUrgentJobsCount = () => {
    return customerJobs.filter(job => job.status === 'red').length;
  };

  const getActiveJobsCount = () => {
    return customerJobs.filter(job => job.status !== 'green').length;
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{customer.name}</h1>
          <p className="text-muted-foreground mt-2">
            {customer.sites.length} sites managed
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button onClick={onAlertsClick} variant="outline" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Alerts Portal
          </Button>
          <Button onClick={onBack} variant="outline" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
        </div>
      </div>

      {/* Customer Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Customer Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Phone</p>
                  <p className="text-sm text-muted-foreground">{customer.phone}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Email</p>
                  <p className="text-sm text-muted-foreground">{customer.email}</p>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Sites</p>
                  <p className="text-sm text-muted-foreground">{customer.sites.length} locations</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Briefcase className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Total Jobs</p>
                  <p className="text-sm text-muted-foreground">{stats.total} jobs</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Sites List */}
          {customer.sites.length > 0 && (
            <div className="mt-6">
              <h3 className="text-sm font-medium mb-3">Sites</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {customer.sites.map((site, index) => (
                  <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{site}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Job Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Briefcase className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-muted-foreground">Total Jobs</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-amber-600" />
              <div>
                <p className="text-sm text-muted-foreground">Active</p>
                <p className="text-2xl font-bold">{stats.active}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm text-muted-foreground">Completed</p>
                <p className="text-2xl font-bold">{stats.completed}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <div>
                <p className="text-sm text-muted-foreground">Critical</p>
                <p className="text-2xl font-bold">{stats.critical}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <div>
                <p className="text-sm text-muted-foreground">Overdue</p>
                <p className="text-2xl font-bold">{stats.overdue}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Engineer Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Engineers
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {customerJobs.length > 0 ? (
              (() => {
                // Get unique engineers for this customer
                const engineers = [...new Set(customerJobs.map(job => job.engineer))];
                return engineers.map(engineer => {
                  const engineerJobs = customerJobs.filter(job => job.engineer === engineer);
                  const completedJobs = engineerJobs.filter(job => job.status === 'green').length;
                  const activeJobs = engineerJobs.filter(job => job.status === 'amber' || job.status === 'red').length;
                  
                  return (
                    <div key={engineer} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="p-2 bg-primary/10 rounded-lg">
                          <User className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold">{engineer}</h3>
                          <p className="text-sm text-muted-foreground">
                            {engineerJobs.length} total jobs
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="default" className="bg-green-600">
                          {completedJobs} completed
                        </Badge>
                        {activeJobs > 0 && (
                          <Badge variant="secondary">
                            {activeJobs} active
                          </Badge>
                        )}
                      </div>
                    </div>
                  );
                });
              })()
            ) : (
              <div className="text-center py-8">
                <User className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-2 text-sm font-semibold text-gray-900">No engineers assigned</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  No engineers have been assigned to jobs for this customer yet.
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Jobs List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="h-5 w-5" />
            Job History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {customerJobs.length > 0 ? (
              customerJobs.map(job => (
                <div 
                  key={job.id} 
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => onJobClick(job)}
                >
                  <div className="flex items-center gap-4">
                    <div>
                      <h3 className="font-semibold">{job.jobNumber}</h3>
                      <p className="text-sm text-muted-foreground">
                        {job.site} • {job.engineer}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {job.description}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge 
                      variant="secondary" 
                                            className={`${getStatusColor(job.status)} text-white text-xs`}
                    >
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
                    <Badge 
                      variant="outline" 
                      className={`${getPriorityColor(job.priority)} text-xs`}
                    >
                      {job.priority}
                    </Badge>
                    <div className="text-right text-xs text-muted-foreground">
                      <p>{job.dateLogged.toLocaleDateString()}</p>
                      <p>{formatTime(job.dateLogged)}</p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <Briefcase className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-2 text-sm font-semibold text-gray-900">No jobs found</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  No jobs have been logged for this customer yet.
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
