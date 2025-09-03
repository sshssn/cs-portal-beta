import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Job, Customer, JobAlert } from '@/types/job';
import { mockJobs, mockCustomers, mockEngineers } from '@/lib/jobUtils';
import MasterDashboard from '@/components/MasterDashboard';
import CustomerDashboard from '@/components/CustomerDashboard';
import CustomerAlertsPortal from '@/components/CustomerAlertsPortal';
import GlobalAlertsPortal from '@/components/GlobalAlertsPortal';
import AllCustomersPage from '@/components/AllCustomersPage';
import EndOfShiftReport from '@/components/EndOfShiftReport';
import CustomerDetailPage from '@/components/CustomerDetailPage';
import JobLogWizard from '@/components/JobLogWizard';
import JobEditModal from '@/components/JobEditModal';
import NavigationSidebar from '@/components/NavigationSidebar';
import { SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Users, Bell } from 'lucide-react';
import JobDetailPage from './JobDetailPage';

type View = 'master' | 'customer' | 'alerts' | 'wizard' | 'reports' | 'customer-detail' | 'customer-alerts';

export default function Index() {
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();
  const [jobs, setJobs] = useState<Job[]>(mockJobs);
  const [customers] = useState<Customer[]>(mockCustomers);
  const [currentView, setCurrentView] = useState<View>('master');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const handleJobCreate = (newJob: Omit<Job, 'id'>) => {
    const jobWithId: Job = {
      ...newJob,
      id: `job-${Date.now()}`
    };
    setJobs(prev => [jobWithId, ...prev]);
    setCurrentView('master');
  };

  const handleJobClick = (job: Job) => {
    navigate(`/job/${job.id}`);
  };

  const handleJobSave = (updatedJob: Job) => {
    setJobs(prev => prev.map(job => 
      job.id === updatedJob.id ? updatedJob : job
    ));
    setSelectedJob(null);
  };

  const handleCustomerSelect = (customer: Customer) => {
    setSelectedCustomer(customer);
    setCurrentView('customer-detail');
  };

  const handleViewChange = (view: View) => {
    setCurrentView(view);
  };

  const handleHomepageClick = () => {
    setCurrentView('master');
    setSelectedCustomer(null);
  };

  // If we're on a job detail page, show the JobDetailPage
  if (jobId) {
    return (
      <>
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
          />
        );
      
      case 'customer':
        return (
          <AllCustomersPage
            onBack={() => setCurrentView('master')}
            onCustomerSelect={handleCustomerSelect}
          />
        );
      
      case 'alerts':
        return (
          <GlobalAlertsPortal
            onBack={() => setCurrentView('master')}
            onJobUpdate={handleJobSave}
          />
        );
      
      case 'wizard':
        return (
          <JobLogWizard
            customers={customers}
            onJobCreate={(job) => {
              // Handle job creation logic here
              console.log('New job created:', job);
              setCurrentView('master');
            }}
            onCancel={() => setCurrentView('master')}
          />
        );
      
      case 'reports':
        return (
          <EndOfShiftReport
            onBack={() => setCurrentView('master')}
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
      
      default:
        return null;
    }
  };

  return (
    <>
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
              {currentView === 'customer-detail' && selectedCustomer && `${selectedCustomer.name} Details`}
              {currentView === 'customer-alerts' && selectedCustomer && `${selectedCustomer.name} Alerts`}
              {currentView === 'alerts' && 'Global Alerts Portal'}
              {currentView === 'wizard' && 'New Job Wizard'}
              {currentView === 'reports' && 'End of Shift Report'}
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
    </>
  );
}
