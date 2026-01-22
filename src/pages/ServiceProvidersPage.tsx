import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { SearchInput } from '@/components/ui/search-input';
import { Badge } from '@/components/ui/badge';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { 
  MapPin, 
  Phone, 
  Mail, 
  Building2, 
  Users,
  Wrench
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { oohServiceProviders } from '@/lib/serviceProviderData';

// Use the shared service providers data
const serviceProviders = oohServiceProviders;

export default function ServiceProvidersPage() {
  const [searchQuery, setSearchQuery] = useState('');

  // Filter providers based on search
  const filteredProviders = serviceProviders.filter(provider => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      provider.name.toLowerCase().includes(query) ||
      provider.location.toLowerCase().includes(query) ||
      provider.specialty.toLowerCase().includes(query)
    );
  });

  return (
    <div className="space-y-6">
      {/* Breadcrumbs */}
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/" className="text-gray-500 hover:text-gray-900">
              Home
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage className="font-medium">Service Providers</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Service Providers</h1>
          <p className="text-gray-500 mt-1">OOH Service Providers by location</p>
        </div>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="py-4">
          <SearchInput
            placeholder="Search by name, location, or specialty..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onClear={() => setSearchQuery('')}
          />
        </CardContent>
      </Card>

      {/* Service Providers List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredProviders.map(provider => (
          <Card key={provider.id} className="overflow-hidden hover:shadow-md transition-shadow">
            <CardHeader className="border-b bg-gray-50/50 pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Building2 className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{provider.name}</CardTitle>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge className={cn(
                        "text-xs",
                        provider.status === 'active'
                          ? "bg-green-100 text-green-700 border-green-200"
                          : "bg-gray-100 text-gray-600 border-gray-200"
                      )}>
                        {provider.status === 'active' ? 'Active' : 'Inactive'}
                      </Badge>
                      <span className="text-xs text-gray-500 flex items-center gap-1">
                        <Wrench className="h-3 w-3" />
                        {provider.specialty}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-4 space-y-3">
              <div className="flex items-start gap-3">
                <MapPin className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="text-sm font-medium text-gray-900">{provider.location}</div>
                  <div className="text-xs text-gray-500">{provider.address}</div>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-gray-400 flex-shrink-0" />
                <a 
                  href={`tel:${provider.phone}`} 
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  {provider.phone}
                </a>
              </div>
              
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-gray-400 flex-shrink-0" />
                <a 
                  href={`mailto:${provider.email}`} 
                  className="text-sm text-blue-600 hover:text-blue-700"
                >
                  {provider.email}
                </a>
              </div>

              <div className="pt-3 border-t flex justify-end gap-2">
                <a
                  href={`tel:${provider.phone}`}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors",
                    provider.status === 'active'
                      ? "bg-green-100 text-green-700 hover:bg-green-200"
                      : "bg-gray-100 text-gray-400 cursor-not-allowed"
                  )}
                  onClick={(e) => provider.status !== 'active' && e.preventDefault()}
                >
                  <Phone className="h-3.5 w-3.5" />
                  Call
                </a>
                <a
                  href={`mailto:${provider.email}`}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-blue-100 text-blue-700 hover:bg-blue-200 transition-colors"
                >
                  <Mail className="h-3.5 w-3.5" />
                  Email
                </a>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredProviders.length === 0 && (
        <div className="text-center py-12">
          <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No service providers found matching your search</p>
          <Button variant="outline" onClick={() => setSearchQuery('')} className="mt-4">
            Clear Search
          </Button>
        </div>
      )}
    </div>
  );
}
