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
    name: 'Demo Corporation',
    email: 'info@democorp.com',
    phone: '+44 20 7123 4567',
    sites: ['London HQ', 'Manchester Office', 'Birmingham Site'],
    notes: 'Demo customer for testing purposes'
  }
];

export const mockJobs: Job[] = [
  {
    id: '1',
    jobNumber: 'JOB-2024-001',
    customer: 'Demo Corporation',
    site: 'London HQ',
    description: 'Demo job for testing the system - HVAC maintenance required',
    engineer: 'John Smith',
    status: 'amber',
    priority: 'Medium',
    category: 'HVAC',
    jobType: 'Maintenance',
    targetCompletionTime: 120,
    dateLogged: new Date('2024-01-15T09:00:00'),
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
    secondaryJobTrades: ['Electrical', 'General'],
    tags: ['Demo', 'Maintenance', 'HVAC'],
    customAlerts: {
      acceptSLA: 30,
      onsiteSLA: 90,
      completedSLA: 180
    },
    project: 'Demo Project',
    customerOrderNumber: 'PO-2024-001',
    referenceNumber: 'REF-001',
    jobOwner: 'Demo Department',
    jobRef1: 'DEMO-001',
    jobRef2: 'TEST-001',
    requiresApproval: false,
    preferredAppointmentDate: new Date('2024-01-16T10:00:00'),
    startDate: new Date('2024-01-15T09:00:00'),
    endDate: null,
    lockVisitDateTime: false,
    deployToMobile: true,
    isRecurringJob: false,
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