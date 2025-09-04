import { Job, Customer, Engineer } from '@/types/job';

// Utility functions for styling
export const getStatusColor = (status: Job['status']): string => {
  switch (status) {
    case 'new':
      return 'bg-blue-500 text-white border-blue-600 shadow-sm';
    case 'allocated':
      return 'bg-yellow-500 text-white border-yellow-600 shadow-sm';
    case 'attended':
      return 'bg-orange-500 text-white border-orange-600 shadow-sm';
    case 'awaiting_parts':
      return 'bg-purple-500 text-white border-purple-600 shadow-sm';
    case 'completed':
      return 'bg-emerald-500 text-white border-emerald-600 shadow-sm';
    case 'costed':
      return 'bg-emerald-500 text-white border-emerald-600 shadow-sm';
    case 'reqs_invoice':
      return 'bg-emerald-500 text-white border-emerald-600 shadow-sm';
    // Legacy statuses for backward compatibility
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

// Site-Engineer mapping for better job allocation
export const mockSiteEngineersMapping: Record<string, string[]> = {
  'Main Office': ['John Smith', 'Sarah Johnson', 'Mike Wilson'],
  'Warehouse A': ['John Smith', 'David Brown'],
  'Warehouse B': ['Sarah Johnson', 'Mike Wilson'],
  'Distribution Center': ['Mike Wilson', 'David Brown', 'Lisa Davis'],
  'Retail Store 1': ['John Smith', 'Lisa Davis'],
  'Retail Store 2': ['Sarah Johnson', 'Mike Wilson'],
  'Manufacturing Plant': ['David Brown', 'Lisa Davis'],
  'Call Center': ['John Smith', 'Sarah Johnson'],
  'Data Center': ['Mike Wilson', 'David Brown'],
  'Parking Garage': ['Lisa Davis', 'John Smith']
};

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
    name: 'Demo Corporation',
    email: 'info@democorp.com',
    phone: '+44 20 7123 4567',
    sites: ['London HQ', 'Manchester Office', 'Birmingham Site', 'Leeds Branch', 'Edinburgh Office'],
    notes: 'Demo customer for testing purposes'
  },
  {
    id: 2,
    name: 'Tech Solutions Ltd',
    email: 'contact@techsolutions.com',
    phone: '+44 20 7234 5678',
    sites: ['Manchester Office', 'Liverpool Site', 'Cardiff Branch', 'Bristol Office'],
    notes: 'Technology company with multiple office locations'
  },
  {
    id: 3,
    name: 'Industrial Manufacturing',
    email: 'operations@indmanufacturing.com',
    phone: '+44 20 7345 6789',
    sites: ['Birmingham Factory', 'Sheffield Plant', 'Glasgow Factory', 'Newcastle Site'],
    notes: 'Heavy industrial manufacturing company'
  },
  {
    id: 4,
    name: 'Healthcare Systems',
    email: 'support@healthcaresystems.com',
    phone: '+44 20 7456 7890',
    sites: ['London Hospital', 'Manchester Medical Center', 'Birmingham Clinic', 'Leeds Hospital'],
    notes: 'Healthcare facilities requiring regular maintenance'
  },
  {
    id: 5,
    name: 'Retail Chain',
    email: 'facilities@retailchain.com',
    phone: '+44 20 7567 8901',
    sites: ['London Store', 'Manchester Mall', 'Birmingham Outlet', 'Glasgow Center', 'Cardiff Store'],
    notes: 'National retail chain with multiple locations'
  },
  {
    id: 6,
    name: 'Educational Institute',
    email: 'maintenance@eduinst.com',
    phone: '+44 20 7678 9012',
    sites: ['London Campus', 'Manchester University', 'Birmingham College', 'Edinburgh School'],
    notes: 'Educational facilities with diverse maintenance needs'
  },
  {
    id: 7,
    name: 'Financial Services',
    email: 'facilities@financialservices.com',
    phone: '+44 20 7789 0123',
    sites: ['London HQ', 'Manchester Office', 'Birmingham Branch', 'Glasgow Office', 'Cardiff Center'],
    notes: 'Financial services company with high-security requirements'
  },
  {
    id: 8,
    name: 'Transport & Logistics',
    email: 'maintenance@transportlog.com',
    phone: '+44 20 7890 1234',
    sites: ['London Depot', 'Manchester Hub', 'Birmingham Warehouse', 'Liverpool Port', 'Southampton Terminal'],
    notes: 'Transport and logistics company with critical infrastructure'
  }
];

