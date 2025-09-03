import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Check, ChevronsUpDown, User, Building, MapPin, Phone, Mail } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Contact, Customer } from '@/types/job';
import { mockCustomers } from '@/lib/jobUtils';

interface CustomerDetailsFormProps {
  onNext: (customerData: {
    customer: string;
    site: string;
    contact: Contact;
  }) => void;
}

export default function CustomerDetailsForm({ onNext }: CustomerDetailsFormProps) {
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [selectedSite, setSelectedSite] = useState('');
  const [contact, setContact] = useState<Contact>({
    name: '',
    number: '',
    email: '',
    relationship: ''
  });
  const [customerOpen, setCustomerOpen] = useState(false);
  const [siteOpen, setSiteOpen] = useState(false);

  const isFormValid = selectedCustomer && selectedSite && contact.name && contact.number;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isFormValid) {
      onNext({
        customer: selectedCustomer.name,
        site: selectedSite,
        contact
      });
    }
  };

  const handleContactChange = (field: keyof Contact, value: string) => {
    setContact(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-gray-50">
        <CardHeader className="text-center pb-6">
          <CardTitle className="text-2xl font-bold text-gray-900">
            Customer Details
          </CardTitle>
          <p className="text-muted-foreground">
            Please provide the customer and contact information
          </p>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Customer Selection */}
            <div className="space-y-2">
              <Label htmlFor="customer" className="text-sm font-medium flex items-center gap-2">
                <Building size={16} />
                Customer *
              </Label>
              <Popover open={customerOpen} onOpenChange={setCustomerOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={customerOpen}
                    className="w-full justify-between h-12"
                  >
                    {selectedCustomer ? selectedCustomer.name : "Select customer..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0">
                  <Command>
                    <CommandInput placeholder="Search customers..." />
                    <CommandEmpty>No customer found.</CommandEmpty>
                    <CommandGroup>
                      {mockCustomers.map((customer) => (
                        <CommandItem
                          key={customer.id}
                          onSelect={() => {
                            setSelectedCustomer(customer);
                            setSelectedSite(''); // Reset site when customer changes
                            setCustomerOpen(false);
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              selectedCustomer?.id === customer.id ? "opacity-100" : "opacity-0"
                            )}
                          />
                          {customer.name}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            {/* Site Selection */}
            <div className="space-y-2">
              <Label htmlFor="site" className="text-sm font-medium flex items-center gap-2">
                <MapPin size={16} />
                Site *
              </Label>
              <Popover open={siteOpen} onOpenChange={setSiteOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={siteOpen}
                    className="w-full justify-between h-12"
                    disabled={!selectedCustomer}
                  >
                    {selectedSite || "Select site..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0">
                  <Command>
                    <CommandInput placeholder="Search sites..." />
                    <CommandEmpty>No site found.</CommandEmpty>
                    <CommandGroup>
                      {selectedCustomer?.sites.map((site) => (
                        <CommandItem
                          key={site}
                          onSelect={() => {
                            setSelectedSite(site);
                            setSiteOpen(false);
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              selectedSite === site ? "opacity-100" : "opacity-0"
                            )}
                          />
                          {site}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            {/* Contact Information */}
            <div className="space-y-4 pt-4 border-t">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <User size={18} />
                Contact Information
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="contactName" className="text-sm font-medium">
                    Contact Name *
                  </Label>
                  <Input
                    id="contactName"
                    placeholder="Enter contact name"
                    value={contact.name}
                    onChange={(e) => handleContactChange('name', e.target.value)}
                    className="h-12"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="contactNumber" className="text-sm font-medium flex items-center gap-2">
                    <Phone size={14} />
                    Phone Number *
                  </Label>
                  <Input
                    id="contactNumber"
                    type="tel"
                    placeholder="Enter phone number"
                    value={contact.number}
                    onChange={(e) => handleContactChange('number', e.target.value)}
                    className="h-12"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="contactEmail" className="text-sm font-medium flex items-center gap-2">
                    <Mail size={14} />
                    Email Address
                  </Label>
                  <Input
                    id="contactEmail"
                    type="email"
                    placeholder="Enter email address"
                    value={contact.email}
                    onChange={(e) => handleContactChange('email', e.target.value)}
                    className="h-12"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="contactRelationship" className="text-sm font-medium">
                    Relationship
                  </Label>
                  <Input
                    id="contactRelationship"
                    placeholder="e.g., Site Manager"
                    value={contact.relationship}
                    onChange={(e) => handleContactChange('relationship', e.target.value)}
                    className="h-12"
                  />
                </div>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-12 text-lg font-semibold bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
              disabled={!isFormValid}
            >
              Continue to Job Details
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}