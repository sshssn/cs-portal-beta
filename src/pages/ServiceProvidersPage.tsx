import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { SearchInput } from '@/components/ui/search-input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Plus, MapPin, Eye, Edit, Trash, Users, ChevronDown, Phone, User, X, Clock, Mail } from 'lucide-react';
import { ServiceProvider } from '@/types/ticket';
import { mockServiceProviders, mockFlatLocations } from '@/lib/ticketUtils';
import { cn } from '@/lib/utils';

// Mock OOH Engineers data
const mockOOHEngineers = [
  { id: '1', name: 'John Smith', phone: '+44 7700 123456', email: 'john.smith@ooh.com', specialty: 'Electrical', available: true },
  { id: '2', name: 'Sarah Johnson', phone: '+44 7700 234567', email: 'sarah.j@ooh.com', specialty: 'HVAC', available: true },
  { id: '3', name: 'Mike Brown', phone: '+44 7700 345678', email: 'mike.b@ooh.com', specialty: 'Plumbing', available: false },
  { id: '4', name: 'Emma Wilson', phone: '+44 7700 456789', email: 'emma.w@ooh.com', specialty: 'Fire Safety', available: true },
];

// Service Line Categories
const serviceLineCategories = [
  'Electrical',
  'Plumbing',
  'HVAC',
  'Fire Safety',
  'Security Systems',
  'Cleaning',
  'Landscaping',
  'Pest Control',
  'Building Maintenance',
  'Lifts & Escalators',
  'Catering',
  'Waste Management'
];

interface ServiceProvidersPageProps {
  onSelectServiceProvider?: (provider: ServiceProvider) => void;
  selectedLocation?: string;
}

