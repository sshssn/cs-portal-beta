import { Job } from '@/types/job';
import { Ticket, SLA, TicketNote, TimelineEvent } from '@/types/ticket';

// Storage keys
export const STORAGE_KEYS = {
  TICKETS: 'ooh_helpdesk_tickets_v1',
  JOBS: 'ooh_helpdesk_jobs_v1',
};

// SLA Definitions
export const defaultSLAs: SLA[] = [
  {
    id: 'sla-emergency',
    name: 'Emergency 4-Hour',
    ticketOpenedBefore: 15,
    containBefore: 60,
    completeBefore: 240, // 4 hours
  },
  {
    id: 'sla-urgent',
    name: 'Urgent 24-Hour',
    ticketOpenedBefore: 30,
    containBefore: 120,
    completeBefore: 1440, // 24 hours
  },
  {
    id: 'sla-standard',
    name: 'Standard 48-Hour',
    ticketOpenedBefore: 60,
    containBefore: 240,
    completeBefore: 2880, // 48 hours
  },
];

// 5 Realistic Linked Tickets
export const initialTickets: Ticket[] = [
  {
    id: 'ticket-1',
    reference: 'TKT-2026-001',
    shortDescription: 'Emergency Boiler Failure - No Heating',
    longDescription: 'Complete boiler failure in Block A. All 24 residential units without heating. Temperature dropping to unsafe levels. Elderly residents at risk.',
    status: 'In Progress',
    priority: '1 - High',
    impact: 'Critical - Multiple Units Affected',
    classification: 'HVAC > Boiler',
    ticketQueue: 'Emergency',
    slaId: 'sla-emergency',
    sla: defaultSLAs[0],
    autoSLA: true,
    origin: 'Phone Call',
    createdDate: new Date('2026-01-20T08:30:00'),
    reportedBy: {
      id: 'rep-1',
      name: 'Margaret Thompson',
      email: 'm.thompson@blockamgmt.com',
      phone: '+44 20 7946 0958',
    },
    locations: ['Block A - Residential'],
    assets: ['Boiler-001'],
    tags: ['Emergency', 'HVAC', 'Health & Safety'],
    notes: [],
    jobs: ['job-1'],
    timeline: [
      {
        id: 'tl-1-1',
        type: 'ticket_created',
        title: 'Ticket Created',
        description: 'Emergency ticket raised for boiler failure',
        timestamp: new Date('2026-01-20T08:30:00'),
        author: 'System',
        status: 'completed',
      },
      {
        id: 'tl-1-2',
        type: 'job_created',
        title: 'Job Created',
        description: 'JOB-2026-001: Emergency boiler repair dispatched',
        timestamp: new Date('2026-01-20T08:45:00'),
        author: 'Dispatch',
        relatedId: 'job-1',
        status: 'completed',
      },
    ],
  },
  {
    id: 'ticket-2',
    reference: 'TKT-2026-002',
    shortDescription: 'Fire Alarm System Fault',
    longDescription: 'Fire alarm control panel showing Zone 3 fault. Located in main reception area. System cannot be silenced. Intermittent beeping causing disturbance.',
    status: 'Open',
    priority: '2 - High',
    impact: 'High - Safety System',
    classification: 'Fire Safety > Alarm Systems',
    ticketQueue: 'Safety',
    slaId: 'sla-urgent',
    sla: defaultSLAs[1],
    autoSLA: true,
    origin: 'Email',
    createdDate: new Date('2026-01-21T09:15:00'),
    reportedBy: {
      id: 'rep-2',
      name: 'David Chen',
      email: 'd.chen@corporatehq.com',
      phone: '+44 161 555 0147',
    },
    locations: ['Corporate HQ - Reception'],
    assets: ['FirePanel-Zone3'],
    tags: ['Fire Safety', 'Urgent', 'Compliance'],
    notes: [],
    jobs: ['job-2'],
    timeline: [
      {
        id: 'tl-2-1',
        type: 'ticket_created',
        title: 'Ticket Created',
        timestamp: new Date('2026-01-21T09:15:00'),
        author: 'System',
        status: 'completed',
      },
      {
        id: 'tl-2-2',
        type: 'job_created',
        title: 'Job Created',
        description: 'JOB-2026-002: Fire alarm fault investigation',
        timestamp: new Date('2026-01-21T09:30:00'),
        author: 'Dispatch',
        relatedId: 'job-2',
        status: 'completed',
      },
    ],
  },
  {
    id: 'ticket-3',
    reference: 'TKT-2026-003',
    shortDescription: 'Water Leak in Server Room',
    longDescription: 'Water ingress detected in server room ceiling. Possible pipe leak from floor above. Risk to critical IT infrastructure. Buckets placed temporarily.',
    status: 'In Progress',
    priority: '1 - High',
    impact: 'Critical - IT Infrastructure at Risk',
    classification: 'Plumbing > Leaks',
    ticketQueue: 'Emergency',
    slaId: 'sla-emergency',
    sla: defaultSLAs[0],
    autoSLA: true,
    origin: 'Phone Call',
    createdDate: new Date('2026-01-21T14:22:00'),
    reportedBy: {
      id: 'rep-3',
      name: 'James Mitchell',
      email: 'j.mitchell@techpark.io',
      phone: '+44 121 555 0293',
    },
    locations: ['Tech Park - Building B - Server Room'],
    assets: ['Server-Rack-01', 'Server-Rack-02'],
    tags: ['Emergency', 'Plumbing', 'IT Infrastructure'],
    notes: [],
    jobs: ['job-3'],
    timeline: [
      {
        id: 'tl-3-1',
        type: 'ticket_created',
        title: 'Ticket Created',
        timestamp: new Date('2026-01-21T14:22:00'),
        author: 'System',
        status: 'completed',
      },
      {
        id: 'tl-3-2',
        type: 'job_created',
        title: 'Job Created',
        description: 'JOB-2026-003: Emergency plumber dispatched',
        timestamp: new Date('2026-01-21T14:35:00'),
        author: 'Dispatch',
        relatedId: 'job-3',
        status: 'completed',
      },
    ],
  },
  {
    id: 'ticket-4',
    reference: 'TKT-2026-004',
    shortDescription: 'Lift Stuck Between Floors',
    longDescription: 'Passenger lift stuck between 2nd and 3rd floor. No passengers inside (confirmed via CCTV). Lift showing error code E-47. Service required.',
    status: 'Open',
    priority: '2 - High',
    impact: 'High - Access Restricted',
    classification: 'Mechanical > Lifts',
    ticketQueue: 'Urgent',
    slaId: 'sla-urgent',
    sla: defaultSLAs[1],
    autoSLA: true,
    origin: 'Phone Call',
    createdDate: new Date('2026-01-22T07:45:00'),
    reportedBy: {
      id: 'rep-4',
      name: 'Susan Wright',
      email: 's.wright@residentialmgmt.co.uk',
      phone: '+44 113 555 0184',
    },
    locations: ['Maple Court - Main Lift'],
    assets: ['Lift-001'],
    tags: ['Mechanical', 'Urgent', 'Access'],
    notes: [],
    jobs: ['job-4'],
    timeline: [
      {
        id: 'tl-4-1',
        type: 'ticket_created',
        title: 'Ticket Created',
        timestamp: new Date('2026-01-22T07:45:00'),
        author: 'System',
        status: 'completed',
      },
      {
        id: 'tl-4-2',
        type: 'job_created',
        title: 'Job Created',
        description: 'JOB-2026-004: Lift engineer callout',
        timestamp: new Date('2026-01-22T08:00:00'),
        author: 'Dispatch',
        relatedId: 'job-4',
        status: 'completed',
      },
    ],
  },
  {
    id: 'ticket-5',
    reference: 'TKT-2026-005',
    shortDescription: 'Power Outage - East Wing',
    longDescription: 'Complete power loss in East Wing offices. Approximately 40 workstations affected. Emergency lighting has activated. Main breaker appears tripped.',
    status: 'In Progress',
    priority: '1 - High',
    impact: 'Critical - Business Operations Halted',
    classification: 'Electrical > Power Distribution',
    ticketQueue: 'Emergency',
    slaId: 'sla-emergency',
    sla: defaultSLAs[0],
    autoSLA: true,
    origin: 'Phone Call',
    createdDate: new Date('2026-01-22T10:05:00'),
    reportedBy: {
      id: 'rep-5',
      name: 'Robert Taylor',
      email: 'r.taylor@financialservices.com',
      phone: '+44 20 7946 0421',
    },
    locations: ['Financial Centre - East Wing'],
    assets: ['MainBreaker-EW', 'DistBoard-EW1'],
    tags: ['Emergency', 'Electrical', 'Business Critical'],
    notes: [],
    jobs: ['job-5'],
    timeline: [
      {
        id: 'tl-5-1',
        type: 'ticket_created',
        title: 'Ticket Created',
        timestamp: new Date('2026-01-22T10:05:00'),
        author: 'System',
        status: 'completed',
      },
      {
        id: 'tl-5-2',
        type: 'job_created',
        title: 'Job Created',
        description: 'JOB-2026-005: Emergency electrician dispatched',
        timestamp: new Date('2026-01-22T10:15:00'),
        author: 'Dispatch',
        relatedId: 'job-5',
        status: 'completed',
      },
    ],
  },
];

