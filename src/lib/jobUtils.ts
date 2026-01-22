import { Job, Customer, Engineer } from '@/types/job';
import { mockJobs } from './mockData';

export { mockJobs };

// Utility functions for styling
export const getStatusColor = (status: Job['status'] | 'green' | 'amber' | 'red'): string => {
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

export const getEngineerStatusColor = (status: string): string => {
  switch (status) {
    case 'OOH':
    case 'available':
      return 'bg-green-500';
    case 'On call':
    case 'on_job':
      return 'bg-blue-500';
    case 'travel':
    case 'traveling':
      return 'bg-amber-500';
    case 'off_duty':
      return 'bg-gray-400';
    default:
      return 'bg-gray-400';
  }
};

// Professional numbering system
const getCurrentYear = () => new Date().getFullYear().toString();
const getCurrentDate = () => {
  const now = new Date();
  const month = (now.getMonth() + 1).toString().padStart(2, '0');
  const day = now.getDate().toString().padStart(2, '0');
  return `${month}${day}`;
};

// Generate professional job number: JOB-YYYY-MMDD-001
export const generateJobNumber = (): string => {
  const year = getCurrentYear();
  const date = getCurrentDate();

  // Get existing jobs to determine next sequence number
  const existingJobs = loadJobsFromStorage();
  const todayJobs = existingJobs.filter(job =>
    job.jobNumber.startsWith(`JOB-${year}-${date}`)
  );

  const nextSequence = (todayJobs.length + 1).toString().padStart(3, '0');
  return `JOB-${year}-${date}-${nextSequence}`;
};

// Generate professional customer number: CUST-YYYY-001
export const generateCustomerNumber = (): string => {
  const year = getCurrentYear();

  // Get existing customers to determine next sequence number
  const existingCustomers = loadFromStorage('customers', []);
  const yearCustomers = existingCustomers.filter((customer: any) =>
    customer.customerNumber && customer.customerNumber.startsWith(`CUST-${year}`)
  );

  const nextSequence = (yearCustomers.length + 1).toString().padStart(3, '0');
  return `CUST-${year}-${nextSequence}`;
};

// Generate professional site number: SITE-YYYY-001
export const generateSiteNumber = (): string => {
  const year = getCurrentYear();

  // Get existing sites to determine next sequence number
  const existingSites = loadFromStorage('sites', []);
  const yearSites = existingSites.filter((site: any) =>
    site.siteNumber && site.siteNumber.startsWith(`SITE-${year}`)
  );

  const nextSequence = (yearSites.length + 1).toString().padStart(3, '0');
  return `SITE-${year}-${nextSequence}`;
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
    customerNumber: 'CUST-2025-001',
    name: 'Demo Corporation',
    email: 'info@democorp.com',
    phone: '+44 20 7123 4567',
    sites: ['London HQ', 'Manchester Office', 'Birmingham Site', 'Leeds Branch', 'Edinburgh Office'],
    notes: 'Demo customer for testing purposes'
  },
  {
    id: 2,
    customerNumber: 'CUST-2025-002',
    name: 'Tech Solutions Ltd',
    email: 'contact@techsolutions.com',
    phone: '+44 20 7234 5678',
    sites: ['Manchester Office', 'Liverpool Site', 'Cardiff Branch', 'Bristol Office'],
    notes: 'Technology company with multiple office locations'
  },
  {
    id: 3,
    customerNumber: 'CUST-2025-003',
    name: 'Industrial Manufacturing',
    email: 'operations@indmanufacturing.com',
    phone: '+44 20 7345 6789',
    sites: ['Birmingham Factory', 'Sheffield Plant', 'Glasgow Factory', 'Newcastle Site'],
    notes: 'Heavy industrial manufacturing company'
  },
  {
    id: 4,
    customerNumber: 'CUST-2025-004',
    name: 'Healthcare Systems',
    email: 'support@healthcaresystems.com',
    phone: '+44 20 7456 7890',
    sites: ['London Hospital', 'Manchester Medical Center', 'Birmingham Clinic', 'Leeds Hospital'],
    notes: 'Healthcare facilities requiring regular maintenance'
  },
  {
    id: 5,
    customerNumber: 'CUST-2025-005',
    name: 'Retail Chain',
    email: 'facilities@retailchain.com',
    phone: '+44 20 7567 8901',
    sites: ['London Store', 'Manchester Mall', 'Birmingham Outlet', 'Glasgow Center', 'Cardiff Store'],
    notes: 'National retail chain with multiple locations'
  },
  {
    id: 6,
    customerNumber: 'CUST-2025-006',
    name: 'Educational Institute',
    email: 'maintenance@eduinst.com',
    phone: '+44 20 7678 9012',
    sites: ['London Campus', 'Manchester University', 'Birmingham College', 'Edinburgh School'],
    notes: 'Educational facilities with diverse maintenance needs'
  },
  {
    id: 7,
    customerNumber: 'CUST-2025-007',
    name: 'Financial Services',
    email: 'facilities@financialservices.com',
    phone: '+44 20 7789 0123',
    sites: ['London HQ', 'Manchester Office', 'Birmingham Branch', 'Glasgow Office', 'Cardiff Center'],
    notes: 'Financial services company with high-security requirements'
  },
  {
    id: 8,
    customerNumber: 'CUST-2025-008',
    name: 'Transport & Logistics',
    email: 'maintenance@transportlog.com',
    phone: '+44 20 7890 1234',
    sites: ['London Depot', 'Manchester Hub', 'Birmingham Warehouse', 'Liverpool Port', 'Southampton Terminal'],
    notes: 'Transport and logistics company with critical infrastructure'
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
      targetAttendanceDate: job.targetAttendanceDate ? new Date(job.targetAttendanceDate) : null,
      allocatedVisitDate: job.allocatedVisitDate ? new Date(job.allocatedVisitDate) : null,
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