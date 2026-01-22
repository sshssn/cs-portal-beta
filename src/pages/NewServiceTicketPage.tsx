import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { LocationSelectorModal } from '@/components/LocationSelectorModal';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { CalendarIcon, X, MapPin, Plus, User, FileText, Tag, Clock, Save, Layers } from 'lucide-react';
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
  const [contactSearchQuery, setContactSearchQuery] = useState('');

  // Demo contacts for testing
  const demoContacts = [
    { id: 'contact-1', name: 'John Smith', email: 'john.smith@example.com', phone: '+44 7700 900123' },
    { id: 'contact-2', name: 'Sarah Johnson', email: 'sarah.johnson@stmartins.co.uk', phone: '+44 7700 900456' },
    { id: 'contact-3', name: 'Mike Williams', email: 'mike.williams@homeforstudents.com', phone: '+44 7700 900789' },
    { id: 'contact-4', name: 'Emma Davis', email: 'emma.davis@facilities.org', phone: '+44 7700 900321' }
  ];

  const filteredContacts = demoContacts.filter(contact =>
    contact.name.toLowerCase().includes(contactSearchQuery.toLowerCase()) ||
    contact.email.toLowerCase().includes(contactSearchQuery.toLowerCase())
  );

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

  // Validation - require all mandatory fields
  const hasReporter = ticketData.reportedBy?.name || ticketData.reportedBy?.email || ticketData.reportedBy?.phone;
  const isFormValid = ticketData.shortDescription?.trim() && 
                      ticketData.longDescription?.trim() && 
                      ticketData.locations && ticketData.locations.length > 0 &&
                      ticketData.origin &&
                      ticketData.impact &&
                      hasReporter;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Breadcrumbs
            items={[
              { label: 'Ticket Manager', path: '/tickets' },
              { label: 'New Service Ticket' }
            ]}
          />
          <h1 className="text-2xl font-bold mt-2">Create New Service Ticket</h1>
          <p className="text-muted-foreground">Log a new service request with all relevant details</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => navigate('/tickets')}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!isFormValid} className="gap-2">
            <Save className="h-4 w-4" />
            Save Ticket
          </Button>
        </div>
      </div>

      {/* Row 1: Date & Origin + Reported By (side by side) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Date & Origin Card */}
        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Clock className="h-5 w-5 text-blue-600" />
              </div>
              <CardTitle className="text-lg">Date & Origin</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              {/* Date */}
              <div className="space-y-2">
                <Label>Date *</Label>
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
              <div className="space-y-2">
                <Label>Origin *</Label>
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

        {/* Reported By Card */}
        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <User className="h-5 w-5 text-green-600" />
              </div>
              <CardTitle className="text-lg">Reported By *</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {/* Contact Search and Selection */}
              <div className="space-y-2">
                <Input
                  placeholder="Search for contact..."
                  value={contactSearchQuery}
                  onChange={(e) => setContactSearchQuery(e.target.value)}
                  className="h-9"
                />
                
                {/* Contact List */}
                <div className="border rounded-md max-h-[180px] overflow-y-auto">
                  {filteredContacts.length > 0 ? (
                    filteredContacts.map(contact => (
                      <div
                        key={contact.id}
                        onClick={() => {
                          setTicketData(prev => ({
                            ...prev,
                            reportedBy: {
                              id: contact.id,
                              name: contact.name,
                              email: contact.email,
                              phone: contact.phone
                            }
                          }));
                          setContactSearchQuery(contact.name);
                        }}
                        className={cn(
                          "px-3 py-2 cursor-pointer hover:bg-accent transition-colors border-b last:border-b-0",
                          ticketData.reportedBy?.id === contact.id && "bg-accent"
                        )}
                      >
                        <div className="font-medium text-sm">{contact.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {contact.email} • {contact.phone}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="px-3 py-4 text-center text-sm text-muted-foreground">
                      No contacts found
                    </div>
                  )}
                </div>
              </div>

              {/* Selected Contact Display */}
              {ticketData.reportedBy?.name && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-md">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-sm text-green-800">{ticketData.reportedBy.name}</div>
                      <div className="text-xs text-green-600">
                        {ticketData.reportedBy.email} • {ticketData.reportedBy.phone}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setTicketData(prev => ({
                          ...prev,
                          reportedBy: { id: '', name: '', email: '', phone: '' }
                        }));
                        setContactSearchQuery('');
                      }}
                      className="h-6 w-6 p-0 text-green-600 hover:text-green-800 hover:bg-green-100"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Row 2: Service Ticket Details (full width) */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <FileText className="h-5 w-5 text-purple-600" />
            </div>
            <CardTitle className="text-lg">Service Ticket Details</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left column - Descriptions */}
            <div className="lg:col-span-2 space-y-4">
              <div className="space-y-2">
                <Label>Short Description *</Label>
                <Input
                  placeholder="Enter short description..."
                  value={ticketData.shortDescription}
                  onChange={(e) => handleInputChange('shortDescription', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Long Description *</Label>
                <Textarea
                  placeholder="Enter detailed description of the issue..."
                  value={ticketData.longDescription}
                  onChange={(e) => handleInputChange('longDescription', e.target.value)}
                  className="min-h-[100px]"
                />
              </div>
            </div>

            {/* Right column - Dropdowns */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Impact *</Label>
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

              <div className="space-y-2">
                <Label>Classification</Label>
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

              <div className="space-y-2">
                <Label>Ticket Queue</Label>
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

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Default SLA</Label>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-muted-foreground text-xs">Auto</span>
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
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Row 3: Tags + Locations/Assets (side by side) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tags Card */}
        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Tag className="h-5 w-5 text-orange-600" />
              </div>
              <CardTitle className="text-lg">Tags</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {mockTicketTags.map(tag => {
                const isSelected = ticketData.tags?.includes(tag);
                return (
                  <button
                    key={tag}
                    onClick={() => handleTagToggle(tag)}
                    className={cn(
                      'px-3 py-1.5 rounded-full text-sm font-medium transition-all border',
                      isSelected 
                        ? getTagColors(tag)
                        : 'bg-muted/50 text-muted-foreground border-transparent hover:bg-muted'
                    )}
                  >
                    {tag}
                    {isSelected && (
                      <X className="inline-block ml-1.5 h-3 w-3" />
                    )}
                  </button>
                );
              })}
            </div>

            {ticketData.tags && ticketData.tags.length > 0 && (
              <div className="mt-3 pt-3 border-t">
                <p className="text-sm text-muted-foreground">
                  Selected: {ticketData.tags.length} tag(s)
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Locations/Assets Card */}
        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <MapPin className="h-5 w-5 text-red-600" />
              </div>
              <CardTitle className="text-lg">Locations/Assets *</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {ticketData.locations && ticketData.locations.length > 0 ? (
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {selectedLocations.map(location => (
                  <div 
                    key={location.id} 
                    className="p-2 border rounded-lg bg-blue-50 border-blue-200 flex items-center justify-between"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm truncate">{location.name}</div>
                      <div className="text-xs text-blue-700 truncate">{getLocationPath(location.id)}</div>
                    </div>
                    <button
                      onClick={() => {
                        handleInputChange(
                          'locations',
                          ticketData.locations?.filter(id => id !== location.id)
                        );
                      }}
                      className="ml-2 text-red-500 hover:text-red-700 flex-shrink-0"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 border-2 border-dashed rounded-lg text-center">
                <Layers className="h-8 w-8 mx-auto text-muted-foreground mb-1" />
                <p className="text-sm text-muted-foreground">
                  No locations selected
                </p>
              </div>
            )}

            <Button
              variant="outline"
              onClick={() => setShowLocationSelector(true)}
              className="w-full gap-2"
            >
              <MapPin className="h-4 w-4" />
              Select Locations/Assets
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Sticky Footer */}
      <div className="sticky bottom-4 bg-background/95 backdrop-blur border rounded-lg p-4 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              {isFormValid ? (
                <div className="h-2 w-2 bg-green-500 rounded-full" />
              ) : (
                <div className="h-2 w-2 bg-amber-500 rounded-full" />
              )}
              <span className="text-sm text-muted-foreground">
                {isFormValid ? 'Ready to save' : 'Complete required fields'}
              </span>
            </div>
            {!isFormValid && (
              <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                {!ticketData.shortDescription?.trim() && <Badge variant="outline">Short description</Badge>}
                {!ticketData.longDescription?.trim() && <Badge variant="outline">Long description</Badge>}
                {!ticketData.origin && <Badge variant="outline">Origin</Badge>}
                {!ticketData.impact && <Badge variant="outline">Impact</Badge>}
                {!(ticketData.reportedBy?.name || ticketData.reportedBy?.email || ticketData.reportedBy?.phone) && <Badge variant="outline">Reporter info</Badge>}
                {(!ticketData.locations || ticketData.locations.length === 0) && <Badge variant="outline">Location</Badge>}
              </div>
            )}
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => navigate('/tickets')}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={!isFormValid} className="gap-2">
              <Save className="h-4 w-4" />
              Save Ticket
            </Button>
          </div>
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