// 5 Linked Jobs (correspond to the 5 tickets above)
export const initialJobs: Job[] = [
  {
    id: 'job-1',
    jobNumber: 'JOB-2026-001',
    ticketReference: 'TKT-2026-001',
    customer: 'Block A Management Ltd',
    tenant: '',
    site: 'Block A Residential Complex',
    engineer: 'Manchester Facilities Services',
    contact: {
      name: 'Margaret Thompson',
      number: '+44 20 7946 0958',
      email: 'm.thompson@blockamgmt.com',
      relationship: 'Building Manager',
    },
    reporter: {
      name: 'Margaret Thompson',
      number: '+44 20 7946 0958',
      email: 'm.thompson@blockamgmt.com',
      relationship: 'Building Manager',
    },
    status: 'attended',
    priority: 'Critical',
    dateLogged: new Date('2026-01-20T08:45:00'),
    dateAccepted: new Date('2026-01-20T09:00:00'),
    dateOnSite: new Date('2026-01-20T10:30:00'),
    dateCompleted: null,
    description: 'Emergency boiler repair - Complete heating system failure affecting 24 residential units',
    jobType: 'Emergency',
    category: 'HVAC',
    targetCompletionTime: 240,
    reason: null,
    customAlerts: {
      acceptSLA: 15,
      onsiteSLA: 120,
      completedSLA: 240,
    },
    alerts: [],
    primaryJobTrade: 'HVAC',
    tags: ['Emergency', 'Boiler', 'Heating'],
    jobNotes: 'Boiler showing E119 error code. Parts may be required. Keeping residents informed via building manager.',
  },
  {
    id: 'job-2',
    jobNumber: 'JOB-2026-002',
    ticketReference: 'TKT-2026-002',
    customer: 'Corporate HQ Ltd',
    tenant: '',
    site: 'Corporate Headquarters',
    engineer: 'London Property Care',
    contact: {
      name: 'David Chen',
      number: '+44 161 555 0147',
      email: 'd.chen@corporatehq.com',
      relationship: 'Facilities Coordinator',
    },
    reporter: {
      name: 'David Chen',
      number: '+44 161 555 0147',
      email: 'd.chen@corporatehq.com',
      relationship: 'Facilities Coordinator',
    },
    status: 'allocated',
    priority: 'High',
    dateLogged: new Date('2026-01-21T09:30:00'),
    dateAccepted: new Date('2026-01-21T09:45:00'),
    dateOnSite: null,
    dateCompleted: null,
    description: 'Fire alarm panel fault investigation - Zone 3 showing continuous fault',
    jobType: 'Call Out',
    category: 'Fire Safety',
    targetCompletionTime: 480,
    reason: null,
    customAlerts: {
      acceptSLA: 30,
      onsiteSLA: 180,
      completedSLA: 480,
    },
    alerts: [],
    primaryJobTrade: 'Fire Safety',
    tags: ['Fire Alarm', 'Safety', 'Compliance'],
    jobNotes: 'Zone 3 covers main reception and conference rooms. Panel is Kentec Syncro AS.',
  },
  {
    id: 'job-3',
    jobNumber: 'JOB-2026-003',
    ticketReference: 'TKT-2026-003',
    customer: 'Tech Park Developments',
    tenant: '',
    site: 'Tech Park Building B',
    engineer: 'Birmingham Building Solutions',
    contact: {
      name: 'James Mitchell',
      number: '+44 121 555 0293',
      email: 'j.mitchell@techpark.io',
      relationship: 'IT Manager',
    },
    reporter: {
      name: 'James Mitchell',
      number: '+44 121 555 0293',
      email: 'j.mitchell@techpark.io',
      relationship: 'IT Manager',
    },
    status: 'attended',
    priority: 'Critical',
    dateLogged: new Date('2026-01-21T14:35:00'),
    dateAccepted: new Date('2026-01-21T14:40:00'),
    dateOnSite: new Date('2026-01-21T15:45:00'),
    dateCompleted: null,
    description: 'Emergency water leak repair - Server room ceiling leak endangering IT equipment',
    jobType: 'Emergency',
    category: 'Plumbing',
    targetCompletionTime: 180,
    reason: null,
    customAlerts: {
      acceptSLA: 10,
      onsiteSLA: 90,
      completedSLA: 180,
    },
    alerts: [],
    primaryJobTrade: 'Plumbing',
    tags: ['Emergency', 'Water Leak', 'IT Critical'],
    jobNotes: 'Leak appears to be from pipe in floor above (washroom area). IT team has covered equipment with plastic sheeting.',
  },
  {
    id: 'job-4',
    jobNumber: 'JOB-2026-004',
    ticketReference: 'TKT-2026-004',
    customer: 'Maple Court Residents Association',
    tenant: '',
    site: 'Maple Court',
    engineer: 'Leeds Maintenance Group',
    contact: {
      name: 'Susan Wright',
      number: '+44 113 555 0184',
      email: 's.wright@residentialmgmt.co.uk',
      relationship: 'Property Manager',
    },
    reporter: {
      name: 'Susan Wright',
      number: '+44 113 555 0184',
      email: 's.wright@residentialmgmt.co.uk',
      relationship: 'Property Manager',
    },
    status: 'allocated',
    priority: 'High',
    dateLogged: new Date('2026-01-22T08:00:00'),
    dateAccepted: new Date('2026-01-22T08:15:00'),
    dateOnSite: null,
    dateCompleted: null,
    description: 'Lift repair - Passenger lift stuck between floors, error code E-47',
    jobType: 'Call Out',
    category: 'Mechanical',
    targetCompletionTime: 360,
    reason: null,
    customAlerts: {
      acceptSLA: 20,
      onsiteSLA: 120,
      completedSLA: 360,
    },
    alerts: [],
    primaryJobTrade: 'Lifts',
    tags: ['Lift', 'Mechanical', 'Access'],
    jobNotes: 'Lift is Otis model. CCTV confirmed no passengers trapped. Building has one other lift operational.',
  },
  {
    id: 'job-5',
    jobNumber: 'JOB-2026-005',
    ticketReference: 'TKT-2026-005',
    customer: 'Financial Services Group',
    tenant: '',
    site: 'Financial Centre',
    engineer: 'London Property Care',
    contact: {
      name: 'Robert Taylor',
      number: '+44 20 7946 0421',
      email: 'r.taylor@financialservices.com',
      relationship: 'Operations Director',
    },
    reporter: {
      name: 'Robert Taylor',
      number: '+44 20 7946 0421',
      email: 'r.taylor@financialservices.com',
      relationship: 'Operations Director',
    },
    status: 'attended',
    priority: 'Critical',
    dateLogged: new Date('2026-01-22T10:15:00'),
    dateAccepted: new Date('2026-01-22T10:20:00'),
    dateOnSite: new Date('2026-01-22T11:00:00'),
    dateCompleted: null,
    description: 'Emergency power restoration - Complete power loss in East Wing affecting 40 workstations',
    jobType: 'Emergency',
    category: 'Electrical',
    targetCompletionTime: 120,
    reason: null,
    customAlerts: {
      acceptSLA: 10,
      onsiteSLA: 60,
      completedSLA: 120,
    },
    alerts: [],
    primaryJobTrade: 'Electrical',
    tags: ['Emergency', 'Power', 'Business Critical'],
    jobNotes: 'Main breaker for East Wing has tripped. Investigating cause before reset. May be overload or fault.',
  },
];

