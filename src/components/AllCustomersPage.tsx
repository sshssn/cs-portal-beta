import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Customer } from '@/types/job';
import { mockCustomers } from '@/lib/jobUtils';
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
  X
} from 'lucide-react';

interface AllCustomersPageProps {
  onBack: () => void;
  onCustomerSelect: (customer: Customer) => void;
  onCustomerCreate?: (customer: Omit<Customer, 'id'>) => void;
}

export default function AllCustomersPage({ onBack, onCustomerSelect, onCustomerCreate }: AllCustomersPageProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSite, setSelectedSite] = useState<string>('all');
  const [showAddCustomer, setShowAddCustomer] = useState(false);
  const [newCustomer, setNewCustomer] = useState({
    name: '',
    email: '',
    phone: '',
    sites: [''],
    notes: ''
  });
  
  // Get all unique sites from all customers
  const allSites = Array.from(new Set(mockCustomers.flatMap(customer => customer.sites))).sort();
  
  // Filter customers based on search query and selected site
  const filteredCustomers = mockCustomers.filter(customer => {
    const matchesSearch = customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         customer.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         customer.sites.some(site => site.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesSite = selectedSite === 'all' || customer.sites.includes(selectedSite);
    
    return matchesSearch && matchesSite;
  });

  const totalCustomers = mockCustomers.length;
  const activeJobs = mockCustomers.reduce((total, customer) => 
    total + (customer.jobs?.filter(job => job.status !== 'green').length || 0), 0
  );

  const getUrgentJobsCount = (customer: Customer) => {
    return customer.jobs?.filter(job => job.status === 'red').length || 0;
  };

  const getActiveJobsCount = (customer: Customer) => {
    return customer.jobs?.filter(job => job.status !== 'green').length || 0;
  };

  const handleAddCustomer = () => {
    if (newCustomer.name && newCustomer.email && newCustomer.phone && newCustomer.sites[0]) {
      const customerData = {
        name: newCustomer.name,
        email: newCustomer.email,
        phone: newCustomer.phone,
        sites: newCustomer.sites.filter(site => site.trim() !== ''),
        notes: newCustomer.notes
      };
      
      if (onCustomerCreate) {
        onCustomerCreate(customerData);
      }
      
      // Reset form
      setNewCustomer({
        name: '',
        email: '',
        phone: '',
        sites: [''],
        notes: ''
      });
      setShowAddCustomer(false);
    }
  };

  const addSiteField = () => {
    setNewCustomer(prev => ({
      ...prev,
      sites: [...prev.sites, '']
    }));
  };

  const removeSiteField = (index: number) => {
    setNewCustomer(prev => ({
      ...prev,
      sites: prev.sites.filter((_, i) => i !== index)
    }));
  };

  const updateSiteField = (index: number, value: string) => {
    setNewCustomer(prev => ({
      ...prev,
      sites: prev.sites.map((site, i) => i === index ? value : site)
    }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">All Customers</h1>
          <p className="text-muted-foreground mt-2">Manage and view all customer accounts and their job history</p>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            onClick={() => setShowAddCustomer(true)} 
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Customer
          </Button>
          <Button onClick={onBack} variant="outline" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-800">Total Customers</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-900">{totalCustomers}</div>
            <p className="text-xs text-blue-700">Active accounts</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-800">Active Jobs</CardTitle>
            <Briefcase className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-900">{activeJobs}</div>
            <p className="text-xs text-green-700">Across all customers</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-800">Total Sites</CardTitle>
            <MapPin className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-900">{allSites.length}</div>
            <p className="text-xs text-purple-700">Managed locations</p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            {/* Search Bar */}
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search customers by name, email, or site..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
            </div>
            
            {/* Site Filter */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">Filter by Site:</span>
              </div>
              
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={selectedSite === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedSite('all')}
                  className="text-xs"
                >
                  All Sites
                </Button>
                {allSites.map(site => (
                  <Button
                    key={site}
                    variant={selectedSite === site ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedSite(site)}
                    className="text-xs"
                  >
                    {site}
                  </Button>
                ))}
              </div>
              
              {selectedSite !== 'all' && (
                <div className="flex items-center gap-2 pt-2">
                  <span className="text-sm text-gray-600">
                    Currently filtering by: <span className="font-medium text-blue-600">{selectedSite}</span>
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedSite('all')}
                    className="text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                  >
                    Clear Filter
                  </Button>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Customer Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCustomers.map((customer) => {
          const urgentJobs = getUrgentJobsCount(customer);
          const activeJobs = getActiveJobsCount(customer);
          const totalJobs = customer.jobs?.length || 0;
          
          return (
            <Card 
              key={customer.id} 
              className="hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => onCustomerSelect(customer)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Building2 className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">{customer.name}</h3>
                    </div>
                  </div>
                  {urgentJobs > 0 && (
                    <Badge variant="destructive" className="text-xs">
                      {urgentJobs} urgent
                    </Badge>
                  )}
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Contact Information */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Phone className="h-4 w-4" />
                    <span>{customer.phone}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Mail className="h-4 w-4" />
                    <span>{customer.email}</span>
                  </div>
                </div>

                {/* Metrics */}
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{customer.sites.length} Sites</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Briefcase className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{totalJobs} Total Jobs</span>
                  </div>
                </div>

                {/* Job Status */}
                {activeJobs > 0 && (
                  <div className="pt-2 border-t">
                    <p className="text-sm text-muted-foreground">
                      {activeJobs} active jobs
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredCustomers.length === 0 && (
        <div className="text-center py-12">
          <Building2 className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-2 text-sm font-semibold text-gray-900">No customers found</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {searchQuery ? 'Try adjusting your search criteria.' : 'No customers available.'}
          </p>
        </div>
      )}

      {/* Add Customer Modal */}
      {showAddCustomer && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">Add New Customer</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAddCustomer(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Customer Name *</label>
                  <Input
                    value={newCustomer.name}
                    onChange={(e) => setNewCustomer(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter customer name"
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-700">Email *</label>
                  <Input
                    type="email"
                    value={newCustomer.email}
                    onChange={(e) => setNewCustomer(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="Enter email address"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">Phone Number *</label>
                <Input
                  type="tel"
                  value={newCustomer.phone}
                  onChange={(e) => setNewCustomer(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="Enter phone number"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">Sites *</label>
                <div className="space-y-2">
                  {newCustomer.sites.map((site, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Input
                        value={site}
                        onChange={(e) => updateSiteField(index, e.target.value)}
                        placeholder={`Site ${index + 1}`}
                      />
                      {newCustomer.sites.length > 1 && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeSiteField(index)}
                          className="text-red-600 hover:text-red-700"
                          disabled={newCustomer.sites.length === 1}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addSiteField}
                    className="text-blue-600 hover:text-blue-700"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Another Site
                  </Button>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">Notes</label>
                <Textarea
                  value={newCustomer.notes}
                  onChange={(e) => setNewCustomer(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Enter any additional notes about this customer..."
                  rows={3}
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-6 border-t">
              <Button variant="outline" onClick={() => setShowAddCustomer(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleAddCustomer} 
                disabled={!newCustomer.name || !newCustomer.email || !newCustomer.phone || !newCustomer.sites[0]}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Customer
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
