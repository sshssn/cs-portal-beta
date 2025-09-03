import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Job, Customer, Engineer } from '@/types/job';
import { getStatusColor, getPriorityColor } from '@/lib/jobUtils';
import { 
  ArrowLeft, 
  Building2, 
  MapPin, 
  User, 
  Clock, 
  AlertTriangle,
  CheckCircle,
  Phone,
  Mail,
  Calendar,
  FileText,
  Plus
} from 'lucide-react';

interface CustomerDashboardProps {
  customer: Customer;
  jobs: Job[];
  engineers: Engineer[];
  onBack: () => void;
  onJobClick: (job: Job) => void;
  onAlertsPortal: () => void;
  onJobCreate: () => void;
}

export default function CustomerDashboard({ 
  customer, 
  jobs, 
  engineers, 
  onBack, 
  onJobClick,
  onAlertsPortal,
  onJobCreate
}: CustomerDashboardProps) {
  const [selectedSite, setSelectedSite] = useState<string>('all');

  // Filter jobs for this customer
  const customerJobs = jobs.filter(job => job.customer === customer.name);
  const filteredJobs = selectedSite === 'all' 
    ? customerJobs 
    : customerJobs.filter(job => job.site === selectedSite);

  // Calculate statistics
  const stats = {
    total: customerJobs.length,
    active: customerJobs.filter(job => job.status === 'amber' || job.status === 'red').length,
    completed: customerJobs.filter(job => job.status === 'green').length,
    overdue: customerJobs.filter(job => job.status === 'red').length
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" onClick={onBack}>
            <ArrowLeft size={16} className="mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center space-x-2">
              <Building2 className="h-8 w-8" />
              <span>{customer.name}</span>
            </h1>
            <p className="text-muted-foreground">{customer.sites?.length || 0} sites managed</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button onClick={onJobCreate} className="bg-blue-600 hover:bg-blue-700">
            <Plus size={16} className="mr-2" />
            Log New Job
          </Button>
          <Button onClick={onAlertsPortal} variant="outline">
            <AlertTriangle size={16} className="mr-2" />
            Alerts Portal
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <FileText className="h-5 w-5 text-blue-600" />
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
                <p className="text-sm text-muted-foreground">Overdue</p>
                <p className="text-2xl font-bold">{stats.overdue}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Site Filter */}
      {customer.sites && customer.sites.length > 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Filter by Site</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              <Button
                variant={selectedSite === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedSite('all')}
              >
                All Sites ({customerJobs.length})
              </Button>
              {customer.sites.map(site => {
                const siteJobCount = customerJobs.filter(job => job.site === site).length;
                return (
                  <Button
                    key={site}
                    variant={selectedSite === site ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedSite(site)}
                  >
                    {site} ({siteJobCount})
                  </Button>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Active Jobs */}
      <Card>
        <CardHeader>
          <CardTitle>Active Jobs</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredJobs.map(job => (
              <Card 
                key={job.id} 
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => onJobClick(job)}
              >
                <CardContent className="p-4">
                  <div className="space-y-3">
                    {/* Header */}
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-semibold text-sm">{job.jobNumber}</p>
                        <p className="text-xs text-muted-foreground">{job.jobType}</p>
                      </div>
                      <div className="flex flex-col items-end space-y-1">
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
                      </div>
                    </div>

                    {/* Site and Description */}
                    <div className="space-y-1">
                      <div className="flex items-center space-x-1">
                        <MapPin className="h-3 w-3 text-gray-400" />
                        <p className="text-xs font-medium">{job.site}</p>
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {job.description}
                      </p>
                    </div>

                    {/* Engineer */}
                    <div className="flex items-center space-x-1">
                      <User className="h-3 w-3 text-gray-400" />
                      <p className="text-xs">{job.engineer}</p>
                    </div>

                    {/* SLA Information */}
                    <div className="bg-gray-50 p-2 rounded text-xs space-y-1">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Accept SLA:</span>
                        <span className="font-medium">{job.customAlerts?.acceptSLA || 30}min</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Onsite SLA:</span>
                        <span className="font-medium">{job.customAlerts?.onsiteSLA || 90}min</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Complete SLA:</span>
                        <span className="font-medium">{job.customAlerts?.completedSLA || 180}min</span>
                      </div>
                    </div>

                    {/* Alerts */}
                    {(job.status === 'red' || job.priority === 'Critical') && (
                      <div className="flex items-center space-x-1 text-red-600">
                        <AlertTriangle className="h-3 w-3" />
                        <p className="text-xs font-medium">Alert Active</p>
                      </div>
                    )}

                    {/* Time */}
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{job.dateLogged.toLocaleDateString()}</span>
                      <span>{job.dateLogged.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredJobs.length === 0 && (
            <div className="text-center py-12">
              <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No jobs found</h3>
              <p className="text-muted-foreground">No jobs found for the selected criteria</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Engineers Table */}
      <Card>
        <CardHeader>
          <CardTitle>Available Engineers</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium">Engineer</th>
                  <th className="text-left py-3 px-4 font-medium">Status</th>
                  <th className="text-left py-3 px-4 font-medium">Contact</th>
                  <th className="text-left py-3 px-4 font-medium">Sync Status</th>
                  <th className="text-left py-3 px-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {engineers.map(engineer => (
                  <tr key={engineer.name} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-2">
                        <User className="h-4 w-4 text-gray-400" />
                        <span className="font-medium">{engineer.name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant={engineer.status === 'accept' ? 'default' : 'secondary'}>
                        {engineer.status}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-1 text-sm">
                          <Phone className="h-3 w-3" />
                          <span>{engineer.phone}</span>
                        </div>
                        <div className="flex items-center space-x-1 text-sm">
                          <Mail className="h-3 w-3" />
                          <span>{engineer.email}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant="outline" className="text-xs">
                        {engineer.syncStatus}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      <Button size="sm" variant="outline">
                        <Phone className="h-3 w-3 mr-1" />
                        Call
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}