import { Job, Customer, Engineer } from '@/types/job';

// Utility functions for styling
export const getStatusColor = (status: Job['status']): string => {
  switch (status) {
    case 'green':
      return 'bg-emerald-500 text-white border-emerald-600 shadow-sm';
    case 'amber':
      return 'bg-amber-500 text-white border-amber-600 shadow-sm';
    case 'red':
      return 'bg-red-500 text-white border-red-600 shadow-sm';
    default:
      return 'bg-gray-500 text-white border-gray-600 shadow-sm';
  }
};

export const getPriorityColor = (priority: Job['priority']): string => {
  switch (priority) {
    case 'Critical':
      return 'bg-red-600 text-white border-red-700 shadow-sm';
    case 'High':
      return 'bg-orange-500 text-white border-orange-600 shadow-sm';
    case 'Medium':
      return 'bg-yellow-500 text-white border-yellow-600 shadow-sm';
    case 'Low':
      return 'bg-green-500 text-white border-green-600 shadow-sm';
    default:
      return 'bg-gray-500 text-white border-gray-600 shadow-sm';
  }
};

// Generate job number
export const generateJobNumber = (): string => {
  const prefix = 'JOB';
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `${prefix}-${timestamp}-${random}`;
};

// Mock data
export const mockJobTrades = [
  'Electrical',
  'Plumbing',
  'HVAC',
  'Carpentry',
  'Painting',
  'Roofing',
  'Flooring',
  'Landscaping',
  'Security Systems',
  'Fire Safety'
];

export const mockTags = [
  'Urgent',
  'Scheduled',
  'Maintenance',
  'Repair',
  'Installation',
  'Inspection',
  'Emergency',
  'Warranty',
  'Preventive',
  'Compliance'
];

export const mockEngineers: Engineer[] = [
  {
    name: 'John Smith',
    email: 'john.smith@company.com',
    phone: '+1 (555) 123-4567',
    status: 'OOH',
    syncStatus: 'synced',
    shiftTiming: '6:00 PM - 6:00 AM',
    isOnHoliday: false
  },
  {
    name: 'Sarah Johnson',
    email: 'sarah.johnson@company.com',
    phone: '+1 (555) 234-5678',
    status: 'On call',
    syncStatus: 'synced',
    shiftTiming: '8:00 PM - 8:00 AM',
    isOnHoliday: false
  },
  {
    name: 'Mike Davis',
    email: 'mike.davis@company.com',
    phone: '+1 (555) 345-6789',
    status: 'travel',
    syncStatus: 'pending',
    shiftTiming: '7:00 PM - 7:00 AM',
    isOnHoliday: true
  },
  {
    name: 'Lisa Wilson',
    email: 'lisa.wilson@company.com',
    phone: '+1 (555) 456-7890',
    status: 'OOH',
    syncStatus: 'synced',
    shiftTiming: '5:00 PM - 5:00 AM',
    isOnHoliday: false
  },
  {
    name: 'Tom Brown',
    email: 'tom.brown@company.com',
    phone: '+1 (555) 567-8901',
    status: 'completed',
    syncStatus: 'synced',
    shiftTiming: '9:00 PM - 9:00 AM',
    isOnHoliday: false
  },
  {
    name: 'Emma Wilson',
    email: 'emma.wilson@company.com',
    phone: '+1 (555) 678-9012',
    status: 'sick',
    syncStatus: 'synced',
    shiftTiming: '6:00 PM - 6:00 AM',
    isOnHoliday: false
  },
  {
    name: 'David Chen',
    email: 'david.chen@company.com',
    phone: '+1 (555) 789-0123',
    status: 'training',
    syncStatus: 'synced',
    shiftTiming: '7:00 PM - 7:00 AM',
    isOnHoliday: false
  },
  {
    name: 'Sophie Rodriguez',
    email: 'sophie.rodriguez@company.com',
    phone: '+1 (555) 890-1234',
    status: 'OOH',
    syncStatus: 'synced',
    shiftTiming: '8:00 PM - 8:00 AM',
    isOnHoliday: true
  }
];

