import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import JobLogWizard from '@/components/JobLogWizard';
import { Customer, Job } from '@/types/job';
import { mockCustomers } from '@/lib/jobUtils';

export default function WizardPage() {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState<Customer[]>([]);

  useEffect(() => {
    // Load customers data
    setCustomers(mockCustomers);
  }, []);

  const handleJobCreate = (job: Omit<Job, 'id'>) => {
    // Handle job creation - you can add your logic here
    console.log('Job created:', job);
    
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
