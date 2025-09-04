import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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

// Debug mock jobs
console.log('Index.tsx - mockJobs imported:', mockJobs);
import MasterDashboard from '@/components/MasterDashboard';
import CustomerDashboard from '@/components/CustomerDashboard';
import CustomerDetailPage from '@/components/CustomerDetailPage';
import CustomerAlertsPortal from '@/components/CustomerAlertsPortal';
import AllCustomersPage from '@/components/AllCustomersPage';
import JobLogWizard from '@/components/JobLogWizard';
import JobDetailPage from '@/pages/JobDetailPage';
import JobEditModal from '@/components/JobEditModal';
import GlobalAlertsPortal from '@/components/GlobalAlertsPortal';
import SitesPage from '@/components/SitesPage';
import NavigationSidebar from '@/components/NavigationSidebar';
import { SidebarInset, SidebarTrigger, SidebarProvider } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Users, Bell } from 'lucide-react';
import EndOfShiftReport from '@/components/EndOfShiftReport';
import NotificationManager from '@/components/NotificationManager';
import EngineerAlertsPage from '@/pages/EngineerAlertsPage';
import ProfilePage from '@/pages/ProfilePage';
import SettingsPage from '@/pages/SettingsPage';

type View = 'master' | 'customer' | 'customer-dashboard' | 'customer-detail' | 'customer-alerts' | 'alerts' | 'engineer-alerts' | 'wizard' | 'reports' | 'job-detail' | 'sites' | 'profile' | 'settings';