export const mockCustomers: Customer[] = [
  {
    id: 1,
    name: 'Acme Corporation',
    sites: ['Main Office', 'Warehouse A', 'Warehouse B', 'Distribution Center']
  },
  {
    id: 2,
    name: 'TechStart Inc',
    sites: ['Headquarters', 'R&D Lab', 'Data Center']
  },
  {
    id: 3,
    name: 'Global Manufacturing',
    sites: ['Plant 1', 'Plant 2', 'Quality Control', 'Administration']
  },
  {
    id: 4,
    name: 'Metro Hospital',
    sites: ['Main Building', 'Emergency Wing', 'Parking Garage', 'Cafeteria']
  },
  {
    id: 5,
    name: 'City University',
    sites: ['Library', 'Science Building', 'Student Center', 'Dormitory A', 'Dormitory B']
  }
];

export const mockJobs: Job[] = [
  {
    id: '1',
    jobNumber: 'JOB-240901-001',
    customer: 'Acme Corporation',
    site: 'Main Office',
    description: 'HVAC system maintenance in conference room',
    engineer: 'John Smith',
    status: 'amber',
    priority: 'High',
    category: 'HVAC',
    jobType: 'Maintenance',
    targetCompletionTime: 120,
    dateLogged: new Date('2024-09-01T09:00:00'),
    contact: {
      name: 'Alice Johnson',
      number: '+1 (555) 101-2001',
      email: 'alice.johnson@acme.com',
      relationship: 'Facilities Manager'
    },
    reporter: {
      name: 'Bob Wilson',
      number: '+1 (555) 101-2002',
      email: 'bob.wilson@acme.com',
      relationship: 'Office Manager'
    },
    primaryJobTrade: 'HVAC',
    secondaryJobTrades: ['Electrical'],
    tags: ['Maintenance', 'Scheduled'],
    customAlerts: {
      acceptSLA: 30,
      onsiteSLA: 90,
      completedSLA: 180
    },
    project: 'Q3 Maintenance',
    customerOrderNumber: 'PO-2024-001',
    referenceNumber: 'REF-001',
    jobOwner: 'Facilities Department',
    jobRef1: 'HVAC-001',
    jobRef2: 'MAINT-001',
    requiresApproval: false,
    preferredAppointmentDate: new Date('2024-09-02T10:00:00'),
    startDate: new Date('2024-09-01T09:00:00'),
    endDate: null,
    lockVisitDateTime: false,
    deployToMobile: true,
    isRecurringJob: false,
    completionTimeFromEngineerOnsite: false
  },
  {
    id: '2',
    jobNumber: 'JOB-240901-002',
    customer: 'TechStart Inc',
    site: 'Data Center',
    description: 'Emergency electrical repair - server room power outage',
    engineer: 'Sarah Johnson',
    status: 'red',
    priority: 'Critical',
    category: 'Electrical',
    jobType: 'Emergency',
    targetCompletionTime: 60,
    dateLogged: new Date('2024-09-01T14:30:00'),
    contact: {
      name: 'David Chen',
      number: '+1 (555) 201-3001',
      email: 'david.chen@techstart.com',
      relationship: 'IT Manager'
    },
    reporter: {
      name: 'Emma Davis',
      number: '+1 (555) 201-3002',
      email: 'emma.davis@techstart.com',
      relationship: 'System Administrator'
    },
    primaryJobTrade: 'Electrical',
    secondaryJobTrades: [],
    tags: ['Emergency', 'Critical'],
    customAlerts: {
      acceptSLA: 10,
      onsiteSLA: 30,
      completedSLA: 60
    },
    project: 'Infrastructure',
    customerOrderNumber: 'EMG-2024-001',
    referenceNumber: 'REF-002',
    jobOwner: 'IT Department',
    jobRef1: 'ELEC-002',
    jobRef2: 'EMG-002',
    requiresApproval: false,
    preferredAppointmentDate: new Date('2024-09-01T15:00:00'),
    startDate: new Date('2024-09-01T14:30:00'),
    endDate: null,
    lockVisitDateTime: true,
    deployToMobile: true,
    isRecurringJob: false,
    completionTimeFromEngineerOnsite: false
  },
  {
    id: '3',
    jobNumber: 'JOB-240901-003',
    customer: 'Global Manufacturing',
    site: 'Plant 1',
    description: 'Routine safety inspection of fire suppression system',
    engineer: 'Mike Davis',
    status: 'green',
    priority: 'Medium',
    category: 'Fire Safety',
    jobType: 'Inspection',
    targetCompletionTime: 180,
    dateLogged: new Date('2024-09-01T08:00:00'),
    contact: {
      name: 'Frank Miller',
      number: '+1 (555) 301-4001',
      email: 'frank.miller@globalmfg.com',
      relationship: 'Safety Manager'
    },
    reporter: {
      name: 'Grace Lee',
      number: '+1 (555) 301-4002',
      email: 'grace.lee@globalmfg.com',
      relationship: 'Plant Supervisor'
    },
    primaryJobTrade: 'Fire Safety',
    secondaryJobTrades: ['Electrical'],
    tags: ['Inspection', 'Compliance'],
    customAlerts: {
      acceptSLA: 60,
      onsiteSLA: 180,
      completedSLA: 360
    },
    project: 'Safety Compliance',
    customerOrderNumber: 'INS-2024-001',
    referenceNumber: 'REF-003',
    jobOwner: 'Safety Department',
    jobRef1: 'FIRE-003',
    jobRef2: 'INS-003',
    requiresApproval: true,
    preferredAppointmentDate: new Date('2024-09-02T09:00:00'),
    startDate: new Date('2024-09-01T08:00:00'),
    endDate: null,
    lockVisitDateTime: false,
    deployToMobile: true,
    isRecurringJob: true,
    completionTimeFromEngineerOnsite: false
  },
  {
    id: '4',
    jobNumber: 'JOB-240901-004',
    customer: 'Metro Hospital',
    site: 'Emergency Wing',
    description: 'Plumbing repair in patient bathroom - water leak',
    engineer: 'Lisa Wilson',
    status: 'amber',
    priority: 'High',
    category: 'Plumbing',
    jobType: 'Repair',
    targetCompletionTime: 90,
    dateLogged: new Date('2024-09-01T12:15:00'),
    contact: {
      name: 'Helen Rodriguez',
      number: '+1 (555) 401-5001',
      email: 'helen.rodriguez@metrohospital.com',
      relationship: 'Facilities Coordinator'
    },
    reporter: {
      name: 'Ivan Petrov',
      number: '+1 (555) 401-5002',
      email: 'ivan.petrov@metrohospital.com',
      relationship: 'Maintenance Supervisor'
    },
    primaryJobTrade: 'Plumbing',
    secondaryJobTrades: [],
    tags: ['Repair', 'Urgent'],
    customAlerts: {
      acceptSLA: 20,
      onsiteSLA: 60,
      completedSLA: 120
    },
    project: 'Emergency Wing Maintenance',
    customerOrderNumber: 'REP-2024-001',
    referenceNumber: 'REF-004',
    jobOwner: 'Facilities Department',
    jobRef1: 'PLUMB-004',
    jobRef2: 'REP-004',
    requiresApproval: false,
    preferredAppointmentDate: new Date('2024-09-01T13:00:00'),
    startDate: new Date('2024-09-01T12:15:00'),
    endDate: null,
    lockVisitDateTime: false,
    deployToMobile: true,
    isRecurringJob: false,
    completionTimeFromEngineerOnsite: false
  },
  {
    id: '5',
    jobNumber: 'JOB-240901-005',
    customer: 'City University',
    site: 'Library',
    description: 'Installation of new security cameras in reading areas',
    engineer: 'Tom Brown',
    status: 'green',
    priority: 'Low',
    category: 'Security Systems',
    jobType: 'Installation',
    targetCompletionTime: 240,
    dateLogged: new Date('2024-08-30T10:00:00'),
    contact: {
      name: 'Julia Kim',
      number: '+1 (555) 501-6001',
      email: 'julia.kim@cityuni.edu',
      relationship: 'Library Director'
    },
    reporter: {
      name: 'Kevin O\'Connor',
      number: '+1 (555) 501-6002',
      email: 'kevin.oconnor@cityuni.edu',
      relationship: 'Security Manager'
    },
    primaryJobTrade: 'Security Systems',
    secondaryJobTrades: ['Electrical'],
    tags: ['Installation', 'Scheduled'],
    customAlerts: {
      acceptSLA: 120,
      onsiteSLA: 240,
      completedSLA: 480
    },
    project: 'Campus Security Upgrade',
    customerOrderNumber: 'INST-2024-001',
    referenceNumber: 'REF-005',
    jobOwner: 'Security Department',
    jobRef1: 'SEC-005',
    jobRef2: 'INST-005',
    requiresApproval: true,
    preferredAppointmentDate: new Date('2024-08-30T11:00:00'),
    startDate: new Date('2024-08-30T10:00:00'),
    endDate: new Date('2024-09-01T16:00:00'),
    lockVisitDateTime: false,
    deployToMobile: true,
    isRecurringJob: false,
    completionTimeFromEngineerOnsite: true
  },
  {
    id: '6',
    jobNumber: 'JOB-240902-006',
    customer: 'Acme Corporation',
    site: 'Warehouse A',
    description: 'Painting touch-up work in loading dock area',
    engineer: 'John Smith',
    status: 'green',
    priority: 'Low',
    category: 'Painting',
    jobType: 'Maintenance',
    targetCompletionTime: 300,
    dateLogged: new Date('2024-09-02T07:30:00'),
    contact: {
      name: 'Laura Martinez',
      number: '+1 (555) 101-2003',
      email: 'laura.martinez@acme.com',
      relationship: 'Warehouse Manager'
    },
    reporter: {
      name: 'Mark Thompson',
      number: '+1 (555) 101-2004',
      email: 'mark.thompson@acme.com',
      relationship: 'Dock Supervisor'
    },
    primaryJobTrade: 'Painting',
    secondaryJobTrades: [],
    tags: ['Maintenance', 'Preventive'],
    customAlerts: {
      acceptSLA: 60,
      onsiteSLA: 180,
      completedSLA: 360
    },
    project: 'Warehouse Maintenance',
    customerOrderNumber: 'PAINT-2024-001',
    referenceNumber: 'REF-006',
    jobOwner: 'Warehouse Operations',
    jobRef1: 'PAINT-006',
    jobRef2: 'MAINT-006',
    requiresApproval: false,
    preferredAppointmentDate: new Date('2024-09-03T09:00:00'),
    startDate: new Date('2024-09-02T07:30:00'),
    endDate: null,
    lockVisitDateTime: false,
    deployToMobile: true,
    isRecurringJob: false,
    completionTimeFromEngineerOnsite: false
  },
  {
    id: '7',
    jobNumber: 'JOB-240902-007',
    customer: 'TechStart Inc',
    site: 'Headquarters',
    description: 'Carpet replacement in executive conference room',
    engineer: 'Sarah Johnson',
    status: 'amber',
    priority: 'Medium',
    category: 'Flooring',
    jobType: 'Installation',
    targetCompletionTime: 480,
    dateLogged: new Date('2024-09-02T09:15:00'),
    contact: {
      name: 'Nancy Wilson',
      number: '+1 (555) 201-3003',
      email: 'nancy.wilson@techstart.com',
      relationship: 'Executive Assistant'
    },
    reporter: {
      name: 'Oscar Garcia',
      number: '+1 (555) 201-3004',
      email: 'oscar.garcia@techstart.com',
      relationship: 'Facilities Coordinator'
    },
    primaryJobTrade: 'Flooring',
    secondaryJobTrades: [],
    tags: ['Installation', 'Scheduled'],
    customAlerts: {
      acceptSLA: 30,
      onsiteSLA: 90,
      completedSLA: 180
    },
    project: 'Office Renovation',
    customerOrderNumber: 'FLOOR-2024-001',
    referenceNumber: 'REF-007',
    jobOwner: 'Executive Office',
    jobRef1: 'FLOOR-007',
    jobRef2: 'RENO-007',
    requiresApproval: true,
    preferredAppointmentDate: new Date('2024-09-04T08:00:00'),
    startDate: new Date('2024-09-02T09:15:00'),
    endDate: null,
    lockVisitDateTime: false,
    deployToMobile: true,
    isRecurringJob: false,
    completionTimeFromEngineerOnsite: false
  },
  {
    id: '8',
    jobNumber: 'JOB-240902-008',
    customer: 'Global Manufacturing',
    site: 'Quality Control',
    description: 'Roof leak repair above testing equipment',
    engineer: 'Mike Davis',
    status: 'red',
    priority: 'Critical',
    category: 'Roofing',
    jobType: 'Emergency',
    targetCompletionTime: 120,
    dateLogged: new Date('2024-09-02T11:00:00'),
    contact: {
      name: 'Paul Anderson',
      number: '+1 (555) 301-4003',
      email: 'paul.anderson@globalmfg.com',
      relationship: 'QC Manager'
    },
    reporter: {
      name: 'Quinn Roberts',
      number: '+1 (555) 301-4004',
      email: 'quinn.roberts@globalmfg.com',
      relationship: 'QC Technician'
    },
    primaryJobTrade: 'Roofing',
    secondaryJobTrades: ['Electrical'],
    tags: ['Emergency', 'Critical'],
    customAlerts: {
      acceptSLA: 10,
      onsiteSLA: 30,
      completedSLA: 60
    },
    project: 'Emergency Repairs',
    customerOrderNumber: 'EMG-2024-002',
    referenceNumber: 'REF-008',
    jobOwner: 'Quality Control',
    jobRef1: 'ROOF-008',
    jobRef2: 'EMG-008',
    requiresApproval: false,
    preferredAppointmentDate: new Date('2024-09-02T12:00:00'),
    startDate: new Date('2024-09-02T11:00:00'),
    endDate: null,
    lockVisitDateTime: true,
    deployToMobile: true,
    isRecurringJob: false,
    completionTimeFromEngineerOnsite: false
  },
  {
    id: '9',
    jobNumber: 'JOB-240903-009',
    customer: 'Metro Hospital',
    site: 'Main Building',
    description: 'HVAC filter replacement and system cleaning',
    engineer: 'Lisa Wilson',
    status: 'green',
    priority: 'Medium',
    category: 'HVAC',
    jobType: 'Maintenance',
    targetCompletionTime: 180,
    dateLogged: new Date('2024-09-03T08:00:00'),
    contact: {
      name: 'Rachel Green',
      number: '+1 (555) 401-5003',
      email: 'rachel.green@metrohospital.com',
      relationship: 'Facilities Manager'
    },
    reporter: {
      name: 'Sam Thompson',
      number: '+1 (555) 401-5004',
      email: 'sam.thompson@metrohospital.com',
      relationship: 'Maintenance Coordinator'
    },
    primaryJobTrade: 'HVAC',
    secondaryJobTrades: [],
    tags: ['Maintenance', 'Scheduled'],
    customAlerts: {
      acceptSLA: 60,
      onsiteSLA: 180,
      completedSLA: 360
    },
    project: 'Preventive Maintenance',
    customerOrderNumber: 'PM-2024-001',
    referenceNumber: 'REF-009',
    jobOwner: 'Facilities Department',
    jobRef1: 'HVAC-009',
    jobRef2: 'PM-009',
    requiresApproval: true,
    preferredAppointmentDate: new Date('2024-09-03T09:00:00'),
    startDate: new Date('2024-09-03T08:00:00'),
    endDate: new Date('2024-09-03T11:00:00'),
    lockVisitDateTime: false,
    deployToMobile: true,
    isRecurringJob: true,
    completionTimeFromEngineerOnsite: false
  },
  {
    id: '10',
    jobNumber: 'JOB-240903-010',
    customer: 'City University',
    site: 'Science Building',
    description: 'Electrical panel upgrade for new laboratory equipment',
    engineer: 'Tom Brown',
    status: 'amber',
    priority: 'High',
    category: 'Electrical',
    jobType: 'Installation',
    targetCompletionTime: 360,
    dateLogged: new Date('2024-09-03T10:30:00'),
    contact: {
      name: 'Tina Chen',
      number: '+1 (555) 501-6003',
      email: 'tina.chen@cityuni.edu',
      relationship: 'Lab Manager'
    },
    reporter: {
      name: 'Victor Martinez',
      number: '+1 (555) 501-6004',
      email: 'victor.martinez@cityuni.edu',
      relationship: 'Department Head'
    },
    primaryJobTrade: 'Electrical',
    secondaryJobTrades: ['HVAC'],
    tags: ['Installation', 'Upgrade'],
    customAlerts: {
      acceptSLA: 30,
      onsiteSLA: 90,
      completedSLA: 180
    },
    project: 'Lab Equipment Upgrade',
    customerOrderNumber: 'UPG-2024-001',
    referenceNumber: 'REF-010',
    jobOwner: 'Science Department',
    jobRef1: 'ELEC-010',
    jobRef2: 'UPG-010',
    requiresApproval: true,
    preferredAppointmentDate: new Date('2024-09-04T08:00:00'),
    startDate: new Date('2024-09-03T10:30:00'),
    endDate: null,
    lockVisitDateTime: false,
    deployToMobile: true,
    isRecurringJob: false,
    completionTimeFromEngineerOnsite: false
  }
];