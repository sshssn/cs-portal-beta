import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { SearchInput } from '@/components/ui/search-input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Job, Customer } from '@/types/job';
import { getStatusColor, getPriorityColor } from '@/lib/jobUtils';
import {
  Search,
  ArrowLeft,
  Building2,
  Phone,
  Mail,
  MapPin,
  Users,
  Briefcase,
  Filter,
  Plus,
  Clock,
  AlertTriangle,
  CheckCircle,
  FileText,
  Calendar,
  User,
  ChevronDown
} from 'lucide-react';

interface CustomerDashboardProps {
  customer: Customer;
  jobs: Job[];
  onBack: () => void;
  onJobClick: (job: Job) => void;
  onJobCreate: () => void;
}

export default function CustomerDashboard({ customer, jobs, onBack, onJobClick, onJobCreate }: CustomerDashboardProps) {
  const [searchQuery, setSearchQuery] = useState(() =>
    localStorage.getItem('customerDashboard_searchQuery') || ''
  );
  const [statusFilter, setStatusFilter] = useState<string>(() =>
    localStorage.getItem('customerDashboard_statusFilter') || 'all'
  );
  const [priorityFilter, setPriorityFilter] = useState<string>(() =>
    localStorage.getItem('customerDashboard_priorityFilter') || 'all'
  );
  const [siteFilter, setSiteFilter] = useState<string>(() =>
    localStorage.getItem('customerDashboard_siteFilter') || 'all'
  );

  // Save state to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('customerDashboard_searchQuery', searchQuery);
  }, [searchQuery]);

  useEffect(() => {
    localStorage.setItem('customerDashboard_statusFilter', statusFilter);
  }, [statusFilter]);

  useEffect(() => {
    localStorage.setItem('customerDashboard_priorityFilter', priorityFilter);
  }, [priorityFilter]);

  useEffect(() => {
    localStorage.setItem('customerDashboard_siteFilter', siteFilter);
  }, [siteFilter]);

  // Filter jobs for this customer
  const customerJobs = jobs.filter(job => job.customer === customer.name);

  // Get all unique sites from customer jobs
  const allSites = Array.from(new Set(customerJobs.map(job => job.site))).sort();

  // Filter jobs based on search and filters
  const filteredJobs = customerJobs.filter(job => {
    const matchesSearch = searchQuery === '' ||
      job.jobNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.engineer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.site.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'all' || job.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || job.priority === priorityFilter;
    const matchesSite = siteFilter === 'all' || job.site === siteFilter;

    return matchesSearch && matchesStatus && matchesPriority && matchesSite;
  });

  // Calculate statistics
  const stats = {
    total: customerJobs.length,
    active: customerJobs.filter(job => job.status !== 'green' && job.status !== 'completed').length,
    completed: customerJobs.filter(job => job.status === 'green' || job.status === 'completed').length,
    critical: customerJobs.filter(job => job.priority === 'Critical').length,
    urgent: customerJobs.filter(job => job.status === 'red').length
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{customer.name}</h1>
          <p className="text-muted-foreground mt-2">Customer Dashboard & Job Management</p>
        </div>
        <div className="flex items-center gap-3">
          <Button onClick={onJobCreate} className="bg-blue-600 hover:bg-blue-700">
            <Plus size={16} className="mr-2" />
            Log New Job
          </Button>
          <Button onClick={onBack} variant="outline" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Button>
        </div>
      </div>

      {/* Customer Information */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Building2 className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-blue-900">Location</p>
                <p className="text-lg font-semibold text-blue-900">{customer.name}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Mail className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-green-900">Email</p>
                <p className="text-sm font-medium text-green-900">{customer.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Phone className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-purple-900">Phone</p>
                <p className="text-sm font-medium text-purple-900">{customer.phone}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <MapPin className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-orange-900">Sites</p>
                <p className="text-lg font-semibold text-orange-900">{customer.sites.length}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-800">Total Jobs</CardTitle>
            <Briefcase className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-900">{stats.total}</div>
            <p className="text-xs text-blue-700">All time jobs</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-amber-800">Active Jobs</CardTitle>
            <Clock className="h-4 w-4 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-900">{stats.active}</div>
            <p className="text-xs text-amber-700">In progress</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-800">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-900">{stats.completed}</div>
            <p className="text-xs text-green-700">Finished jobs</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-red-800">Critical</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-900">{stats.critical}</div>
            <p className="text-xs text-red-700">High priority</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-800">Urgent</CardTitle>
            <AlertTriangle className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-900">{stats.urgent}</div>
            <p className="text-xs text-purple-700">Red status</p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            {/* Search Bar */}
            <SearchInput
              placeholder="Search jobs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onClear={() => setSearchQuery('')}
              containerClassName='flex-1'
            />

            {/* Filters */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">Filters:</span>
              </div>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="new">New</SelectItem>
                  <SelectItem value="allocated">Allocated</SelectItem>
                  <SelectItem value="attended">Attended</SelectItem>
                  <SelectItem value="awaiting_parts">Awaiting Parts</SelectItem>
                  <SelectItem value="parts_to_fit">Parts to Fit</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="costed">Costed</SelectItem>
                  <SelectItem value="reqs_invoice">Reqs. Invoice</SelectItem>
                </SelectContent>
              </Select>

              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="All Priorities" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priorities</SelectItem>
                  <SelectItem value="Low">Low</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="High">High</SelectItem>
                  <SelectItem value="Critical">Critical</SelectItem>
                </SelectContent>
              </Select>

              <Select value={siteFilter} onValueChange={setSiteFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="All Sites" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sites</SelectItem>
                  {allSites.map(site => (
                    <SelectItem key={site} value={site}>
                      {site}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Jobs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredJobs.map((job) => (
          <Card
            key={job.id}
            className="hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => onJobClick(job)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Briefcase className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">{job.jobNumber}</h3>
                    <p className="text-sm text-muted-foreground">{job.site}</p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <Badge
                    variant={getStatusColor(job.status) as any}
                    className="text-xs"
                  >
                    {job.status}
                  </Badge>
                  <Badge
                    variant={getPriorityColor(job.priority) as any}
                    className="text-xs"
                  >
                    {job.priority}
                  </Badge>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              <p className="text-sm text-gray-700 line-clamp-2">
                {job.description}
              </p>

              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-1">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{job.engineer}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">
                    {new Date(job.dateLogged).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {filteredJobs.length === 0 && (
        <div className="text-center py-12">
          <Briefcase className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-2 text-sm font-semibold text-gray-900">No jobs found</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {searchQuery || statusFilter !== 'all' || priorityFilter !== 'all' || siteFilter !== 'all'
              ? 'Try adjusting your search criteria.'
              : 'No jobs available for this customer.'}
          </p>
        </div>
      )}
    </div>
  );
}