// Helper functions for localStorage
export const loadTicketsFromStorage = (): Ticket[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.TICKETS);
    if (stored) {
      const parsed = JSON.parse(stored, (key, value) => {
        // Revive date fields
        if ((key === 'createdDate' || key === 'timestamp') && value) {
          return new Date(value);
        }
        return value;
      });
      return parsed;
    }
  } catch (e) {
    console.error('Error loading tickets from storage:', e);
  }
  return initialTickets;
};

export const saveTicketsToStorage = (tickets: Ticket[]): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.TICKETS, JSON.stringify(tickets));
  } catch (e) {
    console.error('Error saving tickets to storage:', e);
  }
};

export const loadJobsFromStorage = (): Job[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.JOBS);
    if (stored) {
      const parsed = JSON.parse(stored, (key, value) => {
        // Revive date fields
        if (key.startsWith('date') && value) {
          return new Date(value);
        }
        if (key === 'preferredAppointmentDate' && value) {
          return new Date(value);
        }
        return value;
      });
      return parsed;
    }
  } catch (e) {
    console.error('Error loading jobs from storage:', e);
  }
  return initialJobs;
};

export const saveJobsToStorage = (jobs: Job[]): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.JOBS, JSON.stringify(jobs));
  } catch (e) {
    console.error('Error saving jobs to storage:', e);
  }
};

