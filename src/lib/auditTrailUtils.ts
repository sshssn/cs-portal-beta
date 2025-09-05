// Audit Trail Utils - Track all job related actions with timestamps

import { CommunicationEvent, Job, JobAlert } from '@/types/job';
import { showNotification } from '@/components/ui/toast-notification';

// Define audit trail event types
export type AuditEventType = 
  | 'job_created' 
  | 'job_updated' 
  | 'job_allocated'
  | 'job_accepted'
  | 'job_completed'
  | 'job_cancelled'
  | 'status_changed'
  | 'alert_created'
  | 'alert_resolved'
  | 'note_added'
  | 'communication_added'
  | 'engineer_changed'
  | 'priority_changed';

// Audit trail event structure
export interface AuditEvent {
  id: string;
  timestamp: Date;
  type: AuditEventType;
  jobId: string;
  jobNumber: string;
  userId: string;
  description: string;
  details?: any;
}

const AUDIT_STORAGE_KEY = 'jobLogicAuditTrail';

// Load audit trail from localStorage
export const loadAuditTrail = (): AuditEvent[] => {
  try {
    const savedData = localStorage.getItem(AUDIT_STORAGE_KEY);
    if (!savedData) return [];
    
    const parsed = JSON.parse(savedData);
    
    // Convert date strings back to Date objects
    return parsed.map((event: any) => ({
      ...event,
      timestamp: new Date(event.timestamp)
    }));
  } catch (error) {
    console.error('Error loading audit trail:', error);
    return [];
  }
};

// Save audit trail to localStorage
export const saveAuditTrail = (auditTrail: AuditEvent[]): void => {
  try {
    localStorage.setItem(AUDIT_STORAGE_KEY, JSON.stringify(auditTrail));
  } catch (error) {
    console.error('Error saving audit trail:', error);
    showNotification({
      type: 'error',
      title: 'Audit Trail Error',
      message: 'Failed to save audit trail. Local storage may be full.'
    });
  }
};

// Get current user ID - in a real system this would come from authentication
export const getCurrentUserId = (): string => {
  return 'current-user'; // Placeholder
};

// Create a new audit event
export const createAuditEvent = (
  type: AuditEventType,
  jobId: string,
  jobNumber: string,
  description: string,
  details?: any
): AuditEvent => {
  return {
    id: `audit-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    timestamp: new Date(),
    type,
    jobId,
    jobNumber,
    userId: getCurrentUserId(),
    description,
    details
  };
};

// Log an audit event
export const logAuditEvent = (
  type: AuditEventType,
  jobId: string,
  jobNumber: string,
  description: string,
  details?: any
): void => {
  const auditTrail = loadAuditTrail();
  const newEvent = createAuditEvent(type, jobId, jobNumber, description, details);
  auditTrail.unshift(newEvent); // Add to the beginning of the array
  saveAuditTrail(auditTrail);
  
  // Convert to communication event for immediate display
  const communicationEvent: CommunicationEvent = {
    id: newEvent.id,
    timestamp: newEvent.timestamp,
    type: 'status_update',
    direction: 'inbound',
    from: 'System',
    to: 'All Users',
    content: description,
    status: 'sent',
    priority: 'medium',
    tags: ['audit_trail', type],
    relatedJobId: jobId,
    requiresFollowUp: false
  };
  
  // Return the communication event for immediate use
  return communicationEvent;
};

// Track job status changes
export const trackStatusChange = (job: Job, oldStatus: Job['status'], newStatus: Job['status']): CommunicationEvent => {
  return logAuditEvent(
    'status_changed',
    job.id,
    job.jobNumber,
    `Job status changed from ${oldStatus} to ${newStatus}`,
    { oldStatus, newStatus }
  );
};

// Track job updates
export const trackJobUpdate = (job: Job, changes: string[]): CommunicationEvent => {
  return logAuditEvent(
    'job_updated',
    job.id,
    job.jobNumber,
    `Job updated: ${changes.join(', ')}`,
    { changes }
  );
};

// Track alert creation
export const trackAlertCreated = (job: Job, alert: JobAlert): CommunicationEvent => {
  return logAuditEvent(
    'alert_created',
    job.id,
    job.jobNumber,
    `Alert created: ${alert.type} - ${alert.message}`,
    { alertId: alert.id, alertType: alert.type }
  );
};

// Track alert resolution
export const trackAlertResolved = (job: Job, alert: JobAlert): CommunicationEvent => {
  return logAuditEvent(
    'alert_resolved',
    job.id,
    job.jobNumber,
    `Alert resolved: ${alert.type} - ${alert.resolution || 'No resolution provided'}`,
    { alertId: alert.id, alertType: alert.type }
  );
};

// Get audit trail for specific job
export const getJobAuditTrail = (jobId: string): AuditEvent[] => {
  const auditTrail = loadAuditTrail();
  return auditTrail.filter(event => event.jobId === jobId);
};