export default function ServiceProvidersPage({
  onSelectServiceProvider,
  selectedLocation
}: ServiceProvidersPageProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [locationFilter, setLocationFilter] = useState<string>(selectedLocation || 'all');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedProvider, setSelectedProvider] = useState<ServiceProvider | null>(null);
  const [showOOHModal, setShowOOHModal] = useState(false);

  const handleRowClick = (provider: ServiceProvider) => {
    setSelectedProvider(provider);
    setShowOOHModal(true);
    onSelectServiceProvider?.(provider);
  };

  const filteredProviders = mockServiceProviders.filter(provider => {
    if (searchQuery && !provider.name.toLowerCase().includes(searchQuery.toLowerCase()) && 
        !provider.ref.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    if (statusFilter !== 'all' && provider.status.toLowerCase() !== statusFilter.toLowerCase()) {
      return false;
    }
    if (locationFilter !== 'all' && provider.location !== locationFilter) {
      return false;
    }
    return true;
  });

  const toggleCategory = (category: string) => {
    setSelectedCategories(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const getDocumentBadge = (count: number, type: 'missing' | 'pending' | 'approaching' | 'expired') => {
    if (count === 0) return null;
    
    const colors = {
      missing: 'bg-red-100 text-red-700 border-red-200',
      pending: 'bg-orange-100 text-orange-700 border-orange-200',
      approaching: 'bg-yellow-100 text-yellow-700 border-yellow-200',
      expired: 'bg-red-100 text-red-700 border-red-200'
    };

    return (
      <Badge variant="outline" className={cn('border', colors[type])}>
        {count}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-end">
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          New
        </Button>
      </div>

      <Card>
        <CardHeader className="border-b">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <SearchInput
                placeholder="Search for Service Provider..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onClear={() => setSearchQuery('')}
              />
            </div>

            {/* Filters */}
            <div className="flex gap-2 flex-wrap">
              {/* Status Filter */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center justify-between px-3 py-2 border rounded-md text-sm hover:bg-accent min-w-[120px]">
                    <span className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-green-500" />
                      Status
                    </span>
                    <ChevronDown className="h-4 w-4 text-muted-foreground ml-2" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-48">
                  <DropdownMenuCheckboxItem 
                    checked={statusFilter === 'all'}
                    onCheckedChange={() => setStatusFilter('all')}
                  >
                    All
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem 
                    checked={statusFilter === 'active'}
                    onCheckedChange={() => setStatusFilter('active')}
                  >
                    Active
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem 
                    checked={statusFilter === 'inactive'}
                    onCheckedChange={() => setStatusFilter('inactive')}
                  >
                    Inactive
                  </DropdownMenuCheckboxItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Service Line Categories */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center justify-between px-3 py-2 border rounded-md text-sm hover:bg-accent min-w-[180px]">
                    <span className="flex items-center gap-2 truncate">
                      <div className="w-2 h-2 rounded-full bg-gray-400 shrink-0" />
                      <span className="truncate">
                        {selectedCategories.length > 0 
                          ? `${selectedCategories.length} selected`
                          : 'Service Line Categories'
                        }
                      </span>
                    </span>
                    <ChevronDown className="h-4 w-4 text-muted-foreground ml-2 shrink-0" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-56">
                  {serviceLineCategories.map(category => (
                    <DropdownMenuCheckboxItem
                      key={category}
                      checked={selectedCategories.includes(category)}
                      onCheckedChange={() => toggleCategory(category)}
                    >
                      {category}
                    </DropdownMenuCheckboxItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Area Codes */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center justify-between px-3 py-2 border rounded-md text-sm hover:bg-accent min-w-[130px]">
                    <span className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 shrink-0" />
                      Area Codes
                    </span>
                    <ChevronDown className="h-4 w-4 text-muted-foreground ml-2" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-48">
                  <DropdownMenuCheckboxItem checked>All Areas</DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem>Edinburgh</DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem>Glasgow</DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem>London</DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem>Manchester</DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem>Birmingham</DropdownMenuCheckboxItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Filters Button */}
              <Button variant="outline" className="gap-2">
                Filters
                <ChevronDown className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12"></TableHead>
                  <TableHead className="w-12"></TableHead>
                  <TableHead>Ref.</TableHead>
                  <TableHead>Service Provider Name</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead className="text-center">
                    <div className="flex flex-col items-center">
                      <span>Missing Mandatory</span>
                      <span>Documents</span>
                    </div>
                  </TableHead>
                  <TableHead className="text-center">
                    <div className="flex flex-col items-center">
                      <span>Pending Mandatory</span>
                      <span>Documents</span>
                    </div>
                  </TableHead>
                  <TableHead className="text-center">
                    <div className="flex flex-col items-center">
                      <span>Documents Approaching</span>
                      <span>Expiry</span>
                    </div>
                  </TableHead>
                  <TableHead className="text-center">
                    <div className="flex flex-col items-center">
                      <span>Expired Mandatory</span>
                      <span>Documents</span>
                    </div>
                  </TableHead>
                  <TableHead className="text-center">Performance</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProviders.map((provider) => (
                  <TableRow 
                    key={provider.id}
                    className="cursor-pointer hover:bg-accent/50"
                    onClick={() => handleRowClick(provider)}
                  >
                    <TableCell>
                      <button className="text-muted-foreground hover:text-foreground">
                        <Edit className="h-4 w-4" />
                      </button>
                    </TableCell>
                    <TableCell>
                      <button className="text-muted-foreground hover:text-foreground">
                        <Trash className="h-4 w-4" />
                      </button>
                    </TableCell>
                    <TableCell className="font-medium">{provider.ref}</TableCell>
                    <TableCell>{provider.name}</TableCell>
                    <TableCell>
                      <Badge variant={provider.status === 'Active' ? 'default' : 'secondary'}>
                        {provider.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{provider.location}</TableCell>
                    <TableCell className="text-center">
                      {getDocumentBadge(provider.missingMandatoryDocs, 'missing')}
                    </TableCell>
                    <TableCell className="text-center">
                      {getDocumentBadge(provider.pendingMandatoryDocs, 'pending')}
                    </TableCell>
                    <TableCell className="text-center">
                      {getDocumentBadge(provider.docsApproachingExpiry, 'approaching')}
                    </TableCell>
                    <TableCell className="text-center">
                      {getDocumentBadge(provider.expiredMandatoryDocs, 'expired')}
                    </TableCell>
                    <TableCell className="text-center">{provider.performance}</TableCell>
                    <TableCell>
                      <button className="text-muted-foreground hover:text-foreground">
                        <Eye className="h-4 w-4" />
                      </button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {filteredProviders.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No service providers found</p>
        </div>
      )}

      {/* OOH Engineers Modal */}
      <Dialog open={showOOHModal} onOpenChange={setShowOOHModal}>
        <DialogContent className="max-w-lg">
          <DialogHeader className="border-b pb-4">
            <DialogTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-600" />
              OOH Engineers - {selectedProvider?.name}
            </DialogTitle>
          </DialogHeader>
          
          <div className="py-4 space-y-4">
            {/* Provider Info */}
            <div className="bg-gray-50 rounded-lg p-4 border">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-gray-500">Reference:</span>
                  <span className="ml-2 font-medium">{selectedProvider?.ref}</span>
                </div>
                <div>
                  <span className="text-gray-500">Location:</span>
                  <span className="ml-2 font-medium">{selectedProvider?.location}</span>
                </div>
                <div>
                  <span className="text-gray-500">Status:</span>
                  <Badge variant={selectedProvider?.status === 'Active' ? 'default' : 'secondary'} className="ml-2">
                    {selectedProvider?.status}
                  </Badge>
                </div>
                <div>
                  <span className="text-gray-500">Performance:</span>
                  <span className="ml-2 font-medium">{selectedProvider?.performance}</span>
                </div>
              </div>
            </div>

            {/* Engineers List */}
            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Clock className="h-4 w-4 text-orange-500" />
                Out of Hours Engineers
              </h4>
              <div className="space-y-3">
                {mockOOHEngineers.map(engineer => (
                  <div
                    key={engineer.id}
                    className="flex items-center justify-between p-3 bg-white border rounded-lg hover:border-blue-300 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-medium",
                        engineer.available ? "bg-blue-600" : "bg-gray-400"
                      )}>
                        {engineer.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-gray-900">{engineer.name}</span>
                          <span className={cn(
                            "text-xs px-1.5 py-0.5 rounded",
                            engineer.available 
                              ? "bg-green-100 text-green-700" 
                              : "bg-gray-100 text-gray-500"
                          )}>
                            {engineer.available ? 'Available' : 'Unavailable'}
                          </span>
                        </div>
                        <div className="text-sm text-gray-500 flex items-center gap-3">
                          <span className="flex items-center gap-1">
                            <Badge variant="outline" className="text-xs font-normal">
                              {engineer.specialty}
                            </Badge>
                          </span>
                        </div>
                        <div className="text-xs text-gray-400 mt-1 flex items-center gap-2">
                          <Mail className="h-3 w-3" />
                          {engineer.email}
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <a
                        href={`tel:${engineer.phone}`}
                        className={cn(
                          "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                          engineer.available
                            ? "bg-green-600 text-white hover:bg-green-700"
                            : "bg-gray-100 text-gray-400 cursor-not-allowed"
                        )}
                        onClick={(e) => !engineer.available && e.preventDefault()}
                      >
                        <Phone className="h-4 w-4" />
                        Call
                      </a>
                      <span className="text-xs text-center text-gray-500">{engineer.phone}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="border-t pt-4 flex justify-end">
            <Button variant="outline" onClick={() => setShowOOHModal(false)}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
