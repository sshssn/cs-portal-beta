import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AppTabs } from '@/components/ui/app-tabs';
import { useJobs } from '@/context/JobContext'; // Use Global Context
import { SearchInput } from '@/components/ui/search-input'; // Use Reusable Component
import {
  Users,
  AlertTriangle,
  Clock,
  Bell,
  ChevronDown,
  ChevronRight,
  Phone,
  Building2,
  MapPin,
  ExternalLink
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

// Mock call log data matching the screenshot
// Mock call log data removed - derived from jobs inside component

export default function MasterDashboard({
  onJobCreate,
  onJobClick,
  onAlertsClick
}: any) {
  const { jobs } = useJobs(); // Use global jobs
  const [searchTerm, setSearchTerm] = useState('');
  const [activeJobTab, setActiveJobTab] = useState<'my' | 'team'>('my');
  const [activeActivityTab, setActiveActivityTab] = useState<'reminders' | 'calls'>('reminders');
  const [callLogTimeFilter, setCallLogTimeFilter] = useState<'yesterday' | 'thisWeek' | 'all'>('yesterday');

  // Derive call logs from actual jobs to ensure valid linking
  const recentCallLogs = {
    yesterday: jobs.slice(0, 3).map((job, index) => ({
      id: job.id, // Use actual job ID
      company: job.tenant || 'Guardian Environmental Services Limited',
      timestamp: `Yesterday ${10 + index}:00`,
      callerName: ['Jade', 'Andreas', 'Vivienna'][index % 3],
      phone: job.contact?.number || '01234 567890',
      client: job.customer,
      site: job.site,
      jobNumber: job.jobNumber,
      status: job.status === 'completed' ? 'Completed' : 'Reqs. Invoice'
    })),
    thisWeek: jobs.slice(3, 6).map((job, index) => ({
      id: job.id, // Use actual job ID
      company: job.tenant || 'Guardian Environmental Services Limited',
      timestamp: `Sun ${12 + index}:30`,
      callerName: ['Chola', 'Lauren', 'Security'][index % 3],
      phone: job.contact?.number || '09876 543210',
      client: job.customer,
      site: job.site,
      jobNumber: job.jobNumber,
      status: 'Reqs. Invoice'
    }))
  };

  const currentCallLogs = callLogTimeFilter === 'yesterday' ? recentCallLogs.yesterday : recentCallLogs.thisWeek;

  // Collapsible states for SLA sections
  const [attendedSLAOpen, setAttendedSLAOpen] = useState(true);
  const [completionSLAOpen, setCompletionSLAOpen] = useState(true);
  const [approachingSLAOpen, setApproachingSLAOpen] = useState(true);

  // Calculate statistics from jobs
  // Calculate statistics from jobs
  const stats = {
    unassigned: jobs.filter(job => !job.engineer || job.engineer === 'Unassigned').length,
    attendanceBreached: jobs.filter(job => job.alerts?.some(a => a.type === 'OVERDUE')).length,
    completionBreached: jobs.filter(job => job.status === 'completed' && job.alerts?.some(a => a.type === 'OVERDUE')).length,
    approaching: jobs.filter(job => job.alerts?.some(a => a.type === 'WARNING' || a.type === 'AMBER')).length
  };

  // SLA breach data
  const slaData = {
    attendedBreaches: jobs.filter(job => job.alerts?.some(a => a.type === 'OVERDUE')),
    completionBreaches: jobs.filter(job => job.status === 'completed' && job.alerts?.some(a => a.type === 'OVERDUE')),
    approaching: jobs.filter(job => job.alerts?.some(a => a.type === 'WARNING'))
  };

  // Job statistics for pie chart
  const jobStatusData = [
    { name: 'New Job', value: jobs.filter(j => j.status === 'new').length, color: '#3B82F6' },
    { name: 'Allocated', value: jobs.filter(j => j.status === 'allocated').length, color: '#8B5CF6' },
    { name: 'Attended', value: jobs.filter(j => j.status === 'attended').length, color: '#22C55E' },
    { name: 'Awaiting Parts', value: jobs.filter(j => j.status === 'awaiting_parts').length, color: '#F59E0B' },
    { name: 'Parts To Fit', value: jobs.filter(j => j.status === 'parts_to_fit').length, color: '#EF4444' },
    { name: 'Completed', value: jobs.filter(j => j.status === 'completed' || j.status === 'reqs_invoice').length, color: '#6366F1' }
  ];

  const totalJobs = jobStatusData.reduce((sum, item) => sum + item.value, 0);

  // Call Log Entry Component
  const CallLogEntry = ({ log }: { log: typeof recentCallLogs.yesterday[0] }) => (
    <div className="border border-gray-200 rounded-lg p-4 bg-white">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          {/* Company and Timestamp */}
          <div className="flex items-center gap-3 mb-3">
            <Badge variant="outline" className="text-xs font-normal border-gray-300 text-gray-700">
              {log.company}
            </Badge>
            <span className="text-sm text-gray-500">{log.timestamp}</span>
          </div>

          {/* Caller Info */}
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
              <Users className="h-4 w-4 text-gray-400" />
            </div>
            <div>
              <span className="font-medium text-gray-900">{log.callerName}</span>
              <span className="text-blue-600 ml-2">{log.phone}</span>
            </div>
          </div>

          {/* Details Row */}
          <div className="flex items-center gap-4 text-sm text-gray-600 flex-wrap">
            <div className="flex items-center gap-1">
              <Building2 className="h-4 w-4 text-gray-400" />
              <span>{log.client}</span>
            </div>
            <div className="flex items-center gap-1">
              <MapPin className="h-4 w-4 text-gray-400" />
              <span>{log.site}</span>
            </div>
            <div className="flex items-center gap-1">
              <Building2 className="h-4 w-4 text-amber-500" />
              <span className="text-amber-600">{log.jobNumber}</span>
            </div>
            <Badge
              variant="outline"
              className={`text-xs ${log.status === 'Completed'
                ? 'border-green-300 text-green-700 bg-green-50'
                : 'border-amber-300 text-amber-700 bg-amber-50'
                }`}
            >
              {log.status}
            </Badge>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-2 ml-4">
          <Button variant="outline" size="sm" className="text-sm">
            <Phone className="h-4 w-4 mr-1" />
            Call
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="text-sm"
            onClick={() => {
              // Find job from calling args or just use onJobClick with a constructed object if only ID/Number available
              // Since we have log.jobNumber, we should try to find the job. 
              // For now, we'll pass the log object and handle it up stream or assuming onJobClick can handle it.
              // Better: find the job from 'jobs' context if possible, but here we are in a sub-component.
              // We will use the passed 'onJobClick' prop.
              onJobClick({ id: log.id, jobNumber: log.jobNumber } as any);
            }}
          >
            <ExternalLink className="h-4 w-4 mr-1" />
            View Job
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <SearchInput
        placeholder="Search jobs, numbers, tenants, sites..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        onClear={() => setSearchTerm('')}
        className="h-12 bg-gray-50 border-gray-200"
      />

      {/* Stats Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Unassigned */}
        <Card
          className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
          onClick={() => onAlertsClick ? onAlertsClick('unassigned') : null} // Map to parent handler
        >
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 font-medium">Unassigned</p>
                <p className="text-3xl font-bold text-blue-600">{stats.unassigned}</p>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Attendance Breached */}
        <Card
          className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
          onClick={() => onAlertsClick ? onAlertsClick('attendance_breached') : null}
        >
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 font-medium">Attendance Breached</p>
                <p className="text-3xl font-bold text-red-600">{stats.attendanceBreached}</p>
              </div>
              <div className="p-3 bg-red-50 rounded-lg">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Completion Breached */}
        <Card
          className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
          onClick={() => onAlertsClick ? onAlertsClick('completion_breached') : null}
        >
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 font-medium">Completion Breached</p>
                <p className="text-3xl font-bold text-gray-700">{stats.completionBreached}</p>
              </div>
              <div className="p-3 bg-gray-100 rounded-lg">
                <Clock className="h-6 w-6 text-gray-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Approaching */}
        <Card
          className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
          onClick={() => onAlertsClick ? onAlertsClick('approaching') : null}
        >
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 font-medium">Approaching</p>
                <p className="text-3xl font-bold text-gray-700">{stats.approaching}</p>
              </div>
              <div className="p-3 bg-gray-100 rounded-lg">
                <Clock className="h-6 w-6 text-gray-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column - Job Overview */}
        <Card className="border border-gray-200 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-semibold">Job Overview</CardTitle>
            {/* Tab Switcher - Pill Style */}
            <AppTabs
              tabs={[
                { label: 'My Priorities', value: 'my', icon: <Users className="h-4 w-4" /> },
                { label: 'Team Priorities', value: 'team', icon: <Building2 className="h-4 w-4" /> }
              ]}
              activeTab={activeJobTab}
              onChange={(val) => setActiveJobTab(val as 'my' | 'team')}
              className="mt-3 w-full sm:w-auto"
            />
          </CardHeader>
          <CardContent className="space-y-2 pt-4">
            {activeJobTab === 'my' ? (
              /* My Priorities - Empty State */
              /* My Priorities - New Card Layout */
              <div className="space-y-3">
                {/* Attended SLA Breaches */}
                <div className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-lg shadow-sm">
                  <div className="p-2 bg-red-50 rounded-full">
                    <AlertTriangle className="h-5 w-5 text-red-600" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900">Attended SLA Breaches (0)</h4>
                    <p className="text-xs text-gray-500">No attended SLA breaches</p>
                  </div>
                </div>

                {/* Completion SLA Breaches */}
                <div className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-lg shadow-sm">
                  <div className="p-2 bg-orange-50 rounded-full">
                    <AlertTriangle className="h-5 w-5 text-orange-600" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900">Completion SLA Breaches (0)</h4>
                    <p className="text-xs text-gray-500">No completion SLA breaches</p>
                  </div>
                </div>

                {/* Approaching SLAs */}
                <div className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-lg shadow-sm">
                  <div className="p-2 bg-blue-50 rounded-full">
                    <Clock className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900">Approaching SLAs (0)</h4>
                    <p className="text-xs text-gray-500">No approaching SLAs</p>
                  </div>
                </div>
              </div>
            ) : (
              /* Team Priorities - SLA Sections */
              <>
                {/* Attended SLA Breaches */}
                <Collapsible open={attendedSLAOpen} onOpenChange={setAttendedSLAOpen}>
                  <CollapsibleTrigger className="flex items-center gap-2 w-full p-2 hover:bg-gray-50 rounded-lg transition-colors">
                    {attendedSLAOpen ? (
                      <ChevronDown className="h-4 w-4 text-gray-500" />
                    ) : (
                      <ChevronRight className="h-4 w-4 text-gray-500" />
                    )}
                    <AlertTriangle className="h-4 w-4 text-orange-500" />
                    <span className="text-sm font-medium">Attended SLA Breaches ({slaData.attendedBreaches.length})</span>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="pl-10 py-2">
                    {slaData.attendedBreaches.length === 0 ? (
                      <p className="text-sm text-gray-400 italic">No attended SLA breaches</p>
                    ) : (
                      <div className="space-y-2 max-h-[300px] overflow-y-auto">
                        {slaData.attendedBreaches.map(job => (
                          <div
                            key={job.id}
                            onClick={() => onJobClick(job)}
                            className="text-sm p-2 bg-gray-50 rounded cursor-pointer hover:bg-gray-100 flex justify-between"
                          >
                            <span>{job.jobNumber}</span>
                            <span className="text-gray-500">{job.customer}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </CollapsibleContent>
                </Collapsible>

                {/* Completion SLA Breaches */}
                <Collapsible open={completionSLAOpen} onOpenChange={setCompletionSLAOpen}>
                  <CollapsibleTrigger className="flex items-center gap-2 w-full p-2 hover:bg-gray-50 rounded-lg transition-colors">
                    {completionSLAOpen ? (
                      <ChevronDown className="h-4 w-4 text-gray-500" />
                    ) : (
                      <ChevronRight className="h-4 w-4 text-gray-500" />
                    )}
                    <Clock className="h-4 w-4 text-red-500" />
                    <span className="text-sm font-medium">Completion SLA Breaches ({slaData.completionBreaches.length})</span>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="pl-10 py-2">
                    {slaData.completionBreaches.length === 0 ? (
                      <p className="text-sm text-gray-400 italic">No completion SLA breaches</p>
                    ) : (
                      <div className="space-y-2 max-h-[300px] overflow-y-auto">
                        {slaData.completionBreaches.map(job => (
                          <div
                            key={job.id}
                            onClick={() => onJobClick(job)}
                            className="text-sm p-2 bg-gray-50 rounded cursor-pointer hover:bg-gray-100 flex justify-between"
                          >
                            <span>{job.jobNumber}</span>
                            <span className="text-gray-500">{job.customer}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </CollapsibleContent>
                </Collapsible>

                {/* Approaching SLAs */}
                <Collapsible open={approachingSLAOpen} onOpenChange={setApproachingSLAOpen}>
                  <CollapsibleTrigger className="flex items-center gap-2 w-full p-2 hover:bg-gray-50 rounded-lg transition-colors">
                    {approachingSLAOpen ? (
                      <ChevronDown className="h-4 w-4 text-gray-500" />
                    ) : (
                      <ChevronRight className="h-4 w-4 text-gray-500" />
                    )}
                    <Clock className="h-4 w-4 text-yellow-500" />
                    <span className="text-sm font-medium">Approaching SLAs ({slaData.approaching.length})</span>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="pl-10 py-2">
                    {slaData.approaching.length === 0 ? (
                      <p className="text-sm text-gray-400 italic">No approaching SLAs</p>
                    ) : (
                      <div className="space-y-2 max-h-[300px] overflow-y-auto">
                        {slaData.approaching.map(job => (
                          <div
                            key={job.id}
                            onClick={() => onJobClick(job)}
                            className="text-sm p-2 bg-gray-50 rounded cursor-pointer hover:bg-gray-100 flex justify-between"
                          >
                            <span>{job.jobNumber}</span>
                            <span className="text-gray-500">{job.customer}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </CollapsibleContent>
                </Collapsible>
              </>
            )}
          </CardContent>
        </Card>

        {/* Right Column - Activity & Statistics */}
        <div className="space-y-6">
          {/* Activity Panel */}
          <Card className="border border-gray-200 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-semibold">Activity</CardTitle>
              <div className="mt-3">
                <AppTabs
                  tabs={[
                    { label: 'My Reminders', value: 'reminders', icon: <Bell className="h-4 w-4" /> },
                    { label: 'Recent Call Logs', value: 'calls', icon: <Phone className="h-4 w-4" /> }
                  ]}
                  activeTab={activeActivityTab}
                  onChange={(val) => setActiveActivityTab(val as 'reminders' | 'calls')}
                  className="w-full sm:w-auto"
                />
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              {activeActivityTab === 'reminders' ? (
                <div className="flex flex-col items-center justify-center py-8 text-gray-400">
                  <Bell className="h-12 w-12 mb-3 text-gray-300" />
                  <p className="text-sm">No active reminders</p>
                </div>
              ) : (
                <div className="space-y-6 max-h-[500px] overflow-y-auto">
                  {/* YESTERDAY Section */}
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">YESTERDAY</span>
                      <div className="flex-1 h-px bg-gray-200"></div>
                    </div>
                    <div className="space-y-3">
                      {recentCallLogs.yesterday.map(log => (
                        <CallLogEntry key={log.id} log={log} />
                      ))}
                    </div>
                  </div>

                  {/* THIS WEEK Section */}
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">THIS WEEK</span>
                      <div className="flex-1 h-px bg-gray-200"></div>
                    </div>
                    <div className="space-y-3">
                      {currentCallLogs.map(log => (
                        <CallLogEntry key={log.id} log={log} />
                      ))}
                    </div>
                  </div>

                  {/* View All Call Logs Button */}
                  <div className="text-center pt-4 border-t border-gray-100">
                    <button className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700 text-sm font-medium">
                      View All Call Logs
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Job Statistics by Status */}
          <Card className="border border-gray-200 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-semibold">Job Statistics by Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center">
                {/* Donut Chart */}
                <div className="relative w-full h-44">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Tooltip
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const data = payload[0].payload;
                            return (
                              <div className="bg-white p-2 border border-gray-200 shadow-sm rounded text-xs">
                                <p className="font-semibold" style={{ color: data.color }}>{data.name}</p>
                                <p className="text-gray-600">{data.value} Jobs</p>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Pie
                        data={jobStatusData.filter(d => d.value > 0)}
                        cx="50%"
                        cy="50%"
                        innerRadius={42}
                        outerRadius={70}
                        paddingAngle={2}
                        dataKey="value"
                        onClick={(data) => {
                          // Map display names to status codes if needed, or pass raw if aligned
                          // Status codes: 'new', 'allocated', 'attended', 'awaiting_parts', 'parts_to_fit', 'completed', 'reqs_invoice'
                          // Data names: 'New Job', 'Allocated', 'Attended', 'Awaiting Parts', 'Parts To Fit', 'Completed'
                          let code = data.name.toLowerCase().replace(/ /g, '_');
                          if (data.name === 'New Job') code = 'new'; // Special case
                          if (data.name === 'Completed') code = 'completed'; // Merged completed/reqs_invoice in data? value includes both but we can filter 'completed'

                          onAlertsClick('status', code);
                        }}
                        cursor="pointer"
                      >
                        {jobStatusData.filter(d => d.value > 0).map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  {/* Center Total */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-2xl font-bold text-gray-700">{totalJobs}</span>
                  </div>
                </div>

                {/* Legend */}
                <div className="grid grid-cols-3 gap-x-6 gap-y-2 mt-4 text-sm">
                  {jobStatusData.map((item) => (
                    <div
                      key={item.name}
                      className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
                      onClick={() => {
                        let code = item.name.toLowerCase().replace(/ /g, '_');
                        if (item.name === 'New Job') code = 'new';
                        if (item.name === 'Completed') code = 'completed';
                        onAlertsClick('status', code);
                      }}
                    >
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-gray-600">{item.name}</span>
                      <span className="text-gray-400">({item.value})</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}