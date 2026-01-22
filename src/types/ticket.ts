export interface ServiceProvider {
  id: string;
  ref: string;
  name: string;
  status: 'Active' | 'Inactive';
  location: string;
  missingMandatoryDocs: number;
  pendingMandatoryDocs: number;
  docsApproachingExpiry: number;
  expiredMandatoryDocs: number;
  performance: number;
  engineers: Engineer[];
}

export interface Engineer {
  id: string;
  name: string;
  status: 'Available' | 'On Job' | 'Off Duty' | 'On Leave';
  serviceProviderId: string;
  location: string;
  isOOH: boolean; // Out of Hours engineer
  skills: string[];
}

export interface Location {
  id: string;
  name: string;
  type: 'Organization' | 'Site' | 'Building' | 'Area' | 'Space';
  parentId: string | null;
  children?: Location[];
  hazards?: LocationHazard[];
  assets?: Asset[];
}

export interface LocationHazard {
  id: string;
  description: string;
  type: string;
}

export interface Asset {
  id: string;
  name: string;
  type: string;
  locationId: string;
}

export interface SLA {
  id: string;
  name: string;
  ticketOpenedBefore: number; // minutes
  containBefore: number; // minutes
  completeBefore: number; // minutes
}

export interface TicketNote {
  id: string;
  ticketId: string;
  content: string;
  author: string;
  timestamp: Date;
  visibility: 'Public' | 'Private';
  attachments: NoteAttachment[];
}

export interface NoteAttachment {
  id: string;
  name: string;
  url: string;
  type: string;
}

export interface TimelineEvent {
  id: string;
  type: 'ticket_created' | 'job_created' | 'tag_added' | 'note_added' | 'status_changed' | 'sla_milestone';
  title: string;
  description?: string;
  timestamp: Date;
  author?: string;
  status?: 'completed' | 'breached' | 'approaching' | 'pending';
  relatedId?: string; // job id, note id, etc.
}

export interface Ticket {
  id: string;
  reference: string;
  shortDescription: string;
  longDescription: string;
  status: 'Open' | 'In Progress' | 'Resolved' | 'Closed';
  priority: '1 - High' | '2 - High' | '3 - Medium' | '4 - Low' | '5 - Low';
  impact: string;
  classification: string;
  ticketQueue: string;
  slaId: string;
  sla: SLA;
  autoSLA: boolean;
  createdDate: Date;
  reportedBy: TicketReporter;
  locations: string[]; // location IDs
  assets: string[]; // asset IDs
  tags: string[];
  notes: TicketNote[];
  jobs: string[]; // job IDs
  timeline: TimelineEvent[];
  origin: string;
}

export interface TicketReporter {
  id: string;
  name: string;
  email: string;
  phone: string;
}

export interface CreateTicketFormData {
  date: Date;
  origin: string;
  tags: string[];
  shortDescription: string;
  longDescription: string;
  impact: string;
  classification: string;
  ticketQueue: string;
  slaId: string;
  autoSLA: boolean;
  reportedBy: TicketReporter;
  locations: string[];
  assets: string[];
}

export interface CreateJobFromTicketData {
  shortDescription: string;
  details: string;
  location: string;
  team: string;
  priority: '1 - High' | '2 - High' | '3 - Medium' | '4 - Low';
  selectedSLA: string;
  workflow: string;
  startJob: 'straight-away' | 'specific-date';
  specificDate?: Date;
  preDefinedInstruction: string;
  serviceProviderId?: string;
  engineerId?: string;
}