export const mockJobs: Job[] = [
  {
    id: '1',
    jobNumber: 'JOB-2024-001',
    customer: 'Demo Corporation',
    site: 'London HQ',
    description: 'HVAC system malfunction - Air conditioning unit not cooling effectively in server room',
    engineer: 'John Smith',
    status: 'red',
    priority: 'High',
    category: 'HVAC',
    jobType: 'Repair',
    targetCompletionTime: 240,
    dateLogged: new Date('2024-01-15T09:00:00'),
    dateAccepted: new Date('2024-01-15T09:30:00'),
    dateOnSite: new Date('2024-01-15T10:15:00'),
    dateCompleted: null,
    reason: null,
    contact: {
      name: 'Sarah Johnson',
      number: '+447123456789',
      email: 'sarah.johnson@democorp.com',
      relationship: 'Facilities Manager'
    },
    reporter: {
      name: 'Sarah Johnson',
      number: '+447123456789',
      email: 'sarah.johnson@democorp.com',
      relationship: 'Facilities Manager'
    },
    primaryJobTrade: 'HVAC',
    secondaryJobTrades: ['Electrical', 'General'],
    tags: ['HVAC', 'Emergency', 'Cooling', 'Server Room', 'Repair'],
    customAlerts: {
      acceptSLA: 30,
      onsiteSLA: 90,
      completedSLA: 240
    },
    project: 'HVAC Maintenance',
    customerOrderNumber: 'PO-2024-001',
    referenceNumber: 'REF-001',
    jobOwner: 'Facilities Department',
    jobRef1: 'HVAC-001',
    jobRef2: 'SR-001',
    requiresApproval: false,
    preferredAppointmentDate: new Date('2024-01-16T10:00:00'),
    startDate: new Date('2024-01-15T09:00:00'),
    endDate: null,
    lockVisitDateTime: false,
    deployToMobile: true,
    isRecurringJob: false,
    completionTimeFromEngineerOnsite: false
  },
  {
    id: '2',
    jobNumber: 'JOB-2024-002',
    customer: 'Tech Solutions Ltd',
    site: 'Manchester Office',
    description: 'Leaky faucet in breakroom - Constant drip from the breakroom sink faucet',
    engineer: 'Sarah Johnson',
    status: 'amber',
    priority: 'Medium',
    category: 'Plumbing',
    jobType: 'Maintenance',
    targetCompletionTime: 120,
    dateLogged: new Date('2024-01-14T14:30:00'),
    dateAccepted: new Date('2024-01-14T15:00:00'),
    dateOnSite: null,
    dateCompleted: null,
    reason: null,
    contact: {
      name: 'Mike Davis',
      number: '+447234567890',
      email: 'mike.davis@techsolutions.com',
      relationship: 'Office Manager'
    },
    reporter: {
      name: 'Mike Davis',
      number: '+447234567890',
      email: 'mike.davis@techsolutions.com',
      relationship: 'Office Manager'
    },
    primaryJobTrade: 'Plumbing',
    secondaryJobTrades: ['General'],
    tags: ['Plumbing', 'Leak', 'Maintenance', 'Breakroom', 'Faucet'],
    customAlerts: {
      acceptSLA: 60,
      onsiteSLA: 180,
      completedSLA: 360
    },
    project: 'Office Maintenance',
    customerOrderNumber: 'PO-2024-002',
    referenceNumber: 'REF-002',
    jobOwner: 'Office Management',
    jobRef1: 'PLUMB-001',
    jobRef2: 'BR-001',
    requiresApproval: false,
    preferredAppointmentDate: new Date('2024-01-15T09:00:00'),
    startDate: new Date('2024-01-14T14:30:00'),
    endDate: null,
    lockVisitDateTime: false,
    deployToMobile: true,
    isRecurringJob: false,
    completionTimeFromEngineerOnsite: false
  },
  {
    id: '3',
    jobNumber: 'JOB-2024-003',
    customer: 'Industrial Manufacturing',
    site: 'Birmingham Factory',
    description: 'Electrical outlet repair - Several power outlets in production area are not working',
    engineer: 'Mike Davis',
    status: 'green',
    priority: 'High',
    category: 'Electrical',
    jobType: 'Repair',
    targetCompletionTime: 180,
    dateLogged: new Date('2024-01-13T10:00:00'),
    dateAccepted: new Date('2024-01-13T10:15:00'),
    dateOnSite: new Date('2024-01-13T11:00:00'),
    dateCompleted: new Date('2024-01-13T14:00:00'),
    reason: null,
    contact: {
      name: 'Lisa Wilson',
      number: '+447345678901',
      email: 'lisa.wilson@indmanufacturing.com',
      relationship: 'Production Manager'
    },
    reporter: {
      name: 'Lisa Wilson',
      number: '+447345678901',
      email: 'lisa.wilson@indmanufacturing.com',
      relationship: 'Production Manager'
    },
    primaryJobTrade: 'Electrical'
    
    ,
    secondaryJobTrades: ['General'],
    tags: ['Electrical', 'Power', 'Repair', 'Production', 'Outlets'],
    customAlerts: {
      acceptSLA: 30,
      onsiteSLA: 90,
      completedSLA: 180
    },
    project: 'Electrical Maintenance',
    customerOrderNumber: 'PO-2024-003',
    referenceNumber: 'REF-003',
    jobOwner: 'Production Department',
    jobRef1: 'ELEC-001',
    jobRef2: 'PA-001',
    requiresApproval: false,
    preferredAppointmentDate: new Date('2024-01-13T10:00:00'),
    startDate: new Date('2024-01-13T10:00:00'),
    endDate: new Date('2024-01-13T14:00:00'),
    lockVisitDateTime: false,
    deployToMobile: true,
    isRecurringJob: false,
    completionTimeFromEngineerOnsite: false
  },
  {
    id: '4',
    jobNumber: 'JOB-2024-004',
    customer: 'Demo Corporation',
    site: 'London HQ',
    description: 'Routine HVAC maintenance - Annual check-up and filter replacement for all HVAC units',
    engineer: 'John Smith',
    status: 'amber',
    priority: 'Low',
    category: 'HVAC',
    jobType: 'Maintenance',
    targetCompletionTime: 480,
    dateLogged: new Date('2024-01-16T08:00:00'),
    dateAccepted: null,
    dateOnSite: null,
    dateCompleted: null,
    reason: null,
    contact: {
      name: 'Sarah Johnson',
      number: '+447123456789',
      email: 'sarah.johnson@democorp.com',
      relationship: 'Facilities Manager'
    },
    reporter: {
      name: 'Sarah Johnson',
      number: '+447123456789',
      email: 'sarah.johnson@democorp.com',
      relationship: 'Facilities Manager'
    },
    primaryJobTrade: 'HVAC',
    secondaryJobTrades: ['General'],
    tags: ['HVAC', 'Maintenance', 'Scheduled', 'Annual', 'Filters'],
    customAlerts: {
      acceptSLA: 120,
      onsiteSLA: 480,
      completedSLA: 720
    },
    project: 'Annual HVAC Maintenance',
    customerOrderNumber: 'PO-2024-004',
    referenceNumber: 'REF-004',
    jobOwner: 'Facilities Department',
    jobRef1: 'HVAC-002',
    jobRef2: 'ANNUAL-001',
    requiresApproval: false,
    preferredAppointmentDate: new Date('2024-01-17T08:00:00'),
    startDate: new Date('2024-01-16T08:00:00'),
    endDate: null,
    lockVisitDateTime: false,
    deployToMobile: true,
    isRecurringJob: true,
    completionTimeFromEngineerOnsite: false
  },
  {
    id: '5',
    jobNumber: 'JOB-2024-005',
    customer: 'Tech Solutions Ltd',
    site: 'Manchester Office',
    description: 'Emergency pipe burst - Major water leak from a burst pipe in the basement',
    engineer: 'Sarah Johnson',
    status: 'red',
    priority: 'Critical',
    category: 'Plumbing',
    jobType: 'Emergency',
    targetCompletionTime: 360,
    dateLogged: new Date('2024-01-16T10:00:00'),
    dateAccepted: new Date('2024-01-16T10:05:00'),
    dateOnSite: new Date('2024-01-16T10:30:00'),
    dateCompleted: null,
    reason: null,
    contact: {
      name: 'Mike Davis',
      number: '+447234567890',
      email: 'mike.davis@techsolutions.com',
      relationship: 'Office Manager'
    },
    reporter: {
      name: 'Mike Davis',
      number: '+447234567890',
      email: 'mike.davis@techsolutions.com',
      relationship: 'Office Manager'
    },
    primaryJobTrade: 'Plumbing',
    secondaryJobTrades: ['General'],
    tags: ['Plumbing', 'Emergency', 'Water Damage', 'Basement', 'Pipe Burst'],
    customAlerts: {
      acceptSLA: 15,
      onsiteSLA: 60,
      completedSLA: 360
    },
    project: 'Emergency Plumbing',
    customerOrderNumber: 'PO-2024-005',
    referenceNumber: 'REF-005',
    jobOwner: 'Office Management',
    jobRef1: 'PLUMB-002',
    jobRef2: 'EMERG-001',
    requiresApproval: false,
    preferredAppointmentDate: new Date('2024-01-16T10:00:00'),
    startDate: new Date('2024-01-16T10:00:00'),
    endDate: null,
    lockVisitDateTime: false,
    deployToMobile: true,
    isRecurringJob: false,
    completionTimeFromEngineerOnsite: false
  },
  {
    id: '6',
    jobNumber: 'JOB-2024-006',
    customer: 'Demo Corporation',
    site: 'Manchester Office',
    description: 'Security system upgrade - Install new CCTV cameras and update access control system',
    engineer: 'Sophie Rodriguez',
    status: 'new',
    priority: 'Medium',
    category: 'Security Systems',
    jobType: 'Installation',
    targetCompletionTime: 720,
    dateLogged: new Date('2024-01-17T09:00:00'),
    dateAccepted: null,
    dateOnSite: null,
    dateCompleted: null,
    reason: null,
    contact: {
      name: 'David Chen',
      number: '+447456789012',
      email: 'david.chen@democorp.com',
      relationship: 'Security Manager'
    },
    reporter: {
      name: 'David Chen',
      number: '+447456789012',
      email: 'david.chen@democorp.com',
      relationship: 'Security Manager'
    },
    primaryJobTrade: 'Security Systems',
    secondaryJobTrades: ['Electrical', 'General'],
    tags: ['Security', 'Installation', 'CCTV', 'Access Control', 'Upgrade'],
    customAlerts: {
      acceptSLA: 120,
      onsiteSLA: 480,
      completedSLA: 1440
    },
    project: 'Security System Upgrade',
    customerOrderNumber: 'PO-2024-006',
    referenceNumber: 'REF-006',
    jobOwner: 'Security Department',
    jobRef1: 'SEC-001',
    jobRef2: 'UPGRADE-001',
    requiresApproval: true,
    preferredAppointmentDate: new Date('2024-01-18T08:00:00'),
    startDate: new Date('2024-01-17T09:00:00'),
    endDate: null,
    targetAttendanceDate: new Date('2024-01-18T09:00:00'),
    targetAttendanceTime: '09:00',
    allocatedVisitDate: new Date('2024-01-18T09:00:00'),
    allocatedVisitTime: '09:00',
    lockVisitDateTime: false,
    deployToMobile: true,
    isRecurringJob: false,
    completionTimeFromEngineerOnsite: false
  },
  {
    id: '7',
    jobNumber: 'JOB-2024-007',
    customer: 'Tech Solutions Ltd',
    site: 'Manchester Office',
    description: 'Fire alarm system maintenance - Annual testing and inspection of fire detection system',
    engineer: 'Emma Wilson',
    status: 'allocated',
    priority: 'Medium',
    category: 'Fire Safety',
    jobType: 'Maintenance',
    targetCompletionTime: 360,
    dateLogged: new Date('2024-01-16T14:00:00'),
    dateAccepted: null,
    dateOnSite: null,
    dateCompleted: null,
    reason: null,
    contact: {
      name: 'Mike Davis',
      number: '+447234567890',
      email: 'mike.davis@techsolutions.com',
      relationship: 'Office Manager'
    },
    reporter: {
      name: 'Mike Davis',
      number: '+447234567890',
      email: 'mike.davis@techsolutions.com',
      relationship: 'Office Manager'
    },
    primaryJobTrade: 'Fire Safety',
    secondaryJobTrades: ['Electrical', 'General'],
    tags: ['Fire Safety', 'Maintenance', 'Annual', 'Testing', 'Inspection'],
    customAlerts: {
      acceptSLA: 60,
      onsiteSLA: 240,
      completedSLA: 480
    },
    project: 'Annual Fire Safety Check',
    customerOrderNumber: 'PO-2024-007',
    referenceNumber: 'REF-007',
    jobOwner: 'Safety Department',
    jobRef1: 'FIRE-001',
    jobRef2: 'ANNUAL-002',
    requiresApproval: false,
    preferredAppointmentDate: new Date('2024-01-17T09:00:00'),
    startDate: new Date('2024-01-16T14:00:00'),
    endDate: null,
    targetAttendanceDate: new Date('2024-01-17T09:00:00'),
    targetAttendanceTime: '09:00',
    allocatedVisitDate: new Date('2024-01-17T09:00:00'),
    allocatedVisitTime: '09:00',
    lockVisitDateTime: false,
    deployToMobile: true,
    isRecurringJob: true,
    completionTimeFromEngineerOnsite: false
  },
  {
    id: '8',
    jobNumber: 'JOB-2024-008',
    customer: 'Industrial Manufacturing',
    site: 'Birmingham Factory',
    description: 'Production line electrical fault - Intermittent power loss affecting production efficiency',
    engineer: 'Tom Brown',
    status: 'attended',
    priority: 'High',
    category: 'Electrical',
    jobType: 'Repair',
    targetCompletionTime: 300,
    dateLogged: new Date('2024-01-15T16:00:00'),
    dateAccepted: new Date('2024-01-15T16:15:00'),
    dateOnSite: null,
    dateCompleted: null,
    reason: 'Awaiting parts delivery',
    contact: {
      name: 'Lisa Wilson',
      number: '+447345678901',
      email: 'lisa.wilson@indmanufacturing.com',
      relationship: 'Production Manager'
    },
    reporter: {
      name: 'Lisa Wilson',
      number: '+447345678901',
      email: 'lisa.wilson@indmanufacturing.com',
      relationship: 'Production Manager'
    },
    primaryJobTrade: 'Electrical',
    secondaryJobTrades: ['General'],
    tags: ['Electrical', 'Production', 'Power Loss', 'Repair', 'Critical'],
    customAlerts: {
      acceptSLA: 30,
      onsiteSLA: 120,
      completedSLA: 300
    },
    project: 'Production Line Maintenance',
    customerOrderNumber: 'PO-2024-008',
    referenceNumber: 'REF-008',
    jobOwner: 'Production Department',
    jobRef1: 'ELEC-002',
    jobRef2: 'PL-002',
    requiresApproval: false,
    preferredAppointmentDate: new Date('2024-01-16T08:00:00'),
    startDate: new Date('2024-01-15T16:00:00'),
    endDate: null,
    targetAttendanceDate: new Date('2024-01-16T08:00:00'),
    targetAttendanceTime: '08:00',
    allocatedVisitDate: new Date('2024-01-16T08:00:00'),
    allocatedVisitTime: '08:00',
    lockVisitDateTime: false,
    deployToMobile: true,
    isRecurringJob: false,
    completionTimeFromEngineerOnsite: false
  },
  {
    id: '9',
    jobNumber: 'JOB-2024-009',
    customer: 'Demo Corporation',
    site: 'London HQ',
    description: 'Office painting and decoration - Refresh office spaces with new color scheme',
    engineer: 'David Chen',
    status: 'awaiting_parts',
    priority: 'Low',
    category: 'Painting',
    jobType: 'Maintenance',
    targetCompletionTime: 1440,
    dateLogged: new Date('2024-01-14T11:00:00'),
    dateAccepted: new Date('2024-01-14T11:30:00'),
    dateOnSite: new Date('2024-01-15T09:00:00'),
    dateCompleted: null,
    reason: 'Paint supplies delayed',
    contact: {
      name: 'Sarah Johnson',
      number: '+447123456789',
      email: 'sarah.johnson@democorp.com',
      relationship: 'Facilities Manager'
    },
    reporter: {
      name: 'Sarah Johnson',
      number: '+447123456789',
      email: 'sarah.johnson@democorp.com',
      relationship: 'Facilities Manager'
    },
    primaryJobTrade: 'Painting',
    secondaryJobTrades: ['General'],
    tags: ['Painting', 'Decoration', 'Office', 'Refresh', 'Maintenance'],
    customAlerts: {
      acceptSLA: 120,
      onsiteSLA: 480,
      completedSLA: 1440
    },
    project: 'Office Refresh',
    customerOrderNumber: 'PO-2024-009',
    referenceNumber: 'REF-009',
    jobOwner: 'Facilities Department',
    jobRef1: 'PAINT-001',
    jobRef2: 'REFRESH-001',
    requiresApproval: false,
    preferredAppointmentDate: new Date('2024-01-15T09:00:00'),
    startDate: new Date('2024-01-14T11:00:00'),
    endDate: null,
    targetAttendanceDate: new Date('2024-01-15T09:00:00'),
    targetAttendanceTime: '09:00',
    allocatedVisitDate: new Date('2024-01-15T09:00:00'),
    allocatedVisitTime: '09:00',
    lockVisitDateTime: false,
    deployToMobile: true,
    isRecurringJob: false,
    completionTimeFromEngineerOnsite: false
  },
  {
    id: '10',
    jobNumber: 'JOB-2024-010',
    customer: 'Tech Solutions Ltd',
    site: 'Manchester Office',
    description: 'Flooring replacement - Replace worn carpet tiles in meeting rooms and corridors',
    engineer: 'Emma Wilson',
    status: 'completed',
    priority: 'Medium',
    category: 'Flooring',
    jobType: 'Installation',
    targetCompletionTime: 600,
    dateLogged: new Date('2024-01-12T10:00:00'),
    dateAccepted: new Date('2024-01-12T10:15:00'),
    dateOnSite: new Date('2024-01-12T11:00:00'),
    dateCompleted: new Date('2024-01-12T17:00:00'),
    reason: null,
    contact: {
      name: 'Mike Davis',
      number: '+447234567890',
      email: 'mike.davis@techsolutions.com',
      relationship: 'Office Manager'
    },
    reporter: {
      name: 'Mike Davis',
      number: '+447234567890',
      email: 'mike.davis@techsolutions.com',
      relationship: 'Office Manager'
    },
    primaryJobTrade: 'Flooring',
    secondaryJobTrades: ['General'],
    tags: ['Flooring', 'Installation', 'Carpet', 'Meeting Rooms', 'Corridors'],
    customAlerts: {
      acceptSLA: 60,
      onsiteSLA: 240,
      completedSLA: 600
    },
    project: 'Office Flooring Update',
    customerOrderNumber: 'PO-2024-010',
    referenceNumber: 'REF-010',
    jobOwner: 'Facilities Department',
    jobRef1: 'FLOOR-001',
    jobRef2: 'UPDATE-001',
    requiresApproval: false,
    preferredAppointmentDate: new Date('2024-01-12T11:00:00'),
    startDate: new Date('2024-01-12T10:00:00'),
    endDate: new Date('2024-01-12T17:00:00'),
    targetAttendanceDate: new Date('2024-01-12T11:00:00'),
    targetAttendanceTime: '11:00',
    allocatedVisitDate: new Date('2024-01-12T11:00:00'),
    allocatedVisitTime: '11:00',
    lockVisitDateTime: false,
    deployToMobile: true,
    isRecurringJob: false,
    completionTimeFromEngineerOnsite: false
  },
  {
    id: '8',
    jobNumber: 'JOB-2024-008',
    customer: 'Retail Chain',
    site: 'Oxford Street Store',
    description: 'HVAC maintenance - Regular service and filter replacement for air conditioning units',
    engineer: 'John Smith',
    status: 'allocated',
    priority: 'Medium',
    category: 'HVAC',
    jobType: 'Maintenance',
    targetCompletionTime: 120,
    dateLogged: new Date('2024-01-16T08:00:00'),
    dateAccepted: null,
    dateOnSite: null,
    dateCompleted: null,
    reason: null,
    contact: {
      name: 'Emma Thompson',
      number: '+447456789012',
      email: 'emma.thompson@retailchain.com',
      relationship: 'Store Manager'
    },
    reporter: {
      name: 'Emma Thompson',
      number: '+447456789012',
      email: 'emma.thompson@retailchain.com',
      relationship: 'Store Manager'
    },
    primaryJobTrade: 'HVAC',
    secondaryJobTrades: ['General'],
    tags: ['HVAC', 'Maintenance', 'Filter Replacement', 'Regular Service'],
    customAlerts: {
      acceptSLA: 60,
      onsiteSLA: 180,
      completedSLA: 360
    },
    project: 'Store Maintenance',
    customerOrderNumber: 'PO-2024-008',
    referenceNumber: 'REF-008',
    jobOwner: 'Facilities Management',
    jobRef1: 'HVAC-002',
    jobRef2: 'OS-001',
    requiresApproval: false,
    preferredAppointmentDate: new Date('2024-01-17T09:00:00'),
    startDate: new Date('2024-01-16T08:00:00'),
    endDate: null,
    lockVisitDateTime: false,
    deployToMobile: true,
    isRecurringJob: true,
    completionTimeFromEngineerOnsite: false
  },
  {
    id: '9',
    jobNumber: 'JOB-2024-009',
    customer: 'Healthcare Center',
    site: 'Manchester Clinic',
    description: 'Plumbing emergency - Burst pipe in the main corridor causing water damage',
    engineer: 'Sarah Johnson',
    status: 'attended',
    priority: 'Critical',
    category: 'Plumbing',
    jobType: 'Emergency',
    targetCompletionTime: 90,
    dateLogged: new Date('2024-01-16T06:30:00'),
    dateAccepted: new Date('2024-01-16T06:45:00'),
    dateOnSite: new Date('2024-01-16T07:00:00'),
    dateCompleted: null,
    reason: null,
    contact: {
      name: 'Dr. James Brown',
      number: '+447567890123',
      email: 'james.brown@healthcare.com',
      relationship: 'Facilities Director'
    },
    reporter: {
      name: 'Dr. James Brown',
      number: '+447567890123',
      email: 'james.brown@healthcare.com',
      relationship: 'Facilities Director'
    },
    primaryJobTrade: 'Plumbing',
    secondaryJobTrades: ['General', 'Emergency'],
    tags: ['Plumbing', 'Emergency', 'Burst Pipe', 'Water Damage', 'Critical'],
    customAlerts: {
      acceptSLA: 15,
      onsiteSLA: 30,
      completedSLA: 120
    },
    project: 'Emergency Response',
    customerOrderNumber: 'PO-2024-009',
    referenceNumber: 'REF-009',
    jobOwner: 'Emergency Services',
    jobRef1: 'PLUMB-002',
    jobRef2: 'MC-001',
    requiresApproval: false,
    preferredAppointmentDate: new Date('2024-01-16T07:00:00'),
    startDate: new Date('2024-01-16T06:30:00'),
    endDate: null,
    lockVisitDateTime: true,
    deployToMobile: true,
    isRecurringJob: false,
    completionTimeFromEngineerOnsite: false
  },
  {
    id: '10',
    jobNumber: 'JOB-2024-010',
    customer: 'Office Complex',
    site: 'Canary Wharf Tower',
    description: 'Security system upgrade - Install new access control system for main entrance',
    engineer: 'Mike Davis',
    status: 'allocated',
    priority: 'High',
    category: 'Security Systems',
    jobType: 'Installation',
    targetCompletionTime: 480,
    dateLogged: new Date('2024-01-15T14:00:00'),
    dateAccepted: null,
    dateOnSite: null,
    dateCompleted: null,
    reason: null,
    contact: {
      name: 'Alex Chen',
      number: '+447678901234',
      email: 'alex.chen@officecomplex.com',
      relationship: 'IT Manager'
    },
    reporter: {
      name: 'Alex Chen',
      number: '+447678901234',
      email: 'alex.chen@officecomplex.com',
      relationship: 'IT Manager'
    },
    primaryJobTrade: 'Security Systems',
    secondaryJobTrades: ['Electrical', 'IT'],
    tags: ['Security', 'Installation', 'Access Control', 'Main Entrance', 'Upgrade'],
    customAlerts: {
      acceptSLA: 120,
      onsiteSLA: 360,
      completedSLA: 720
    },
    project: 'Security Upgrade',
    customerOrderNumber: 'PO-2024-010',
    referenceNumber: 'REF-010',
    jobOwner: 'IT Department',
    jobRef1: 'SEC-001',
    jobRef2: 'CW-001',
    requiresApproval: true,
    preferredAppointmentDate: new Date('2024-01-18T09:00:00'),
    startDate: new Date('2024-01-15T14:00:00'),
    endDate: null,
    lockVisitDateTime: false,
    deployToMobile: true,
    isRecurringJob: false,
    completionTimeFromEngineerOnsite: false
  },
  {
    id: '11',
    jobNumber: 'JOB-2024-011',
    customer: 'Data Center',
    site: 'Manchester Hub',
    description: 'Emergency power backup system failure - UPS system not functioning properly',
    engineer: 'John Smith',
    status: 'allocated',
    priority: 'Critical',
    category: 'Electrical',
    jobType: 'Emergency',
    targetCompletionTime: 120,
    dateLogged: new Date('2024-01-17T08:00:00'),
    dateAccepted: null,
    dateOnSite: null,
    dateCompleted: null,
    reason: null,
    contact: {
      name: 'David Wilson',
      number: '+447890123456',
      email: 'david.wilson@datacenter.com',
      relationship: 'Operations Manager'
    },
    reporter: {
      name: 'David Wilson',
      number: '+447890123456',
      email: 'david.wilson@datacenter.com',
      relationship: 'Operations Manager'
    },
    primaryJobTrade: 'Electrical',
    secondaryJobTrades: ['Emergency', 'Critical Systems'],
    tags: ['Electrical', 'Emergency', 'UPS', 'Power Backup', 'Critical'],
    customAlerts: {
      acceptSLA: 15,
      onsiteSLA: 30,
      completedSLA: 90
    },
    project: 'Emergency Response',
    customerOrderNumber: 'PO-2024-011',
    referenceNumber: 'REF-011',
    jobOwner: 'Operations',
    jobRef1: 'ELEC-002',
    jobRef2: 'DC-001',
    requiresApproval: false,
    preferredAppointmentDate: new Date('2024-01-17T08:30:00'),
    startDate: new Date('2024-01-17T08:00:00'),
    endDate: null,
    lockVisitDateTime: true,
    deployToMobile: true,
    isRecurringJob: false,
    completionTimeFromEngineerOnsite: false
  },
  {
    id: '12',
    jobNumber: 'JOB-2024-012',
    customer: 'Shopping Mall',
    site: 'Birmingham Central',
    description: 'Escalator maintenance - Annual service and safety inspection required',
    engineer: 'Sarah Johnson',
    status: 'attended',
    priority: 'Medium',
    category: 'Mechanical',
    jobType: 'Maintenance',
    targetCompletionTime: 240,
    dateLogged: new Date('2024-01-16T09:00:00'),
    dateAccepted: new Date('2024-01-16T09:15:00'),
    dateOnSite: new Date('2024-01-16T09:45:00'),
    dateCompleted: null,
    reason: null,
    contact: {
      name: 'Emma Brown',
      number: '+447901234567',
      email: 'emma.brown@shoppingmall.com',
      relationship: 'Facilities Manager'
    },
    reporter: {
      name: 'Emma Brown',
      number: '+447901234567',
      email: 'emma.brown@shoppingmall.com',
      relationship: 'Facilities Manager'
    },
    primaryJobTrade: 'Mechanical',
    secondaryJobTrades: ['Safety', 'Inspection'],
    tags: ['Mechanical', 'Maintenance', 'Escalator', 'Annual Service', 'Safety'],
    customAlerts: {
      acceptSLA: 60,
      onsiteSLA: 180,
      completedSLA: 360
    },
    project: 'Annual Maintenance',
    customerOrderNumber: 'PO-2024-012',
    referenceNumber: 'REF-012',
    jobOwner: 'Facilities',
    jobRef1: 'MECH-001',
    jobRef2: 'BC-001',
    requiresApproval: false,
    preferredAppointmentDate: new Date('2024-01-17T09:00:00'),
    startDate: new Date('2024-01-16T09:00:00'),
    endDate: null,
    lockVisitDateTime: false,
    deployToMobile: true,
    isRecurringJob: true,
    completionTimeFromEngineerOnsite: false
  },
  {
    id: '13',
    jobNumber: 'JOB-2024-013',
    customer: 'Hotel Chain',
    site: 'Liverpool Waterfront',
    description: 'HVAC system repair - Air conditioning not working in conference rooms',
    engineer: 'Mike Davis',
    status: 'allocated',
    priority: 'High',
    category: 'HVAC',
    jobType: 'Repair',
    targetCompletionTime: 180,
    dateLogged: new Date('2024-01-17T10:00:00'),
    dateAccepted: null,
    dateOnSite: null,
    dateCompleted: null,
    reason: null,
    contact: {
      name: 'Lisa Thompson',
      number: '+447912345678',
      email: 'lisa.thompson@hotelchain.com',
      relationship: 'Maintenance Supervisor'
    },
    reporter: {
      name: 'Lisa Thompson',
      number: '+447912345678',
      email: 'lisa.thompson@hotelchain.com',
      relationship: 'Maintenance Supervisor'
    },
    primaryJobTrade: 'HVAC',
    secondaryJobTrades: ['Repair', 'Conference Rooms'],
    tags: ['HVAC', 'Repair', 'Air Conditioning', 'Conference Rooms', 'High Priority'],
    customAlerts: {
      acceptSLA: 45,
      onsiteSLA: 120,
      completedSLA: 300
    },
    project: 'Conference Room HVAC',
    customerOrderNumber: 'PO-2024-013',
    referenceNumber: 'REF-013',
    jobOwner: 'Maintenance',
    jobRef1: 'HVAC-003',
    jobRef2: 'LW-001',
    requiresApproval: false,
    preferredAppointmentDate: new Date('2024-01-18T09:00:00'),
    startDate: new Date('2024-01-17T10:00:00'),
    endDate: null,
    lockVisitDateTime: false,
    deployToMobile: true,
    isRecurringJob: false,
    completionTimeFromEngineerOnsite: false
  },
  {
    id: '14',
    jobNumber: 'JOB-2024-014',
    customer: 'University Campus',
    site: 'Leeds Main Building',
    description: 'Fire alarm system testing - Monthly fire safety system inspection and testing',
    engineer: 'John Smith',
    status: 'attended',
    priority: 'Low',
    category: 'Fire Safety',
    jobType: 'Inspection',
    targetCompletionTime: 120,
    dateLogged: new Date('2024-01-17T08:30:00'),
    dateAccepted: new Date('2024-01-17T08:45:00'),
    dateOnSite: new Date('2024-01-17T09:00:00'),
    dateCompleted: null,
    reason: null,
    contact: {
      name: 'Dr. Robert Green',
      number: '+447923456789',
      email: 'robert.green@university.com',
      relationship: 'Safety Officer'
    },
    reporter: {
      name: 'Dr. Robert Green',
      number: '+447923456789',
      email: 'robert.green@university.com',
      relationship: 'Safety Officer'
    },
    primaryJobTrade: 'Fire Safety',
    secondaryJobTrades: ['Inspection', 'Testing'],
    tags: ['Fire Safety', 'Inspection', 'Monthly', 'Testing', 'Campus'],
    customAlerts: {
      acceptSLA: 120,
      onsiteSLA: 240,
      completedSLA: 480
    },
    project: 'Monthly Safety Inspection',
    customerOrderNumber: 'PO-2024-014',
    referenceNumber: 'REF-014',
    jobOwner: 'Safety Department',
    jobRef1: 'FS-002',
    jobRef2: 'LMB-001',
    requiresApproval: false,
    preferredAppointmentDate: new Date('2024-01-18T09:00:00'),
    startDate: new Date('2024-01-17T08:30:00'),
    endDate: null,
    lockVisitDateTime: false,
    deployToMobile: true,
    isRecurringJob: true,
    completionTimeFromEngineerOnsite: false
  }
];

