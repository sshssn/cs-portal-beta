import { useState, useEffect, useRef } from 'react';
import { FileText as FileTextIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Job, Customer } from '@/types/job';
import { getStatusColor, getPriorityColor } from '@/lib/jobUtils';
import { showNotification } from '@/components/ui/toast-notification';
import FaviconChanger from './FaviconChanger';
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
  // Load search filters from localStorage or use defaults
  const FILTERS_STORAGE_KEY = 'masterDashboardFilters';
  
  const [searchTerm, setSearchTerm] = useState(() => {
    const savedFilters = localStorage.getItem(FILTERS_STORAGE_KEY);
    if (savedFilters) {
      try {
        const parsed = JSON.parse(savedFilters);
        return parsed.searchTerm || '';
      } catch (error) {
        console.error('Error parsing saved filters:', error);
      }
    }
    return '';
  });
  const [statusFilter, setStatusFilter] = useState<string>(() => {
    const savedFilters = localStorage.getItem(FILTERS_STORAGE_KEY);
    if (savedFilters) {
      try {
        const parsed = JSON.parse(savedFilters);
        return parsed.statusFilter || 'all';
      } catch (error) {
        console.error('Error parsing saved filters:', error);
      }
    }
    return 'all';
  });
  const [priorityFilter, setPriorityFilter] = useState<string>(() => {
    const savedFilters = localStorage.getItem(FILTERS_STORAGE_KEY);
    if (savedFilters) {
      try {
        const parsed = JSON.parse(savedFilters);
        return parsed.priorityFilter || 'all';
      } catch (error) {
        console.error('Error parsing saved filters:', error);
      }
    }
    return 'all';
  });
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [showAlertsDropdown, setShowAlertsDropdown] = useState(false);
  const alertsDropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (alertsDropdownRef.current && !alertsDropdownRef.current.contains(event.target as Node)) {
        setShowAlertsDropdown(false);
      }
    };

    if (showAlertsDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showAlertsDropdown]);
  const [searchResults, setSearchResults] = useState<{
    jobs: Job[];
    customers: Customer[];
    sites: string[];
    engineers: string[];
  }>({ jobs: [], customers: [], sites: [], engineers: [] });

  // Draft job state
  const [draftJobData, setDraftJobData] = useState<any>(null);

  // Handle clicking outside alerts dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (alertsDropdownRef.current && !alertsDropdownRef.current.contains(event.target as Node)) {
        setShowAlertsDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Save filters to localStorage when they change
  useEffect(() => {
    localStorage.setItem(FILTERS_STORAGE_KEY, JSON.stringify({
      searchTerm,
      statusFilter,
      priorityFilter
    }));
  }, [searchTerm, statusFilter, priorityFilter]);
  
  // Check for draft job data
  useEffect(() => {
    const STORAGE_KEY = 'jobLogWizardData';
    const savedData = localStorage.getItem(STORAGE_KEY);
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        // Check if there's meaningful data (more than just defaults)
        if (parsed.customer || parsed.site || parsed.description || parsed.reporterName) {
          setDraftJobData(parsed);
        }
      } catch (error) {
        console.error('Error parsing draft job data:', error);
      }
    }
  }, []);

  // Filter jobs based on search and filters
  const filteredJobs = jobs.filter(job => {
    const matchesSearch = searchTerm === '' || 
      (job.customer && job.customer.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (job.site && job.site.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (job.description && job.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (job.engineer && job.engineer.toLowerCase().includes(searchTerm.toLowerCase()));
    
    let matchesStatus = true;
    if (statusFilter === 'all') {
      matchesStatus = true;
    } else if (statusFilter === 'active') {
      matchesStatus = ['new', 'allocated', 'attended', 'awaiting_parts'].includes(job.status);
    } else if (statusFilter === 'overdue') {
      matchesStatus = ['awaiting_parts'].includes(job.status);
    } else if (statusFilter === 'completed') {
      matchesStatus = ['completed', 'costed', 'reqs_invoice'].includes(job.status);
    } else {
      matchesStatus = job.status === statusFilter;
    }
    
    const matchesPriority = priorityFilter === 'all' || job.priority === priorityFilter;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });



  // Calculate statistics
  const stats = {
    total: jobs.length,
    active: jobs.filter(job => 
      job.status === 'new' || 
      job.status === 'allocated' || 
      job.status === 'attended' || 
      job.status === 'awaiting_parts'
    ).length,
    completed: jobs.filter(job => 
      job.status === 'completed' || 
      job.status === 'costed' || 
      job.status === 'reqs_invoice'
    ).length,
    critical: jobs.filter(job => job.priority === 'Critical').length,
    overdue: jobs.filter(job => 
      job.status === 'awaiting_parts'
    ).length
  };

  // Calculate total alerts - jobs that need attention
  const totalAlerts = jobs.filter(job => 
    job.priority === 'Critical' ||
    job.status === 'new' ||
    job.status === 'awaiting_parts'
  ).length;

  // Get latest alerts for dropdown
  const latestAlerts = jobs
    .filter(job => 
      job.priority === 'Critical' ||
      job.status === 'new' ||
      job.status === 'awaiting_parts'
    )
    .sort((a, b) => new Date(b.dateLogged).getTime() - new Date(a.dateLogged).getTime())
    .slice(0, 10);

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
      // Show all active statuses (both old and new)
      setStatusFilter('active');
      setPriorityFilter('all');
      setSearchTerm('');
    } else if (statType === 'completed') {
      // Show all completed statuses (both old and new)
      setStatusFilter('completed');
      setPriorityFilter('all');
      setSearchTerm('');
    } else if (statType === 'critical') {
      setStatusFilter('all');
      setPriorityFilter('Critical');
      setSearchTerm('');
    } else if (statType === 'overdue') {
      // Show overdue statuses (both old and new)
      setStatusFilter('overdue');
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
            {/* Favicon Changer */}
            <FaviconChanger />
            
            {/* Enhanced Alerts Indicator */}
            <div className="relative" ref={alertsDropdownRef}>
              <Button 
                onClick={() => setShowAlertsDropdown(!showAlertsDropdown)} 
                variant="outline" 
                className="relative flex items-center gap-2 hover:bg-gray-50 transition-colors"
              >
                <Bell className="h-5 w-5 text-gray-600" />
                <span className="text-gray-700 font-medium">Alerts</span>
                {totalAlerts > 0 && (
                  <Badge 
                    variant="destructive" 
                    className="absolute -top-2 -right-2 h-6 w-6 flex items-center justify-center p-0 text-xs font-bold"
                  >
                    {totalAlerts > 99 ? '99+' : totalAlerts}
                  </Badge>
                )}
              </Button>

              {/* Alerts Dropdown */}
              {showAlertsDropdown && (
                <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-[9999] pointer-events-auto">
                  <div className="p-4 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-gray-900">Recent Alerts</h3>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={onAlertsClick}
                        className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 pointer-events-auto"
                      >
                        View All
                      </Button>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      {totalAlerts} alert{totalAlerts !== 1 ? 's' : ''} requiring attention
                    </p>
                  </div>
                  
                  <div className="max-h-96 overflow-y-auto pointer-events-auto">
                    {latestAlerts.length === 0 ? (
                      <div className="p-4 text-center text-gray-500">
                        <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-500" />
                        <p className="text-sm">No active alerts</p>
                        <p className="text-xs">All jobs are running smoothly</p>
                      </div>
                    ) : (
                      <div className="divide-y divide-gray-100">
                        {latestAlerts.map((job) => (
                          <div 
                            key={job.id}
                            className="p-4 hover:bg-gray-50 cursor-pointer transition-colors pointer-events-auto"
                            onClick={(e) => {
                              e.stopPropagation();
                              onJobClick(job);
                              setShowAlertsDropdown(false);
                            }}
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <Badge 
                                    variant={job.status === 'new' || job.status === 'awaiting_parts' || job.priority === 'Critical' ? 'destructive' : 'secondary'}
                                    className="text-xs"
                                  >
                                    {job.priority === 'Critical' ? 'Critical' : 
                                     job.status === 'new' ? 'New Job' : 
                                     job.status === 'awaiting_parts' ? 'Awaiting Parts' : 
                                     job.priority}
                                  </Badge>
                                  <span className="text-xs text-gray-500">
                                    {new Date(job.dateLogged).toLocaleDateString()}
                                  </span>
                                </div>
                                <h4 className="text-sm font-medium text-gray-900 mb-1">
                                  {job.jobNumber} - {job.customer}
                                </h4>
                                <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                                  {job.description}
                                </p>
                                <div className="flex items-center gap-2 text-xs text-gray-500">
                                  <MapPin className="h-3 w-3" />
                                  <span>{job.site}</span>
                                  <span>•</span>
                                  <User className="h-3 w-3" />
                                  <span>{job.engineer}</span>
                                </div>
                              </div>
                              <div className="ml-3">
                                <div className={`w-3 h-3 rounded-full ${
                                  job.priority === 'Critical' ? 'bg-red-500' : 
                                  job.status === 'attended' ? 'bg-amber-500' : 
                                  job.status === 'new' ? 'bg-blue-500' : 
                                  job.status === 'allocated' ? 'bg-yellow-500' : 
                                  job.status === 'attended' ? 'bg-orange-500' : 
                                  job.status === 'awaiting_parts' ? 'bg-purple-500' : 
                                  job.status === 'completed' || job.status === 'costed' || job.status === 'reqs_invoice' ? 'bg-green-500' : 
                                  'bg-gray-500'
                                }`} />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  <div className="p-3 border-t border-gray-200 bg-gray-50">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowAlertsDropdown(false);
                      }}
                      className="w-full text-gray-600 hover:text-gray-800 pointer-events-auto"
                    >
                      Close
                    </Button>
                  </div>
                </div>
              )}
            </div>

            <Button onClick={onJobCreate} className="bg-blue-600 hover:bg-blue-700">
              <Plus size={16} className="mr-2" />
              Log New Job
            </Button>
          </div>
      </div>

      {/* Draft Job Card */}
      {draftJobData && (
        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200 shadow-lg">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <FileTextIcon className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <CardTitle className="text-lg text-orange-900">Draft Job In Progress</CardTitle>
                  <p className="text-sm text-orange-700">Resume your unfinished job creation</p>
                </div>
              </div>
              <Badge variant="secondary" className="bg-orange-200 text-orange-800">
                Draft
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                {draftJobData.customer && (
                  <div>
                    <span className="font-medium text-orange-800">Customer:</span>
                    <p className="text-orange-900">{draftJobData.customer}</p>
                  </div>
                )}
                {draftJobData.site && (
                  <div>
                    <span className="font-medium text-orange-800">Site:</span>
                    <p className="text-orange-900">{draftJobData.site}</p>
                  </div>
                )}
                {draftJobData.jobNumber && (
                  <div>
                    <span className="font-medium text-orange-800">Job Number:</span>
                    <p className="text-orange-900 font-mono">{draftJobData.jobNumber}</p>
                  </div>
                )}
              </div>
              {draftJobData.description && (
                <div>
                  <span className="font-medium text-orange-800 text-sm">Description:</span>
                  <p className="text-orange-900 text-sm mt-1">{draftJobData.description}</p>
                </div>
              )}
              <div className="flex items-center justify-between pt-2">
                <p className="text-xs text-orange-700">
                  Last modified: {new Date().toLocaleString()}
                </p>
                <Button
                  onClick={onJobCreate}
                  className="bg-orange-600 hover:bg-orange-700 text-white text-sm px-4 py-2"
                >
                  Resume Job Creation
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

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
                Status: {statusFilter === 'active' ? 'Active Jobs' : 
                         statusFilter === 'completed' ? 'Completed' : 
                         statusFilter === 'overdue' ? 'Overdue' : 
                         statusFilter === 'new' ? 'New' : 
                         statusFilter === 'allocated' ? 'Allocated' : 
                         statusFilter === 'attended' ? 'Attended' : 
                         statusFilter === 'awaiting_parts' ? 'Awaiting Parts' : 
                         statusFilter}
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
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex items-center gap-3 flex-1">
          <Search className="text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
            onFocus={() => searchTerm.length >= 2 && setShowSearchDropdown(true)}
            onBlur={() => setTimeout(() => setShowSearchDropdown(false), 200)}
            className="min-w-0 h-12 text-base"
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
                        {job.status === 'new' ? 'New' : 
                         job.status === 'allocated' ? 'Allocated' : 
                         job.status === 'attended' ? 'Attended' : 
                         job.status === 'awaiting_parts' ? 'Awaiting Parts' : 
                         job.status === 'completed' ? 'Completed' : 
                         job.status === 'costed' ? 'Costed' : 
                         job.status === 'reqs_invoice' ? 'Invoice Ready' : 
                         job.status === 'completed' ? 'Completed' : 
                         job.status === 'attended' ? 'In Process' : 
                         job.priority === 'Critical' ? 'Critical' : 
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
              <SelectItem value="active">Active Jobs</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="overdue">Overdue</SelectItem>
              <SelectItem value="new">New</SelectItem>
              <SelectItem value="allocated">Allocated</SelectItem>
              <SelectItem value="attended">Attended</SelectItem>
              <SelectItem value="awaiting_parts">Awaiting Parts</SelectItem>
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
                    <p className="font-semibold text-sm">{job.customer} - {job.site}</p>
                    <p className="text-xs text-muted-foreground">Job Number: {job.jobNumber}</p>
                    <p className="text-xs text-muted-foreground mt-1">{job.description}</p>
                  </div>
                  <div className="flex flex-col items-end space-y-1">
                    <Badge 
                      variant="secondary" 
                      className={`${getStatusColor(job.status)} text-white text-xs`}
                    >
                      {job.status === 'new' ? 'New' : 
                       job.status === 'allocated' ? 'Allocated' : 
                       job.status === 'attended' ? 'Attended' : 
                       job.status === 'awaiting_parts' ? 'Awaiting Parts' : 
                       job.status === 'completed' ? 'Completed' : 
                       job.status === 'costed' ? 'Costed' : 
                       job.status === 'reqs_invoice' ? 'Invoice Ready' : 
                       job.status === 'completed' ? 'Completed' : 
                       job.status === 'attended' ? 'In Process' : 
                       job.priority === 'Critical' ? 'Critical' : 
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

                {/* Engineer Action Alerts */}
                {job.status === 'allocated' && !job.dateAccepted && (
                  <div className="flex items-center space-x-1 text-blue-600 bg-blue-50 px-2 py-1 rounded">
                    <User className="h-3 w-3" />
                    <p className="text-xs font-medium">Engineer Accept Required</p>
                  </div>
                )}
                {job.dateAccepted && !job.dateOnSite && job.status !== 'completed' && (
                  <div className="flex items-center space-x-1 text-green-600 bg-green-50 px-2 py-1 rounded">
                    <MapPin className="h-3 w-3" />
                    <p className="text-xs font-medium">Engineer Onsite Required</p>
                  </div>
                )}
                {/* General Alerts */}
                {(!job.alerts || job.alerts.length === 0) && job.priority === 'Critical' && (
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