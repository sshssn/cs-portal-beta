import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Job, Customer } from '@/types/job';
import { getStatusColor, getPriorityColor } from '@/lib/jobUtils';
import { 
  ArrowLeft, 
  Search, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  MapPin,
  Phone,
  Smartphone,
  User
} from 'lucide-react';

interface JobAlertsPageProps {
  customer: Customer;
  jobs: Job[];
  onBack: () => void;
}

export default function JobAlertsPage({ customer, jobs, onBack }: JobAlertsPageProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');

  // Filter jobs based on search and filters
  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.jobNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.engineer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || job.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || job.priority === priorityFilter;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

  // Get engineer sync status icon
  const getSyncStatusIcon = (status: string) => {
    switch (status) {
      case 'accepted':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'traveling':
        return <Clock className="h-4 w-4 text-blue-600" />;
      case 'onsite':
        return <MapPin className="h-4 w-4 text-orange-600" />;
      case 'revisit required':
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  // Get engineer sync status color
  const getSyncStatusColor = (status: string) => {
    switch (status) {
      case 'accepted':
        return 'bg-green-500 text-white border-green-600 shadow-sm';
      case 'traveling':
        return 'bg-blue-500 text-white border-blue-600 shadow-sm';
      case 'onsite':
        return 'bg-orange-500 text-white border-orange-600 shadow-sm';
      case 'revisit required':
        return 'bg-red-500 text-white border-red-600 shadow-sm';
      default:
        return 'bg-gray-500 text-white border-gray-600 shadow-sm';
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Left Sidebar */}
      <div className="w-64 bg-white shadow-lg">
        <div className="p-6 border-b">
          <Button 
            variant="ghost" 
            onClick={onBack}
            className="mb-4 p-0 h-auto font-normal"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          <h2 className="text-xl font-bold text-gray-900">Job Alerts</h2>
          <p className="text-sm text-gray-600">{customer.name}</p>
        </div>
        
        <div className="p-4 space-y-4">
          {/* Quick Stats */}
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium">Total Jobs</span>
              </div>
              <span className="text-lg font-bold text-blue-600">{jobs.length}</span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium">Completed</span>
              </div>
              <span className="text-lg font-bold text-green-600">
                {jobs.filter(job => job.status === 'completed').length}
              </span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-amber-50 rounded-lg">
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-amber-600" />
                <span className="text-sm font-medium">In Progress</span>
              </div>
              <span className="text-lg font-bold text-amber-600">
                {jobs.filter(job => job.status !== 'completed').length}
              </span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <span className="text-sm font-medium">Critical</span>
              </div>
              <span className="text-lg font-bold text-red-600">
                {jobs.filter(job => job.priority === 'Critical').length}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="p-6">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Job Alerts - {customer.name}</h1>
            <p className="text-gray-600">Monitor job status and engineer mobile app sync</p>
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search jobs, descriptions, or engineers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="green">Green</SelectItem>
                  <SelectItem value="amber">Amber</SelectItem>
                  <SelectItem value="red">Red</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All priorities" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priorities</SelectItem>
                  <SelectItem value="Critical">Critical</SelectItem>
                  <SelectItem value="High">High</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="Low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Jobs Table */}
          <Card>
            <CardHeader>
              <CardTitle>Job Status & Engineer Sync</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-4 font-medium text-gray-900">Job Number</th>
                      <th className="text-left p-4 font-medium text-gray-900">Assigned Engineer</th>
                      <th className="text-left p-4 font-medium text-gray-900">Job Status</th>
                      <th className="text-left p-4 font-medium text-gray-900">Engineer Mobile Sync</th>
                      <th className="text-left p-4 font-medium text-gray-900">Priority</th>
                      <th className="text-left p-4 font-medium text-gray-900">Site</th>
                      <th className="text-left p-4 font-medium text-gray-900">Created</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredJobs.map(job => (
                      <tr key={job.id} className="border-b hover:bg-gray-50">
                        <td className="p-4">
                          <div>
                            <div className="font-medium text-gray-900">{job.jobNumber}</div>
                            <div className="text-sm text-gray-600 truncate max-w-xs">
                              {job.description}
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center space-x-2">
                            <User className="h-4 w-4 text-gray-400" />
                            <div>
                              <div className="font-medium text-gray-900">{job.engineer}</div>
                              <div className="text-sm text-gray-600 flex items-center">
                                <Phone className="h-3 w-3 mr-1" />
                                Contact available
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <Badge 
                            variant="secondary" 
                            className={`${getStatusColor(job.status)}`}
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
                        </td>
                        <td className="p-4">
                          <div className="flex items-center space-x-2">
                            {getSyncStatusIcon('accepted')}
                            <Badge 
                              variant="outline" 
                              className={`${getSyncStatusColor('accepted')} text-xs`}
                            >
                              Accepted
                            </Badge>
                          </div>
                          <div className="text-xs text-gray-500 mt-1 flex items-center">
                            <Smartphone className="h-3 w-3 mr-1" />
                            Last sync: 2 min ago
                          </div>
                        </td>
                        <td className="p-4">
                          <Badge 
                            variant="outline" 
                            className={`${getPriorityColor(job.priority)}`}
                          >
                            {job.priority}
                          </Badge>
                        </td>
                        <td className="p-4">
                          <div className="text-sm text-gray-900">{job.site}</div>
                        </td>
                        <td className="p-4">
                          <div className="text-sm text-gray-900">
                            {new Date(job.dateLogged).toLocaleDateString()}
                          </div>
                          <div className="text-xs text-gray-500">
                            {new Date(job.dateLogged).toLocaleTimeString()}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {filteredJobs.length === 0 && (
                  <div className="text-center py-12">
                    <AlertTriangle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No jobs found</h3>
                    <p className="text-gray-600">Try adjusting your search or filters.</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}