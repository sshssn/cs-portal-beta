import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Bell, User, MapPin, AlertTriangle, CheckCircle } from 'lucide-react';
import EngineerActionAlerts from '@/components/EngineerActionAlerts';
import { Job } from '@/types/job';
import { loadJobsFromStorage, saveJobsToStorage } from '@/lib/jobUtils';

interface EngineerAlertsPageProps {
  onBack: () => void;
}

export default function EngineerAlertsPage({ onBack }: EngineerAlertsPageProps) {
  const [jobs, setJobs] = useState<Job[]>([]);

  useEffect(() => {
    // Load jobs from storage
    const loadedJobs = loadJobsFromStorage();
    setJobs(loadedJobs);
  }, []);

  const handleJobUpdate = (updatedJob: Job) => {
    const updatedJobs = jobs.map(job => 
      job.id === updatedJob.id ? updatedJob : job
    );
    setJobs(updatedJobs);
    saveJobsToStorage(updatedJobs);
  };

  // Calculate alert statistics
  const generateAlerts = () => {
    const alerts: any[] = [];
    
    jobs.forEach(job => {
      if (job.status === 'allocated' && !job.dateAccepted) {
        alerts.push({ type: 'ENGINEER_ACCEPT', job });
      }
      if (job.dateAccepted && !job.dateOnSite && job.status !== 'completed') {
        alerts.push({ type: 'ENGINEER_ONSITE', job });
      }
    });
    
    return alerts;
  };

  const alerts = generateAlerts();
  const activeAlerts = alerts.filter(alert => !alert.job.dateCompleted);
  const resolvedAlerts = alerts.filter(alert => alert.job.dateCompleted);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              onClick={onBack}
              variant="ghost"
              size="sm"
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Button>
            
            <div className="h-8 w-px bg-gray-300" />
            
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <Bell className="h-8 w-8 text-blue-600" />
                <h1 className="text-3xl font-bold text-gray-900">Engineer Action Alerts</h1>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <User className="h-5 w-5 text-blue-600" />
                <span>Engineer Accept</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-green-600" />
                <span>Engineer Onsite</span>
              </div>
            </div>
          </div>
        </div>
        
        <p className="text-muted-foreground mt-3 ml-20 text-lg">
          Monitor and manage engineer job acceptance and onsite status alerts
        </p>
      </div>

      {/* Stats Cards */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl border-2 border-blue-200 p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Total Alerts</p>
                <p className="text-3xl font-bold text-blue-900">{alerts.length}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <Bell className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border-2 border-orange-200 p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-600">Active Alerts</p>
                <p className="text-3xl font-bold text-orange-900">{activeAlerts.length}</p>
              </div>
              <div className="p-3 bg-orange-100 rounded-lg">
                <AlertTriangle className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border-2 border-green-200 p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">Resolved</p>
                <p className="text-3xl font-bold text-green-900">{resolvedAlerts.length}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border-2 border-purple-200 p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600">Engineers</p>
                <p className="text-3xl font-bold text-purple-900">{new Set(alerts.map(a => a.job.engineer)).size}</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <User className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <EngineerActionAlerts 
          jobs={jobs} 
          onJobUpdate={handleJobUpdate} 
        />
      </div>
    </div>
  );
}
