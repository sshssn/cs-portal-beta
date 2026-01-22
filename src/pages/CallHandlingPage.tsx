import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Badge } from '@/components/ui/badge';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Customer, Job } from '@/types/job';
import { mockCustomers } from '@/lib/jobUtils';
import {
    Phone,
    RefreshCw,
    FileText,
    Clock,
    PhoneCall,
    Edit,
    MapPin,
    User,
    Briefcase,
    AlertTriangle,
    ClipboardList,
    Building2,
    CheckCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface CallHandlingPageProps {
    customers: Customer[];
    onJobCreate: (job: Omit<Job, 'id'>) => void;
}

type CallType = 'new_request' | 'customer_followup' | 'engineer_callback';

export default function CallHandlingPage({ customers, onJobCreate }: CallHandlingPageProps) {
    // Phone number popup state
    const [showPhonePopup, setShowPhonePopup] = useState(true);
    const [phoneNumberRequired, setPhoneNumberRequired] = useState(false);
    const [phoneInput, setPhoneInput] = useState('');
    const [isPhoneEntered, setIsPhoneEntered] = useState(false);

    // Call handling form state
    const [callType, setCallType] = useState<CallType>('new_request');
    const [customerValue, setCustomerValue] = useState('');
    const [siteValue, setSiteValue] = useState('');
    const [callerName, setCallerName] = useState('');
    const [callerRole, setCallerRole] = useState('Not specified');
    const [problem, setProblem] = useState('');
    const [jobType, setJobType] = useState('');
    const [jobTrade, setJobTrade] = useState('');
    const [priorityType, setPriorityType] = useState<'emergency' | 'standard'>('emergency');
    const [priorityLevel, setPriorityLevel] = useState('');
    const [orderNumber, setOrderNumber] = useState('');
    const [activeTab, setActiveTab] = useState<'notes' | 'jobs'>('notes');

    // Generate Call ID on mount
    const [callId] = useState(() => `CALL-${Date.now()}`);

    // Get unique tenants
    const allCustomers = customers.length > 0 ? customers : mockCustomers;

    // Get sites based on selected customer
    const sites = customerValue
        ? allCustomers.find(c => c.name === customerValue)?.sites || []
        : [];

    const jobTypes = ['Reactive', 'Planned', 'Quote', 'Emergency', 'Inspection'];
    const jobTrades = ['Plumbing', 'Electrical', 'HVAC', 'General Maintenance', 'Carpentry', 'Roofing'];

    // Handle phone popup continue
    const handlePhoneContinue = () => {
        if (phoneInput.trim()) {
            setIsPhoneEntered(true);
            setShowPhonePopup(false);
            setPhoneNumberRequired(false);
        }
    };

    // Handle phone popup cancel
    const handlePhoneCancel = () => {
        setShowPhonePopup(false);
        setPhoneNumberRequired(true);
    };

    // Handle re-enter phone number
    const handleReEnterPhone = () => {
        setPhoneNumberRequired(false);
        setShowPhonePopup(true);
    };

    // Handle form submission
    const handleSubmit = () => {
        const newJob: Omit<Job, 'id'> = {
            jobNumber: `JOB-${Date.now()}`,
            customer: customerValue,
            site: siteValue,
            description: problem,
            priority: priorityType === 'emergency' ? 'Critical' : 'Medium',
            status: 'new',
            engineer: 'Unassigned',
            dateLogged: new Date(),
            reporterName: callerName,
            reporterPhone: phoneInput,
            notes: [],
            alerts: []
        };
        onJobCreate(newJob);
    };

    // Show phone number required screen
    if (phoneNumberRequired) {
        return (
            <div className="flex items-center justify-center min-h-[80vh]">
                <Card className="max-w-md w-full">
                    <CardContent className="pt-8 pb-8 text-center">
                        <div className="flex justify-center mb-6">
                            <div className="p-4 bg-blue-100 rounded-full">
                                <Phone className="h-12 w-12 text-blue-600" />
                            </div>
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900 mb-3">Phone Number Required</h1>
                        <p className="text-gray-500 mb-6">
                            You must enter a phone number to continue<br />
                            handling this call.
                        </p>
                        <Button
                            onClick={handleReEnterPhone}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3"
                        >
                            <Phone className="h-4 w-4 mr-2" />
                            Enter Phone Number
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <>
            {/* Phone Number Popup */}
            <Dialog open={showPhonePopup} onOpenChange={(open) => {
                setShowPhonePopup(open);
                if (!open && !isPhoneEntered) {
                    setPhoneNumberRequired(true);
                }
            }}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-semibold flex items-center gap-2">
                            <Phone className="h-5 w-5 text-blue-600" />
                            Enter Phone Number
                        </DialogTitle>
                    </DialogHeader>
                    <div className="py-4">
                        <Label htmlFor="phone" className="text-sm font-medium">
                            Phone Number <span className="text-red-500">*</span>
                        </Label>
                        <Input
                            id="phone"
                            placeholder="Enter phone number..."
                            value={phoneInput}
                            onChange={(e) => setPhoneInput(e.target.value)}
                            className="mt-2 h-11"
                        />
                    </div>
                    <DialogFooter className="gap-2">
                        <Button variant="outline" onClick={handlePhoneCancel}>
                            Cancel
                        </Button>
                        <Button onClick={handlePhoneContinue} className="bg-blue-600 hover:bg-blue-700">
                            Continue
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Main Call Handling UI */}
            {isPhoneEntered && (
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
                                <BreadcrumbPage className="font-medium">Call Handling</BreadcrumbPage>
                            </BreadcrumbItem>
                        </BreadcrumbList>
                    </Breadcrumb>

                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-green-100 rounded-lg">
                                <PhoneCall className="h-6 w-6 text-green-600" />
                            </div>
                            <div>
                                <div className="flex items-center gap-3">
                                    <h1 className="text-2xl font-bold text-gray-900">Incoming Call</h1>
                                    <Badge className="bg-green-100 text-green-700 border-green-200">
                                        Active
                                    </Badge>
                                </div>
                                <div className="flex items-center gap-2 mt-1">
                                    <Phone className="h-4 w-4 text-blue-600" />
                                    <span className="text-blue-600 font-medium">{phoneInput}</span>
                                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={handleReEnterPhone}>
                                        <Edit className="h-3 w-3 text-gray-400" />
                                    </Button>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-200 rounded-lg">
                                <span className="text-sm text-gray-600">Call ID:</span>
                                <span className="text-sm text-blue-600 font-medium">{callId}</span>
                            </div>
                            <Button variant="outline" className="gap-2">
                                <Clock className="h-4 w-4" />
                                Manual Entry
                            </Button>
                        </div>
                    </div>

                    {/* Two Column Layout */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Left Column - Form */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Caller & Location Card */}
                            <Card>
                                <CardHeader className="border-b bg-gray-50/50">
                                    <CardTitle className="text-base font-semibold flex items-center gap-2">
                                        <User className="h-5 w-5 text-blue-600" />
                                        Caller & Location Details
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="pt-6">
                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="space-y-4">
                                            <div className="space-y-2">
                                                <Label className="text-sm font-medium">
                                                    Location <span className="text-red-500">*</span>
                                                </Label>
                                                <Select value={customerValue} onValueChange={setCustomerValue}>
                                                    <SelectTrigger className="h-10">
                                                        <SelectValue placeholder="Select location..." />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {allCustomers.map(c => (
                                                            <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-sm font-medium">Site</Label>
                                                <div className="flex gap-2">
                                                    <Select value={siteValue} onValueChange={setSiteValue}>
                                                        <SelectTrigger className="h-10 flex-1">
                                                            <SelectValue placeholder="Select location first" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {sites.map(s => (
                                                                <SelectItem key={s} value={s}>{s}</SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                    <Button variant="outline" size="icon" className="h-10 w-10">
                                                        <RefreshCw className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="space-y-4">
                                            <div className="space-y-2">
                                                <Label className="text-sm font-medium">Caller Name</Label>
                                                <Input
                                                    placeholder="Enter caller name..."
                                                    value={callerName}
                                                    onChange={(e) => setCallerName(e.target.value)}
                                                    className="h-10"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-sm font-medium">Caller Role</Label>
                                                <Input
                                                    placeholder="e.g. Site Manager"
                                                    value={callerRole}
                                                    onChange={(e) => setCallerRole(e.target.value)}
                                                    className="h-10"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Call Type Selection */}
                            <div className="grid grid-cols-3 gap-4">
                                <div
                                    onClick={() => setCallType('new_request')}
                                    className={cn(
                                        "p-4 rounded-lg border-2 cursor-pointer transition-all",
                                        callType === 'new_request'
                                            ? "border-blue-500 bg-blue-50 ring-1 ring-blue-500"
                                            : "border-gray-200 bg-white hover:border-gray-300"
                                    )}
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <div className={cn(
                                            "p-2 rounded-lg",
                                            callType === 'new_request' ? "bg-blue-100" : "bg-gray-100"
                                        )}>
                                            <FileText className={cn(
                                                "h-5 w-5",
                                                callType === 'new_request' ? "text-blue-600" : "text-gray-600"
                                            )} />
                                        </div>
                                        {callType === 'new_request' && (
                                            <CheckCircle className="h-5 w-5 text-blue-600" />
                                        )}
                                    </div>
                                    <div className="font-semibold text-gray-900">New Request</div>
                                    <div className="text-xs text-gray-500 mt-1">Create a new job</div>
                                </div>

                                <div
                                    onClick={() => setCallType('customer_followup')}
                                    className={cn(
                                        "p-4 rounded-lg border-2 cursor-pointer transition-all",
                                        callType === 'customer_followup'
                                            ? "border-blue-500 bg-blue-50 ring-1 ring-blue-500"
                                            : "border-gray-200 bg-white hover:border-gray-300"
                                    )}
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <div className={cn(
                                            "p-2 rounded-lg",
                                            callType === 'customer_followup' ? "bg-blue-100" : "bg-gray-100"
                                        )}>
                                            <Clock className={cn(
                                                "h-5 w-5",
                                                callType === 'customer_followup' ? "text-blue-600" : "text-gray-600"
                                            )} />
                                        </div>
                                        {callType === 'customer_followup' && (
                                            <CheckCircle className="h-5 w-5 text-blue-600" />
                                        )}
                                    </div>
                                    <div className="font-semibold text-gray-900">Customer Follow-up</div>
                                    <div className="text-xs text-gray-500 mt-1">Callback on previous job</div>
                                </div>

                                <div
                                    onClick={() => setCallType('engineer_callback')}
                                    className={cn(
                                        "p-4 rounded-lg border-2 cursor-pointer transition-all",
                                        callType === 'engineer_callback'
                                            ? "border-blue-500 bg-blue-50 ring-1 ring-blue-500"
                                            : "border-gray-200 bg-white hover:border-gray-300"
                                    )}
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <div className={cn(
                                            "p-2 rounded-lg",
                                            callType === 'engineer_callback' ? "bg-blue-100" : "bg-gray-100"
                                        )}>
                                            <PhoneCall className={cn(
                                                "h-5 w-5",
                                                callType === 'engineer_callback' ? "text-blue-600" : "text-gray-600"
                                            )} />
                                        </div>
                                        {callType === 'engineer_callback' && (
                                            <CheckCircle className="h-5 w-5 text-blue-600" />
                                        )}
                                    </div>
                                    <div className="font-semibold text-gray-900">Engineer Callback</div>
                                    <div className="text-xs text-gray-500 mt-1">Follow-up on assigned job</div>
                                </div>
                            </div>

                            {/* Problem Description Card */}
                            <Card>
                                <CardHeader className="border-b bg-gray-50/50">
                                    <CardTitle className="text-base font-semibold flex items-center gap-2">
                                        <ClipboardList className="h-5 w-5 text-orange-500" />
                                        Problem Details
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="pt-6 space-y-5">
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <Label className="text-sm font-medium">
                                                What's the problem? <span className="text-red-500">*</span>
                                            </Label>
                                            <span className="text-xs text-gray-400">{problem.length}/1000</span>
                                        </div>
                                        <Textarea
                                            placeholder="Describe the issue in detail..."
                                            value={problem}
                                            onChange={(e) => setProblem(e.target.value)}
                                            className="min-h-[120px] resize-none"
                                            maxLength={1000}
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label className="text-sm font-medium">
                                                Job Type <span className="text-red-500">*</span>
                                            </Label>
                                            <Select value={jobType} onValueChange={setJobType}>
                                                <SelectTrigger className="h-10">
                                                    <SelectValue placeholder="Select job type..." />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {jobTypes.map(type => (
                                                        <SelectItem key={type} value={type}>{type}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-sm font-medium">Job Trade</Label>
                                            <Select value={jobTrade} onValueChange={setJobTrade}>
                                                <SelectTrigger className="h-10">
                                                    <SelectValue placeholder="Select trade..." />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {jobTrades.map(trade => (
                                                        <SelectItem key={trade} value={trade}>{trade}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Priority & Order Card */}
                            <Card>
                                <CardHeader className="border-b bg-gray-50/50">
                                    <CardTitle className="text-base font-semibold flex items-center gap-2">
                                        <AlertTriangle className="h-5 w-5 text-amber-500" />
                                        Priority & Order
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="pt-6">
                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="space-y-4">
                                            <div className="space-y-2">
                                                <Label className="text-sm font-medium">
                                                    Priority <span className="text-red-500">*</span>
                                                </Label>
                                                <RadioGroup
                                                    value={priorityType}
                                                    onValueChange={(val) => setPriorityType(val as 'emergency' | 'standard')}
                                                    className="flex items-center gap-4"
                                                >
                                                    <div className="flex items-center space-x-2">
                                                        <RadioGroupItem value="emergency" id="emergency" />
                                                        <Label htmlFor="emergency" className="text-sm font-medium text-red-600 cursor-pointer">Emergency</Label>
                                                    </div>
                                                    <div className="flex items-center space-x-2">
                                                        <RadioGroupItem value="standard" id="standard" />
                                                        <Label htmlFor="standard" className="text-sm cursor-pointer">Standard</Label>
                                                    </div>
                                                </RadioGroup>
                                            </div>
                                            <Select value={priorityLevel} onValueChange={setPriorityLevel}>
                                                <SelectTrigger className="h-10">
                                                    <SelectValue placeholder="Default Priority (No SLA)" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="no-sla">Default Priority (No SLA)</SelectItem>
                                                    <SelectItem value="4-hour">4 Hour Response</SelectItem>
                                                    <SelectItem value="24-hour">24 Hour Response</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-sm font-medium">Order Number</Label>
                                            <Input
                                                placeholder="Customer PO/Order number (optional)"
                                                value={orderNumber}
                                                onChange={(e) => setOrderNumber(e.target.value)}
                                                className="h-10"
                                            />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Submit Button */}
                            <Button
                                onClick={handleSubmit}
                                className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-medium gap-2"
                                disabled={!customerValue || !problem}
                            >
                                <CheckCircle className="h-5 w-5" />
                                Confirm & Create Job
                            </Button>
                        </div>

                        {/* Right Column - Site Notes */}
                        <div className="space-y-6">
                            <Card>
                                <CardHeader className="border-b p-0">
                                    <div className="flex">
                                        <button
                                            onClick={() => setActiveTab('notes')}
                                            className={cn(
                                                "flex-1 px-4 py-3 text-sm font-medium transition-colors",
                                                activeTab === 'notes'
                                                    ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50/50"
                                                    : "text-gray-500 hover:text-gray-700"
                                            )}
                                        >
                                            <div className="flex items-center justify-center gap-2">
                                                <FileText className="h-4 w-4" />
                                                Site Notes
                                            </div>
                                        </button>
                                        <button
                                            onClick={() => setActiveTab('jobs')}
                                            className={cn(
                                                "flex-1 px-4 py-3 text-sm font-medium transition-colors",
                                                activeTab === 'jobs'
                                                    ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50/50"
                                                    : "text-gray-500 hover:text-gray-700"
                                            )}
                                        >
                                            <div className="flex items-center justify-center gap-2">
                                                <Briefcase className="h-4 w-4" />
                                                Recent Jobs
                                            </div>
                                        </button>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-6">
                                    {activeTab === 'notes' ? (
                                        <div>
                                            {siteValue ? (
                                                <div className="space-y-3">
                                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                                        <Building2 className="h-4 w-4" />
                                                        <span>Notes for <strong>{siteValue}</strong></span>
                                                    </div>
                                                    <div className="p-3 bg-gray-50 rounded-lg border text-sm text-gray-600">
                                                        No notes available for this site.
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="text-center py-8">
                                                    <div className="p-3 bg-gray-100 rounded-full w-12 h-12 mx-auto mb-3 flex items-center justify-center">
                                                        <MapPin className="h-5 w-5 text-gray-400" />
                                                    </div>
                                                    <p className="text-sm text-gray-500">
                                                        Select a site to view notes
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <div>
                                            {siteValue ? (
                                                <div className="space-y-3">
                                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                                        <Briefcase className="h-4 w-4" />
                                                        <span>Recent jobs at <strong>{siteValue}</strong></span>
                                                    </div>
                                                    <div className="p-3 bg-gray-50 rounded-lg border text-sm text-gray-600">
                                                        No recent jobs found.
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="text-center py-8">
                                                    <div className="p-3 bg-gray-100 rounded-full w-12 h-12 mx-auto mb-3 flex items-center justify-center">
                                                        <Briefcase className="h-5 w-5 text-gray-400" />
                                                    </div>
                                                    <p className="text-sm text-gray-500">
                                                        Select a site to view recent jobs
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Quick Summary Card */}
                            {customerValue && (
                                <Card>
                                    <CardHeader className="border-b">
                                        <CardTitle className="text-base font-semibold">Call Summary</CardTitle>
                                    </CardHeader>
                                    <CardContent className="pt-4 space-y-3">
                                        <div>
                                            <div className="text-xs text-gray-500">Location</div>
                                            <div className="text-sm font-medium text-gray-900">{customerValue}</div>
                                        </div>
                                        {siteValue && (
                                            <div>
                                                <div className="text-xs text-gray-500">Site</div>
                                                <div className="text-sm font-medium text-gray-900">{siteValue}</div>
                                            </div>
                                        )}
                                        {callerName && (
                                            <div>
                                                <div className="text-xs text-gray-500">Caller</div>
                                                <div className="text-sm font-medium text-gray-900">{callerName}</div>
                                            </div>
                                        )}
                                        <div>
                                            <div className="text-xs text-gray-500">Call Type</div>
                                            <Badge variant="outline" className="mt-1">
                                                {callType === 'new_request' ? 'New Request' : 
                                                 callType === 'customer_followup' ? 'Customer Follow-up' : 
                                                 'Engineer Callback'}
                                            </Badge>
                                        </div>
                                        {problem && (
                                            <div>
                                                <div className="text-xs text-gray-500">Problem</div>
                                                <div className="text-sm text-gray-700 line-clamp-3">{problem}</div>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
