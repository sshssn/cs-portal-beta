import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import JobLogWizard from '@/components/JobLogWizard';
import { Customer, Job } from '@/types/job';
import { mockCustomers, loadJobsFromStorage, saveJobsToStorage } from '@/lib/jobUtils';

export default function WizardPage() {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState<Customer[]>([]);

  useEffect(() => {
    // Load customers data
    setCustomers(mockCustomers);
  }, []);

  const handleJobCreate = (job: Omit<Job, 'id'>) => {
    // Load existing jobs from localStorage
    const existingJobs = loadJobsFromStorage();
    
    // Create new job with ID
    const newJob: Job = {
      ...job,
      id: `job-${Date.now()}`
    };
    
    // Add new job to existing jobs
    const updatedJobs = [newJob, ...existingJobs];
    
    // Save updated jobs to localStorage
    saveJobsToStorage(updatedJobs);
    
    console.log('Job created and saved:', newJob);
    
    // Navigate back to the main dashboard or show success message
    navigate('/', { 
      state: { 
        message: `Job ${job.jobNumber} created successfully!`,
        jobCreated: true 
      } 
    });
  };

  const handleCancel = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <JobLogWizard
        customers={customers}
        onJobCreate={handleJobCreate}
        onCancel={handleCancel}
      />
    </div>
  );
}


