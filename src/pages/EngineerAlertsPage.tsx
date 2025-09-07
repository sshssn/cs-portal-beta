import { Button } from '@/components/ui/button';
import { ArrowLeft, Bell, User, MapPin } from 'lucide-react';
import EngineerActionAlerts from '@/components/EngineerActionAlerts';
import { Job } from '@/types/job';

interface EngineerAlertsPageProps {
  onBack: () => void;
  jobs: Job[];
  onJobUpdate: (job: Job) => void;
}

export default function EngineerAlertsPage({ onBack, jobs, onJobUpdate }: EngineerAlertsPageProps) {
  const handleJobUpdate = (updatedJob: Job) => {
    onJobUpdate(updatedJob);
  };



  return (
    <div className="min-h-screen bg-gray-50" style={{ transform: 'scale(1.2)', transformOrigin: 'top left' }}>
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

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <EngineerActionAlerts 
          jobs={jobs} 
          onJobUpdate={handleJobUpdate} 
        />
      </div>
    </div>
  );
}
