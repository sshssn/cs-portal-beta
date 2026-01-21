import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
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
import { Customer, Job } from '@/types/job';
import { mockCustomers } from '@/lib/jobUtils';
import {
    Phone,
    RefreshCw,
    FileText,
    Clock,
    PhoneCall,
    Edit,
    ChevronDown
} from 'lucide-react';

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
                <div className="text-center">
                    <div className="flex justify-center mb-6">
                        <Phone className="h-16 w-16 text-gray-800" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-3">Phone Number Required</h1>
                    <p className="text-gray-500 mb-6">
                        You must enter a <span className="text-blue-600">phone number</span> to continue using<br />
                        this screen.
                    </p>
                    <Button
                        onClick={handleReEnterPhone}
                        className="bg-gray-900 hover:bg-black text-white px-8 py-3"
                    >
                        Enter Phone Number
                    </Button>
                </div>
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
                        <DialogTitle className="text-xl font-semibold">Enter Phone Number</DialogTitle>
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
                            className="mt-2"
                        />
                    </div>
                    <DialogFooter className="gap-2">
                        <Button variant="outline" onClick={handlePhoneCancel}>
                            Cancel
                        </Button>
                        <Button onClick={handlePhoneContinue} className="bg-gray-900 hover:bg-black">
                            Continue
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Main Call Handling UI */}
            {isPhoneEntered && (
                <div className="space-y-4">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 bg-gray-100 rounded-full flex items-center justify-center">
                                <Phone className="h-5 w-5 text-gray-600" />
                            </div>
                            <div>
                                <div className="flex items-center gap-2">
                                    <span className="font-semibold text-gray-900">Select Tenant</span>
                                    <Button variant="ghost" size="icon" className="h-5 w-5">
                                        <Edit className="h-3 w-3 text-gray-400" />
                                    </Button>
                                    <span className="text-red-500 text-sm">* Please select a tenant</span>
                                </div>
                                <div className="flex items-center gap-1 text-blue-600">
                                    <span className="text-sm">+{phoneInput}</span>
                                    <span className="text-sm text-gray-500">is calling</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <Button variant="outline" size="sm" className="gap-2">
                                <Clock className="h-4 w-4" />
                                Manual Entry
                            </Button>
                            <div className="flex items-center gap-2 bg-blue-50 px-3 py-1.5 rounded">
                                <span className="text-sm text-gray-600">Call ID:</span>
                                <span className="text-sm text-blue-600 font-medium">{callId}</span>
                                <ChevronDown className="h-4 w-4 text-gray-400" />
                            </div>
                        </div>
                    </div>

                    {/* Two Column Layout */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Left Column - Form */}
                        <div className="lg:col-span-2 space-y-4">
                            {/* Customer & Site Row */}
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-3">
                                    <div className="flex items-center gap-3">
                                        <Label className="text-blue-600 w-20">Customer:</Label>
                                        <Select value={customerValue} onValueChange={setCustomerValue}>
                                            <SelectTrigger className="flex-1">
                                                <SelectValue placeholder="Select customer" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {allCustomers.map(c => (
                                                    <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <Label className="text-blue-600 w-20">Site:</Label>
                                        <Select value={siteValue} onValueChange={setSiteValue}>
                                            <SelectTrigger className="flex-1">
                                                <SelectValue placeholder="Select Tenant First" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {sites.map(s => (
                                                    <SelectItem key={s} value={s}>{s}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <Button variant="ghost" size="icon" className="h-8 w-8">
                                            <RefreshCw className="h-4 w-4 text-gray-400" />
                                        </Button>
                                        <span className="text-blue-600 text-sm cursor-pointer">Sync</span>
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <div className="flex items-center gap-3">
                                        <Label className="text-gray-500 w-24">Caller Name:</Label>
                                        <Input
                                            placeholder="Enter name..."
                                            value={callerName}
                                            onChange={(e) => setCallerName(e.target.value)}
                                            className="flex-1"
                                        />
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <Label className="text-gray-500 w-24">Caller Role:</Label>
                                        <Input
                                            value={callerRole}
                                            onChange={(e) => setCallerRole(e.target.value)}
                                            className="flex-1 text-gray-500"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Call Type Selection */}
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setCallType('new_request')}
                                    className={`flex-1 flex items-center gap-3 p-4 rounded-lg border-2 transition-colors ${callType === 'new_request'
                                        ? 'border-gray-800 bg-white'
                                        : 'border-gray-200 bg-white hover:border-gray-300'
                                        }`}
                                >
                                    <div className="h-8 w-8 bg-gray-100 rounded-full flex items-center justify-center">
                                        <FileText className="h-4 w-4 text-gray-600" />
                                    </div>
                                    <div className="text-left">
                                        <div className="flex items-center gap-2">
                                            <span className="font-semibold text-gray-900">New Request</span>
                                            {callType === 'new_request' && <span className="text-green-600">✓</span>}
                                        </div>
                                        <span className="text-xs text-gray-500">Create a new job</span>
                                    </div>
                                </button>

                                <button
                                    onClick={() => setCallType('customer_followup')}
                                    className={`flex-1 flex items-center gap-3 p-4 rounded-lg border-2 transition-colors ${callType === 'customer_followup'
                                        ? 'border-gray-800 bg-white'
                                        : 'border-gray-200 bg-white hover:border-gray-300'
                                        }`}
                                >
                                    <div className="h-8 w-8 bg-gray-100 rounded-full flex items-center justify-center">
                                        <Clock className="h-4 w-4 text-gray-600" />
                                    </div>
                                    <div className="text-left">
                                        <span className="font-semibold text-gray-900">Customer Follow-up</span>
                                        <p className="text-xs text-gray-500">Callback on previous job</p>
                                    </div>
                                </button>

                                <button
                                    onClick={() => setCallType('engineer_callback')}
                                    className={`flex-1 flex items-center gap-3 p-4 rounded-lg border-2 transition-colors ${callType === 'engineer_callback'
                                        ? 'border-gray-800 bg-white'
                                        : 'border-gray-200 bg-white hover:border-gray-300'
                                        }`}
                                >
                                    <div className="h-8 w-8 bg-gray-100 rounded-full flex items-center justify-center">
                                        <PhoneCall className="h-4 w-4 text-gray-600" />
                                    </div>
                                    <div className="text-left">
                                        <span className="font-semibold text-gray-900">Engineer Callback</span>
                                        <p className="text-xs text-gray-500">Follow-up on assigned job</p>
                                    </div>
                                </button>
                            </div>

                            {/* Problem Description */}
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <Label className="text-sm font-medium flex items-center gap-2">
                                        <FileText className="h-4 w-4" />
                                        What's the problem? <span className="text-red-500">*</span>
                                    </Label>
                                    <span className="text-xs text-gray-400">{problem.length}/1000</span>
                                </div>
                                <Textarea
                                    placeholder="Describe the issue in detail..."
                                    value={problem}
                                    onChange={(e) => setProblem(e.target.value)}
                                    className="min-h-[100px] resize-none"
                                    maxLength={1000}
                                />
                            </div>

                            {/* Job Type & Trade */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label className="text-sm text-gray-600 mb-2 block">
                                        Job Type <span className="text-red-500">*</span>
                                    </Label>
                                    <Select value={jobType} onValueChange={setJobType}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select job type..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {jobTypes.map(type => (
                                                <SelectItem key={type} value={type}>{type}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <Label className="text-sm text-gray-600 mb-2 block">Job Trade</Label>
                                    <Select value={jobTrade} onValueChange={setJobTrade}>
                                        <SelectTrigger>
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

                            {/* Priority & Order Number */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label className="text-sm text-gray-600 mb-2 block">
                                        Priority <span className="text-red-500">*</span>
                                    </Label>
                                    <RadioGroup
                                        value={priorityType}
                                        onValueChange={(val) => setPriorityType(val as 'emergency' | 'standard')}
                                        className="flex items-center gap-4 mb-2"
                                    >
                                        <div className="flex items-center gap-2">
                                            <RadioGroupItem value="emergency" id="emergency" />
                                            <Label htmlFor="emergency" className="text-sm font-medium text-blue-600">Emergency</Label>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <RadioGroupItem value="standard" id="standard" />
                                            <Label htmlFor="standard" className="text-sm">Standard</Label>
                                        </div>
                                    </RadioGroup>
                                    <Select value={priorityLevel} onValueChange={setPriorityLevel}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Default Priority (No SLA)" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="no-sla">Default Priority (No SLA)</SelectItem>
                                            <SelectItem value="4-hour">4 Hour Response</SelectItem>
                                            <SelectItem value="24-hour">24 Hour Response</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <Label className="text-sm text-gray-600 mb-2 block">Order Number</Label>
                                    <Input
                                        placeholder="Enter customer PO/Order number (optional)"
                                        value={orderNumber}
                                        onChange={(e) => setOrderNumber(e.target.value)}
                                    />
                                </div>
                            </div>

                            {/* Submit Button */}
                            <Button
                                onClick={handleSubmit}
                                className="w-full h-12 bg-gray-800 hover:bg-gray-900 text-white font-medium"
                            >
                                Confirm & Create Job
                            </Button>
                        </div>

                        {/* Right Column - Site Notes */}
                        <div>
                            <Card className="border border-gray-200">
                                <CardContent className="p-0">
                                    {/* Tab Switcher */}
                                    <div className="flex border-b border-gray-200">
                                        <button
                                            onClick={() => setActiveTab('notes')}
                                            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${activeTab === 'notes'
                                                ? 'text-gray-900 border-b-2 border-gray-900'
                                                : 'text-gray-500 hover:text-gray-700'
                                                }`}
                                        >
                                            Site Notes
                                        </button>
                                        <button
                                            onClick={() => setActiveTab('jobs')}
                                            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${activeTab === 'jobs'
                                                ? 'text-gray-900 border-b-2 border-gray-900'
                                                : 'text-gray-500 hover:text-gray-700'
                                                }`}
                                        >
                                            Recent Site Jobs
                                        </button>
                                    </div>

                                    <div className="p-4">
                                        <h3 className="font-semibold text-gray-900 mb-3">Site Notes</h3>
                                        <p className="text-sm text-gray-400 italic text-center py-8">
                                            Please select a site to view notes
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
