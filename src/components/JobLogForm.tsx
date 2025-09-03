import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ArrowLeft, Save, Wrench, Clock, AlertTriangle, User, Calendar, Tag, Check, ChevronsUpDown, Plus, X, Phone, Mail, Bell } from 'lucide-react';
import { JobFormData, Reporter, JobContact, Engineer } from '@/types/job';
import { mockEngineers, mockJobTrades, mockTags, getEngineerStatusColor } from '@/lib/jobUtils';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface JobLogFormProps {
  customerData: {
    customer: string;
    site: string;
    reporter: Reporter;
  };
  onSave: (jobData: JobFormData) => void;
  onBack: () => void;
}

export default function JobLogForm({ customerData, onSave, onBack }: JobLogFormProps) {
  const [jobData, setJobData] = useState<Partial<JobFormData>>({
    description: '',
    jobType: 'Maintenance',
    category: 'Electrical',
    priority: 'Medium',
    targetCompletionTime: 60,
    engineer: '',
    project: '',
    primaryJobTrade: '',
    secondaryJobTrades: [],
    customerOrderNumber: '',
    referenceNumber: '',
    jobOwner: '',
    tags: [],
    jobRef1: '',
    jobRef2: '',
    requiresApproval: false,
    preferredAppointmentDate: null,
    startDate: null,
    endDate: null,
    lockVisitDateTime: false,
    deployToMobile: true,
    isRecurringJob: false,
    completionTimeFromEngineerOnsite: false,
    customAlerts: {
      acceptSLA: 20,
      onsiteSLA: 60,
      completedSLA: 120
    },
    contact: {
      name: '',
      number: '',
      email: '',
      relationship: ''
    }
  });

  const [engineerOpen, setEngineerOpen] = useState(false);
  const [primaryTradeOpen, setPrimaryTradeOpen] = useState(false);

  const isFormValid = jobData.description?.trim() !== '' && jobData.contact?.name && jobData.contact?.number;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isFormValid) {
      const completeJobData: JobFormData = {
        ...customerData,
        ...jobData as JobFormData
      };
      onSave(completeJobData);
    }
  };

  const handleInputChange = (field: string, value: string | number | boolean | Date | null | string[]) => {
    setJobData(prev => ({ ...prev, [field]: value }));
  };

  const handleContactChange = (field: keyof JobContact, value: string) => {
    setJobData(prev => ({
      ...prev,
      contact: {
        ...prev.contact!,
        [field]: value
      }
    }));
  };

  const handleCustomAlertChange = (field: string, value: number) => {
    setJobData(prev => ({
      ...prev,
      customAlerts: {
        ...prev.customAlerts!,
        [field]: value
      }
    }));
  };

  const handleTagToggle = (tag: string) => {
    const currentTags = jobData.tags || [];
    if (currentTags.includes(tag)) {
      handleInputChange('tags', currentTags.filter(t => t !== tag));
    } else {
      handleInputChange('tags', [...currentTags, tag]);
    }
  };

  const handleSecondaryTradeToggle = (trade: string) => {
    const currentTrades = jobData.secondaryJobTrades || [];
    if (currentTrades.includes(trade)) {
      handleInputChange('secondaryJobTrades', currentTrades.filter(t => t !== trade));
    } else {
      handleInputChange('secondaryJobTrades', [...currentTrades, trade]);
    }
  };

  const selectedEngineer = mockEngineers.find(eng => eng.name === jobData.engineer);

  return (
    <div className="max-w-6xl mx-auto">
      <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-gray-50">
        <CardHeader className="pb-6">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={onBack}
              className="p-2"
            >
              <ArrowLeft size={20} />
            </Button>
            <div>
              <CardTitle className="text-2xl font-bold text-gray-900">
                Log New Job
              </CardTitle>
              <p className="text-muted-foreground mt-1">
                {customerData.customer} - {customerData.site}
              </p>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Contact Information Section */}
            <div className="space-y-6">
              <div className="flex items-center gap-2 mb-4">
                <User size={20} className="text-blue-600" />
                <h3 className="text-lg font-semibold">Contact Information</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="contactName" className="text-sm font-medium">
                    Contact Name *
                  </Label>
                  <Input
                    id="contactName"
                    placeholder="Enter contact name"
                    value={jobData.contact?.name || ''}
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
                    value={jobData.contact?.number || ''}
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
                    value={jobData.contact?.email || ''}
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
                    value={jobData.contact?.relationship || ''}
                    onChange={(e) => handleContactChange('relationship', e.target.value)}
                    className="h-12"
                  />
                </div>
              </div>
            </div>

            {/* Custom Alerts Section - Enhanced */}
            <Card className="bg-gradient-to-br from-orange-50 to-red-50 border-2 border-orange-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-orange-800">
                  <Bell size={20} />
                  Custom Job Alerts & SLA Settings
                </CardTitle>
                <p className="text-sm text-orange-700">
                  Configure automatic status alerts based on job progress milestones
                </p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card className="bg-white border-green-200">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm text-green-700 flex items-center gap-2">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        Accept SLA
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <Input
                            type="number"
                            min="1"
                            max="120"
                            value={jobData.customAlerts?.acceptSLA || 20}
                            onChange={(e) => handleCustomAlertChange('acceptSLA', parseInt(e.target.value) || 20)}
                            className="w-20 h-10 text-center"
                          />
                          <span className="text-sm text-gray-600">minutes</span>
                        </div>
                        <div className="text-xs text-gray-600 bg-gray-50 p-2 rounded">
                          <div className="flex items-center gap-1 mb-1">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            <span>Green: Accepted within time</span>
                          </div>
                          <div className="flex items-center gap-1 mb-1">
                            <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                            <span>Amber: 80% of time elapsed</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                            <span>Red: Time exceeded</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-white border-blue-200">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm text-blue-700 flex items-center gap-2">
                        <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                        On Site SLA
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <Input
                            type="number"
                            min="1"
                            max="240"
                            value={jobData.customAlerts?.onsiteSLA || 60}
                            onChange={(e) => handleCustomAlertChange('onsiteSLA', parseInt(e.target.value) || 60)}
                            className="w-20 h-10 text-center"
                          />
                          <span className="text-sm text-gray-600">minutes</span>
                        </div>
                        <div className="text-xs text-gray-600 bg-gray-50 p-2 rounded">
                          <div className="flex items-center gap-1 mb-1">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            <span>Green: On site within time</span>
                          </div>
                          <div className="flex items-center gap-1 mb-1">
                            <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                            <span>Amber: Engineer traveling</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                            <span>Red: Time exceeded</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-white border-purple-200">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm text-purple-700 flex items-center gap-2">
                        <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                        Completion SLA
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <Input
                            type="number"
                            min="1"
                            max="480"
                            value={jobData.customAlerts?.completedSLA || 120}
                            onChange={(e) => handleCustomAlertChange('completedSLA', parseInt(e.target.value) || 120)}
                            className="w-20 h-10 text-center"
                          />
                          <span className="text-sm text-gray-600">minutes</span>
                        </div>
                        <div className="text-xs text-gray-600 bg-gray-50 p-2 rounded">
                          <div className="flex items-center gap-1 mb-1">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            <span>Green: Completed within time</span>
                          </div>
                          <div className="flex items-center gap-1 mb-1">
                            <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                            <span>Amber: Work in progress</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                            <span>Red: Time exceeded</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>How it works:</strong> The system automatically monitors job progress and updates status colors based on these SLA settings. 
                    Engineers and managers receive visual alerts when jobs approach or exceed target times.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Job Details Section */}
            <div className="space-y-6 pt-6 border-t">
              <div className="flex items-center gap-2 mb-4">
                <Wrench size={20} className="text-blue-600" />
                <h3 className="text-lg font-semibold">Job Details</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="jobType" className="text-sm font-medium">
                    Job Type *
                  </Label>
                  <Select
                    value={jobData.jobType}
                    onValueChange={(value) => handleInputChange('jobType', value)}
                  >
                    <SelectTrigger className="h-12">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Maintenance">Maintenance</SelectItem>
                      <SelectItem value="Repair">Repair</SelectItem>
                      <SelectItem value="Installation">Installation</SelectItem>
                      <SelectItem value="Emergency">Emergency</SelectItem>
                      <SelectItem value="Inspection">Inspection</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="primaryTrade" className="text-sm font-medium">
                    Primary Job Trade
                  </Label>
                  <Popover open={primaryTradeOpen} onOpenChange={setPrimaryTradeOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={primaryTradeOpen}
                        className="w-full justify-between h-12"
                      >
                        {jobData.primaryJobTrade || "Please select an option..."}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-full p-0">
                      <Command>
                        <CommandInput placeholder="Search trades..." />
                        <CommandEmpty>No trade found.</CommandEmpty>
                        <CommandGroup>
                          {mockJobTrades.map((trade) => (
                            <CommandItem
                              key={trade}
                              onSelect={() => {
                                handleInputChange('primaryJobTrade', trade);
                                setPrimaryTradeOpen(false);
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  jobData.primaryJobTrade === trade ? "opacity-100" : "opacity-0"
                                )}
                              />
                              {trade}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category" className="text-sm font-medium">
                    Job Category
                  </Label>
                  <Select
                    value={jobData.category}
                    onValueChange={(value) => handleInputChange('category', value)}
                  >
                    <SelectTrigger className="h-12">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Electrical">Electrical</SelectItem>
                      <SelectItem value="Mechanical">Mechanical</SelectItem>
                      <SelectItem value="Plumbing">Plumbing</SelectItem>
                      <SelectItem value="HVAC">HVAC</SelectItem>
                      <SelectItem value="General">General</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="priority" className="text-sm font-medium flex items-center gap-2">
                    <AlertTriangle size={14} />
                    Priority Level
                  </Label>
                  <Select
                    value={jobData.priority}
                    onValueChange={(value) => handleInputChange('priority', value)}
                  >
                    <SelectTrigger className="h-12">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Low">Low</SelectItem>
                      <SelectItem value="Medium">Medium</SelectItem>
                      <SelectItem value="High">High</SelectItem>
                      <SelectItem value="Critical">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-sm font-medium">
                  Description *
                </Label>
                <Textarea
                  id="description"
                  placeholder="Describe the issue or work required in detail..."
                  value={jobData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  rows={4}
                  className="resize-none"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">Secondary Job Trade(s)</Label>
                <div className="flex flex-wrap gap-2 p-3 border rounded-md bg-gray-50 min-h-[60px]">
                  {mockJobTrades.map(trade => (
                    <Badge
                      key={trade}
                      variant={jobData.secondaryJobTrades?.includes(trade) ? "default" : "outline"}
                      className="cursor-pointer hover:bg-blue-100"
                      onClick={() => handleSecondaryTradeToggle(trade)}
                    >
                      {trade}
                      {jobData.secondaryJobTrades?.includes(trade) && (
                        <X size={12} className="ml-1" />
                      )}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="engineer" className="text-sm font-medium">
                    Engineer
                  </Label>
                  <Popover open={engineerOpen} onOpenChange={setEngineerOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={engineerOpen}
                        className="w-full justify-between h-12"
                      >
                        {selectedEngineer ? (
                          <div className="flex items-center gap-2">
                            <div className={cn("w-2 h-2 rounded-full", getEngineerStatusColor(selectedEngineer.status))} />
                            <span>{selectedEngineer.name}</span>
                            <Badge variant="outline" className="text-xs">
                              {selectedEngineer.status.replace('_', ' ')}
                            </Badge>
                          </div>
                        ) : (
                          "Please select an option..."
                        )}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-full p-0">
                      <Command>
                        <CommandInput placeholder="Search engineers..." />
                        <CommandEmpty>No engineer found.</CommandEmpty>
                        <CommandGroup>
                          {mockEngineers.map((engineer) => (
                            <CommandItem
                              key={engineer.name}
                              onSelect={() => {
                                handleInputChange('engineer', engineer.name);
                                setEngineerOpen(false);
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  jobData.engineer === engineer.name ? "opacity-100" : "opacity-0"
                                )}
                              />
                              <div className="flex items-center gap-2 flex-1">
                                <div className={cn("w-2 h-2 rounded-full", getEngineerStatusColor(engineer.status))} />
                                <span>{engineer.name}</span>
                                <Badge variant="outline" className="text-xs ml-auto">
                                  {engineer.status.replace('_', ' ')}
                                </Badge>
                              </div>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="targetTime" className="text-sm font-medium flex items-center gap-2">
                    <Clock size={14} />
                    Target Time (minutes)
                  </Label>
                  <Input
                    id="targetTime"
                    type="number"
                    min="15"
                    max="480"
                    value={jobData.targetCompletionTime}
                    onChange={(e) => handleInputChange('targetCompletionTime', parseInt(e.target.value) || 60)}
                    className="h-12"
                  />
                </div>
              </div>
            </div>

            {/* Reporter Summary */}
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <h4 className="font-medium text-blue-900 mb-2">Reporter Information</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-700">
                <div>
                  <span className="font-medium">Name:</span> {customerData.reporter.name}
                </div>
                <div>
                  <span className="font-medium">Phone:</span> {customerData.reporter.number}
                </div>
                {customerData.reporter.email && (
                  <div>
                    <span className="font-medium">Email:</span> {customerData.reporter.email}
                  </div>
                )}
                {customerData.reporter.relationship && (
                  <div>
                    <span className="font-medium">Role:</span> {customerData.reporter.relationship}
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-4 pt-6 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={onBack}
                className="flex-1 h-12"
              >
                Back to Reporter Details
              </Button>
              <Button
                type="submit"
                className="flex-1 h-12 text-lg font-semibold bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
                disabled={!isFormValid}
              >
                <Save size={18} className="mr-2" />
                Log Job
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}