// Local Storage Utilities for Jobs
export const JOB_STORAGE_KEY = 'mockPortalJobs';
export const CUSTOMER_STORAGE_KEY = 'mockPortalCustomers';
export const NOTES_STORAGE_KEY = 'mockPortalNotes';
export const COMMUNICATION_STORAGE_KEY = 'mockPortalCommunication';
export const ENGINEER_STORAGE_KEY = 'mockPortalEngineers';
export const SITE_NOTES_STORAGE_KEY = 'mockPortalSiteNotes';

// Generic localStorage utilities
export const saveToStorage = (key: string, data: any) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error(`Failed to save ${key} to localStorage:`, error);
  }
};

export const loadFromStorage = (key: string, defaultValue: any) => {
  try {
    const savedData = localStorage.getItem(key);
    if (savedData) {
      return JSON.parse(savedData);
    }
  } catch (error) {
    console.error(`Failed to load ${key} from localStorage:`, error);
  }
  return defaultValue;
};

export const clearFromStorage = (key: string) => {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error(`Failed to clear ${key} from localStorage:`, error);
  }
};

// Jobs localStorage
export const saveJobsToStorage = (jobs: Job[]) => {
  saveToStorage(JOB_STORAGE_KEY, jobs);
};

export const loadJobsFromStorage = (): Job[] => {
  const savedJobs = loadFromStorage(JOB_STORAGE_KEY, mockJobs);
  if (Array.isArray(savedJobs)) {
    // Convert date strings back to Date objects
    return savedJobs.map((job: any) => ({
      ...job,
      dateLogged: new Date(job.dateLogged),
      dateAccepted: job.dateAccepted ? new Date(job.dateAccepted) : null,
      dateOnSite: job.dateOnSite ? new Date(job.dateOnSite) : null,
      dateCompleted: job.dateCompleted ? new Date(job.dateCompleted) : null,
      preferredAppointmentDate: job.preferredAppointmentDate ? new Date(job.preferredAppointmentDate) : null,
      startDate: job.startDate ? new Date(job.startDate) : null,
      endDate: job.endDate ? new Date(job.endDate) : null,
    }));
  }
  return mockJobs;
};

