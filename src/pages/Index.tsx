import { useState, useEffect, Suspense } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Job, Customer, JobAlert } from '@/types/job';
import {
  mockJobs,
  mockCustomers,
  mockEngineers,
  loadJobsFromStorage,
  saveJobsToStorage,
  loadCustomersFromStorage,
  saveCustomersToStorage,
  loadEngineersFromStorage,
  saveEngineersToStorage
} from '@/lib/jobUtils';
import { showNotification } from '@/components/ui/toast-notification';
import { useJobs } from '@/context/JobContext';

// Debug mock jobs
console.log('Index.tsx - mockJobs imported:', mockJobs);
import MasterDashboard from '@/components/MasterDashboard';
import JobLogWizard from '@/components/JobLogWizard';
import JobDetailPage from '@/pages/JobDetailPage';
import JobEditModal from '@/components/JobEditModal';
import EndOfShiftReport from '@/components/EndOfShiftReport';
import NavigationSidebar from '@/components/NavigationSidebar';
import { SidebarInset, SidebarTrigger, SidebarProvider } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Bell, User } from 'lucide-react';
import NotificationManager from '@/components/NotificationManager';
import ErrorBoundary from '@/components/ErrorBoundary';
import ProfilePage from '@/pages/ProfilePage';
import SettingsPage from '@/pages/SettingsPage';
import AllJobsPage from '@/pages/AllJobsPage';
import CallHandlingPage from '@/pages/CallHandlingPage';
import HistoryPage from '@/pages/HistoryPage';
import MyRemindersPage from '@/pages/MyRemindersPage';
import TicketManagerPage from '@/pages/TicketManagerPage';
import NewServiceTicketPage from '@/pages/NewServiceTicketPage';
import TicketDetailPage from '@/pages/TicketDetailPage';
import ServiceProvidersPage from '@/pages/ServiceProvidersPage';
import CreateJobFromTicketPage from '@/pages/CreateJobFromTicketPage';
import NotificationPopover from '@/components/NotificationPopover';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

// Updated view types matching Joblogic Helpdesk
type View = 'dashboard' | 'create-job' | 'all-jobs' | 'reports' | 'call-handling' | 'history' | 'reminders' | 'profile' | 'settings' | 'job-detail' | 'tickets' | 'tickets-new' | 'ticket-detail' | 'service-providers' | 'create-job-from-ticket';

// Clear any stale view from localStorage on module load
if (typeof window !== 'undefined') {
  localStorage.removeItem('currentView');
}

