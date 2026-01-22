import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Job, Customer } from '@/types/job';
import {
  Calendar,
  Download,
  Mail,
  ChevronDown,
  Plus,
  Edit,
  Trash2
} from 'lucide-react';

interface EndOfShiftReportProps {
  onBack: () => void;
  jobs: Job[];
  customers: Customer[];
  onJobCreate: (job: Omit<Job, 'id'>) => void;
}

interface NightshiftNote {
  id: string;
  date: string;
  time: string;
  content: string;
  jobRef?: string;
  author?: string;
}

export default function EndOfShiftReport({ onBack, jobs, customers, onJobCreate }: EndOfShiftReportProps) {
  const [customerFilter, setCustomerFilter] = useState('all');
  const [siteFilter, setSiteFilter] = useState('all');
  const [dateRange, setDateRange] = useState('last-night');
  const [newNote, setNewNote] = useState('');

  // Generate notes from actual job data
  const generateNotesFromJobs = (): NightshiftNote[] => {
    const baseNotes: NightshiftNote[] = [];
    
    // Add notes based on actual jobs in the system
    jobs.forEach((job, index) => {
      if (job.jobNotes) {
        baseNotes.push({
          id: `job-note-${job.id}`,
          date: new Date(job.dateLogged).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
          time: new Date(job.dateLogged).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
          content: job.jobNotes,
          jobRef: job.jobNumber,
          author: 'System'
        });
      }
      
      // Add status-based notes for critical jobs
      if (job.priority === 'Critical' || job.priority === 'High') {
        baseNotes.push({
          id: `priority-note-${job.id}`,
          date: new Date(job.dateLogged).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
          time: new Date(job.dateLogged).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
          content: `${job.priority} priority job logged: ${job.description}. Location: ${job.customer} - ${job.site}. Service Provider: ${job.engineer || 'Pending allocation'}.`,
          jobRef: job.jobNumber,
          author: 'Night Shift'
        });
      }
    });

    // Add some default contextual notes if no job notes exist
    if (baseNotes.length === 0) {
      return [
        {
          id: '1',
          date: 'Jan 22, 2026',
          time: '02:04',
          content: `Night shift commenced. Total jobs in system: ${jobs.length}. Monitoring all active tickets and jobs.`,
          author: 'Night Shift Operator'
        },
        {
          id: '2', 
          date: 'Jan 22, 2026',
          time: '03:30',
          content: 'All systems operational. No critical escalations during shift.',
          author: 'Night Shift Operator'
        }
      ];
    }

    return baseNotes.slice(0, 10); // Limit to 10 most recent notes
  };

  const [notes, setNotes] = useState<NightshiftNote[]>(generateNotesFromJobs());

  // Calculate statistics
  const stats = useMemo(() => {
    const filteredJobs = jobs.filter(j => {
      if (customerFilter !== 'all' && j.customer !== customerFilter) return false;
      return true;
    });

    return {
      totalJobs: filteredJobs.length,
      completed: filteredJobs.filter(j => j.status === 'completed' || j.status === 'reqs_invoice').length,
      open: filteredJobs.filter(j => j.status === 'new' || j.status === 'allocated' || j.status === 'attended').length,
      attendanceBreached: filteredJobs.filter(j => j.priority === 'Critical').length,
      completionBreached: filteredJobs.filter(j => j.status === 'awaiting_parts').length,
      approaching: filteredJobs.filter(j => j.priority === 'High').length
    };
  }, [jobs, customerFilter]);

  // Get filtered jobs for display
  const displayJobs = useMemo(() => {
    return jobs.filter(j => {
      if (customerFilter !== 'all' && j.customer !== customerFilter) return false;
      if (siteFilter !== 'all' && j.site !== siteFilter) return false;
      return true;
    });
  }, [jobs, customerFilter, siteFilter]);

  // Get unique values
  const customerOptions = useMemo(() => [...new Set(jobs.map(j => j.customer).filter(Boolean))], [jobs]);
  const siteOptions = useMemo(() => [...new Set(jobs.map(j => j.site).filter(Boolean))], [jobs]);

  // Get SLA status badge
  const getSlaStatusBadge = (job: Job) => {
    if (job.priority === 'Critical') {
      return <Badge className="bg-red-100 text-red-700 text-xs">Attendance Breached</Badge>;
    } else if (job.status === 'awaiting_parts') {
      return <Badge className="bg-orange-100 text-orange-700 text-xs">Completion Breached</Badge>;
    } else if (job.status === 'completed' || job.status === 'reqs_invoice') {
      return <Badge className="bg-green-100 text-green-700 text-xs">Completed</Badge>;
    }
    return <Badge className="bg-gray-100 text-gray-700 text-xs">No SLA</Badge>;
  };

  // Get job status badge
  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      'new': 'bg-blue-100 text-blue-700',
      'allocated': 'bg-purple-100 text-purple-700',
      'attended': 'bg-green-100 text-green-700',
      'awaiting_parts': 'bg-orange-100 text-orange-700',
      'completed': 'bg-green-100 text-green-700',
      'reqs_invoice': 'bg-amber-100 text-amber-700',
      'costed': 'bg-gray-100 text-gray-700'
    };

    const labels: Record<string, string> = {
      'new': 'New',
      'allocated': 'Allocated',
      'attended': 'Attended',
      'awaiting_parts': 'Awaiting Parts',
      'completed': 'Completed',
      'reqs_invoice': 'Reqs. Invoice',
      'costed': 'Costed'
    };

    return (
      <Badge className={`text-xs ${styles[status] || 'bg-gray-100 text-gray-700'}`}>
        {labels[status] || status}
      </Badge>
    );
  };

  // Add new note
  const handleAddNote = () => {
    if (!newNote.trim()) return;

    const note: NightshiftNote = {
      id: Date.now().toString(),
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      time: new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
      content: newNote
    };

    setNotes([note, ...notes]);
    setNewNote('');
  };

  return (
    <div className="space-y-4">
      {/* Header Filters */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">Location:</span>
            <Select value={customerFilter} onValueChange={setCustomerFilter}>
              <SelectTrigger className="w-32 h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Locations</SelectItem>
                {customerOptions.map(c => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">Customer:</span>
            <Select value={customerFilter} onValueChange={setCustomerFilter}>
              <SelectTrigger className="w-32 h-8">
                <SelectValue placeholder="All Cust..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Customers</SelectItem>
                {customerOptions.map(c => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">Site:</span>
            <Select value={siteFilter} onValueChange={setSiteFilter}>
              <SelectTrigger className="w-28 h-8">
                <SelectValue placeholder="All Sites" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sites</SelectItem>
                {siteOptions.map(s => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-8">
                <Calendar className="h-4 w-4 mr-2" />
                Last night shift
                <ChevronDown className="h-4 w-4 ml-2" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setDateRange('last-night')}>Last night shift</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setDateRange('last-3')}>Last 3 days</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setDateRange('last-7')}>Last 7 days</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setDateRange('custom')}>Custom range</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="default" size="sm" className="h-8 bg-green-600 hover:bg-green-700">
                <Download className="h-4 w-4 mr-2" />
                Export
                <ChevronDown className="h-4 w-4 ml-2" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>Export as PDF</DropdownMenuItem>
              <DropdownMenuItem>Export as Excel</DropdownMenuItem>
              <DropdownMenuItem>Export as CSV</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button variant="default" size="sm" className="h-8 bg-blue-600 hover:bg-blue-700">
            <Mail className="h-4 w-4 mr-2" />
            Send Email
          </Button>
        </div>
      </div>

      {/* Company Info */}
      <div className="border-b border-gray-200 pb-4">
        <h2 className="text-xl font-bold text-blue-600">End of Shift Report</h2>
        <p className="text-sm text-gray-500">Shift time: Dec 21, 22:00 - Jan 21, 13:30</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-6 gap-4">
        {/* Left Stats Group */}
        <Card className="border-l-4 border-l-gray-400">
          <CardContent className="p-4">
            <p className="text-xs text-gray-500 uppercase">TOTAL JOBS</p>
            <p className="text-3xl font-bold text-gray-900">{stats.totalJobs}</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardContent className="p-4">
            <p className="text-xs text-green-600 uppercase">COMPLETED</p>
            <p className="text-3xl font-bold text-green-600">{stats.completed}</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500">
          <CardContent className="p-4">
            <p className="text-xs text-orange-600 uppercase">OPEN</p>
            <p className="text-3xl font-bold text-orange-600">{stats.open}</p>
          </CardContent>
        </Card>

        {/* Right Stats Group - SLA */}
        <Card className="border-l-4 border-l-red-500">
          <CardContent className="p-4">
            <p className="text-xs text-red-600 uppercase">ATTENDANCE BREACHED</p>
            <p className="text-3xl font-bold text-red-600">{stats.attendanceBreached}</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-red-500">
          <CardContent className="p-4">
            <p className="text-xs text-red-600 uppercase">COMPLETION BREACHED</p>
            <p className="text-3xl font-bold text-red-600">{stats.completionBreached}</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-yellow-500">
          <CardContent className="p-4">
            <p className="text-xs text-yellow-600 uppercase">APPROACHING</p>
            <p className="text-3xl font-bold text-yellow-600">{stats.approaching}</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content - Table and Notes */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Jobs Table - 3 columns */}
        <div className="lg:col-span-3">
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead className="text-xs font-semibold text-gray-600">Job Number</TableHead>
                  <TableHead className="text-xs font-semibold text-gray-600">Description</TableHead>
                  <TableHead className="text-xs font-semibold text-gray-600">Job Status</TableHead>
                  <TableHead className="text-xs font-semibold text-gray-600">SLA Status</TableHead>
                  <TableHead className="text-xs font-semibold text-gray-600">Service Provider</TableHead>
                  <TableHead className="text-xs font-semibold text-gray-600">Location</TableHead>
                  <TableHead className="text-xs font-semibold text-gray-600">Logged Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {displayJobs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                      No jobs found for the selected filters
                    </TableCell>
                  </TableRow>
                ) : (
                  displayJobs.map((job) => (
                    <TableRow key={job.id} className="hover:bg-gray-50">
                      <TableCell className="font-medium text-amber-600">{job.jobNumber}</TableCell>
                      <TableCell className="text-gray-600 text-sm max-w-[150px] truncate">{job.description}</TableCell>
                      <TableCell>{getStatusBadge(job.status)}</TableCell>
                      <TableCell>{getSlaStatusBadge(job)}</TableCell>
                      <TableCell className="text-gray-700 text-sm">{job.engineer || 'Unassigned'}</TableCell>
                      <TableCell className="text-gray-600 text-sm">{job.customer}</TableCell>
                      <TableCell className="text-gray-500 text-sm">
                        {new Date(job.dateLogged).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Nightshift Notes - 1 column */}
        <div className="lg:col-span-1">
          <Card className="bg-amber-50 border-amber-200">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-semibold text-gray-900">Nightshift Notes</CardTitle>
                <Button
                  size="sm"
                  className="h-7 bg-blue-600 hover:bg-blue-700"
                  onClick={handleAddNote}
                >
                  Add Note
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 max-h-[500px] overflow-y-auto">
              {notes.length === 0 ? (
                <p className="text-sm text-gray-500 italic">
                  No nightshift notes yet. Click "Add Note" to create one.
                </p>
              ) : (
                notes.map((note) => (
                  <div key={note.id} className="bg-white p-3 rounded-lg border border-amber-200 text-sm">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-gray-500">{note.date}, {note.time}</span>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" className="h-6 w-6">
                          <Edit className="h-3 w-3 text-gray-400" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-6 w-6">
                          <Trash2 className="h-3 w-3 text-gray-400" />
                        </Button>
                      </div>
                    </div>
                    <p className="text-gray-700 text-xs leading-relaxed">{note.content}</p>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
