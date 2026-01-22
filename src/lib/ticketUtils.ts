import { ServiceProvider, Engineer, Location, SLA, Ticket, TicketNote, TimelineEvent, LocationHazard, Asset } from '@/types/ticket';

// Service Providers Mock Data
export const mockServiceProviders: ServiceProvider[] = [
  {
    id: 'sp-1',
    ref: 'AID',
    name: 'Alarmedl Intruder Detection',
    status: 'Active',
    location: 'All',
    missingMandatoryDocs: 6,
    pendingMandatoryDocs: 0,
    docsApproachingExpiry: 0,
    expiredMandatoryDocs: 0,
    performance: 0,
    engineers: []
  },
  {
    id: 'sp-2',
    ref: 'BS1',
    name: 'Beanstalk Plant Maintenance',
    status: 'Active',
    location: 'All',
    missingMandatoryDocs: 6,
    pendingMandatoryDocs: 0,
    docsApproachingExpiry: 0,
    expiredMandatoryDocs: 0,
    performance: 0,
    engineers: []
  },
  {
    id: 'sp-3',
    ref: 'BEN',
    name: 'Beniba Ltd',
    status: 'Active',
    location: 'All',
    missingMandatoryDocs: 6,
    pendingMandatoryDocs: 1,
    docsApproachingExpiry: 0,
    expiredMandatoryDocs: 2,
    performance: 0,
    engineers: []
  },
  {
    id: 'sp-4',
    ref: 'BPW',
    name: 'Bob Waters Pool Services',
    status: 'Active',
    location: 'All',
    missingMandatoryDocs: 6,
    pendingMandatoryDocs: 0,
    docsApproachingExpiry: 0,
    expiredMandatoryDocs: 0,
    performance: 0,
    engineers: []
  },
  {
    id: 'sp-5',
    ref: 'CCC',
    name: 'Captain Cook Catering',
    status: 'Active',
    location: 'All',
    missingMandatoryDocs: 6,
    pendingMandatoryDocs: 0,
    docsApproachingExpiry: 0,
    expiredMandatoryDocs: 0,
    performance: 0,
    engineers: []
  },
  {
    id: 'sp-6',
    ref: 'CPM',
    name: 'Cash Parking Management',
    status: 'Active',
    location: 'All',
    missingMandatoryDocs: 6,
    pendingMandatoryDocs: 0,
    docsApproachingExpiry: 0,
    expiredMandatoryDocs: 0,
    performance: 0,
    engineers: []
  },
  {
    id: 'sp-7',
    ref: 'CJW',
    name: 'Central Jet Washing Services',
    status: 'Active',
    location: 'All',
    missingMandatoryDocs: 6,
    pendingMandatoryDocs: 0,
    docsApproachingExpiry: 0,
    expiredMandatoryDocs: 0,
    performance: 0,
    engineers: []
  },
  {
    id: 'sp-8',
    ref: 'ESC',
    name: 'Eye Spy CCTV',
    status: 'Active',
    location: 'All',
    missingMandatoryDocs: 6,
    pendingMandatoryDocs: 1,
    docsApproachingExpiry: 0,
    expiredMandatoryDocs: 0,
    performance: 0,
    engineers: []
  },
  {
    id: 'sp-9',
    ref: 'FF',
    name: 'Fascinating Fasteners',
    status: 'Active',
    location: 'All',
    missingMandatoryDocs: 6,
    pendingMandatoryDocs: 0,
    docsApproachingExpiry: 0,
    expiredMandatoryDocs: 0,
    performance: 0,
    engineers: []
  },
  {
    id: 'sp-10',
    ref: 'FS',
    name: 'Fast Stationery',
    status: 'Active',
    location: 'All',
    missingMandatoryDocs: 6,
    pendingMandatoryDocs: 0,
    docsApproachingExpiry: 0,
    expiredMandatoryDocs: 0,
    performance: 0,
    engineers: []
  },
  {
    id: 'sp-11',
    ref: 'FMC',
    name: 'FM Contractors',
    status: 'Active',
    location: 'All',
    missingMandatoryDocs: 3,
    pendingMandatoryDocs: 0,
    docsApproachingExpiry: 0,
    expiredMandatoryDocs: 0,
    performance: 0,
    engineers: []
  },
  {
    id: 'sp-12',
    ref: 'GD1',
    name: 'George Doors',
    status: 'Active',
    location: 'All',
    missingMandatoryDocs: 6,
    pendingMandatoryDocs: 0,
    docsApproachingExpiry: 0,
    expiredMandatoryDocs: 0,
    performance: 0,
    engineers: []
  }
];