export const clearJobsFromStorage = () => {
  clearFromStorage(JOB_STORAGE_KEY);
};

// Customers localStorage
export const saveCustomersToStorage = (customers: Customer[]) => {
  saveToStorage(CUSTOMER_STORAGE_KEY, customers);
};

export const loadCustomersFromStorage = (): Customer[] => {
  return loadFromStorage(CUSTOMER_STORAGE_KEY, mockCustomers);
};

export const clearCustomersFromStorage = () => {
  clearFromStorage(CUSTOMER_STORAGE_KEY);
};

// Notes localStorage
export const saveNotesToStorage = (notes: any[]) => {
  saveToStorage(NOTES_STORAGE_KEY, notes);
};

export const loadNotesFromStorage = (): any[] => {
  return loadFromStorage(NOTES_STORAGE_KEY, []);
};

export const clearNotesFromStorage = () => {
  clearFromStorage(NOTES_STORAGE_KEY);
};

// Communication Timeline localStorage
export const saveCommunicationToStorage = (communications: any[]) => {
  saveToStorage(COMMUNICATION_STORAGE_KEY, communications);
};

export const loadCommunicationFromStorage = (): any[] => {
  return loadFromStorage(COMMUNICATION_STORAGE_KEY, []);
};

export const clearCommunicationFromStorage = () => {
  clearFromStorage(COMMUNICATION_STORAGE_KEY);
};

