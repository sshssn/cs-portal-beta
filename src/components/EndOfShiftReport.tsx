import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Job, Customer } from '@/types/job';
import { generateJobNumber, mockJobTrades, mockTags } from '@/lib/jobUtils';
import { 
  FileText, 
  ArrowLeft, 
  Download, 
  Mail, 
  Calendar,
  Clock,
  CheckCircle,
  AlertTriangle,
  User,
  Building2,
  Briefcase,
  MapPin,
  Mic,
  Sparkles,
  StickyNote,
  Plus
} from 'lucide-react';

interface EndOfShiftReportProps {
  onBack: () => void;
  jobs: Job[];
  customers: Customer[];
  onJobCreate: (job: Omit<Job, 'id'>) => void;
}

export default function EndOfShiftReport({ onBack, jobs, customers, onJobCreate }: EndOfShiftReportProps) {
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [shiftNotes, setShiftNotes] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [showSummarizeOptions, setShowSummarizeOptions] = useState(false);
  const [summaryType, setSummaryType] = useState<'concise' | 'pro' | 'detailed'>('concise');
  const [showFollowUpOptions, setShowFollowUpOptions] = useState(false);
  const [activeFilter, setActiveFilter] = useState<'all' | 'green' | 'amber' | 'red'>('all');
  const [showCreateJobModal, setShowCreateJobModal] = useState(false);
  const [newJobData, setNewJobData] = useState({
    customer: '',
    site: '',
    description: '',
    engineer: '',
    priority: 'Medium' as Job['priority'],
    category: 'General' as Job['category'],
    jobType: 'Maintenance' as Job['jobType']
  });

  // Get all jobs for display - now using props instead of mockJobs
  const getAllJobs = () => {
    return jobs;
  };

  // Get filtered jobs based on active filter
  const getFilteredJobs = () => {
    if (activeFilter === 'all') {
      return getAllJobs();
    }
    return getAllJobs().filter(job => job.status === activeFilter);
  };

  // Calculate statistics using all jobs
  const allJobs = getAllJobs();
  const stats = {
    totalJobs: allJobs.length,
    completed: allJobs.filter(job => job.status === 'green' || job.status === 'completed' || job.status === 'costed' || job.status === 'reqs_invoice').length,
    inProgress: allJobs.filter(job => job.status === 'amber' || job.status === 'new' || job.status === 'allocated' || job.status === 'attended' || job.status === 'awaiting_parts').length,
    issues: allJobs.filter(job => job.status === 'red').length,
  };

  // Calculate completion rate
  const completionRate = stats.totalJobs > 0 ? (stats.completed / stats.totalJobs) * 100 : 0;

  const handleTileClick = (filter: 'all' | 'green' | 'amber' | 'red') => {
    setActiveFilter(filter);
  };

  const handleCreateJob = () => {
    if (!newJobData.customer || !newJobData.site || !newJobData.description || !newJobData.engineer) {
      alert('Please fill in all required fields');
      return;
    }

    const newJob: Omit<Job, 'id'> = {
      jobNumber: generateJobNumber(),
      customer: newJobData.customer,
      site: newJobData.site,
      description: newJobData.description,
      engineer: newJobData.engineer,
      status: 'new',
      priority: newJobData.priority,
      category: newJobData.category,
      jobType: newJobData.jobType,
      targetCompletionTime: 240,
      dateLogged: new Date(),
      dateAccepted: null,
      dateOnSite: null,
      dateCompleted: null,
      reason: null,
      contact: {
        name: 'Shift Report',
        number: '+447000000000',
        email: 'shift@company.com',
        relationship: 'Shift Manager'
      },
      reporter: {
        name: 'Shift Report',
        number: '+447000000000',
        email: 'shift@company.com',
        relationship: 'Shift Manager'
      },
      primaryJobTrade: newJobData.category,
      secondaryJobTrades: ['General'],
      tags: [newJobData.category, newJobData.jobType, 'Shift Report'],
      customAlerts: {
        acceptSLA: 30,
        onsiteSLA: 90,
        completedSLA: 240
      },
      project: 'Shift Report Jobs',
      customerOrderNumber: '',
      referenceNumber: '',
      jobOwner: 'Shift Manager',
      jobRef1: '',
      jobRef2: '',
      requiresApproval: false,
      preferredAppointmentDate: null,
      startDate: new Date(),
      endDate: null,
      lockVisitDateTime: false,
      deployToMobile: true,
      isRecurringJob: false,
      completionTimeFromEngineerOnsite: false
    };

    onJobCreate(newJob);
    setShowCreateJobModal(false);
    setNewJobData({
      customer: '',
      site: '',
      description: '',
      engineer: '',
      priority: 'Medium',
      category: 'General',
      jobType: 'Maintenance'
    });
    
    // Add note about job creation
    setShiftNotes(prev => prev + `\n\n[Job Created: ${newJob.jobNumber} - ${newJob.description} for ${newJob.customer} at ${newJob.site}]`);
  };

  const handleGenerateReport = () => {
    // In a real application, this would generate and download a PDF report
    console.log('Generating report for:', startDate, 'to', endDate, shiftNotes);
    alert('Report generated successfully! (This would download a PDF in a real application)');
  };

  const handleSendEmail = () => {
    // In a real application, this would send the report via email
    console.log('Sending report via email for:', startDate, 'to', endDate, shiftNotes);
    alert('Email sent successfully! (This would send as a PDF in a real application via email)');
  };

  const handleVoiceInput = () => {
    setIsRecording(!isRecording);
    // In a real app, this would start/stop voice recording
    if (!isRecording) {
      alert('Text to Speech Assistant activated! (This would start voice input in a real application)');
      // Simulate adding voice input after 3 seconds
      setTimeout(() => {
        setShiftNotes(prev => prev + '\n\n[Voice Note: Shift completed successfully with 3 jobs completed and 1 in progress. All customers satisfied with service quality.]');
        setIsRecording(false);
      }, 3000);
    } else {
      alert('Text to Speech Assistant deactivated!');
    }
  };

  const handleSummarize = () => {
    if (!shiftNotes.trim()) {
      alert('Please add some notes before summarizing.');
      return;
    }
    setShowSummarizeOptions(true);
  };

  const generateSummary = (type: 'concise' | 'pro' | 'detailed') => {
    const summaries = {
      concise: 'Shift completed with 3 jobs finished, 1 in progress. Good customer satisfaction.',
      pro: 'End of shift report: Successfully completed 3 maintenance jobs, 1 installation in progress. Met all SLA targets. Customer feedback positive. No major issues reported.',
      detailed: 'Comprehensive shift summary: Completed 3 jobs (HVAC maintenance, electrical repair, plumbing fix) within SLA. 1 installation job in progress for security system. All customers provided positive feedback. Equipment functioning properly. Team coordination excellent. Ready for next shift handover.'
    };
    
    setShiftNotes(prev => prev + `\n\n--- ${type.charAt(0).toUpperCase() + type.slice(1)} Summary ---\n\n${summaries[type]}`);
    setShowSummarizeOptions(false);
  };

  const addFollowUpNote = (type: string) => {
    const followUpNotes = {
      'job-follow-up': '⚠️ JOB REQUIRES FOLLOW UP: Customer requested additional work on security system installation. Schedule follow-up visit within 48 hours.',
      'customer-feedback': '📞 CUSTOMER FEEDBACK: Positive response from HVAC maintenance. Customer satisfied with quick resolution.',
      'equipment-issue': '🔧 EQUIPMENT ISSUE: Plumbing tools need maintenance. Report to maintenance team for inspection.',
      'sla-breach': '⏰ SLA BREACH: Job #HVAC-2024-001 exceeded response time. Requires escalation to management.'
    };
    
    setShiftNotes(prev => prev + `\n\n--- ${type.replace('-', ' ').toUpperCase()} ---\n\n${followUpNotes[type as keyof typeof followUpNotes]}`);
    setShowFollowUpOptions(false);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">End of Shift Report</h1>
          <p className="text-muted-foreground mt-2">
            Generate comprehensive reports for completed shifts
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            onClick={() => setShowCreateJobModal(true)} 
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
          >
            <Plus className="h-4 w-4" />
            Create Job
          </Button>
          <Button onClick={onBack} variant="outline" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Button>
        </div>
      </div>

      {/* Report Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Report Configuration
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">From Date</label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">To Date</label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>

            <div className="flex items-end gap-2">
              <Button onClick={handleGenerateReport} className="flex-1">
                <Download className="h-4 w-4 mr-2" />
                Generate Report
              </Button>
              <Button onClick={handleSendEmail} variant="outline" className="flex-1">
                <Mail className="h-4 w-4 mr-2" />
                Send via Email
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Shift Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card 
          className={`bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-105 ${
            activeFilter === 'all' ? 'ring-2 ring-blue-500 shadow-lg' : ''
          }`}
          onClick={() => handleTileClick('all')}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-800">Total Jobs</CardTitle>
            <Briefcase className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-900">{stats.totalJobs}</div>
            <p className="text-xs text-blue-700">Jobs processed</p>
          </CardContent>
        </Card>

        <Card 
          className={`bg-gradient-to-br from-green-50 to-green-100 border-green-200 cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-105 ${
            activeFilter === 'green' ? 'ring-2 ring-green-500 shadow-lg' : ''
          }`}
          onClick={() => handleTileClick('green')}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-800">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-900">{stats.completed}</div>
            <p className="text-xs text-green-700">{completionRate.toFixed(1)}% completion rate</p>
          </CardContent>
        </Card>

        <Card 
          className={`bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200 cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-105 ${
            activeFilter === 'amber' ? 'ring-2 ring-amber-500 shadow-lg' : ''
          }`}
          onClick={() => handleTileClick('amber')}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-amber-800">In Progress</CardTitle>
            <Clock className="h-4 w-4 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-900">{stats.inProgress}</div>
            <p className="text-xs text-amber-700">Ongoing work</p>
          </CardContent>
        </Card>

        <Card 
          className={`bg-gradient-to-br from-red-50 to-red-100 border-red-200 cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-105 ${
            activeFilter === 'red' ? 'ring-2 ring-red-500 shadow-lg' : ''
          }`}
          onClick={() => handleTileClick('red')}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-red-800">Issues</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-900">{stats.issues}</div>
            <p className="text-xs text-red-700">Require attention</p>
          </CardContent>
        </Card>
      </div>

      {/* Active Filter Display */}
      {activeFilter !== 'all' && (
        <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg border">
          <span className="text-sm text-gray-600">Showing:</span>
          <Badge 
            className={
              activeFilter === 'green' ? 'bg-green-100 text-green-800 border-green-200' :
              activeFilter === 'amber' ? 'bg-amber-100 text-amber-800 border-amber-200' :
              'bg-red-100 text-red-800 border-red-200'
            }
          >
            {activeFilter === 'green' ? 'Completed Jobs' :
             activeFilter === 'amber' ? 'In Progress Jobs' :
             'Issue Jobs'}
          </Badge>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => handleTileClick('all')}
            className="text-gray-500 hover:text-gray-700"
          >
            Clear Filter
          </Button>
        </div>
      )}

      {/* Jobs Logged */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Jobs Logged {activeFilter !== 'all' && `(${getFilteredJobs().length} ${activeFilter === 'green' ? 'completed' : activeFilter === 'amber' ? 'in progress' : 'issue'} jobs)`}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {getFilteredJobs().length > 0 ? (
              getFilteredJobs().map(job => (
                <div key={job.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-semibold text-gray-900 text-sm">{job.jobNumber}</h3>
                    <Badge variant={job.status === 'green' ? 'default' : job.status === 'amber' ? 'secondary' : 'destructive'} className="text-xs">
                      {job.status === 'green' ? 'Completed' : 
                       job.status === 'amber' ? 'In Process' : 
                       job.status === 'red' ? 'Issue' : 
                       job.status === 'OOH' ? 'Out of Hours' :
                       job.status === 'On call' ? 'On Call' :
                       job.status === 'travel' ? 'Traveling' :
                       job.status === 'require_revisit' ? 'Requires Revisit' :
                       job.status === 'sick' ? 'Sick Leave' :
                       job.status === 'training' ? 'Training' :
                       String(job.status).toUpperCase()}
                    </Badge>
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-600">{job.customer}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-600">{job.site}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-600">{job.engineer}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-600">{formatTime(job.dateLogged)}</span>
                    </div>
                  </div>
                  
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <p className="text-xs text-gray-500 mb-2">{job.description}</p>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {job.priority}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {job.category}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-2 text-sm font-semibold text-gray-900">No jobs found</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {activeFilter !== 'all' 
                    ? `No ${activeFilter === 'green' ? 'completed' : activeFilter === 'amber' ? 'in progress' : 'issue'} jobs found.`
                    : 'No jobs have been logged yet.'}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Shift Notes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <StickyNote className="h-5 w-5" />
            Shift Notes
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2">
            <Button 
              onClick={handleVoiceInput} 
              variant={isRecording ? 'destructive' : 'outline'}
              className="flex items-center gap-2"
            >
              <Mic className="h-4 w-4" />
              {isRecording ? 'Stop Recording' : 'Voice Input'}
            </Button>
            
            <Button onClick={handleSummarize} variant="outline" className="flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              Summarize
            </Button>
            
            <Button onClick={() => setShowFollowUpOptions(true)} variant="outline" className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Add Follow-up
            </Button>
          </div>
          
          <Textarea
            value={shiftNotes}
            onChange={(e) => setShiftNotes(e.target.value)}
            placeholder="Enter your shift notes here... (You can use voice input, summarize, or add follow-up notes using the buttons above)"
            rows={8}
            className="min-h-[200px]"
          />
        </CardContent>
      </Card>

      {/* Summarize Options Modal */}
      {showSummarizeOptions && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Choose Summary Type</h3>
            <div className="space-y-3">
              <Button 
                onClick={() => generateSummary('concise')} 
                variant="outline" 
                className="w-full justify-start"
              >
                <FileText className="h-4 w-4 mr-2" />
                Concise Summary
              </Button>
              <Button 
                onClick={() => generateSummary('pro')} 
                variant="outline" 
                className="w-full justify-start"
              >
                <FileText className="h-4 w-4 mr-2" />
                Professional Summary
              </Button>
              <Button 
                onClick={() => generateSummary('detailed')} 
                variant="outline" 
                className="w-full justify-start"
              >
                <FileText className="h-4 w-4 mr-2" />
                Detailed Summary
              </Button>
            </div>
            <Button 
              onClick={() => setShowSummarizeOptions(false)} 
              variant="ghost" 
              className="w-full mt-4"
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* Follow-up Options Modal */}
      {showFollowUpOptions && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Add Follow-up Note</h3>
            <div className="space-y-3">
              <Button 
                onClick={() => addFollowUpNote('job-follow-up')} 
                variant="outline" 
                className="w-full justify-start"
              >
                <AlertTriangle className="h-4 w-4 mr-2" />
                Job Follow-up Required
              </Button>
              <Button 
                onClick={() => addFollowUpNote('customer-feedback')} 
                variant="outline" 
                className="w-full justify-start"
              >
                <User className="h-4 w-4 mr-2" />
                Customer Feedback
              </Button>
              <Button 
                onClick={() => addFollowUpNote('equipment-issue')} 
                variant="outline" 
                className="w-full justify-start"
              >
                <Building2 className="h-4 w-4 mr-2" />
                Equipment Issue
              </Button>
              <Button 
                onClick={() => addFollowUpNote('sla-breach')} 
                variant="outline" 
                className="w-full justify-start"
              >
                <Clock className="h-4 w-4 mr-2" />
                SLA Breach
              </Button>
            </div>
            <Button 
              onClick={() => setShowFollowUpOptions(false)} 
              variant="ghost" 
              className="w-full mt-4"
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* Create Job Modal */}
      {showCreateJobModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Create New Job</h3>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium mb-1 block">Customer</label>
                <Select onValueChange={(value) => setNewJobData(prev => ({ ...prev, customer: value }))} value={newJobData.customer}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a customer" />
                  </SelectTrigger>
                  <SelectContent>
                    {customers.map(customer => (
                      <SelectItem key={customer.id} value={customer.name}>{customer.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Site</label>
                <Input
                  type="text"
                  value={newJobData.site}
                  onChange={(e) => setNewJobData(prev => ({ ...prev, site: e.target.value }))}
                  placeholder="Enter site name"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Description</label>
                <Input
                  type="text"
                  value={newJobData.description}
                  onChange={(e) => setNewJobData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Enter job description"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Engineer</label>
                <Input
                  type="text"
                  value={newJobData.engineer}
                  onChange={(e) => setNewJobData(prev => ({ ...prev, engineer: e.target.value }))}
                  placeholder="Enter engineer name"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Priority</label>
                <Select onValueChange={(value) => setNewJobData(prev => ({ ...prev, priority: value as Job['priority'] }))} value={newJobData.priority}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Low">Low</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="High">High</SelectItem>
                    <SelectItem value="Critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Category</label>
                <Select onValueChange={(value) => setNewJobData(prev => ({ ...prev, category: value as Job['category'] }))} value={newJobData.category}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="General">General</SelectItem>
                    <SelectItem value="HVAC">HVAC</SelectItem>
                    <SelectItem value="Electrical">Electrical</SelectItem>
                    <SelectItem value="Plumbing">Plumbing</SelectItem>
                    <SelectItem value="Security">Security</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Job Type</label>
                <Select onValueChange={(value) => setNewJobData(prev => ({ ...prev, jobType: value as Job['jobType'] }))} value={newJobData.jobType}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select job type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Maintenance">Maintenance</SelectItem>
                    <SelectItem value="Installation">Installation</SelectItem>
                    <SelectItem value="Repair">Repair</SelectItem>
                    <SelectItem value="Inspection">Inspection</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <Button variant="outline" onClick={() => setShowCreateJobModal(false)}>Cancel</Button>
              <Button onClick={handleCreateJob}>Create Job</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