// Engineers Mock Data
export const mockEngineersForTickets: Engineer[] = [
  {
    id: 'eng-1',
    name: 'John Smith',
    status: 'Available',
    serviceProviderId: 'sp-11',
    location: 'Edinburgh',
    isOOH: false,
    skills: ['Electrical', 'HVAC']
  },
  {
    id: 'eng-2',
    name: 'Sarah Johnson',
    status: 'On Job',
    serviceProviderId: 'sp-11',
    location: 'Edinburgh',
    isOOH: true,
    skills: ['Plumbing', 'General Maintenance']
  },
  {
    id: 'eng-3',
    name: 'Mike Davis',
    status: 'Available',
    serviceProviderId: 'sp-11',
    location: 'Edinburgh',
    isOOH: true,
    skills: ['Electrical', 'Lighting']
  },
  {
    id: 'eng-4',
    name: 'Emma Wilson',
    status: 'Off Duty',
    serviceProviderId: 'sp-4',
    location: 'Edinburgh',
    isOOH: false,
    skills: ['HVAC', 'Air Conditioning']
  }
];

// SLA Mock Data
export const mockSLAs: SLA[] = [
  {
    id: 'sla-1',
    name: 'Healthcare SLA',
    ticketOpenedBefore: 15, // 15 minutes
    containBefore: 60, // 1 hour
    completeBefore: 240 // 4 hours
  },
  {
    id: 'sla-2',
    name: 'Default SLA',
    ticketOpenedBefore: 30,
    containBefore: 120,
    completeBefore: 480
  },
  {
    id: 'sla-3',
    name: 'Critical SLA',
    ticketOpenedBefore: 5,
    containBefore: 30,
    completeBefore: 120
  },
  {
    id: 'sla-4',
    name: 'Standard SLA',
    ticketOpenedBefore: 60,
    containBefore: 240,
    completeBefore: 960
  }
];

// Location Hierarchy Mock Data
export const mockLocations: Location[] = [
  {
    id: 'org-1',
    name: 'Healthcare',
    type: 'Organization',
    parentId: null,
    children: [
      {
        id: 'site-1',
        name: 'Edinburgh Royal NHS Trust',
        type: 'Site',
        parentId: 'org-1',
        children: [
          {
            id: 'building-1',
            name: "Castleview Children's Hospital",
            type: 'Building',
            parentId: 'site-1',
            children: [
              {
                id: 'area-1',
                name: 'Block 4',
                type: 'Area',
                parentId: 'building-1',
                children: [
                  {
                    id: 'space-1',
                    name: 'CVCH-B4-GF-BHG 16 : Medical Gas Store',
                    type: 'Space',
                    parentId: 'area-1',
                    hazards: [
                      {
                        id: 'hazard-1',
                        description: 'Gas Storage Area',
                        type: 'Storage rooms'
                      }
                    ],
                    assets: [
                      {
                        id: 'asset-1',
                        name: 'Gas Storage Area',
                        type: 'Storage rooms',
                        locationId: 'space-1'
                      }
                    ]
                  }
                ]
              }
            ]
          }
        ]
      }
    ]
  }
];

// Flatten locations for easier lookup
export const flattenLocations = (locations: Location[]): Location[] => {
  const flat: Location[] = [];
  const flatten = (locs: Location[]) => {
    locs.forEach(loc => {
      flat.push(loc);
      if (loc.children) {
        flatten(loc.children);
      }
    });
  };
  flatten(locations);
  return flat;
};

export const mockFlatLocations = flattenLocations(mockLocations);

// Get location path (breadcrumb)
export const getLocationPath = (locationId: string): string => {
  const location = mockFlatLocations.find(l => l.id === locationId);
  if (!location) return '';
  
  const path: string[] = [location.name];
  let current = location;
  
  while (current.parentId) {
    const parent = mockFlatLocations.find(l => l.id === current.parentId);
    if (parent) {
      path.unshift(parent.name);
      current = parent;
    } else {
      break;
    }
  }
  
  return path.join(' > ');
};

