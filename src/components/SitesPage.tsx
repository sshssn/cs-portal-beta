import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { SearchInput } from '@/components/ui/search-input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Job, Customer, JobAlert } from '@/types/job';
import { getStatusColor, getPriorityColor } from '@/lib/jobUtils';
import {
  Search,
  ArrowLeft,
  MapPin,
  Building2,
  Briefcase,
  Filter,
  Plus,
  Clock,
  AlertTriangle,
  CheckCircle,
  User,
  Calendar,
  Phone,
  Mail,
  ChevronDown,
  X,
  Globe,
  MapPinIcon,
  FileText,
  Bell,
  Wrench
} from 'lucide-react';

interface SitesPageProps {
  onBack: () => void;
  onSiteSelect: (site: string, customer: string) => void;
  onJobClick: (job: Job) => void;
  onJobCreate: () => void;
  jobs: Job[];
  customers: Customer[];
}

interface SiteInfo {
  name: string;
  customer: string;
  customerId: number;
  totalJobs: number;
  activeJobs: number;
  completedJobs: number;
  criticalJobs: number;
  urgentJobs: number;
  lastJobDate: Date | null;
  engineers: string[];
}

interface SiteAlert {
  id: string;
  siteId: string;
  customerId: string;
  type: 'SLA_VIOLATION' | 'EQUIPMENT_ISSUE' | 'ACCESS_PROBLEM' | 'SAFETY_CONCERN' | 'MAINTENANCE_OVERDUE';
  message: string;
  timestamp: Date;
  severity: 'low' | 'medium' | 'high' | 'critical';
  acknowledged: boolean;
  resolved: boolean;
  resolvedBy?: string;
  resolvedAt?: Date;
  resolution?: string;
}

interface NewSite {
  name: string;
  customer: string;
  address: string;
  city: string;
  postcode: string;
  contactPerson: string;
  phone: string;
  email: string;
  siteType: string;
  accessNotes: string;
  specialRequirements: string;
}