export default function Index() {
  const params = useParams<{ jobId: string; ticketId: string }>();
  const location = useLocation();
  
  // Extract ticketId from either useParams or URL path (for /ticket/ routes)
  const jobId = params.jobId;
  const ticketId = params.ticketId || (
    location.pathname.startsWith('/ticket/') 
      ? location.pathname.split('/ticket/')[1]?.split('/')[0]
      : undefined
  );
  
  console.log('Index.tsx - jobId:', jobId, 'ticketId:', ticketId, 'path:', location.pathname);
  const navigate = useNavigate();

  const { jobs, addJob, updateJob } = useJobs();

  const [customers, setCustomers] = useState<Customer[]>(mockCustomers);
  const [currentView, setCurrentView] = useState<View>(() => {
    // Determine view based on URL path
    const path = window.location.pathname;
    if (path.includes('/create-job')) return 'create-job-from-ticket';
    if (path.startsWith('/tickets/') || path.startsWith('/ticket/')) {
      if (path.includes('/new')) return 'tickets-new';
      return 'ticket-detail';
    }
    if (path === '/tickets') return 'tickets';
    if (path === '/service-providers') return 'service-providers';
    if (path.startsWith('/job/')) return 'job-detail';
    
    // Always default to dashboard on root path
    return 'dashboard';
  });
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Update view based on location changes
  useEffect(() => {
    const path = location.pathname;
    if (path.includes('/create-job')) {
      setCurrentView('create-job-from-ticket');
    } else if (path.startsWith('/tickets/') || path.startsWith('/ticket/')) {
      if (path.includes('/new')) {
        setCurrentView('tickets-new');
      } else {
        setCurrentView('ticket-detail');
      }
    } else if (path === '/tickets') {
      setCurrentView('tickets');
    } else if (path === '/service-providers') {
      setCurrentView('service-providers');
    } else if (path.startsWith('/job/')) {
      setCurrentView('job-detail');
    }
  }, [location]);

  // View changes are now handled by URL routing, no localStorage persistence

  const handleJobCreate = (newJob: Omit<Job, 'id'>) => {
    const jobWithId: Job = {
      ...newJob,
      id: `job-${Date.now()}`
    };
    addJob(jobWithId);
    setCurrentView('dashboard');

    // Show success notification
    showNotification({
      type: 'success',
      title: 'Job Created Successfully',
      message: `Job ${jobWithId.jobNumber} has been created and assigned to ${jobWithId.engineer}`
    });
  };

  const handleJobClick = (job: Job) => {
    navigate(`/job/${job.id}`);
  };

  const handleJobSave = (updatedJob: Job) => {
    updateJob(updatedJob);
    setSelectedJob(null);

    // Show success notification
    showNotification({
      type: 'success',
      title: 'Job Updated Successfully',
      message: `Job ${updatedJob.jobNumber} has been updated with new information`
    });
  };

  const [jobsFilter, setJobsFilter] = useState<any>(null); // State for filters passed from dashboard

  const handleViewChange = (view: View, filter: any = null) => {
    if (filter) {
      setJobsFilter(filter);
    } else {
      setJobsFilter(null);
    }
    setCurrentView(view);
    // If we're on a job detail page and trying to navigate away, clear the URL
    if (jobId && view !== 'job-detail') {
      navigate('/');
    }
  };

  const handleHomepageClick = () => {
    setCurrentView('dashboard');
  };

  // Get page title based on current view
  const getPageTitle = () => {
    switch (currentView) {
      case 'dashboard': return 'Dashboard';
      case 'create-job': return 'Create New Job';
      case 'all-jobs': return 'All Jobs';
      case 'reports': return 'Night shift Reports';
      case 'call-handling': return 'Call Handling';
      case 'history': return 'History';
      case 'reminders': return 'My Reminders';
      case 'profile': return 'Profile';
      case 'settings': return 'Settings';
      case 'job-detail': return 'Job Details';
      case 'tickets': return 'Ticket Manager';
      case 'tickets-new': return 'New Service Ticket';
      case 'ticket-detail': return 'Ticket Details';
      case 'create-job-from-ticket': return 'Create Job';
      case 'service-providers': return 'Service Providers';
      default: return 'Dashboard';
    }
  };

  // If we're on a job detail page, show the JobDetailPage
  if (jobId) {
    console.log('Index.tsx - Rendering job detail page, jobId:', jobId, 'jobs:', jobs);
    return (
      <>
        <NavigationSidebar
          currentView="job-detail"
          onViewChange={(view) => {
            // Always allow navigation, but clear URL if needed
            if (view !== 'job-detail') {
              navigate('/');
            }
            handleViewChange(view);
          }}
          onHomepageClick={() => {
            navigate('/');
            handleHomepageClick();
          }}
        />
        <SidebarInset>
          <div className="flex flex-1 flex-col gap-4 p-4 bg-white">
            <JobDetailPage />
          </div>
        </SidebarInset>
      </>
    );
  }

  // If we're on a ticket detail page (but not create-job), show the TicketDetailPage
  if (ticketId && !location.pathname.includes('/create-job')) {
    return (
      <>
        <NavigationSidebar
          currentView="ticket-detail"
          onViewChange={(view) => {
            if (view !== 'ticket-detail') {
              navigate('/');
            }
            handleViewChange(view);
          }}
          onHomepageClick={() => {
            navigate('/');
            handleHomepageClick();
          }}
        />
        <SidebarInset>
          <div className="flex flex-1 flex-col gap-4 p-4 bg-white">
            <TicketDetailPage />
          </div>
        </SidebarInset>
      </>
    );
  }

  const renderCurrentView = () => {
    switch (currentView) {
      case 'dashboard':
        return (
          <MasterDashboard
            jobs={jobs}
            customers={customers}
            onJobCreate={() => setCurrentView('create-job')}
            onJobClick={handleJobClick}
            onAlertsClick={(type: string, value?: any) => {
              let filter = {};
              if (type === 'unassigned') filter = { type: 'unassigned', value: true };
              else if (type === 'attendance_breached') filter = { type: 'sla', value: 'breached' };
              else if (type === 'completion_breached') filter = { type: 'sla', value: 'completion_breached' };
              else if (type === 'approaching') filter = { type: 'sla', value: 'approaching' };
              else if (type === 'status') filter = { type: 'status', value: value }; // New handler for chart clicks

              handleViewChange('all-jobs', filter);
            }}
            onEngineerAlertsClick={() => setCurrentView('reminders')}
          />
        );

      case 'create-job':
        return (
          <ErrorBoundary
            onReset={() => {
              // Clear localStorage to prevent corrupt data from causing repeated crashes
              localStorage.removeItem('jobLogWizardData');
            }}
          >
            <Suspense fallback={<div className="p-8 text-center">Loading wizard...</div>}>
              <JobLogWizard
                customers={customers}
                onJobCreate={handleJobCreate}
                onCancel={() => setCurrentView('dashboard')}
              />
            </Suspense>
          </ErrorBoundary>
        );

      case 'all-jobs':
        return (
          <AllJobsPage
            onJobClick={handleJobClick}
            initialFilter={jobsFilter}
          />
        );

      case 'reports':
        return (
          <EndOfShiftReport
            onBack={() => setCurrentView('dashboard')}
            jobs={jobs}
            customers={customers}
            onJobCreate={handleJobCreate}
          />
        );

      case 'call-handling':
        return (
          <CallHandlingPage
            customers={customers}
            onJobCreate={handleJobCreate}
          />
        );

      case 'history':
        return (
          <HistoryPage
            jobs={jobs}
          />
        );

      case 'reminders':
        return (
          <MyRemindersPage />
        );

      case 'tickets':
        return <TicketManagerPage />;

      case 'tickets-new':
        return <NewServiceTicketPage />;

      case 'ticket-detail':
        return <TicketDetailPage />;

      case 'create-job-from-ticket':
        return <CreateJobFromTicketPage />;

      case 'service-providers':
        return <ServiceProvidersPage />;

      case 'job-detail':
        return (
          <JobDetailPage />
        );

      case 'profile':
        return <ProfilePage />;

      case 'settings':
        return <SettingsPage />;

      default:
        return null;
    }
  };

  return (
    <SidebarProvider>
      <NavigationSidebar
        currentView={currentView}
        onViewChange={handleViewChange}
        onHomepageClick={handleHomepageClick}
      />
      <SidebarInset className="flex flex-col w-full">
        <header className="flex h-14 items-center justify-between gap-2 border-b border-gray-200 px-6 bg-white sticky top-0 z-30">
          <div className="flex items-center gap-2">
            <SidebarTrigger className="-ml-1" />
            <h1 className="text-lg font-semibold text-gray-900">
              {getPageTitle()}
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <NotificationPopover />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Avatar className="h-8 w-8 cursor-pointer">
                  <AvatarImage src="" />
                  <AvatarFallback className="bg-gray-900 text-white text-sm">S</AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={() => handleViewChange('profile')}>
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleViewChange('settings')}>
                  Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Log out</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>
        <div className="flex-1 p-6 bg-white">
          {renderCurrentView()}
        </div>
      </SidebarInset>

      <JobEditModal
        job={selectedJob}
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedJob(null);
        }}
        onSave={handleJobSave}
      />
      <NotificationManager />
    </SidebarProvider>
  );
}