// Tickets Mock Data
export const mockTickets: Ticket[] = [
  {
    id: 'ticket-1',
    reference: 'SRTK231',
    shortDescription: 'Light Out',
    longDescription: 'Light out in gas room: potential H&S risk',
    status: 'Open',
    priority: '2 - High',
    impact: 'High Impact',
    classification: 'Electrical Repairs > Lighting',
    ticketQueue: 'Healthcare',
    slaId: 'sla-1',
    sla: mockSLAs[0],
    autoSLA: true,
    origin: 'Phone Call',
    createdDate: new Date('2025-08-13T20:41:00'),
    reportedBy: {
      id: 'reporter-1',
      name: 'Clive Owen',
      email: 'clive.owen@hospital.nhs.uk',
      phone: '+44 131 555 0123'
    },
    locations: ['space-1'],
    assets: ['asset-1'],
    tags: ['Health and Safety Issue'],
    notes: [],
    jobs: ['1'], // Links to job id '1' from mockData which has ticketReference: 'SRTK100'
    timeline: [
      {
        id: 'timeline-1',
        type: 'ticket_created',
        title: 'TICKET CREATED',
        timestamp: new Date('2025-08-13T20:41:00'),
        author: 'System',
        status: 'completed'
      },
      {
        id: 'timeline-2',
        type: 'sla_milestone',
        title: 'SLA: TICKET OPENED BEFORE',
        description: 'Ticket Opened 5 months ago',
        timestamp: new Date('2025-08-13T20:56:00'),
        status: 'completed'
      },
      {
        id: 'timeline-3',
        type: 'sla_milestone',
        title: 'SLA: CONTAIN BEFORE',
        description: 'Contain 5 months ago',
        timestamp: new Date('2025-08-13T21:41:00'),
        status: 'breached'
      },
      {
        id: 'timeline-4',
        type: 'sla_milestone',
        title: 'SLA: COMPLETE BEFORE',
        description: 'Complete 5 months ago',
        timestamp: new Date('2025-08-14T00:41:00'),
        status: 'breached'
      },
      {
        id: 'timeline-5',
        type: 'job_created',
        title: 'Job created',
        description: 'JOB-2025-0907-001: HVAC system malfunction',
        timestamp: new Date('2025-08-13T20:41:00'),
        author: 'System',
        relatedId: '1',
        status: 'completed'
      },
      {
        id: 'timeline-6',
        type: 'tag_added',
        title: 'Tag Added',
        description: 'Health and Safety Issue',
        timestamp: new Date('2025-08-13T20:42:00'),
        author: 'System',
        status: 'completed'
      }
    ]
  },
  {
    id: 'ticket-2',
    reference: 'SRTK100',
    shortDescription: 'HVAC System Malfunction',
    longDescription: 'Air conditioning unit not cooling effectively in server room. Temperature rising above safe levels.',
    status: 'In Progress',
    priority: '1 - High',
    impact: 'Critical - Service Down',
    classification: 'HVAC > Air Conditioning',
    ticketQueue: 'Corporate',
    slaId: 'sla-3',
    sla: mockSLAs[2],
    autoSLA: true,
    origin: 'Phone Call',
    createdDate: new Date('2024-01-15T09:00:00'),
    reportedBy: {
      id: 'reporter-2',
      name: 'Sarah Johnson',
      email: 'sarah.johnson@democorp.com',
      phone: '+447123456789'
    },
    locations: ['site-1'],
    assets: [],
    tags: ['Emergency', 'HVAC', 'Server Room'],
    notes: [],
    jobs: ['1'], // Links to job id '1' which has ticketReference: 'SRTK100'
    timeline: [
      {
        id: 'timeline-t2-1',
        type: 'ticket_created',
        title: 'TICKET CREATED',
        timestamp: new Date('2024-01-15T09:00:00'),
        author: 'System',
        status: 'completed'
      },
      {
        id: 'timeline-t2-2',
        type: 'job_created',
        title: 'Job Created',
        description: 'JOB-2025-0907-001: HVAC system malfunction',
        timestamp: new Date('2024-01-15T09:05:00'),
        author: 'Dispatch',
        relatedId: '1',
        status: 'completed'
      }
    ]
  },
  {
    id: 'ticket-3',
    reference: 'SRTK101',
    shortDescription: 'Leaky Faucet in Breakroom',
    longDescription: 'Constant drip from the breakroom sink faucet. Water damage possible if not addressed.',
    status: 'Open',
    priority: '3 - Medium',
    impact: 'Medium Impact',
    classification: 'Plumbing > Leaks',
    ticketQueue: 'Facilities',
    slaId: 'sla-2',
    sla: mockSLAs[1],
    autoSLA: true,
    origin: 'Email',
    createdDate: new Date('2024-01-14T14:30:00'),
    reportedBy: {
      id: 'reporter-3',
      name: 'Mike Davis',
      email: 'mike.davis@techsolutions.com',
      phone: '+447234567890'
    },
    locations: ['building-1'],
    assets: [],
    tags: ['Plumbing', 'Maintenance Required'],
    notes: [],
    jobs: ['2'], // Links to job id '2'
    timeline: [
      {
        id: 'timeline-t3-1',
        type: 'ticket_created',
        title: 'TICKET CREATED',
        timestamp: new Date('2024-01-14T14:30:00'),
        author: 'System',
        status: 'completed'
      },
      {
        id: 'timeline-t3-2',
        type: 'job_created',
        title: 'Job Created',
        description: 'JOB-2025-0907-002: Leaky faucet',
        timestamp: new Date('2024-01-14T14:45:00'),
        author: 'Dispatch',
        relatedId: '2',
        status: 'completed'
      }
    ]
  },
  {
    id: 'ticket-4',
    reference: 'SRTK102',
    shortDescription: 'Electrical Outlet Repair',
    longDescription: 'Several power outlets in production area are not working. Affecting manufacturing operations.',
    status: 'Resolved',
    priority: '2 - High',
    impact: 'High Impact',
    classification: 'Electrical Repairs > Power',
    ticketQueue: 'Industrial',
    slaId: 'sla-1',
    sla: mockSLAs[0],
    autoSLA: true,
    origin: 'Web Portal',
    createdDate: new Date('2024-01-13T10:00:00'),
    reportedBy: {
      id: 'reporter-4',
      name: 'Lisa Wilson',
      email: 'lisa.wilson@indmanufacturing.com',
      phone: '+447345678901'
    },
    locations: ['area-1'],
    assets: [],
    tags: ['Electrical', 'Production'],
    notes: [],
    jobs: ['3'], // Links to job id '3'
    timeline: [
      {
        id: 'timeline-t4-1',
        type: 'ticket_created',
        title: 'TICKET CREATED',
        timestamp: new Date('2024-01-13T10:00:00'),
        author: 'System',
        status: 'completed'
      },
      {
        id: 'timeline-t4-2',
        type: 'job_created',
        title: 'Job Created',
        description: 'JOB-2025-0907-003: Electrical outlet repair',
        timestamp: new Date('2024-01-13T10:15:00'),
        author: 'Dispatch',
        relatedId: '3',
        status: 'completed'
      },
      {
        id: 'timeline-t4-3',
        type: 'status_changed',
        title: 'Status Changed to Resolved',
        description: 'Job completed successfully',
        timestamp: new Date('2024-01-13T14:00:00'),
        author: 'Mike Davis',
        status: 'completed'
      }
    ]
  },
  {
    id: 'ticket-5',
    reference: 'SRTK103',
    shortDescription: 'Fire Alarm Test Required',
    longDescription: 'Annual fire alarm testing due. Need to schedule and coordinate with building occupants.',
    status: 'Open',
    priority: '2 - High',
    impact: 'Medium Impact',
    classification: 'Fire Safety > Alarms',
    ticketQueue: 'Compliance',
    slaId: 'sla-4',
    sla: mockSLAs[3],
    autoSLA: true,
    origin: 'System Alert',
    createdDate: new Date('2024-01-16T08:00:00'),
    reportedBy: {
      id: 'reporter-5',
      name: 'System',
      email: 'alerts@system.com',
      phone: ''
    },
    locations: ['org-1'],
    assets: [],
    tags: ['Compliance', 'Scheduled Work', 'Fire Safety'],
    notes: [],
    jobs: ['4'], // Links to job id '4'
    timeline: [
      {
        id: 'timeline-t5-1',
        type: 'ticket_created',
        title: 'TICKET CREATED',
        timestamp: new Date('2024-01-16T08:00:00'),
        author: 'System',
        status: 'completed'
      }
    ]
  }
];