export default function SitesPage({ onBack, onSiteSelect, onJobClick, onJobCreate, jobs, customers }: SitesPageProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [customerFilter, setCustomerFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [showAddSite, setShowAddSite] = useState(false);
  const [selectedSite, setSelectedSite] = useState<SiteInfo | null>(null);
  const [showSiteAlerts, setShowSiteAlerts] = useState(false);
  const [siteAlerts, setSiteAlerts] = useState<SiteAlert[]>([
    {
      id: '1',
      siteId: 'London HQ',
      customerId: 'Demo Corporation',
      type: 'SLA_VIOLATION',
      message: 'HVAC maintenance overdue by 3 days',
      timestamp: new Date('2024-01-15T10:00:00'),
      severity: 'high',
      acknowledged: false,
      resolved: false
    },
    {
      id: '2',
      siteId: 'Manchester Office',
      customerId: 'Demo Corporation',
      type: 'EQUIPMENT_ISSUE',
      message: 'Fire alarm system showing fault',
      timestamp: new Date('2024-01-14T15:30:00'),
      severity: 'critical',
      acknowledged: true,
      resolved: false
    },
    {
      id: '3',
      siteId: 'Birmingham Site',
      customerId: 'Demo Corporation',
      type: 'ACCESS_PROBLEM',
      message: 'Security card reader malfunction',
      timestamp: new Date('2024-01-13T09:15:00'),
      severity: 'medium',
      acknowledged: false,
      resolved: false
    }
  ]);
  const [newSite, setNewSite] = useState<NewSite>({
    name: '',
    customer: '',
    address: '',
    city: '',
    postcode: '',
    contactPerson: '',
    phone: '',
    email: '',
    siteType: '',
    accessNotes: '',
    specialRequirements: ''
  });

  // Get all unique sites with aggregated information
  const getSitesInfo = (): SiteInfo[] => {
    const sitesMap = new Map<string, SiteInfo>();

    jobs.forEach(job => {
      if (!sitesMap.has(job.site)) {
        const customer = customers.find(c => c.name === job.customer);
        sitesMap.set(job.site, {
          name: job.site,
          customer: job.customer,
          customerId: customer?.id || 0,
          totalJobs: 0,
          activeJobs: 0,
          completedJobs: 0,
          criticalJobs: 0,
          urgentJobs: 0,
          lastJobDate: null,
          engineers: []
        });
      }

      const siteInfo = sitesMap.get(job.site)!;
      siteInfo.totalJobs++;

      if (['green', 'completed', 'costed', 'reqs_invoice'].includes(job.status)) {
        siteInfo.completedJobs++;
      } else {
        siteInfo.activeJobs++;
      }

      if (job.priority === 'Critical') {
        siteInfo.criticalJobs++;
      }

      if (job.status === 'red') {
        siteInfo.urgentJobs++;
      }

      if (!siteInfo.engineers.includes(job.engineer)) {
        siteInfo.engineers.push(job.engineer);
      }

      if (!siteInfo.lastJobDate || new Date(job.dateLogged) > siteInfo.lastJobDate) {
        siteInfo.lastJobDate = new Date(job.dateLogged);
      }
    });

    return Array.from(sitesMap.values()).sort((a, b) => b.totalJobs - a.totalJobs);
  };

  const sitesInfo = getSitesInfo();

  // Filter sites based on search and filters
  const filteredSites = sitesInfo.filter(site => {
    const matchesSearch = searchQuery === '' ||
      site.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      site.customer.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCustomer = customerFilter === 'all' || site.customer === customerFilter;

    const matchesStatus = statusFilter === 'all' ||
      (statusFilter === 'active' && site.activeJobs > 0) ||
      (statusFilter === 'completed' && site.completedJobs > 0) ||
      (statusFilter === 'urgent' && site.urgentJobs > 0);

    const matchesPriority = priorityFilter === 'all' ||
      (priorityFilter === 'critical' && site.criticalJobs > 0);

    return matchesSearch && matchesCustomer && matchesStatus && matchesPriority;
  });

  // Get all unique customers for filter
  const allCustomers = Array.from(new Set(customers.map(c => c.name))).sort();

  // Calculate overall statistics
  const totalStats = {
    sites: sitesInfo.length,
    totalJobs: sitesInfo.reduce((sum, site) => sum + site.totalJobs, 0),
    activeJobs: sitesInfo.reduce((sum, site) => sum + site.activeJobs, 0),
    completedJobs: sitesInfo.reduce((sum, site) => sum + site.completedJobs, 0),
    criticalJobs: sitesInfo.reduce((sum, site) => sum + site.criticalJobs, 0),
    urgentJobs: sitesInfo.reduce((sum, site) => sum + site.urgentJobs, 0)
  };

  // Get site-specific alerts
  const getSiteAlerts = (siteName: string): SiteAlert[] => {
    return siteAlerts.filter(alert => alert.siteId === siteName);
  };

  // Get site-specific jobs
  const getSiteJobs = (siteName: string): Job[] => {
    return jobs.filter(job => job.site === siteName);
  };

  const handleSiteClick = (site: SiteInfo) => {
    setSelectedSite(site);
  };

  const handleBackToSites = () => {
    setSelectedSite(null);
    setShowSiteAlerts(false);
  };

  const handleAcknowledgeAlert = (alertId: string) => {
    setSiteAlerts(prev => prev.map(alert =>
      alert.id === alertId ? { ...alert, acknowledged: true } : alert
    ));
  };

  const handleResolveAlert = (alertId: string, resolution: string) => {
    setSiteAlerts(prev => prev.map(alert =>
      alert.id === alertId ? {
        ...alert,
        resolved: true,
        resolvedBy: 'Current User',
        resolvedAt: new Date(),
        resolution
      } : alert
    ));
  };

  const getAlertSeverityColor = (severity: SiteAlert['severity']) => {
    switch (severity) {
      case 'critical': return 'bg-red-500 text-white';
      case 'high': return 'bg-orange-500 text-white';
      case 'medium': return 'bg-yellow-500 text-white';
      case 'low': return 'bg-blue-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getAlertTypeIcon = (type: SiteAlert['type']) => {
    switch (type) {
      case 'SLA_VIOLATION': return <Clock className="h-4 w-4" />;
      case 'EQUIPMENT_ISSUE': return <AlertTriangle className="h-4 w-4" />;
      case 'ACCESS_PROBLEM': return <User className="h-4 w-4" />;
      case 'SAFETY_CONCERN': return <AlertTriangle className="h-4 w-4" />;
      case 'MAINTENANCE_OVERDUE': return <Wrench className="h-4 w-4" />;
      default: return <AlertTriangle className="h-4 w-4" />;
    }
  };

  const handleAddSite = () => {
    if (newSite.name && newSite.customer && newSite.address) {
      // Here you would save the new site to your data store
      console.log('Adding new site:', newSite);

      // Reset form
      setNewSite({
        name: '',
        customer: '',
        address: '',
        city: '',
        postcode: '',
        contactPerson: '',
        phone: '',
        email: '',
        siteType: '',
        accessNotes: '',
        specialRequirements: ''
      });
      setShowAddSite(false);
    }
  };

  const loadDemoData = () => {
    setNewSite({
      name: 'Main Office Building',
      customer: 'Demo Corporation',
      address: '123 Business Park Drive',
      city: 'Manchester',
      postcode: 'M1 1AA',
      contactPerson: 'John Smith',
      phone: '0161 123 4567',
      email: 'john.smith@democorp.com',
      siteType: 'Office',
      accessNotes: 'Main entrance, security badge required, parking available',
      specialRequirements: '24/7 access, CCTV monitored, fire alarm system'
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">All Sites</h1>
          <p className="text-muted-foreground mt-2">Manage and monitor all customer sites and their job status</p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            onClick={() => setShowSiteAlerts(true)}
            variant="outline"
            className="flex items-center gap-2 border-orange-300 text-orange-700 hover:bg-orange-50"
          >
            <Bell size={16} className="mr-2" />
            Site Alerts
            {siteAlerts.filter(alert => !alert.resolved).length > 0 && (
              <Badge variant="destructive" className="ml-2">
                {siteAlerts.filter(alert => !alert.resolved).length}
              </Badge>
            )}
          </Button>
          <Button onClick={() => setShowAddSite(true)} className="bg-blue-600 hover:bg-blue-700">
            <Plus size={16} className="mr-2" />
            Add New Site
          </Button>
          <Button onClick={onBack} variant="outline" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Button>
        </div>
      </div>

      {/* Overall Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        <Card
          className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-105 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 hover:border-blue-300"
        >
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-700 font-medium">Total Sites</p>
                <p className="text-2xl font-bold text-blue-900">{totalStats.sites}</p>
                <p className="text-xs text-blue-700">Active locations</p>
              </div>
              <MapPin className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card
          className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-105 bg-gradient-to-br from-indigo-50 to-indigo-100 border-indigo-200 hover:border-indigo-300"
        >
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-indigo-700 font-medium">Total Jobs</p>
                <p className="text-2xl font-bold text-indigo-900">{totalStats.totalJobs}</p>
                <p className="text-xs text-indigo-700">Across all sites</p>
              </div>
              <Briefcase className="h-8 w-8 text-indigo-600" />
            </div>
          </CardContent>
        </Card>

        <Card
          className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-105 bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200 hover:border-amber-300"
        >
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-amber-700 font-medium">Active Jobs</p>
                <p className="text-2xl font-bold text-amber-900">{totalStats.activeJobs}</p>
                <p className="text-xs text-amber-700">In progress</p>
              </div>
              <Clock className="h-8 w-8 text-amber-600" />
            </div>
          </CardContent>
        </Card>

        <Card
          className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-105 bg-gradient-to-br from-green-50 to-green-100 border-green-200 hover:border-green-300"
        >
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-700 font-medium">Completed</p>
                <p className="text-2xl font-bold text-green-900">{totalStats.completedJobs}</p>
                <p className="text-xs text-green-700">Finished jobs</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card
          className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-105 bg-gradient-to-br from-red-50 to-red-100 border-red-200 hover:border-red-300"
        >
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-red-700 font-medium">Critical</p>
                <p className="text-2xl font-bold text-red-900">{totalStats.criticalJobs}</p>
                <p className="text-xs text-red-700">High priority</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card
          className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-105 bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200 hover:border-orange-300"
        >
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-orange-700 font-medium">Urgent</p>
                <p className="text-2xl font-bold text-orange-900">{totalStats.urgentJobs}</p>
                <p className="text-xs text-orange-700">Red status</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <SearchInput
          placeholder="Search sites..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onClear={() => setSearchQuery('')}
          className="min-w-0 h-12 text-base"
          containerClassName="flex-1"
        />

        <div className="flex gap-2">
          <Select value={customerFilter} onValueChange={setCustomerFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="All Customers" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Customers</SelectItem>
              {allCustomers.map(customer => (
                <SelectItem key={customer} value={customer}>
                  {customer}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="active">Has Active Jobs</SelectItem>
              <SelectItem value="completed">Has Completed Jobs</SelectItem>
              <SelectItem value="urgent">Has Urgent Jobs</SelectItem>
            </SelectContent>
          </Select>

          <Select value={priorityFilter} onValueChange={setPriorityFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="All Priorities" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priorities</SelectItem>
              <SelectItem value="critical">Has Critical Jobs</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Sites Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredSites.map((site) => (
          <Card
            key={`${site.customer}-${site.name}`}
            className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-105"
            onClick={() => handleSiteClick(site)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <MapPin className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">{site.name}</h3>
                    <p className="text-sm text-muted-foreground">{site.customer}</p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  {site.urgentJobs > 0 && (
                    <Badge variant="destructive" className="text-xs">
                      {site.urgentJobs} urgent
                    </Badge>
                  )}
                  {site.criticalJobs > 0 && (
                    <Badge variant="secondary" className="text-xs">
                      {site.criticalJobs} critical
                    </Badge>
                  )}
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Job Statistics */}
              <div className="grid grid-cols-2 gap-3">
                <div className="text-center p-2 bg-blue-50 rounded">
                  <div className="text-lg font-bold text-blue-900">{site.totalJobs}</div>
                  <div className="text-xs text-blue-700">Total Jobs</div>
                </div>
                <div className="text-center p-2 bg-amber-50 rounded">
                  <div className="text-lg font-bold text-amber-900">{site.activeJobs}</div>
                  <div className="text-xs text-amber-700">Active</div>
                </div>
                <div className="text-center p-2 bg-green-50 rounded">
                  <div className="text-lg font-bold text-green-900">{site.completedJobs}</div>
                  <div className="text-xs text-green-700">Completed</div>
                </div>
                <div className="text-center p-2 bg-red-50 rounded">
                  <div className="text-lg font-bold text-red-900">{site.urgentJobs}</div>
                  <div className="text-xs text-red-700">Urgent</div>
                </div>
              </div>

              {/* Engineers */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Engineers:</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {site.engineers.slice(0, 3).map((engineer, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {engineer}
                    </Badge>
                  ))}
                  {site.engineers.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{site.engineers.length - 3} more
                    </Badge>
                  )}
                </div>
              </div>

              {/* Last Job Date */}
              {site.lastJobDate && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>Last job: {site.lastJobDate.toLocaleDateString()}</span>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {filteredSites.length === 0 && (
        <div className="text-center py-12">
          <MapPin className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-2 text-sm font-semibold text-gray-900">No sites found</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {searchQuery || customerFilter !== 'all' || statusFilter !== 'all' || priorityFilter !== 'all'
              ? 'Try adjusting your search criteria.'
              : 'No sites available.'}
          </p>
        </div>
      )}

      {/* Add Site Modal */}
      {showAddSite && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">Add New Site</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAddSite(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Site Name *</label>
                  <Input
                    value={newSite.name}
                    onChange={(e) => setNewSite(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter site name"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">Customer *</label>
                  <Select value={newSite.customer} onValueChange={(value) => setNewSite(prev => ({ ...prev, customer: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select customer" />
                    </SelectTrigger>
                    <SelectContent>
                      {customers.map(customer => (
                        <SelectItem key={customer.name} value={customer.name}>
                          {customer.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Address Information */}
              <div className="space-y-4">
                <h4 className="text-lg font-medium text-gray-900 flex items-center gap-2">
                  <MapPinIcon className="h-5 w-5" />
                  Address Information
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-2">
                    <label className="text-sm font-medium text-gray-700">Street Address *</label>
                    <Input
                      value={newSite.address}
                      onChange={(e) => setNewSite(prev => ({ ...prev, address: e.target.value }))}
                      placeholder="Enter street address"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">City</label>
                    <Input
                      value={newSite.city}
                      onChange={(e) => setNewSite(prev => ({ ...prev, city: e.target.value }))}
                      placeholder="Enter city"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Postcode</label>
                    <Input
                      value={newSite.postcode}
                      onChange={(e) => setNewSite(prev => ({ ...prev, postcode: e.target.value }))}
                      placeholder="Enter postcode"
                    />
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div className="space-y-4">
                <h4 className="text-lg font-medium text-gray-900 flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Contact Information
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Contact Person</label>
                    <Input
                      value={newSite.contactPerson}
                      onChange={(e) => setNewSite(prev => ({ ...prev, contactPerson: e.target.value }))}
                      placeholder="Enter contact person name"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Phone</label>
                    <Input
                      value={newSite.phone}
                      onChange={(e) => setNewSite(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="Enter phone number"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Email</label>
                    <Input
                      value={newSite.email}
                      onChange={(e) => setNewSite(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="Enter email address"
                    />
                  </div>
                </div>
              </div>

              {/* Site Details */}
              <div className="space-y-4">
                <h4 className="text-lg font-medium text-gray-900 flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  Site Details
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Site Type</label>
                    <Select value={newSite.siteType} onValueChange={(value) => setNewSite(prev => ({ ...prev, siteType: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select site type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Office">Office</SelectItem>
                        <SelectItem value="Warehouse">Warehouse</SelectItem>
                        <SelectItem value="Factory">Factory</SelectItem>
                        <SelectItem value="Retail">Retail</SelectItem>
                        <SelectItem value="Residential">Residential</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Additional Information */}
              <div className="space-y-4">
                <h4 className="text-lg font-medium text-gray-900 flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Additional Information
                </h4>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Access Notes</label>
                    <Textarea
                      value={newSite.accessNotes}
                      onChange={(e) => setNewSite(prev => ({ ...prev, accessNotes: e.target.value }))}
                      placeholder="Enter access instructions, security requirements, etc."
                      rows={3}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Special Requirements</label>
                    <Textarea
                      value={newSite.specialRequirements}
                      onChange={(e) => setNewSite(prev => ({ ...prev, specialRequirements: e.target.value }))}
                      placeholder="Enter any special requirements or notes"
                      rows={3}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center pt-6 border-t">
              <Button
                variant="outline"
                onClick={loadDemoData}
                className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
              >
                Load Demo Data
              </Button>
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setShowAddSite(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={handleAddSite}
                  disabled={!newSite.name || !newSite.customer || !newSite.address}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Site
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Site Details Modal */}
      {selectedSite && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">Site Details: {selectedSite.name}</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBackToSites}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Site Info */}
              <div className="space-y-4">
                <h4 className="text-lg font-medium text-gray-900 flex items-center gap-2">
                  <MapPinIcon className="h-5 w-5" />
                  Site Information
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Location</label>
                    <Badge variant="secondary">{selectedSite.customer}</Badge>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Total Jobs</label>
                    <Badge variant="outline">{selectedSite.totalJobs}</Badge>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Active Jobs</label>
                    <Badge variant="outline">{selectedSite.activeJobs}</Badge>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Completed Jobs</label>
                    <Badge variant="outline">{selectedSite.completedJobs}</Badge>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Critical Jobs</label>
                    <Badge variant="secondary">{selectedSite.criticalJobs}</Badge>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Urgent Jobs</label>
                    <Badge variant="destructive">{selectedSite.urgentJobs}</Badge>
                  </div>
                </div>
              </div>

              {/* Site Jobs */}
              <div className="space-y-4">
                <h4 className="text-lg font-medium text-gray-900 flex items-center gap-2">
                  <Briefcase className="h-5 w-5" />
                  Jobs at {selectedSite.name}
                </h4>
                <div className="space-y-3">
                  {getSiteJobs(selectedSite.name).map((job) => (
                    <Card key={job.id} className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h5 className="font-semibold text-lg">{job.jobNumber}</h5>
                          <p className="text-sm text-muted-foreground">{job.description}</p>
                        </div>
                        <Badge className={`${getStatusColor(job.status)}`}>{job.status}</Badge>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mt-2">
                        <Calendar className="h-4 w-4" /> {new Date(job.dateLogged).toLocaleDateString()}
                        <User className="h-4 w-4" /> {job.engineer}
                        <Badge className={`${getPriorityColor(job.priority)}`}>{job.priority}</Badge>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Site Alerts */}
              <div className="space-y-4">
                <h4 className="text-lg font-medium text-gray-900 flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Alerts for {selectedSite.name}
                </h4>
                <div className="space-y-3">
                  {getSiteAlerts(selectedSite.name).map((alert) => (
                    <Card key={alert.id} className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h5 className="font-semibold text-lg">{alert.message}</h5>
                          <p className="text-sm text-muted-foreground">Severity: {alert.severity.toUpperCase()}</p>
                        </div>
                        <Badge className={`${getAlertSeverityColor(alert.severity)}`}>{alert.severity.toUpperCase()}</Badge>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mt-2">
                        <Calendar className="h-4 w-4" /> {alert.timestamp.toLocaleDateString()}
                        <User className="h-4 w-4" /> {alert.acknowledged ? 'Acknowledged' : 'Unacknowledged'}
                        {alert.resolved && (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        )}
                      </div>
                      {!alert.resolved && (
                        <div className="flex gap-2 mt-4">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleAcknowledgeAlert(alert.id)}
                          >
                            Acknowledge
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleResolveAlert(alert.id, 'Resolved via modal')}
                          >
                            Resolve
                          </Button>
                        </div>
                      )}
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Site Alerts Modal */}
      {showSiteAlerts && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                <Bell className="h-5 w-5 text-orange-600" />
                Site Alerts Overview
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowSiteAlerts(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-6">
              {/* Alerts Summary */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-red-600" />
                    <span className="font-semibold text-red-900">Critical</span>
                  </div>
                  <div className="text-2xl font-bold text-red-900 mt-2">
                    {siteAlerts.filter(alert => alert.severity === 'critical' && !alert.resolved).length}
                  </div>
                </div>

                <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-orange-600" />
                    <span className="font-semibold text-orange-900">High</span>
                  </div>
                  <div className="text-2xl font-bold text-orange-900 mt-2">
                    {siteAlerts.filter(alert => alert.severity === 'high' && !alert.resolved).length}
                  </div>
                </div>

                <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-yellow-600" />
                    <span className="font-semibold text-yellow-900">Medium</span>
                  </div>
                  <div className="text-2xl font-bold text-yellow-900 mt-2">
                    {siteAlerts.filter(alert => alert.severity === 'medium' && !alert.resolved).length}
                  </div>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-blue-600" />
                    <span className="font-semibold text-blue-900">Low</span>
                  </div>
                  <div className="text-2xl font-bold text-blue-900 mt-2">
                    {siteAlerts.filter(alert => alert.severity === 'low' && !alert.resolved).length}
                  </div>
                </div>
              </div>

              {/* All Alerts List */}
              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-gray-900">All Site Alerts</h4>
                <div className="space-y-3">
                  {siteAlerts
                    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                    .map((alert) => (
                      <Card key={alert.id} className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <div className={`p-2 rounded-lg ${getAlertSeverityColor(alert.severity)}`}>
                                {getAlertTypeIcon(alert.type)}
                              </div>
                              <div>
                                <h5 className="font-semibold text-gray-900">{alert.message}</h5>
                                <p className="text-sm text-gray-600">
                                  {alert.siteId} • {alert.customerId}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-gray-500">
                              <span className="flex items-center gap-1">
                                <Calendar className="h-4 w-4" />
                                {alert.timestamp.toLocaleDateString()}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="h-4 w-4" />
                                {alert.timestamp.toLocaleTimeString()}
                              </span>
                              <Badge className={`${getAlertSeverityColor(alert.severity)}`}>
                                {alert.severity.toUpperCase()}
                              </Badge>
                            </div>
                          </div>

                          <div className="flex flex-col items-end gap-2">
                            {alert.resolved ? (
                              <Badge variant="outline" className="text-green-700 border-green-300">
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Resolved
                              </Badge>
                            ) : alert.acknowledged ? (
                              <Badge variant="outline" className="text-blue-700 border-blue-300">
                                Acknowledged
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="text-red-700 border-red-300">
                                Unacknowledged
                              </Badge>
                            )}

                            {!alert.resolved && (
                              <div className="flex gap-2">
                                {!alert.acknowledged && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleAcknowledgeAlert(alert.id)}
                                    className="border-blue-300 text-blue-700 hover:bg-blue-50"
                                  >
                                    Acknowledge
                                  </Button>
                                )}
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleResolveAlert(alert.id, 'Resolved via alerts overview')}
                                  className="border-green-300 text-green-700 hover:bg-green-50"
                                >
                                  Resolve
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>
                      </Card>
                    ))}

                  {siteAlerts.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <CheckCircle className="h-12 w-12 mx-auto mb-3 text-green-600" />
                      <p className="text-sm">No site alerts found</p>
                      <p className="text-xs">All sites are running smoothly</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