export default function Index() {
  const { jobId } = useParams<{ jobId: string }>();
  console.log('Index.tsx - useParams jobId:', jobId);
  const navigate = useNavigate();
  
  // Load jobs from localStorage on component mount
  const [jobs, setJobs] = useState<Job[]>([]);
  
  const [customers, setCustomers] = useState<Customer[]>(mockCustomers);
  const [currentView, setCurrentView] = useState<View>('master');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Load jobs on component mount
  useEffect(() => {
    // Force use mock jobs for now to ensure they work
    setJobs(mockJobs);
  }, []);

  // Save jobs to localStorage whenever jobs state changes
  useEffect(() => {
    saveJobsToStorage(jobs);
  }, [jobs]);

  const handleJobCreate = (newJob: Omit<Job, 'id'>) => {
    const jobWithId: Job = {
      ...newJob,
      id: `job-${Date.now()}`
    };
    setJobs(prev => [jobWithId, ...prev]);
    setCurrentView('master');
    
    // Show success notification
    showNotification({
      type: 'success',
      title: 'Job Created Successfully',
      message: `Job ${jobWithId.jobNumber} has been created and assigned to ${jobWithId.engineer}`
    });
  };

  const handleCustomerCreate = (newCustomer: Omit<Customer, 'id'>) => {
    const customerWithId: Customer = {
      ...newCustomer,
      id: Date.now()
    };
    setCustomers(prev => [customerWithId, ...prev]);
  };

  const handleJobClick = (job: Job) => {
    navigate(`/job/${job.id}`);
  };

  const handleJobSave = (updatedJob: Job) => {
    setJobs(prev => prev.map(job => 
      job.id === updatedJob.id ? updatedJob : job
    ));
    setSelectedJob(null);
    
    // Show success notification
    showNotification({
      type: 'success',
      title: 'Job Updated Successfully',
      message: `Job ${updatedJob.jobNumber} has been updated with new information`
    });
  };

  const handleCustomerSelect = (customer: Customer) => {
    setSelectedCustomer(customer);
    setCurrentView('customer-dashboard');
  };

  const handleViewChange = (view: View) => {
    setCurrentView(view);
    // If we're on a job detail page and trying to navigate away, clear the URL
    if (jobId && view !== 'job-detail') {
      navigate('/');
    }
  };

  const handleHomepageClick = () => {
    setCurrentView('master');
    setSelectedCustomer(null);
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
          selectedCustomer={selectedCustomer?.name}
        />
        <SidebarInset>
          <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
            <SidebarTrigger className="-ml-1" />
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-semibold">Job Details</h1>
            </div>
          </header>
          <div className="flex flex-1 flex-col gap-4 p-4">
            <JobDetailPage 
              jobs={jobs} 
              onJobUpdate={handleJobSave}
            />
          </div>
        </SidebarInset>
      </>
    );
  }

  const renderCurrentView = () => {
    switch (currentView) {
      case 'master':
        return (
          <MasterDashboard
            jobs={jobs}
            customers={customers}
            onJobCreate={() => setCurrentView('wizard')}
            onJobClick={handleJobClick}
            onAlertsClick={() => setCurrentView('alerts')}
            onEngineerAlertsClick={() => setCurrentView('engineer-alerts')}
          />
        );
      
      case 'customer':
        return (
          <AllCustomersPage
            onBack={() => setCurrentView('master')}
            onCustomerSelect={handleCustomerSelect}
            onCustomerCreate={handleCustomerCreate}
          />
        );
      
      case 'customer-dashboard':
        return selectedCustomer ? (
          <CustomerDashboard
            customer={selectedCustomer}
            jobs={jobs}
            onBack={() => setCurrentView('customer')}
            onJobClick={handleJobClick}
            onJobCreate={() => setCurrentView('wizard')}
          />
        ) : (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-900 mb-2">No customer selected</h3>
            <p className="text-muted-foreground">Please select a customer to view dashboard.</p>
          </div>
        );
      
      case 'alerts':
        return (
          <GlobalAlertsPortal
            onBack={() => setCurrentView('master')}
            onJobUpdate={handleJobSave}
            customers={customers}
            jobs={jobs}
          />
        );
      
      case 'engineer-alerts':
        return (
          <EngineerAlertsPage
            onBack={() => setCurrentView('master')}
            jobs={jobs}
            onJobUpdate={handleJobSave}
          />
        );
      
      case 'wizard':
        return (
          <JobLogWizard
            customers={customers}
            onJobCreate={handleJobCreate}
            onCancel={() => setCurrentView('master')}
          />
        );
      
      case 'reports':
        return (
          <EndOfShiftReport
            onBack={() => setCurrentView('master')}
            jobs={jobs}
            customers={customers}
            onJobCreate={handleJobCreate}
          />
        );
      
      case 'sites':
        return (
          <SitesPage
            onBack={() => setCurrentView('master')}
            onSiteSelect={(site, customer) => {
              const selectedCustomer = customers.find(c => c.name === customer);
              if (selectedCustomer) {
                setSelectedCustomer(selectedCustomer);
                setCurrentView('customer');
              }
            }}
            onJobClick={handleJobClick}
            onJobCreate={() => setCurrentView('wizard')}
            jobs={jobs}
            customers={customers}
          />
        );
      
      case 'job-detail':
        return (
          <JobDetailPage
            jobs={jobs}
            onJobUpdate={handleJobSave}
          />
        );
      
      case 'customer-detail':
        return selectedCustomer ? (
          <CustomerDetailPage
            customer={selectedCustomer}
            jobs={jobs}
            onBack={() => setCurrentView('customer')}
            onJobClick={handleJobClick}
            onAlertsClick={() => setCurrentView('customer-alerts')}
          />
        ) : (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-900 mb-2">No customer selected</h3>
            <p className="text-muted-foreground">Please select a customer to view details.</p>
          </div>
        );
      
      case 'customer-alerts':
        return selectedCustomer ? (
          <CustomerAlertsPortal
            customer={selectedCustomer}
            jobs={jobs}
            onBack={() => setCurrentView('customer-detail')}
            onJobUpdate={handleJobSave}
          />
        ) : (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-900 mb-2">No customer selected</h3>
            <p className="text-muted-foreground">Please select a customer to view alerts.</p>
          </div>
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
        selectedCustomer={selectedCustomer?.name}
      />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-semibold">
              {currentView === 'master' && 'Master Dashboard'}
              {currentView === 'customer' && 'All Customers'}
              {currentView === 'sites' && 'All Sites'}
              {currentView === 'customer-dashboard' && selectedCustomer && `${selectedCustomer.name} Dashboard`}
              {currentView === 'customer-detail' && selectedCustomer && `${selectedCustomer.name} Details`}
              {currentView === 'customer-alerts' && selectedCustomer && `${selectedCustomer.name} Alerts`}
              {currentView === 'alerts' && 'Global Alerts Portal'}
              {currentView === 'engineer-alerts' && 'Engineer Action Alerts'}
              {currentView === 'wizard' && 'New Job Wizard'}
              {currentView === 'reports' && 'End of Shift Report'}
              {currentView === 'profile' && 'Profile'}
              {currentView === 'settings' && 'Settings'}
            </h1>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4">
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