// Available tags for tickets with color mapping
export const mockTicketTags = [
  'Health and Safety Issue',
  'Urgent',
  'Equipment Failure',
  'Maintenance Required',
  'Customer Request',
  'Compliance',
  'Emergency',
  'Scheduled Work'
];

// Status color mapping - logical colors for ticket status
export const statusColors: Record<string, { bg: string; text: string; border: string }> = {
  'Open': { bg: 'bg-emerald-100', text: 'text-emerald-700', border: 'border-emerald-200' },
  'In Progress': { bg: 'bg-amber-100', text: 'text-amber-700', border: 'border-amber-200' },
  'Draft': { bg: 'bg-slate-100', text: 'text-slate-600', border: 'border-slate-200' },
  'Closed': { bg: 'bg-gray-100', text: 'text-gray-600', border: 'border-gray-300' },
  'Resolved': { bg: 'bg-teal-100', text: 'text-teal-700', border: 'border-teal-200' },
  'Pending': { bg: 'bg-yellow-100', text: 'text-yellow-700', border: 'border-yellow-200' },
  'On Hold': { bg: 'bg-orange-100', text: 'text-orange-700', border: 'border-orange-200' },
  'default': { bg: 'bg-gray-100', text: 'text-gray-600', border: 'border-gray-200' }
};

