import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
  Briefcase
} from 'lucide-react';

interface AllCustomersPageProps {
  onBack: () => void;
  onCustomerSelect: (customer: Customer) => void;
}

export default function AllCustomersPage({ onBack, onCustomerSelect }: AllCustomersPageProps) {
  const [searchQuery, setSearchQuery] = useState('');
  
  const filteredCustomers = mockCustomers.filter(customer =>
    customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    customer.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    customer.sites.some(site => site.toLowerCase().includes(searchQuery.toLowerCase()))
  );

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">All Customers</h1>
          <p className="text-muted-foreground mt-2">
            Manage and view all customer accounts and their job history
          </p>
        </div>
        <Button onClick={onBack} variant="outline" className="flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Button>
      </div>

      {/* Search Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Search Customers
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Input
            placeholder="Search by customer name, email, or site..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full"
          />
        </CardContent>
      </Card>

      {/* Summary Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
    </div>
  );
}