// Engineers localStorage
export const saveEngineersToStorage = (engineers: Engineer[]) => {
  saveToStorage(ENGINEER_STORAGE_KEY, engineers);
};

export const loadEngineersFromStorage = (): Engineer[] => {
  return loadFromStorage(ENGINEER_STORAGE_KEY, mockEngineers);
};

export const clearEngineersFromStorage = () => {
  clearFromStorage(ENGINEER_STORAGE_KEY);
};

// Site Notes localStorage
export const saveSiteNotesToStorage = (siteNotes: any[]) => {
  saveToStorage(SITE_NOTES_STORAGE_KEY, siteNotes);
};

export const loadSiteNotesFromStorage = (): any[] => {
  return loadFromStorage(SITE_NOTES_STORAGE_KEY, []);
};

export const clearSiteNotesFromStorage = () => {
  clearFromStorage(SITE_NOTES_STORAGE_KEY);
};

// Clear all localStorage data
export const clearAllStorage = () => {
  clearJobsFromStorage();
  clearCustomersFromStorage();
  clearNotesFromStorage();
  clearCommunicationFromStorage();
  clearEngineersFromStorage();
  clearSiteNotesFromStorage();
};

// Reset all data to mock defaults
export const resetAllToMockData = () => {
  clearAllStorage();
  return {
    jobs: mockJobs,
    customers: mockCustomers,
    engineers: mockEngineers,
    notes: [],
    communications: [],
    siteNotes: []
  };
};