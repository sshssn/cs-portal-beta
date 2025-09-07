import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Customer } from '@/types/job';
import { mockCustomers, generateCustomerNumber } from '@/lib/jobUtils';
import { 
  Search, 
  ArrowLeft, 
  Building2, 
  Phone, 
  Mail, 
  MapPin,
  Users,
  Briefcase,
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
  const [showAddCustomer, setShowAddCustomer] = useState(false);
  const [newCustomer, setNewCustomer] = useState({
    name: '',
    email: '',
    phone: '',
    sites: [''],
    notes: ''
  });
  
  // Filter customers based on search query only
  const filteredCustomers = mockCustomers.filter(customer => {
    const matchesSearch = customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         customer.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         customer.sites.some(site => site.toLowerCase().includes(searchQuery.toLowerCase()));
    
    return matchesSearch;
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
        customerNumber: generateCustomerNumber(),
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card 
          className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-105 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 hover:border-blue-300"
        >
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-700 font-medium">Total Customers</p>
                <p className="text-2xl font-bold text-blue-900">{totalCustomers}</p>
                <p className="text-xs text-blue-700">Active accounts</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
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
                <p className="text-2xl font-bold text-amber-900">{activeJobs}</p>
                <p className="text-xs text-amber-700">Across all customers</p>
              </div>
              <Briefcase className="h-8 w-8 text-amber-600" />
            </div>
          </CardContent>
        </Card>

        <Card 
          className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-105 bg-gradient-to-br from-green-50 to-green-100 border-green-200 hover:border-green-300"
        >
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-700 font-medium">Total Sites</p>
                <p className="text-2xl font-bold text-green-900">
                  {Array.from(new Set(mockCustomers.flatMap(customer => customer.sites))).length}
                </p>
                <p className="text-xs text-green-700">Managed locations</p>
              </div>
              <MapPin className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex items-center gap-3 flex-1">
          <Search className="text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search customers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="min-w-0 h-12 text-base"
          />
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-gray-200 pt-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">
            Customer Results ({filteredCustomers.length})
          </h2>
          <span className="text-sm text-gray-500">
            {filteredCustomers.length === mockCustomers.length ? 'Showing all customers' : 'Search results'}
          </span>
        </div>
      </div>

      {/* Customer Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCustomers.map((customer) => {
          const urgentJobs = getUrgentJobsCount(customer);
          const activeJobs = getActiveJobsCount(customer);
          const totalJobs = customer.jobs?.length || 0;
          
          return (
            <Card 
              key={customer.id} 
              className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-105"
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