// Clear all demo data (for reset)
export const clearAllDemoData = (): void => {
  localStorage.removeItem(STORAGE_KEYS.TICKETS);
  localStorage.removeItem(STORAGE_KEYS.JOBS);
};

// Generate next ticket reference
export const generateTicketReference = (tickets: Ticket[]): string => {
  const year = new Date().getFullYear();
  const existingNumbers = tickets
    .filter(t => t.reference.startsWith(`TKT-${year}-`))
    .map(t => parseInt(t.reference.split('-')[2], 10))
    .filter(n => !isNaN(n));
  
  const nextNumber = existingNumbers.length > 0 
    ? Math.max(...existingNumbers) + 1 
    : 1;
  
  return `TKT-${year}-${String(nextNumber).padStart(3, '0')}`;
};

// Generate next job number
export const generateJobNumber = (jobs: Job[]): string => {
  const year = new Date().getFullYear();
  const existingNumbers = jobs
    .filter(j => j.jobNumber.startsWith(`JOB-${year}-`))
    .map(j => parseInt(j.jobNumber.split('-')[2], 10))
    .filter(n => !isNaN(n));
  
  const nextNumber = existingNumbers.length > 0 
    ? Math.max(...existingNumbers) + 1 
    : 1;
  
  return `JOB-${year}-${String(nextNumber).padStart(3, '0')}`;
};