// Helper function to get status color classes
export const getStatusColors = (status: string): string => {
  const colors = statusColors[status] || statusColors['default'];
  return `${colors.bg} ${colors.text} ${colors.border}`;
};

// Tag color mapping - logical colors based on tag meaning (no blue)
export const tagColors: Record<string, { bg: string; text: string; border: string }> = {
  'Health and Safety Issue': { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-200' },
  'Urgent': { bg: 'bg-orange-100', text: 'text-orange-700', border: 'border-orange-200' },
  'Emergency': { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-300' },
  'Equipment Failure': { bg: 'bg-amber-100', text: 'text-amber-700', border: 'border-amber-200' },
  'Maintenance Required': { bg: 'bg-teal-100', text: 'text-teal-700', border: 'border-teal-200' },
  'Customer Request': { bg: 'bg-purple-100', text: 'text-purple-700', border: 'border-purple-200' },
  'Compliance': { bg: 'bg-indigo-100', text: 'text-indigo-700', border: 'border-indigo-200' },
  'Scheduled Work': { bg: 'bg-emerald-100', text: 'text-emerald-700', border: 'border-emerald-200' },
  // Fallback colors for any other tags
  'default': { bg: 'bg-gray-100', text: 'text-gray-700', border: 'border-gray-200' }
};

// Helper function to get tag color classes
export const getTagColors = (tag: string): string => {
  const colors = tagColors[tag] || tagColors['default'];
  return `${colors.bg} ${colors.text} ${colors.border}`;
};

// Ticket Origins
export const mockTicketOrigins = [
  'Phone Call',
  'Email',
  'Web Portal',
  'Mobile App',
  'Walk-in',
  'System Alert'
];

// Ticket Impacts
export const mockTicketImpacts = [
  'Critical - Service Down',
  'High Impact',
  'Medium Impact',
  'Low Impact',
  'Minimal Impact'
];

// Ticket Classifications
export const mockTicketClassifications = [
  'Electrical Repairs > Lighting',
  'Electrical Repairs > Power',
  'HVAC > Air Conditioning',
  'HVAC > Heating',
  'Plumbing > Leak',
  'Plumbing > Drainage',
  'Security > Access Control',
  'Security > CCTV',
  'Building Fabric > Doors',
  'Building Fabric > Windows',
  'General Maintenance'
];

// Ticket Queues
export const mockTicketQueues = [
  'Healthcare',
  'Education',
  'Commercial',
  'Retail',
  'Government',
  'Default'
];

// Workflows for job creation
export const mockWorkflows = [
  'CAFM Job - Reactive',
  'CAFM Job - Planned',
  'CAFM Job - PPM',
  'Emergency Response',
  'Standard Workflow'
];

// Pre-defined instructions
export const mockPreDefinedInstructions = [
  'None',
  'Ensure H&S compliance',
  'Check surrounding area',
  'Report any additional issues',
  'Take photos before and after',
  'Complete risk assessment'
];
