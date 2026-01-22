import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SearchInput } from '@/components/ui/search-input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { LocationSelectorModal } from '@/components/LocationSelectorModal';
import { CalendarIcon, X, MapPin, Plus, Search, User } from 'lucide-react';
import { CreateTicketFormData, Ticket, TicketReporter } from '@/types/ticket';
import { useTickets } from '@/contexts/TicketContext';
import {
  mockTicketTags,
  mockTicketOrigins,
  mockTicketImpacts,
  mockTicketClassifications,
  mockTicketQueues,
  mockSLAs,
  mockLocations,
  getLocationPath,
  mockFlatLocations,
  getTagColors
} from '@/lib/ticketUtils';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

export default function NewServiceTicketPage() {
  const navigate = useNavigate();
  const { addTicket } = useTickets();
  const [showLocationSelector, setShowLocationSelector] = useState(false);
  const [showContactSearch, setShowContactSearch] = useState(false);

  const [ticketData, setTicketData] = useState<Partial<CreateTicketFormData>>({
    date: new Date(),
    origin: '',
    tags: [],
    shortDescription: '',
    longDescription: '',
    impact: '',
    classification: '',
    ticketQueue: '',
    slaId: 'sla-1',
    autoSLA: true,
    reportedBy: {
      id: '',
      name: '',
      email: '',
      phone: ''
    },
    locations: [],
    assets: []
  });

  const handleInputChange = (field: keyof CreateTicketFormData, value: any) => {
    setTicketData(prev => ({ ...prev, [field]: value }));
  };

  const handleReporterChange = (field: keyof TicketReporter, value: string) => {
    setTicketData(prev => ({
      ...prev,
      reportedBy: {
        ...prev.reportedBy!,
        [field]: value
      }
    }));
  };

  const handleTagToggle = (tag: string) => {
    const currentTags = ticketData.tags || [];
    if (currentTags.includes(tag)) {
      handleInputChange('tags', currentTags.filter(t => t !== tag));
    } else {
      handleInputChange('tags', [...currentTags, tag]);
    }
  };

  const handleSave = () => {
    if (!ticketData.shortDescription || !ticketData.longDescription || !ticketData.locations?.length) {
      alert('Please fill in all required fields');
      return;
    }

    const selectedSLA = mockSLAs.find(sla => sla.id === ticketData.slaId) || mockSLAs[0];

    const newTicket: Ticket = {
      id: `ticket-${Date.now()}`,
      reference: `SRTK${Math.floor(Math.random() * 1000)}`,
      shortDescription: ticketData.shortDescription!,
      longDescription: ticketData.longDescription!,
      status: 'Open',
      priority: '2 - High',
      impact: ticketData.impact || 'High Impact',
      classification: ticketData.classification || 'General Maintenance',
      ticketQueue: ticketData.ticketQueue || 'Default',
      slaId: ticketData.slaId!,
      sla: selectedSLA,
      autoSLA: ticketData.autoSLA!,
      origin: ticketData.origin || 'Web Portal',
      createdDate: ticketData.date!,
      reportedBy: ticketData.reportedBy!,
      locations: ticketData.locations!,
      assets: ticketData.assets || [],
      tags: ticketData.tags || [],
      notes: [],
      jobs: [],
      timeline: [
        {
          id: `timeline-${Date.now()}`,
          type: 'ticket_created',
          title: 'NEW TICKET CREATED',
          timestamp: ticketData.date!,
          author: 'Current User',
          status: 'completed'
        }
      ]
    };

    addTicket(newTicket);
    navigate(`/tickets/${newTicket.id}`);
  };

  const selectedLocations = mockFlatLocations.filter(loc => 
    ticketData.locations?.includes(loc.id)
  );

  const isFormValid = ticketData.shortDescription && ticketData.longDescription && 
                      ticketData.locations && ticketData.locations.length > 0;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
            <span className="cursor-pointer hover:text-foreground" onClick={() => navigate('/tickets')}>Ticket Manager</span>
            <span>/</span>
            <span>New Ticket</span>
          </div>
        </div>
        <Button onClick={handleSave} disabled={!isFormValid} size="lg" className="gap-2">
          Save
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Date and Origin */}
          <Card>
            <CardContent className="pt-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {/* Date */}
                <div>
                  <Label>Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          'w-full justify-start text-left font-normal',
                          !ticketData.date && 'text-muted-foreground'
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {ticketData.date ? format(ticketData.date, 'dd/MM/yyyy') : 'Pick a date'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={ticketData.date}
                        onSelect={(date) => handleInputChange('date', date)}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                {/* Origin */}
                <div>
                  <Label>Origin</Label>
                  <Select
                    value={ticketData.origin}
                    onValueChange={(value) => handleInputChange('origin', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Origin..." />
                    </SelectTrigger>
                    <SelectContent>
                      {mockTicketOrigins.map(origin => (
                        <SelectItem key={origin} value={origin}>
                          {origin}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Service Ticket Details */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <div className="w-1 h-6 bg-blue-500 rounded" />
                <h3 className="font-semibold">Service ticket details</h3>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Short Description */}
              <div>
                <Label htmlFor="shortDescription">Short Description...</Label>
                <Input
                  id="shortDescription"
                  placeholder="Enter short description..."
                  value={ticketData.shortDescription}
                  onChange={(e) => handleInputChange('shortDescription', e.target.value)}
                />
              </div>

              {/* Long Description */}
              <div>
                <Label htmlFor="longDescription">Long description</Label>
                <Textarea
                  id="longDescription"
                  placeholder="Enter detailed description..."
                  value={ticketData.longDescription}
                  onChange={(e) => handleInputChange('longDescription', e.target.value)}
                  className="min-h-[100px]"
                />
              </div>

              {/* Impact */}
              <div>
                <Label htmlFor="impact">Select Impact...</Label>
                <Select
                  value={ticketData.impact}
                  onValueChange={(value) => handleInputChange('impact', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Impact..." />
                  </SelectTrigger>
                  <SelectContent>
                    {mockTicketImpacts.map(impact => (
                      <SelectItem key={impact} value={impact}>
                        {impact}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Classification */}
              <div>
                <Label htmlFor="classification">Select Classification...</Label>
                <Select
                  value={ticketData.classification}
                  onValueChange={(value) => handleInputChange('classification', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Classification..." />
                  </SelectTrigger>
                  <SelectContent>
                    {mockTicketClassifications.map(classification => (
                      <SelectItem key={classification} value={classification}>
                        {classification}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Ticket Queue */}
              <div>
                <Label htmlFor="ticketQueue">Select Ticket Queue...</Label>
                <Select
                  value={ticketData.ticketQueue}
                  onValueChange={(value) => handleInputChange('ticketQueue', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Ticket Queue..." />
                  </SelectTrigger>
                  <SelectContent>
                    {mockTicketQueues.map(queue => (
                      <SelectItem key={queue} value={queue}>
                        {queue}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* SLA */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label htmlFor="sla">Default SLA</Label>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Auto</span>
                    <Switch
                      checked={ticketData.autoSLA}
                      onCheckedChange={(checked) => handleInputChange('autoSLA', checked)}
                    />
                  </div>
                </div>
                <Select
                  value={ticketData.slaId}
                  onValueChange={(value) => handleInputChange('slaId', value)}
                  disabled={ticketData.autoSLA}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {mockSLAs.map(sla => (
                      <SelectItem key={sla.id} value={sla.id}>
                        {sla.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Reported By */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <User className="h-5 w-5 text-muted-foreground" />
                <h3 className="font-semibold">Reported By</h3>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <SearchInput
                  placeholder="Search for contact..."
                />
              </div>

              <div className="space-y-3">
                <div>
                  <Label htmlFor="reporterEmail">Email address</Label>
                  <Input
                    id="reporterEmail"
                    type="email"
                    placeholder="Enter email..."
                    value={ticketData.reportedBy?.email}
                    onChange={(e) => handleReporterChange('email', e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="reporterPhone">Phone number</Label>
                  <Input
                    id="reporterPhone"
                    type="tel"
                    placeholder="Enter phone number..."
                    value={ticketData.reportedBy?.phone}
                    onChange={(e) => handleReporterChange('phone', e.target.value)}
                  />
                </div>

                <Button variant="outline" size="sm" className="w-full gap-2">
                  <Plus className="h-4 w-4" />
                  Add another person/group
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Locations/Assets Affected */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-muted-foreground" />
                <h3 className="font-semibold">Locations/Assets affected</h3>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {ticketData.locations && ticketData.locations.length > 0 ? (
                <div className="p-4 border rounded-lg bg-blue-50 border-blue-200">
                  <p className="text-sm font-medium text-blue-900 mb-2">
                    Please select the affected Locations/Assets.
                  </p>
                  <div className="space-y-2">
                    {selectedLocations.map(location => (
                      <div key={location.id} className="flex items-start gap-2">
                        <div className="flex-1">
                          <div className="text-sm font-medium">{location.name}</div>
                          <div className="text-xs text-blue-700">{getLocationPath(location.id)}</div>
                        </div>
                        <button
                          onClick={() => {
                            handleInputChange(
                              'locations',
                              ticketData.locations?.filter(id => id !== location.id)
                            );
                          }}
                          className="text-red-500 hover:text-red-700"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="p-4 border rounded-lg border-blue-200 text-center">
                  <p className="text-sm text-blue-900">
                    Please select the affected Locations/Assets.
                  </p>
                </div>
              )}

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowLocationSelector(true)}
                  className="flex-1 gap-2"
                >
                  <MapPin className="h-4 w-4" />
                  Select locations/assets
                </Button>
                <Button variant="outline" className="gap-2">
                  <Plus className="h-4 w-4" />
                  Add a supplementary location
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Summary */}
        <div className="space-y-6">
          <Card className="sticky top-6">
            <CardHeader>
              <h3 className="font-semibold">Ticket Summary</h3>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <div className="text-xs text-muted-foreground">Status</div>
                <Badge className="bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-100">Draft</Badge>
              </div>
              
              {ticketData.shortDescription && (
                <div>
                  <div className="text-xs text-muted-foreground">Description</div>
                  <div className="text-sm font-medium">{ticketData.shortDescription}</div>
                </div>
              )}

              {ticketData.impact && (
                <div>
                  <div className="text-xs text-muted-foreground">Impact</div>
                  <div className="text-sm">{ticketData.impact}</div>
                </div>
              )}

              {ticketData.classification && (
                <div>
                  <div className="text-xs text-muted-foreground">Classification</div>
                  <div className="text-sm">{ticketData.classification}</div>
                </div>
              )}

              {ticketData.locations && ticketData.locations.length > 0 && (
                <div>
                  <div className="text-xs text-muted-foreground">Locations</div>
                  <div className="text-sm">{ticketData.locations.length} selected</div>
                </div>
              )}

              <div className="pt-3 border-t">
                <Button onClick={handleSave} disabled={!isFormValid} className="w-full">
                  Save Ticket
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Tags */}
          <Card>
            <CardHeader className="pb-3">
              <Label>Tags</Label>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" size="sm" className="gap-2">
                      <Plus className="h-4 w-4" />
                      Add Tag...
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80" align="start">
                    <div className="space-y-2">
                      {mockTicketTags.map(tag => (
                        <button
                          key={tag}
                          onClick={() => handleTagToggle(tag)}
                          className={cn(
                            'w-full text-left px-3 py-2 rounded text-sm transition-colors border',
                            ticketData.tags?.includes(tag) 
                              ? getTagColors(tag)
                              : 'hover:bg-accent border-transparent'
                          )}
                        >
                          <span className={cn(
                            'inline-block w-2 h-2 rounded-full mr-2',
                            ticketData.tags?.includes(tag) ? 'bg-current' : getTagColors(tag).split(' ')[0].replace('bg-', 'bg-').replace('-100', '-400')
                          )} />
                          {tag}
                        </button>
                      ))}
                    </div>
                  </PopoverContent>
                </Popover>

                {ticketData.tags && ticketData.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {ticketData.tags.map(tag => (
                      <Badge key={tag} variant="outline" className={`gap-1 border ${getTagColors(tag)}`}>
                        {tag}
                        <button
                          onClick={() => handleTagToggle(tag)}
                          className="ml-1 hover:opacity-70 rounded-full"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Location Selector Modal */}
      <LocationSelectorModal
        open={showLocationSelector}
        onOpenChange={setShowLocationSelector}
        locations={mockLocations}
        selectedLocations={ticketData.locations || []}
        onSelectLocations={(locationIds) => handleInputChange('locations', locationIds)}
        multiSelect={true}
        title="Select Locations/Assets"
      />
    </div>
  );
}
