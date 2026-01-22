import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Edit,
  Phone,
  Bell,
  RefreshCw,
  Plus,
  Building2,
  Send,
  MoreVertical,
  ChevronRight,
  User,
  Wrench,
  Ticket
} from 'lucide-react';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { AppTabs } from '@/components/ui/app-tabs';
import { Input } from '@/components/ui/input';
import { useJobs } from '@/context/JobContext';
import { Job, JobNote } from '@/types/job';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import JobEditModal from '@/components/JobEditModal';
import StatusBadge from '@/components/StatusBadge';

const EditableField = ({ label, value, onSave, icon: Icon }: { label: string, value: any, onSave: (val: string) => void, icon?: any }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [currentValue, setCurrentValue] = useState(value);

  useEffect(() => { setCurrentValue(value); }, [value]);

  const handleSave = () => {
    onSave(currentValue);
    setIsEditing(false);
  };

  return (
    <div className="group">
      <div className="flex items-center gap-2 mb-1">
        <span className="text-gray-500 text-xs uppercase tracking-wide font-medium w-24 flex-shrink-0">{label}</span>
      </div>
      {isEditing ? (
        <div className="flex items-center gap-2">
          <Input
            value={currentValue}
            onChange={(e) => setCurrentValue(e.target.value)}
            className="h-8 text-sm"
            autoFocus
            onBlur={handleSave}
            onKeyDown={(e) => e.key === 'Enter' && handleSave()}
          />
        </div>
      ) : (
        <div
          onClick={() => setIsEditing(true)}
          className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 -ml-1 rounded transition-colors"
        >
          {Icon && <Icon className="h-4 w-4 text-gray-400 group-hover:text-blue-500" />}
          <span className="text-gray-900 font-medium text-sm border-b border-transparent group-hover:border-blue-200">{value || '-'}</span>
          <Edit className="h-3 w-3 text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      )}
    </div>
  );
};

export default function JobDetailPage() {
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();
  const { getJobById, updateJob } = useJobs();
  const [activeNoteTab, setActiveNoteTab] = useState<'job' | 'site'>('job');
  const [auditTab, setAuditTab] = useState<'audit' | 'site_jobs'>('audit');
  const [job, setJob] = useState<Job | undefined>();
  const [isLoading, setIsLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Notes state
  const [notes, setNotes] = useState<JobNote[]>([]);
  const [newNote, setNewNote] = useState('');
  const [isAddingNote, setIsAddingNote] = useState(false);

  useEffect(() => {
    if (jobId) {
      console.log('JobDetailPage - Loading job with ID:', jobId);
      const foundJob = getJobById(jobId);
      if (foundJob) {
        console.log('JobDetailPage - Job found:', foundJob);
        setJob(foundJob);
        // Load notes specific to this job (mock)
        setNotes([
          {
            id: '1',
            jobId: foundJob.id,
            timestamp: new Date(Date.now() - 3600000),
            author: 'System',
            authorRole: 'System',
            content: 'Job status updated to ' + foundJob.status,
            type: 'general',
            visibility: 'internal',
            tags: [],
            requiresAction: false,
            status: 'active'
          }
        ]);
      }
    }
    setIsLoading(false);
  }, [jobId, getJobById]);

  const handleAddNote = () => {
    if (!newNote.trim() || !job) return;
    const note: JobNote = {
      id: Date.now().toString(),
      jobId: job.id,
      timestamp: new Date(),
      author: 'CurrentUser', // Mock
      authorRole: 'Admin',
      content: newNote,
      type: activeNoteTab === 'job' ? 'general' : 'technical', // Mapped site notes to technical for now
      visibility: 'internal',
      tags: [],
      requiresAction: false,
      status: 'active'
    };
    setNotes([note, ...notes]);
    setNewNote('');
    setIsAddingNote(false);
  };

  const handleFieldUpdate = (field: string, value: any) => {
    if (!job) return;
    const updatedJob = { ...job, [field]: value };
    setJob(updatedJob);
    updateJob(updatedJob);
  };

  const handleEditSave = (updatedJob: Job) => {
    setJob(updatedJob);
    updateJob(updatedJob);
    setIsEditModalOpen(false);
  };

  if (isLoading) return <div className="p-6">Loading...</div>;
  if (!job) return <div className="p-6">Job not found</div>;

  // Derived Values
  const isSlaBreached = job.alerts?.some(a => a.type === 'OVERDUE');
  // Formatted dates/strings to match UI design (using mocks from previous step for consistency where data missing)
  const auditTrail = [
    {
      id: '1',
      title: 'Job Updated',
      date: new Date(Date.now() - 7200000).toLocaleString(),
      description: `Priority: ${job.priority}`,
      author: job.reporter?.name || 'System'
    },
    {
      id: '2',
      title: 'Status Change',
      date: new Date(Date.now() - 15000000).toLocaleString(),
      description: `Status changed to ${job.status}`,
      author: 'System'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      {/* Global Header Style */}
      <header className="flex h-16 shrink-0 items-center justify-between gap-2 border-b border-[#e4e4e7] px-4 bg-white">
        <div className="flex items-center gap-2">
          <SidebarTrigger className="-ml-1" />
          <h1 className="text-lg font-semibold text-[#09090b]">Job Detail</h1>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5 text-muted-foreground" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Avatar className="h-8 w-8 cursor-pointer">
                <AvatarImage src="" />
                <AvatarFallback className="bg-[#2563eb] text-white text-sm">JL</AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem>Profile</DropdownMenuItem>
              <DropdownMenuItem>Settings</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Log out</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* Breadcrumbs */}
      <div className="bg-white px-6 pt-4">
        <Breadcrumbs 
          items={[
            { label: 'All Jobs', onClick: () => {
              localStorage.setItem('currentView', 'all-jobs');
              navigate('/');
            }},
            { label: job.jobNumber }
          ]}
        />
      </div>

      {/* Job Header */}
      <div className="bg-white px-6 py-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                // Set the view to all-jobs and navigate to home
                localStorage.setItem('currentView', 'all-jobs');
                navigate('/');
              }}
              className="text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <span className="font-semibold text-gray-900">{job.jobNumber}</span>
            {job.ticketReference && (
              <Link 
                to={`/ticket/${job.ticketReference}`}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-200 transition-colors border border-blue-200"
              >
                <Ticket className="h-4 w-4" />
                Logged from {job.ticketReference}
              </Link>
            )}
            <span className="text-gray-400">|</span>
            <span className="text-gray-700 text-sm">{job.description}</span>
          </div>
          <div className="flex items-center gap-2">
            <button className="px-3 py-1.5 text-sm border border-gray-300 rounded hover:bg-gray-50 flex items-center gap-2">
              <Bell className="h-4 w-4" />
              Reminder
            </button>
            <button className="p-1.5 hover:bg-gray-100 rounded">
              <MoreVertical className="h-4 w-4 text-gray-600" />
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <StatusBadge status={job.status} />
          <span className="px-2 py-1 bg-white border border-gray-300 text-gray-700 rounded text-xs">
            {job.priority}
          </span>
          <button 
            className="px-3 py-1.5 text-sm border border-gray-300 rounded hover:bg-gray-50 flex items-center gap-1.5 text-gray-700"
            onClick={() => setIsEditModalOpen(true)}
          >
            <Edit className="h-3.5 w-3.5" />
            Edit
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6 bg-gray-50">
        {/* Left Column - 2/3 width */}
        <div className="lg:col-span-2 space-y-6">
          {/* Job Information Card */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
            <div className="p-6">
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-3">
                  <Building2 className="h-4 w-4 text-gray-500" />
                  <span className="text-gray-900 font-medium">{job.customer}</span>
                </div>
                <button 
                  className="px-3 py-1.5 text-sm border border-gray-300 rounded hover:bg-gray-50 flex items-center gap-1"
                  onClick={() => setIsEditModalOpen(true)}
                >
                  <Edit className="h-3 w-3" />
                  Edit
                </button>
              </div>

              <div className="grid grid-cols-2 gap-x-12 gap-y-6">
                <EditableField
                  label="Location"
                  value={job.customer}
                  onSave={(val) => handleFieldUpdate('customer', val)}
                />
                <EditableField
                  label="Site"
                  value={job.site}
                  onSave={(val) => handleFieldUpdate('site', val)}
                />
                <EditableField
                  label="Logged By"
                  value={job.reporter?.name || 'Unknown'}
                  onSave={(val) => handleFieldUpdate('reporter', { ...job.reporter, name: val })}
                />
                <div>
                  <span className="text-gray-500 text-xs uppercase tracking-wide font-medium w-32 flex-shrink-0 block mb-1">Date Logged</span>
                  <span className="text-gray-900 font-medium text-sm">{job.dateLogged ? new Date(job.dateLogged).toLocaleString() : 'N/A'}</span>
                </div>
                <EditableField
                  label="Job Type"
                  value={job.jobType}
                  onSave={(val) => handleFieldUpdate('jobType', val)}
                />
                <EditableField
                  label="Job Trade"
                  value={job.primaryJobTrade || job.category}
                  onSave={(val) => handleFieldUpdate('primaryJobTrade', val)}
                />
                <div>
                  <span className="text-gray-500 w-32 flex-shrink-0">Order Number:</span>
                  <span className="text-gray-900">{job.customerOrderNumber || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-gray-500 text-xs uppercase tracking-wide font-medium block mb-1">Ticket Reference</span>
                  {job.ticketReference ? (
                    <Link 
                      to={`/ticket/${job.ticketReference}`}
                      className="inline-flex items-center gap-1.5 text-blue-600 hover:text-blue-800 font-medium text-sm"
                    >
                      <Ticket className="h-4 w-4" />
                      {job.ticketReference}
                    </Link>
                  ) : (
                    <span className="text-gray-400 text-sm">No linked ticket</span>
                  )}
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="mt-6 pt-6 border-t border-gray-200 px-2">
              <p className="text-gray-500 text-sm mb-2">Description:</p>
              <div className="text-gray-900 text-sm leading-relaxed whitespace-pre-line">
                {job.description}
              </div>
            </div>

            {/* Reported By */}
            <div className="mt-6 pt-6 border-t border-gray-200 px-2">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-blue-600" />
                  <span className="text-gray-900 font-medium text-sm">Reported By</span>
                </div>
                <button className="px-3 py-1.5 text-sm border border-gray-300 rounded hover:bg-gray-50 flex items-center gap-2">
                  <Phone className="h-3 w-3" />
                  Call
                </button>
              </div>
              <div className="grid grid-cols-2 gap-y-3 gap-x-8 text-sm">
                <div className="flex gap-2">
                  <span className="text-gray-500 w-32 flex-shrink-0">Name:</span>
                  <span className="text-gray-900">{job.reporter?.name || job.contact?.name || 'N/A'}</span>
                </div>
                <div className="flex gap-2">
                  <span className="text-gray-500 w-32 flex-shrink-0">Phone Number:</span>
                  <span className="text-gray-900">{job.reporter?.number || job.contact?.number || 'N/A'}</span>
                </div>
              </div>
            </div>

            {/* Service Provider */}
            <div className="mt-6 pt-6 border-t border-gray-200 px-2">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Wrench className="h-4 w-4 text-orange-600" />
                  <span className="text-gray-900 font-medium text-sm">Service Provider</span>
                </div>
                <button className="px-3 py-1.5 text-sm border border-gray-300 rounded hover:bg-gray-50 flex items-center gap-2">
                  <Phone className="h-3 w-3" />
                  Call
                </button>
              </div>
              <div className="grid grid-cols-2 gap-y-3 gap-x-8 text-sm">
                <div className="flex gap-2">
                  <span className="text-gray-500 w-32 flex-shrink-0">Name:</span>
                  <span className="text-gray-900">{job.engineer || 'Unassigned'}</span>
                </div>
                <div className="flex gap-2">
                  <span className="text-gray-500 w-32 flex-shrink-0">Phone Number:</span>
                  <span className="text-gray-900">--</span>
                </div>
                <div className="flex gap-2 col-span-2">
                  <span className="text-gray-500 w-32 flex-shrink-0">Visit Status:</span>
                  <div>
                    <span className="text-gray-900 font-medium">{job.status}</span>
                    <p className="text-gray-400 text-xs mt-0.5">Updated recently</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Notes Section */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
            <div className="border-b border-gray-200 p-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-gray-900">Notes</h2>
              </div>
              <AppTabs
                tabs={[
                  { label: 'Job Note', value: 'job' },
                  { label: 'Site Note', value: 'site' }
                ]}
                activeTab={activeNoteTab}
                onChange={(val) => setActiveNoteTab(val as 'job' | 'site')}
                className="w-full justify-start bg-gray-100/50 p-1"
              />
            </div>
            {/* Filter and Actions */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <div className="flex items-center gap-2">
                <select className="text-sm border border-gray-300 rounded px-2 py-1">
                  <option>All ({notes.length})</option>
                </select>
              </div>
              <div className="flex items-center gap-2">
                <button className="px-3 py-1.5 text-sm border border-gray-300 rounded hover:bg-gray-50 flex items-center gap-2">
                  <RefreshCw className="h-3 w-3" />
                  Refresh
                </button>
                <button
                  onClick={() => setIsAddingNote(!isAddingNote)}
                  className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-2"
                >
                  <Plus className="h-3 w-3" />
                  {isAddingNote ? 'Cancel' : 'Add Note'}
                </button>
              </div>
            </div>

            {/* Add Note Input */}
            {isAddingNote && (
              <div className="p-4 bg-gray-50 border-b border-gray-200">
                <textarea
                  className="w-full p-2 border border-gray-300 rounded mb-2 text-sm"
                  placeholder="Enter note..."
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  rows={3}
                />
                <div className="flex justify-end">
                  <button
                    onClick={handleAddNote}
                    className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                  >
                    Save Note
                  </button>
                </div>
              </div>
            )}

            {/* Notes List */}
            <div className="max-h-[300px] overflow-y-auto">
              {notes.length === 0 ? (
                <div className="p-8 text-center text-gray-500 text-sm">
                  No notes yet
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {notes.map(note => (
                    <div key={note.id} className="p-4 hover:bg-gray-50">
                      <div className="flex justify-between items-start mb-1">
                        <span className="font-medium text-sm text-gray-900">{note.author}</span>
                        <span className="text-xs text-gray-500">{note.timestamp.toLocaleString()}</span>
                      </div>
                      <p className="text-sm text-gray-700 whitespace-pre-wrap">{note.content}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column - 1/3 width */}
        <div className="space-y-6">
          {/* SLA Information Card */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
            <div className="p-6">
              <h3 className="font-semibold text-gray-900 mb-6">SLA Information</h3>

              <div className="space-y-4 text-sm">
                <div className="flex gap-2">
                  <span className="text-gray-500 w-40 flex-shrink-0">Status:</span>
                  <span className={`${isSlaBreached ? 'text-red-600' : 'text-green-600'} font-medium flex items-center gap-1.5`}>
                    <span className={`w-2 h-2 rounded-full ${isSlaBreached ? 'bg-red-600' : 'bg-green-600'}`}></span>
                    {isSlaBreached ? 'Breached' : 'On Track'}
                  </span>
                </div>
                <div className="flex gap-2">
                  <span className="text-gray-500 w-40 flex-shrink-0">Target Attendance:</span>
                  <span className="text-gray-900">{job.targetAttendanceDate ? new Date(job.targetAttendanceDate).toLocaleString() : 'N/A'}</span>
                </div>
                <div className="flex gap-2">
                  <span className="text-gray-500 w-40 flex-shrink-0">Attended At:</span>
                  <div>
                    <div className="text-gray-900">{job.dateOnSite ? new Date(job.dateOnSite).toLocaleString() : 'Not yet attended'}</div>
                    {/* <div className="text-xs text-red-500 mt-0.5">Attended late by X</div> -- Calculate if needed */}
                  </div>
                </div>
                <div className="flex gap-2">
                  <span className="text-gray-500 w-40 flex-shrink-0">Target Completion:</span>
                  <span className="text-gray-900 italic">
                    {/* Calculate target completion based on logged date + targetCompletionTime (minutes) */}
                    {job.dateLogged && job.targetCompletionTime ?
                      new Date(new Date(job.dateLogged).getTime() + job.targetCompletionTime * 60000).toLocaleString()
                      : 'N/A'}
                  </span>
                </div>
                <div className="flex gap-2">
                  <span className="text-gray-500 w-40 flex-shrink-0">Completed At:</span>
                  <div>
                    <div className="text-gray-900">{job.dateCompleted ? new Date(job.dateCompleted).toLocaleString() : 'Not completed'}</div>
                    <div className="text-xs text-green-600 mt-0.5">{job.status === 'completed' ? 'Completed' : ''}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Audit Trail / History */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
            <div className="border-b border-gray-200 p-4">
              <AppTabs
                tabs={[
                  { label: 'Audit Trail', value: 'audit' },
                  { label: 'Recent Site Jobs', value: 'site_jobs' }
                ]}
                activeTab={auditTab}
                onChange={(val) => setAuditTab(val as 'audit' | 'site_jobs')}
                className="w-full justify-start bg-gray-100/50 p-1"
              />
            </div>{/* Refresh Button */}
            <div className="flex items-center justify-end p-3 border-b border-gray-100">
              <button className="text-xs text-gray-500 hover:text-gray-900 flex items-center gap-1">
                <RefreshCw className="h-3 w-3" />
                Refresh
              </button>
            </div>

            {/* Audit Trail Items */}
            <div className="divide-y divide-gray-100">
              {auditTrail.map((item) => (
                <div
                  key={item.id}
                  className="p-4 hover:bg-gray-50 transition-colors cursor-pointer border-l-4 border-transparent hover:border-blue-500 group"
                >
                  <div className="flex items-start justify-between mb-1">
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-900 group-hover:text-blue-700">
                          {item.title}
                        </span>
                        <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-blue-600" />
                      </div>
                      <span className="text-xs text-gray-500">{item.date}</span>
                    </div>
                  </div>
                  {item.description && (
                    <p className="text-xs text-gray-600 mt-1 mb-2">{item.description}</p>
                  )}
                  <div className="flex items-center justify-between">
                    {item.author && (
                      <span className="text-xs text-gray-500 flex items-center gap-1">
                        👤 {item.author}
                      </span>
                    )}
                    {item.title.includes('Updated') && (
                      <button className="text-xs text-blue-600 hover:underline flex items-center gap-1">
                        <Send className="h-3 w-3" />
                        Send Email
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Job Edit Modal */}
      <JobEditModal
        job={job}
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSave={handleEditSave}
      />
    </div>
  );
}