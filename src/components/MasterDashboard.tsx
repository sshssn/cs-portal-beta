import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Job, Customer } from '@/types/job';
import { getStatusColor, getPriorityColor } from '@/lib/jobUtils';
import { 
  Search, 
  Filter, 
  Plus, 
  Building2, 
  Users, 
  Clock, 
  AlertTriangle,
  CheckCircle,
  FileText,
  Calendar,
  MapPin,
  User,
  Phone,
  Bell,
  Briefcase,
  ChevronDown
} from 'lucide-react';

interface MasterDashboardProps {
  jobs: Job[];
  customers: Customer[];
  onJobCreate: () => void;
  onJobClick: (job: Job) => void;
  onAlertsClick: () => void;
}

export default function MasterDashboard({ 
  jobs, 
  customers, 
  onJobCreate, 
  onJobClick,
  onAlertsClick
}: MasterDashboardProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [searchResults, setSearchResults] = useState<{
    jobs: Job[];
    customers: Customer[];
    sites: string[];
    engineers: string[];
  }>({ jobs: [], customers: [], sites: [], engineers: [] });

  // Filter jobs based on search and filters
  const filteredJobs = jobs.filter(job => {
    const matchesSearch = searchTerm === '' || 
      (job.customer && job.customer.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (job.site && job.site.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (job.description && job.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (job.engineer && job.engineer.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = statusFilter === 'all' || job.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || job.priority === priorityFilter;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

  // Calculate statistics
  const stats = {
    total: jobs.length,
    active: jobs.filter(job => job.status === 'amber' || job.status === 'red').length,
    completed: jobs.filter(job => job.status === 'green').length,
    critical: jobs.filter(job => job.priority === 'Critical').length,
    overdue: jobs.filter(job => job.status === 'red').length
  };

  // Calculate total alerts
  const totalAlerts = jobs.filter(job => 
    job.status === 'red' || job.priority === 'Critical'
  ).length;

  // Generate search results for dropdown
  const generateSearchResults = (term: string) => {
    if (term.length < 2) {
      setSearchResults({ jobs: [], customers: [], sites: [], engineers: [] });
      return;
    }

    const lowerTerm = term.toLowerCase();
    
    // Find matching jobs
    const matchingJobs = jobs.filter(job => 
      job.jobNumber.toLowerCase().includes(lowerTerm) ||
      job.customer.toLowerCase().includes(lowerTerm) ||
      job.site.toLowerCase().includes(lowerTerm) ||
      job.engineer.toLowerCase().includes(lowerTerm) ||
      job.description.toLowerCase().includes(lowerTerm)
    ).slice(0, 5);

    // Find matching customers
    const matchingCustomers = customers.filter(customer =>
      customer.name.toLowerCase().includes(lowerTerm)
    ).slice(0, 3);

    // Find unique matching sites
    const matchingSites = [...new Set(
      jobs
        .filter(job => job.site.toLowerCase().includes(lowerTerm))
        .map(job => job.site)
    )].slice(0, 3);

    // Find unique matching engineers
    const matchingEngineers = [...new Set(
      jobs
        .filter(job => job.engineer.toLowerCase().includes(lowerTerm))
        .map(job => job.engineer)
    )].slice(0, 3);

    setSearchResults({
      jobs: matchingJobs,
      customers: matchingCustomers,
      sites: matchingSites,
      engineers: matchingEngineers
    });
  };

  // Handle search input change
  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    generateSearchResults(value);
    setShowSearchDropdown(value.length >= 2);
  };

  // Handle search result selection
  const handleSearchResultClick = (type: string, value: string) => {
    setSearchTerm(value);
    setShowSearchDropdown(false);
  };

  // Handle stat card clicks
  const handleStatClick = (statType: string) => {
    if (statType === 'total') {
      // No specific action for total jobs, just show all jobs
      setStatusFilter('all');
      setPriorityFilter('all');
      setSearchTerm('');
    } else if (statType === 'active') {
      setStatusFilter('amber');
      setPriorityFilter('all');
      setSearchTerm('');
    } else if (statType === 'completed') {
      setStatusFilter('green');
      setPriorityFilter('all');
      setSearchTerm('');
    } else if (statType === 'critical') {
      setStatusFilter('red');
      setPriorityFilter('Critical');
      setSearchTerm('');
    } else if (statType === 'overdue') {
      setStatusFilter('red');
      setPriorityFilter('all');
      setSearchTerm('');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Master Dashboard</h1>
          <p className="text-muted-foreground">Out of Hours Support Management</p>
        </div>
        <div className="flex items-center gap-3">
          {/* Alerts Indicator */}
          <Button 
            onClick={onAlertsClick} 
            variant="outline" 
            className="relative flex items-center gap-2"
          >
            <Bell className="h-4 w-4" />
            Alerts
            {totalAlerts > 0 && (
              <Badge 
                variant="destructive" 
                className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs"
              >
                {totalAlerts}
              </Badge>
            )}
          </Button>
          <Button onClick={onJobCreate} className="bg-blue-600 hover:bg-blue-700">
            <Plus size={16} className="mr-2" />
            Log New Job
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card 
          onClick={() => handleStatClick('total')}
          className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-105 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 hover:border-blue-300"
        >
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-700 font-medium">Total Jobs</p>
                <p className="text-2xl font-bold text-blue-900">{stats.total}</p>
              </div>
              <FileText className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card 
          onClick={() => handleStatClick('active')}
          className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-105 bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200 hover:border-amber-300"
        >
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-amber-700 font-medium">Active</p>
                <p className="text-2xl font-bold text-amber-900">{stats.active}</p>
              </div>
              <Clock className="h-8 w-8 text-amber-600" />
            </div>
          </CardContent>
        </Card>

        <Card 
          onClick={() => handleStatClick('completed')}
          className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-105 bg-gradient-to-br from-green-50 to-green-100 border-green-200 hover:border-green-300"
        >
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-700 font-medium">Completed</p>
                <p className="text-2xl font-bold text-green-900">{stats.completed}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card 
          onClick={() => handleStatClick('critical')}
          className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-105 bg-gradient-to-br from-red-50 to-red-100 border-red-200 hover:border-red-300"
        >
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-red-700 font-medium">Critical</p>
                <p className="text-2xl font-bold text-red-900">{stats.critical}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card 
          onClick={() => handleStatClick('overdue')}
          className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-105 bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200 hover:border-orange-300"
        >
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-orange-700 font-medium">Overdue</p>
                <p className="text-2xl font-bold text-orange-900">{stats.overdue}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Active Filters Indicator */}
      {(statusFilter !== 'all' || priorityFilter !== 'all') && (
        <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-blue-700">Active Filters:</span>
            {statusFilter !== 'all' && (
              <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                Status: {statusFilter === 'green' ? 'Completed' : statusFilter === 'amber' ? 'In Progress' : 'Overdue'}
              </Badge>
            )}
            {priorityFilter !== 'all' && (
              <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                Priority: {priorityFilter}
              </Badge>
            )}
            <span className="text-sm text-blue-600">
              ({filteredJobs.length} of {jobs.length} jobs)
            </span>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => {
              setStatusFilter('all');
              setPriorityFilter('all');
            }}
            className="text-blue-600 hover:text-blue-700"
          >
            Clear All
          </Button>
        </div>
      )}

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search by customer, site, description, or engineer..."
            value={searchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
            onFocus={() => searchTerm.length >= 2 && setShowSearchDropdown(true)}
            onBlur={() => setTimeout(() => setShowSearchDropdown(false), 200)}
            className="pl-10"
          />
          
          {/* Search Dropdown */}
          {showSearchDropdown && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-80 overflow-y-auto">
              {/* Jobs Section */}
              {searchResults.jobs.length > 0 && (
                <div className="p-2">
                  <div className="text-xs font-medium text-gray-500 mb-2 flex items-center gap-1">
                    <Briefcase className="h-3 w-3" />
                    Jobs
                  </div>
                  {searchResults.jobs.map(job => (
                    <div
                      key={job.id}
                      className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded cursor-pointer"
                      onClick={() => {
                        handleSearchResultClick('job', job.jobNumber);
                        onJobClick(job);
                      }}
                    >
                      <Briefcase className="h-4 w-4 text-blue-600" />
                      <div className="flex-1">
                        <div className="text-sm font-medium">{job.jobNumber}</div>
                        <div className="text-xs text-gray-500">{job.customer} • {job.site}</div>
                      </div>
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
                    </div>
                  ))}
                </div>
              )}

              {/* Customers Section */}
              {searchResults.customers.length > 0 && (
                <div className="p-2 border-t">
                  <div className="text-xs font-medium text-gray-500 mb-2 flex items-center gap-1">
                    <Building2 className="h-3 w-3" />
                    Customers
                  </div>
                  {searchResults.customers.map(customer => (
                    <div
                      key={customer.id}
                      className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded cursor-pointer"
                      onClick={() => handleSearchResultClick('customer', customer.name)}
                    >
                      <Building2 className="h-4 w-4 text-green-600" />
                      <div className="flex-1">
                        <div className="text-sm font-medium">{customer.name}</div>
                        <div className="text-xs text-gray-500">{customer.sites.length} sites</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Sites Section */}
              {searchResults.sites.length > 0 && (
                <div className="p-2 border-t">
                  <div className="text-xs font-medium text-gray-500 mb-2 flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    Sites
                  </div>
                  {searchResults.sites.map(site => (
                    <div
                      key={site}
                      className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded cursor-pointer"
                      onClick={() => handleSearchResultClick('site', site)}
                    >
                      <MapPin className="h-4 w-4 text-purple-600" />
                      <div className="text-sm">{site}</div>
                    </div>
                  ))}
                </div>
              )}

              {/* Engineers Section */}
              {searchResults.engineers.length > 0 && (
                <div className="p-2 border-t">
                  <div className="text-xs font-medium text-gray-500 mb-2 flex items-center gap-1">
                    <User className="h-3 w-3" />
                    Engineers
                  </div>
                  {searchResults.engineers.map(engineer => (
                    <div
                      key={engineer}
                      className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded cursor-pointer"
                      onClick={() => handleSearchResultClick('engineer', engineer)}
                    >
                      <User className="h-4 w-4 text-orange-600" />
                      <div className="text-sm">{engineer}</div>
                    </div>
                  ))}
                </div>
              )}

              {/* No Results */}
              {searchResults.jobs.length === 0 && 
               searchResults.customers.length === 0 && 
               searchResults.sites.length === 0 && 
               searchResults.engineers.length === 0 && (
                <div className="p-4 text-center text-gray-500 text-sm">
                  No results found for "{searchTerm}"
                </div>
              )}
            </div>
          )}
        </div>
        
        <div className="flex gap-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="green">Completed</SelectItem>
              <SelectItem value="amber">In Progress</SelectItem>
              <SelectItem value="red">Overdue</SelectItem>
            </SelectContent>
          </Select>

          <Select value={priorityFilter} onValueChange={setPriorityFilter}>
            <SelectTrigger className="w-32">
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
        </div>
      </div>



      {/* Jobs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
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
                    <p className="text-xs text-muted-foreground">{job.customer}</p>
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
                {job.alerts && job.alerts.length > 0 && (
                  <div className="space-y-1">
                    {job.alerts.filter(alert => !alert.acknowledged).map((alert) => (
                      <div key={alert.id} className="flex items-center space-x-1 text-red-600 bg-red-50 px-2 py-1 rounded">
                        <AlertTriangle className="h-3 w-3" />
                        <p className="text-xs font-medium">{alert.type}</p>
                      </div>
                    ))}
                  </div>
                )}
                {(!job.alerts || job.alerts.length === 0) && (job.status === 'red' || job.priority === 'Critical') && (
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
          <p className="text-muted-foreground">Try adjusting your search or filters</p>
        </div>
      )}
    </div>
  );
}