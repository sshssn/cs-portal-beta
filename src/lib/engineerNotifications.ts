import { Job, Engineer } from '@/types/job';
import { mockEngineers } from './jobUtils';

export interface EngineerNotification {
  id: string;
  type: 'JOB_ASSIGNED' | 'JOB_ACCEPTED' | 'JOB_ONSITE' | 'JOB_COMPLETED';
  jobId: string;
  jobNumber: string;
  engineerName: string;
  message: string;
  timestamp: Date;
  read: boolean;
  actionRequired: boolean;
}

export const generateEngineerNotification = (
  job: Job, 
  type: EngineerNotification['type']
): EngineerNotification => {
  const messages = {
    JOB_ASSIGNED: `New job ${job.jobNumber} has been assigned to you. Customer: ${job.customer}, Site: ${job.site}`,
    JOB_ACCEPTED: `Job ${job.jobNumber} has been accepted. Please proceed to site.`,
    JOB_ONSITE: `You have arrived on site for job ${job.jobNumber}. Begin work.`,
    JOB_COMPLETED: `Job ${job.jobNumber} has been completed successfully.`
  };

  return {
    id: `${type}-${job.id}-${Date.now()}`,
    type,
    jobId: job.id,
    jobNumber: job.jobNumber,
    engineerName: job.engineer,
    message: messages[type],
    timestamp: new Date(),
    read: false,
    actionRequired: type === 'JOB_ASSIGNED'
  };
};

export const getEngineerNotifications = (jobs: Job[]): EngineerNotification[] => {
  const notifications: EngineerNotification[] = [];
  
  jobs.forEach(job => {
    // Job assigned notification
    if (job.status === 'allocated' && !job.dateAccepted) {
      notifications.push(generateEngineerNotification(job, 'JOB_ASSIGNED'));
    }
    
    // Job accepted notification
    if (job.dateAccepted && !job.dateOnSite) {
      notifications.push(generateEngineerNotification(job, 'JOB_ACCEPTED'));
    }
    
    // Job onsite notification
    if (job.dateOnSite && !job.dateCompleted) {
      notifications.push(generateEngineerNotification(job, 'JOB_ONSITE'));
    }
    
    // Job completed notification
    if (job.dateCompleted) {
      notifications.push(generateEngineerNotification(job, 'JOB_COMPLETED'));
    }
  });
  
  return notifications.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
};

export const getEngineerByName = (name: string): Engineer | undefined => {
  return mockEngineers.find(e => e.name === name);
};

export const sendEngineerNotification = (engineerName: string, message: string) => {
  // In a real app, this would send push notifications, SMS, or emails
  console.log(`Notification for ${engineerName}: ${message}`);
  
  // Simulate notification
  if (typeof window !== 'undefined') {
    // Show browser notification if permitted
    if (Notification.permission === 'granted') {
      new Notification(`Job Alert - ${engineerName}`, {
        body: message,
        icon: '/favicon.svg',
        tag: `engineer-${engineerName}`
      });
    }
  }
};
