import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Job, JobAlert, Customer, Engineer } from '@/types/job';
import { mockJobs, mockEngineers, getStatusColor, getPriorityColor } from '@/lib/jobUtils';
import StatusBadge from './StatusBadge';
import {
  Bell,
  Search,
  Filter,
  CheckCircle,
  Clock,
  AlertTriangle,
  XCircle,
  ArrowLeft,
  Eye,
  Check,
  X,
  Plus,
  User,
  MapPin,
  Building2,
  Briefcase,
  Calendar,
  Phone,
  Mail,
  ChevronDown,
  FileText,
  Wrench,
  MapPinIcon,
  Globe,

  Settings
} from 'lucide-react';
import CreateAlertModal from './CreateAlertModal';
import CustomPromptModal from '@/components/ui/custom-prompt-modal';
import { toast } from '@/components/ui/sonner';

interface GlobalAlertsPortalProps {
  onBack: () => void;
  onJobUpdate: (job: Job) => void;
  customers: Customer[];
  jobs: Job[];
}

interface SystemAlert extends JobAlert {
  jobId: string;
  jobNumber: string;
  customer: string;
  site: string;
  engineer: string;
  priority: Job['priority'];
  status: Job['status'];
  resolved: boolean;
  resolvedBy?: string;
  resolvedAt?: Date;
  resolution?: string;
}

interface EngineerActionAlert {
  id: string;
  type: 'ENGINEER_ACCEPT' | 'ENGINEER_ONSITE';
  jobId: string;
  jobNumber: string;
  customer: string;
  site: string;
  engineer: string;
  priority: Job['priority'];
  status: Job['status'];
  timestamp: Date;
  acknowledged: boolean;
  resolved: boolean;
  resolvedBy?: string;
  resolvedAt?: Date;
  resolution?: string;
}

interface SiteInfo {
  name: string;
  customer: string;
  customerId: number;
  totalJobs: number;
  activeJobs: number;
  completedJobs: number;
  criticalJobs: number;
  urgentJobs: number;
  lastJobDate: Date | null;
  engineers: string[];
}

interface SiteAlert {
  id: string;
  siteId: string;
  customerId: string;
  type: 'SLA_VIOLATION' | 'EQUIPMENT_ISSUE' | 'ACCESS_PROBLEM' | 'SAFETY_CONCERN' | 'MAINTENANCE_OVERDUE';
  message: string;
  timestamp: Date;
  severity: 'low' | 'medium' | 'high' | 'critical';
  acknowledged: boolean;
  resolved: boolean;
  resolvedBy?: string;
  resolvedAt?: Date;
  resolution?: string;
}

interface NewSite {
  name: string;
  customer: string;
  address: string;
  city: string;
  postcode: string;
  contactPerson: string;
  phone: string;
  email: string;
  siteType: string;
  accessNotes: string;
  specialRequirements: string;
}

export default function GlobalAlertsPortal({ onBack, onJobUpdate, customers, jobs }: GlobalAlertsPortalProps) {
  // Main alerts and filters with local storage
  const [searchQuery, setSearchQuery] = useState(() => 
    localStorage.getItem('globalAlerts_searchQuery') || ''
  );
  const [statusFilter, setStatusFilter] = useState<string>(() => 
    localStorage.getItem('globalAlerts_statusFilter') || 'all'
  );
  const [priorityFilter, setPriorityFilter] = useState<string>(() => 
    localStorage.getItem('globalAlerts_priorityFilter') || 'all'
  );
  const [alertTypeFilter, setAlertTypeFilter] = useState<string>(() => 
    localStorage.getItem('globalAlerts_alertTypeFilter') || 'all'
  );
  const [resolvedFilter, setResolvedFilter] = useState<string>(() => 
    localStorage.getItem('globalAlerts_resolvedFilter') || 'unresolved'
  );
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [customAlerts, setCustomAlerts] = useState<SystemAlert[]>([
    {
      id: `custom-customer-1`,
      type: 'CUSTOMER_ISSUE',
      message: 'Premium customer contract renewal pending - requires immediate attention',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 8), // 8 hours ago
      acknowledged: false,
      jobId: 'customer-alert-1',
      jobNumber: 'CUST-001',
      customer: 'Fairway Holdings Ltd',
      site: 'London HQ',
      engineer: 'Unassigned',
      priority: 'High',
        status: 'attended',
      resolved: false,
      severity: 'high'
    },
    {
      id: `custom-customer-2`,
      type: 'CUSTOMER_ISSUE',
      message: 'Equipment maintenance completed successfully',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
      acknowledged: true,
      jobId: 'customer-alert-2',
      jobNumber: 'CUST-002',
      customer: 'TechCorp Solutions',
      site: 'Manchester Office',
      engineer: 'John Smith',
      priority: 'Medium',
      status: 'completed',
      resolved: true,
      resolvedBy: 'System',
      resolvedAt: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
      resolution: 'Maintenance completed successfully',
      severity: 'medium'
    },
    {
      id: `custom-customer-3`,
      type: 'CUSTOMER_ISSUE',
      message: 'Site access issue resolved',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4), // 4 hours ago
      acknowledged: true,
      jobId: 'customer-alert-3',
      jobNumber: 'CUST-003',
      customer: 'Global Industries',
      site: 'Birmingham Plant',
      engineer: 'Sarah Johnson',
      priority: 'Low',
      status: 'completed',
      resolved: true,
      resolvedBy: 'System',
      resolvedAt: new Date(Date.now() - 1000 * 60 * 60), // 1 hour ago
      resolution: 'Access credentials updated and tested',
      severity: 'low'
    },
    {
      id: `custom-customer-2`,
      type: 'CUSTOMER_SLA',
      message: 'SLA violation for VIP customer - 3 unresolved tickets over 48 hours',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 24 hours ago
      acknowledged: false,
      jobId: 'customer-alert-2',
      jobNumber: 'CUST-002',
      customer: 'Axis Technology Partners',
      site: 'Manchester Office',
      engineer: 'Unassigned',
      priority: 'Critical',
        status: 'allocated',
      resolved: false,
      severity: 'high'
    }
  ]);
  const [showResolutionModal, setShowResolutionModal] = useState(false);
  const [selectedAlertForResolution, setSelectedAlertForResolution] = useState<SystemAlert | null>(null);

  // Engineer alerts
  const [engineerAlerts, setEngineerAlerts] = useState<EngineerActionAlert[]>([]);
  const [selectedEngineerAlert, setSelectedEngineerAlert] = useState<EngineerActionAlert | null>(null);
  const [isEngineerDetailModalOpen, setIsEngineerDetailModalOpen] = useState(false);
  const [activeEngineerTab, setActiveEngineerTab] = useState(() => 
    localStorage.getItem('globalAlerts_activeEngineerTab') || 'active'
  );
  const [showEngineerNotificationsDropdown, setShowEngineerNotificationsDropdown] = useState(false);
  const [showEngineerResolutionModal, setShowEngineerResolutionModal] = useState(false);

  // Sites functionality
  const [customerFilter, setCustomerFilter] = useState<string>('all');
  const [showAddSite, setShowAddSite] = useState(false);
  const [selectedSite, setSelectedSite] = useState<SiteInfo | null>(null);
  const [showSiteAlerts, setShowSiteAlerts] = useState(false);
  const [siteAlerts, setSiteAlerts] = useState<SiteAlert[]>([
    {
      id: '1',
      siteId: 'London HQ',
      customerId: 'Demo Corporation',
      type: 'SLA_VIOLATION',
      message: 'HVAC maintenance overdue by 3 days',
      timestamp: new Date('2024-01-15T10:00:00'),
      severity: 'high',
      acknowledged: false,
      resolved: false
    },
    {
      id: '2',
      siteId: 'Manchester Office',
      customerId: 'Demo Corporation',
      type: 'EQUIPMENT_ISSUE',
      message: 'Fire alarm system showing fault',
      timestamp: new Date('2024-01-14T15:30:00'),
      severity: 'critical',
      acknowledged: true,
      resolved: false
    },
    {
      id: '3',
      siteId: 'Birmingham Site',
      customerId: 'Demo Corporation',
      type: 'ACCESS_PROBLEM',
      message: 'Security card reader malfunction',
      timestamp: new Date('2024-01-13T09:15:00'),
      severity: 'medium',
      acknowledged: false,
      resolved: false
    }
  ]);
  const [newSite, setNewSite] = useState<NewSite>({
    name: '',
    customer: '',
    address: '',
    city: '',
    postcode: '',
    contactPerson: '',
    phone: '',
    email: '',
    siteType: '',
    accessNotes: '',
    specialRequirements: ''
  });

  // Main tabs with local storage
  const [activeMainTab, setActiveMainTab] = useState(() => 
    localStorage.getItem('globalAlerts_activeMainTab') || 'system-alerts'
  );

  // Save state to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('globalAlerts_searchQuery', searchQuery);
  }, [searchQuery]);

  useEffect(() => {
    localStorage.setItem('globalAlerts_statusFilter', statusFilter);
  }, [statusFilter]);

  useEffect(() => {
    localStorage.setItem('globalAlerts_priorityFilter', priorityFilter);
  }, [priorityFilter]);

  useEffect(() => {
    localStorage.setItem('globalAlerts_alertTypeFilter', alertTypeFilter);
  }, [alertTypeFilter]);

  useEffect(() => {
    localStorage.setItem('globalAlerts_resolvedFilter', resolvedFilter);
  }, [resolvedFilter]);

  useEffect(() => {
    localStorage.setItem('globalAlerts_activeMainTab', activeMainTab);
  }, [activeMainTab]);

  useEffect(() => {
    localStorage.setItem('globalAlerts_activeEngineerTab', activeEngineerTab);
  }, [activeEngineerTab]);

  // Regenerate alerts when jobs prop changes
  useEffect(() => {
    const newSystemAlerts = generateSystemAlerts();
    const newEngineerAlerts = generateEngineerActionAlerts();
    setSystemAlerts([...customAlerts, ...newSystemAlerts]);
    
    // Process engineer alerts - add resolution details for resolved alerts
    setEngineerAlerts(prevAlerts => {
      // Keep all previously resolved alerts
      const existingResolvedAlerts = prevAlerts.filter(alert => alert.resolved);
      
      // Process new alerts and add resolution details for resolved ones
      const processedAlerts = newEngineerAlerts.map(alert => {
        const job = jobs.find(j => j.id === alert.jobId);
        if (!job) return alert;
        
        // If alert is already resolved, add resolution details
        if (alert.resolved) {
          if (alert.type === 'ENGINEER_ACCEPT' && job.dateAccepted) {
            return {
              ...alert,
              resolvedBy: 'System',
              resolvedAt: job.dateAccepted,
              resolution: 'Job automatically accepted by engineer'
            };
          }
          
          if (alert.type === 'ENGINEER_ONSITE' && job.dateOnSite) {
            return {
              ...alert,
              resolvedBy: 'System',
              resolvedAt: job.dateOnSite,
              resolution: 'Engineer automatically arrived on site'
            };
          }
        }
        
        return alert;
      });
      
      // Separate active and resolved alerts
      const activeAlerts = processedAlerts.filter(alert => !alert.resolved);
      const newlyResolvedAlerts = processedAlerts.filter(alert => alert.resolved);
      
      // Combine existing resolved alerts with newly resolved ones, avoiding duplicates
      const allResolvedAlerts = [...existingResolvedAlerts];
      newlyResolvedAlerts.forEach(alert => {
        if (!allResolvedAlerts.some(existing => 
          existing.jobId === alert.jobId && existing.type === alert.type
        )) {
          allResolvedAlerts.push(alert);
        }
      });
      
      // Return all resolved alerts first, then active alerts
      const finalAlerts = [...allResolvedAlerts, ...activeAlerts];
      console.log('Final alerts state:', finalAlerts.length, 'resolved:', allResolvedAlerts.length, 'active:', activeAlerts.length);
      return finalAlerts;
    });
  }, [jobs, customAlerts]);
  
  // Generate system alerts from jobs
  const generateSystemAlerts = (): SystemAlert[] => {
    const alerts: SystemAlert[] = [];

    jobs.forEach(job => {
      // Generate alerts based on job status and timing
      const now = new Date();
      const timeSinceLogged = now.getTime() - job.dateLogged.getTime();
      const timeSinceAccepted = job.dateAccepted ? now.getTime() - job.dateAccepted.getTime() : null;
      const timeSinceOnSite = job.dateOnSite ? now.getTime() - job.dateOnSite.getTime() : null;

      // ACCEPTED SLA Alert
      if (!job.dateAccepted && timeSinceLogged > job.customAlerts.acceptSLA * 60000) {
        alerts.push({
          id: `accept-${job.id}`,
          type: 'ACCEPTED',
          message: `Job ${job.jobNumber} has not been accepted within SLA (${job.customAlerts.acceptSLA} minutes)`,
          timestamp: new Date(job.dateLogged.getTime() + job.customAlerts.acceptSLA * 60000),
          acknowledged: false,
          jobId: job.id,
          jobNumber: job.jobNumber,
          customer: job.customer,
          site: job.site,
          engineer: job.engineer,
          priority: job.priority,
          status: job.status,
          resolved: false
        });
      }

      // ONSITE SLA Alert
      if (job.dateAccepted && !job.dateOnSite && timeSinceAccepted && timeSinceAccepted > job.customAlerts.onsiteSLA * 60000) {
        alerts.push({
          id: `onsite-${job.id}`,
          type: 'ONSITE',
          message: `Job ${job.jobNumber} engineer has not arrived on site within SLA (${job.customAlerts.onsiteSLA} minutes)`,
          timestamp: new Date(job.dateAccepted.getTime() + job.customAlerts.onsiteSLA * 60000),
          acknowledged: false,
          jobId: job.id,
          jobNumber: job.jobNumber,
          customer: job.customer,
          site: job.site,
          engineer: job.engineer,
          priority: job.priority,
          status: job.status,
          resolved: false
        });
      }

      // COMPLETED SLA Alert
      if (job.dateOnSite && !job.dateCompleted && timeSinceOnSite && timeSinceOnSite > job.customAlerts.completedSLA * 60000) {
        alerts.push({
          id: `completed-${job.id}`,
          type: 'COMPLETED',
          message: `Job ${job.jobNumber} has not been completed within SLA (${job.customAlerts.completedSLA} minutes)`,
          timestamp: new Date(job.dateOnSite.getTime() + job.customAlerts.completedSLA * 60000),
          acknowledged: false,
          jobId: job.id,
          jobNumber: job.jobNumber,
          customer: job.customer,
          site: job.site,
          engineer: job.engineer,
          priority: job.priority,
          status: job.status,
          resolved: false
        });
      }

      // OVERDUE Alert for critical jobs
      if (job.priority === 'Critical' && !job.dateCompleted) {
        alerts.push({
          id: `overdue-${job.id}`,
          type: 'OVERDUE',
          message: `Job ${job.jobNumber} is overdue and requires immediate attention`,
          timestamp: new Date(job.dateLogged.getTime() + job.targetCompletionTime * 60000),
          acknowledged: false,
          jobId: job.id,
          jobNumber: job.jobNumber,
          customer: job.customer,
          site: job.site,
          engineer: job.engineer,
          priority: job.priority,
          status: job.status,
          resolved: false
        });
      }
    });

    return alerts.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  };

  // Generate Engineer Action Alerts from jobs
  const generateEngineerActionAlerts = (): EngineerActionAlert[] => {
    const alerts: EngineerActionAlert[] = [];

    jobs.forEach(job => {
      // Engineer Accept Alert - for jobs that are allocated (regardless of acceptance status)
      if (job.status === 'allocated') {
        alerts.push({
          id: `engineer-accept-${job.id}`,
          type: 'ENGINEER_ACCEPT',
          jobId: job.id,
          jobNumber: job.jobNumber,
          customer: job.customer,
          site: job.site,
          engineer: job.engineer,
          priority: job.priority,
          status: job.status,
          timestamp: job.dateLogged,
          acknowledged: false,
          resolved: job.dateAccepted ? true : false // Mark as resolved if already accepted
        });
      }

      // Engineer Onsite Alert - for jobs that are accepted (regardless of onsite status)
      if (job.dateAccepted) {
        alerts.push({
          id: `engineer-onsite-${job.id}`,
          type: 'ENGINEER_ONSITE',
          jobId: job.id,
          jobNumber: job.jobNumber,
          customer: job.customer,
          site: job.site,
          engineer: job.engineer,
          priority: job.priority,
          status: job.status,
          timestamp: job.dateAccepted,
          acknowledged: false,
          resolved: job.dateOnSite ? true : false // Mark as resolved if already on site
        });
      }
    });

    return alerts.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  };

  // Get all unique sites with aggregated information
  const getSitesInfo = (): SiteInfo[] => {
    const sitesMap = new Map<string, SiteInfo>();

    jobs.forEach(job => {
      if (!sitesMap.has(job.site)) {
        const customer = customers.find(c => c.name === job.customer);
        sitesMap.set(job.site, {
          name: job.site,
          customer: job.customer,
          customerId: customer?.id || 0,
          totalJobs: 0,
          activeJobs: 0,
          completedJobs: 0,
          criticalJobs: 0,
          urgentJobs: 0,
          lastJobDate: null,
          engineers: []
        });
      }

      const siteInfo = sitesMap.get(job.site)!;
      siteInfo.totalJobs++;

      if (['completed', 'costed', 'reqs_invoice'].includes(job.status)) {
        siteInfo.completedJobs++;
      } else {
        siteInfo.activeJobs++;
      }

      if (job.priority === 'Critical') {
        siteInfo.criticalJobs++;
        siteInfo.urgentJobs++;
      }

      if (!siteInfo.engineers.includes(job.engineer)) {
        siteInfo.engineers.push(job.engineer);
      }

      if (!siteInfo.lastJobDate || new Date(job.dateLogged) > siteInfo.lastJobDate) {
        siteInfo.lastJobDate = new Date(job.dateLogged);
      }
    });

    return Array.from(sitesMap.values()).sort((a, b) => b.totalJobs - a.totalJobs);
  };

  // Handle clicking outside engineer notifications dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showEngineerNotificationsDropdown && !(event.target as Element).closest('.engineer-notifications-dropdown')) {
        setShowEngineerNotificationsDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showEngineerNotificationsDropdown]);

  // Generate engineer alerts when jobs change
  useEffect(() => {
    const newEngineerAlerts = generateEngineerActionAlerts();
    setEngineerAlerts(newEngineerAlerts);
  }, [jobs]);

  const [systemAlerts, setSystemAlerts] = useState<SystemAlert[]>(generateSystemAlerts());
  const allAlerts = [...systemAlerts, ...customAlerts];

  // Sites data
  const sitesInfo = getSitesInfo();
  const allCustomers = Array.from(new Set(customers.map(c => c.name))).sort();

  // Calculate overall statistics for sites
  const totalStats = {
    sites: sitesInfo.length,
    totalJobs: sitesInfo.reduce((sum, site) => sum + site.totalJobs, 0),
    activeJobs: sitesInfo.reduce((sum, site) => sum + site.activeJobs, 0),
    completedJobs: sitesInfo.reduce((sum, site) => sum + site.completedJobs, 0),
    criticalJobs: sitesInfo.reduce((sum, site) => sum + site.criticalJobs, 0),
    urgentJobs: sitesInfo.reduce((sum, site) => sum + site.urgentJobs, 0)
  };

  // Engineer alerts data - reactive to current state
  const activeEngineerAlerts = engineerAlerts.filter(alert => !alert.resolved);
  const resolvedEngineerAlerts = engineerAlerts.filter(alert => alert.resolved);
  
  // Debug logging
  console.log('Total engineer alerts:', engineerAlerts.length);
  console.log('Active alerts:', activeEngineerAlerts.length);
  console.log('Resolved alerts:', resolvedEngineerAlerts.length);
  console.log('Resolved alerts data:', resolvedEngineerAlerts);

  // Filter sites based on search and filters
  const filteredSites = sitesInfo.filter(site => {
    const matchesSearch = searchQuery === '' ||
      site.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      site.customer.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCustomer = customerFilter === 'all' || site.customer === customerFilter;

    const matchesStatus = statusFilter === 'all' ||
      (statusFilter === 'active' && site.activeJobs > 0) ||
      (statusFilter === 'completed' && site.completedJobs > 0) ||
      (statusFilter === 'urgent' && site.urgentJobs > 0);

    const matchesPriority = priorityFilter === 'all' ||
      (priorityFilter === 'critical' && site.criticalJobs > 0);

    return matchesSearch && matchesCustomer && matchesStatus && matchesPriority;
  });

  const filteredAlerts = allAlerts.filter(alert => {
    const matchesSearch =
      alert.jobNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      alert.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      alert.site.toLowerCase().includes(searchQuery.toLowerCase()) ||
      alert.engineer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      alert.message.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'all' || alert.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || alert.priority === priorityFilter;
    const matchesAlertType = alertTypeFilter === 'all' || alert.type === alertTypeFilter;
    const matchesResolved = resolvedFilter === 'all' ||
      (resolvedFilter === 'resolved' && alert.resolved) ||
      (resolvedFilter === 'unresolved' && !alert.resolved);

    return matchesSearch && matchesStatus && matchesPriority && matchesAlertType && matchesResolved;
  });

  // Helper functions
  const getEngineerDetails = (engineerName: string): Engineer | null => {
    return mockEngineers.find(e => e.name === engineerName) || null;
  };

  const getPriorityColor = (priority: Job['priority']) => {
    switch (priority) {
      case 'Critical':
        return 'bg-red-600 text-white';
      case 'High':
        return 'bg-orange-500 text-white';
      case 'Medium':
        return 'bg-yellow-500 text-white';
      case 'Low':
        return 'bg-green-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  const getAlertIcon = (type: EngineerActionAlert['type']) => {
    switch (type) {
      case 'ENGINEER_ACCEPT':
        return <User className="h-5 w-5 text-blue-600" />;
      case 'ENGINEER_ONSITE':
        return <MapPin className="h-5 w-5 text-green-600" />;
      default:
        return <AlertTriangle className="h-5 w-5 text-gray-600" />;
    }
  };

  const getAlertColor = (type: EngineerActionAlert['type']) => {
    switch (type) {
      case 'ENGINEER_ACCEPT':
        return 'bg-blue-50 border-blue-200 hover:bg-blue-100';
      case 'ENGINEER_ONSITE':
        return 'bg-green-50 border-green-200 hover:bg-green-100';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const getAlertTitle = (type: EngineerActionAlert['type']) => {
    switch (type) {
      case 'ENGINEER_ACCEPT':
        return 'Engineer Accept Alert';
      case 'ENGINEER_ONSITE':
        return 'Engineer Onsite Alert';
      default:
        return 'Alert';
    }
  };

  const getAlertDescription = (type: EngineerActionAlert['type'], jobNumber: string) => {
    switch (type) {
      case 'ENGINEER_ACCEPT':
        return `Engineer needs to accept job ${jobNumber}`;
      case 'ENGINEER_ONSITE':
        return `Engineer needs to arrive on site for job ${jobNumber}`;
      default:
        return 'Action required';
    }
  };

  const getAlertSeverityColor = (severity: SiteAlert['severity']) => {
    switch (severity) {
      case 'critical': return 'bg-red-500 text-white';
      case 'high': return 'bg-orange-500 text-white';
      case 'medium': return 'bg-yellow-500 text-white';
      case 'low': return 'bg-blue-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getAlertTypeIcon = (type: SiteAlert['type']) => {
    switch (type) {
      case 'SLA_VIOLATION': return <Clock className="h-4 w-4" />;
      case 'EQUIPMENT_ISSUE': return <AlertTriangle className="h-4 w-4" />;
      case 'ACCESS_PROBLEM': return <User className="h-4 w-4" />;
      case 'SAFETY_CONCERN': return <AlertTriangle className="h-4 w-4" />;
      case 'MAINTENANCE_OVERDUE': return <Wrench className="h-4 w-4" />;
      default: return <AlertTriangle className="h-4 w-4" />;
    }
  };

  // Handler functions
  const handleEngineerAlertClick = (alert: EngineerActionAlert) => {
    setSelectedEngineerAlert(alert);
    setIsEngineerDetailModalOpen(true);
  };

  const handleCallEngineer = (engineerName: string) => {
    const engineer = mockEngineers.find(e => e.name === engineerName);
    if (engineer) {
      window.open(`tel:${engineer.phone}`, '_self');
    }
  };

  const handleResolveEngineerAlert = (alertId: string, resolution: string) => {
    const alert = engineerAlerts.find(a => a.id === alertId);
    if (alert) {
      const job = jobs.find(j => j.id === alert.jobId);
      if (job) {
        const updatedJob = { ...job };

        if (alert.type === 'ENGINEER_ACCEPT') {
          updatedJob.dateAccepted = new Date();
          updatedJob.status = 'attended';
        } else if (alert.type === 'ENGINEER_ONSITE') {
          updatedJob.dateOnSite = new Date();
          updatedJob.status = 'attended';
        }

        // Update alerts state immediately
        setEngineerAlerts(prevAlerts =>
          prevAlerts.map(a =>
            a.id === alertId
              ? {
                  ...a,
                  resolved: true,
                  resolvedBy: 'Current User',
                  resolvedAt: new Date(),
                  resolution
                }
              : a
          )
        );

        // Update the job
        onJobUpdate(updatedJob);
        
        // Show success toast notification to engineer
        toast.success('Job Status Updated', {
          description: `Job ${job.jobNumber} has been ${alert.type === 'ENGINEER_ACCEPT' ? 'accepted' : 'marked as onsite'} successfully.`,
          duration: 5000
        });
        
        // Show global notification to relevant teams
        toast.info('Engineer Action Completed', {
          description: `${alert.engineer} has ${alert.type === 'ENGINEER_ACCEPT' ? 'accepted' : 'arrived onsite for'} job ${job.jobNumber} at ${job.site}.`,
          duration: 7000
        });
        
        // Auto-dismiss container and close modals ONLY after successful resolution
        setTimeout(() => {
          setIsEngineerDetailModalOpen(false);
          setSelectedEngineerAlert(null);
          setShowEngineerResolutionModal(false);
          setShowEngineerNotificationsDropdown(false);
        }, 1000); // Small delay to show the success notification
      } else {
        // Job not found - show error
        toast.error('Error', {
          description: 'Job not found. Please try again.',
          duration: 5000
        });
      }
    } else {
      // Alert not found - show error
      toast.error('Error', {
        description: 'Alert not found. Please try again.',
        duration: 5000
      });
    }
  };

  const handleSiteClick = (site: SiteInfo) => {
    setSelectedSite(site);
  };

  const handleBackToSites = () => {
    setSelectedSite(null);
    setShowSiteAlerts(false);
  };

  const handleAcknowledgeAlert = (alertId: string) => {
    setSiteAlerts(prev => prev.map(alert =>
      alert.id === alertId ? { ...alert, acknowledged: true } : alert
    ));
  };

  const handleResolveSiteAlert = (alertId: string, resolution: string) => {
    setSiteAlerts(prev => prev.map(alert =>
      alert.id === alertId ? {
        ...alert,
        resolved: true,
        resolvedBy: 'Current User',
        resolvedAt: new Date(),
        resolution
      } : alert
    ));
  };

  const handleAddSite = () => {
    if (newSite.name && newSite.customer && newSite.address) {
      console.log('Adding new site:', newSite);
      setNewSite({
        name: '',
        customer: '',
        address: '',
        city: '',
        postcode: '',
        contactPerson: '',
        phone: '',
        email: '',
        siteType: '',
        accessNotes: '',
        specialRequirements: ''
      });
      setShowAddSite(false);
    }
  };

  const loadDemoData = () => {
    setNewSite({
      name: 'Main Office Building',
      customer: 'Demo Corporation',
      address: '123 Business Park Drive',
      city: 'Manchester',
      postcode: 'M1 1AA',
      contactPerson: 'John Smith',
      phone: '0161 123 4567',
      email: 'john.smith@democorp.com',
      siteType: 'Office',
      accessNotes: 'Main entrance, security badge required, parking available',
      specialRequirements: '24/7 access, CCTV monitored, fire alarm system'
    });
  };

  const getSiteAlerts = (siteName: string): SiteAlert[] => {
    return siteAlerts.filter(alert => alert.siteId === siteName);
  };

  const getSiteJobs = (siteName: string): Job[] => {
    return jobs.filter(job => job.site === siteName);
  };

  const handleResolveAlert = (alertId: string, resolution: string) => {
    // Check if it's a custom alert
    if (alertId.startsWith('custom-')) {
      setCustomAlerts(prev => prev.map(alert => 
        alert.id === alertId 
          ? { 
              ...alert, 
              resolved: true, 
              resolvedBy: 'Current User', 
              resolvedAt: new Date(),
              resolution 
            }
          : alert
      ));
    } else {
      // Find the alert
      const systemAlert = systemAlerts.find(a => a.id === alertId);
      const engineerAlert = engineerAlerts.find(a => a.id === alertId);
      
      // Update system alerts
      if (systemAlert) {
        setSystemAlerts(prev => 
          prev.map(alert => 
            alert.id === alertId 
              ? { 
                  ...alert, 
                  resolved: true, 
                  resolvedBy: 'Current User', 
                  resolvedAt: new Date(),
                  resolution 
                }
              : alert
          )
        );

        // Update job if alert has a jobId
        if (systemAlert.jobId) {
          const job = jobs.find(j => j.id === systemAlert.jobId);
          if (job) {
            const updatedJob = { ...job };
            
            // Add resolution to the job's alerts
            if (updatedJob.alerts) {
              updatedJob.alerts = updatedJob.alerts.map(alert => 
                alert.id === alertId 
                  ? { ...alert, resolved: true, resolution, resolvedAt: new Date(), resolvedBy: 'Current User' }
                  : alert
              );
            }
            
            onJobUpdate(updatedJob);
            
            // Force refresh of alerts after job update
            setTimeout(() => {
              const newSystemAlerts = generateSystemAlerts();
              setSystemAlerts([...customAlerts, ...newSystemAlerts]);
            }, 100);
          }
        }
      } 
      // Update engineer alerts
      else if (engineerAlert) {
        setEngineerAlerts(prev => 
          prev.map(alert => 
            alert.id === alertId 
              ? { 
                  ...alert, 
                  resolved: true, 
                  resolvedBy: 'Current User', 
                  resolvedAt: new Date(),
                  resolution 
                }
              : alert
          )
        );

        // Update job
        const job = jobs.find(j => j.id === engineerAlert.jobId);
        if (job) {
          const updatedJob = { ...job };
          
          if (engineerAlert.type === 'ENGINEER_ACCEPT') {
            updatedJob.dateAccepted = new Date();
            updatedJob.status = 'attended';
          } else if (engineerAlert.type === 'ENGINEER_ONSITE') {
            updatedJob.dateOnSite = new Date();
            updatedJob.status = 'attended';
          }
          
          onJobUpdate(updatedJob);
          
          // Show success toast notification to engineer
          toast.success('Job Status Updated', {
            description: `Job ${job.jobNumber} has been ${engineerAlert.type === 'ENGINEER_ACCEPT' ? 'accepted' : 'marked as onsite'} successfully.`,
            duration: 5000
          });
          
          // Show global notification to relevant teams
          toast.info('Engineer Action Completed', {
            description: `${engineerAlert.engineer} has ${engineerAlert.type === 'ENGINEER_ACCEPT' ? 'accepted' : 'arrived onsite for'} job ${job.jobNumber} at ${job.site}.`,
            duration: 7000
          });
          
          // Job update will trigger useEffect to regenerate alerts while preserving resolved ones
          
          // Auto-dismiss container and close modals ONLY after successful resolution
          setTimeout(() => {
            setSelectedAlertForResolution(null);
            setShowResolutionModal(false);
          }, 1000); // Small delay to show the success notification
        } else {
          // Job not found - show error
          toast.error('Error', {
            description: 'Job not found. Please try again.',
            duration: 5000
          });
        }
      } else {
        // Alert not found - show error
        toast.error('Error', {
          description: 'Alert not found. Please try again.',
          duration: 5000
        });
      }
    }
    
    // Close all modals immediately for system alerts
    setSelectedAlertForResolution(null);
    setShowResolutionModal(false);
  };

  const handleCreateAlert = (alertData: {
    jobId: string;
    type: string;
    message: string;
    severity: 'low' | 'medium' | 'high';
    priority: string;
  }) => {
    const job = mockJobs.find(j => j.id === alertData.jobId);
    if (!job) return;

    const newAlert: SystemAlert = {
      id: `custom-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      jobId: alertData.jobId,
      jobNumber: job.jobNumber,
      customer: job.customer,
      site: job.site,
      engineer: job.engineer,
      priority: job.priority,
      status: job.status,
      type: alertData.type,
      message: alertData.message,
      severity: alertData.severity,
      timestamp: new Date(),
      acknowledged: false,
      resolved: false
    };

    setCustomAlerts(prev => [...prev, newAlert]);
    console.log('Alert created successfully:', newAlert);
  };



  const getSystemAlertIcon = (type: JobAlert['type']) => {
    switch (type) {
      case 'ENGINEER_ACCEPT':
        return <User className="h-4 w-4" />;
      case 'ENGINEER_ONSITE':
        return <MapPin className="h-4 w-4" />;
      case 'ACCEPTED':
        return <Clock className="h-4 w-4" />;
      case 'ONSITE':
        return <AlertTriangle className="h-4 w-4" />;
      case 'COMPLETED':
        return <XCircle className="h-4 w-4" />;
      case 'OVERDUE':
        return <Bell className="h-4 w-4" />;
      case 'CUSTOMER_ISSUE':
        return <Building2 className="h-4 w-4" />;
      case 'CUSTOMER_SLA':
        return <Clock className="h-4 w-4" />;
      case 'SITE_ISSUE':
        return <MapPin className="h-4 w-4" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };

  const getSystemAlertColor = (type: JobAlert['type']) => {
    switch (type) {
      case 'ENGINEER_ACCEPT':
        return 'bg-blue-50 border-blue-200';
      case 'ENGINEER_ONSITE':
        return 'bg-green-50 border-green-200';
      case 'ACCEPTED':
        return 'bg-amber-50 border-amber-200';
      case 'ONSITE':
        return 'bg-orange-50 border-orange-200';
      case 'COMPLETED':
        return 'bg-red-50 border-red-200';
      case 'OVERDUE':
        return 'bg-red-50 border-red-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  // Calculate metrics based on selected tab - reactive to current state
  const getStats = () => {
    switch (activeMainTab) {
      case 'engineer-alerts':
        return {
          total: engineerAlerts.length,
          unresolved: engineerAlerts.filter(a => !a.resolved).length,
          resolved: engineerAlerts.filter(a => a.resolved).length,
          critical: engineerAlerts.filter(a => a.priority === 'Critical' && !a.resolved).length,
          title: 'Engineer Alerts'
        };
      case 'system-alerts':
      default:
        return {
          total: allAlerts.length,
          unresolved: allAlerts.filter(a => !a.resolved).length,
          resolved: allAlerts.filter(a => a.resolved).length,
          critical: allAlerts.filter(a => a.priority === 'Critical' && !a.resolved).length,
          title: 'System Alerts'
        };
    }
  };
  
  const stats = getStats();

  return (
    <div className="min-h-screen space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Global Alerts Portal</h1>
          <p className="text-muted-foreground mt-2">
            Monitor and manage all system alerts across all customers and jobs
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            onClick={() => setIsCreateModalOpen(true)} 
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            Create Alert
          </Button>
          <Button onClick={onBack} variant="outline" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12 mt-5">
        <Card 
          className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-105 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 hover:border-blue-300"
          onClick={() => setActiveMainTab('system-alerts')}
        >
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-700 font-medium">System Alerts</p>
                <p className="text-3xl font-bold text-blue-900">{allAlerts.length + engineerAlerts.length}</p>
              </div>
              <Bell className="h-10 w-10 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card 
          className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-105 bg-gradient-to-br from-red-50 to-red-100 border-red-200 hover:border-red-300"
          onClick={() => {
            setActiveMainTab('system-alerts');
            setResolvedFilter('unresolved');
          }}
        >
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-red-700 font-medium">Unresolved</p>
                <p className="text-3xl font-bold text-red-900">{allAlerts.filter(a => !a.resolved).length + activeEngineerAlerts.length}</p>
              </div>
              <AlertTriangle className="h-10 w-10 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card 
          className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-105 bg-gradient-to-br from-green-50 to-green-100 border-green-200 hover:border-green-300"
          onClick={() => {
            setActiveMainTab('system-alerts');
            setResolvedFilter('resolved');
          }}
        >
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-700 font-medium">Resolved</p>
                <p className="text-3xl font-bold text-green-900">{allAlerts.filter(a => a.resolved).length + resolvedEngineerAlerts.length}</p>
              </div>
              <CheckCircle className="h-10 w-10 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card 
          className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-105 bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 hover:border-purple-300"
          onClick={() => {
            setActiveMainTab('engineer-alerts');
            setPriorityFilter('Critical');
          }}
        >
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-700 font-medium">Critical</p>
                <p className="text-3xl font-bold text-purple-900">{engineerAlerts.filter(a => a.priority === 'Critical' && !a.resolved).length}</p>
              </div>
              <XCircle className="h-10 w-10 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs */}
      <div className="mt-8 mb-6">
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-2">
          <Tabs value={activeMainTab} onValueChange={setActiveMainTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-gray-100 p-1 rounded-lg">
              <TabsTrigger 
                value="system-alerts" 
                className="flex items-center justify-center gap-2 py-3 px-4 rounded-md transition-all duration-200 data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-blue-600 data-[state=inactive]:text-gray-600 hover:text-gray-800"
              >
                <Bell className="h-5 w-5" />
                <span className="font-medium">System Alerts</span>
              </TabsTrigger>
              <TabsTrigger 
                value="engineer-alerts" 
                className="flex items-center justify-center gap-2 py-3 px-4 rounded-md transition-all duration-200 data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-blue-600 data-[state=inactive]:text-gray-600 hover:text-gray-800"
              >
                <User className="h-5 w-5" />
                <span className="font-medium">Engineer Alerts</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="system-alerts" className="mt-8">
              {/* Search and Filters */}
              <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
                <div className="flex flex-col lg:flex-row gap-4">
                  {/* Search Bar */}
                  <div className="flex items-center gap-3 flex-1">
                    <Search className="text-gray-400 h-5 w-5" />
                <Input
                      placeholder="Search alerts by job number, customer, site, or engineer..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                      className="h-12 text-base border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              
                  {/* Filter Dropdowns */}
                  <div className="flex flex-wrap gap-3">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="w-40 h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                        <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="green">Completed</SelectItem>
                  <SelectItem value="amber">In Progress</SelectItem>
                  <SelectItem value="red">Issues</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                      <SelectTrigger className="w-40 h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                        <SelectValue placeholder="All Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priority</SelectItem>
                  <SelectItem value="Critical">Critical</SelectItem>
                  <SelectItem value="High">High</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="Low">Low</SelectItem>
                </SelectContent>
              </Select>

              <Select value={alertTypeFilter} onValueChange={setAlertTypeFilter}>
                      <SelectTrigger className="w-48 h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                        <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="ENGINEER_ACCEPT">Engineer Accept</SelectItem>
                  <SelectItem value="ENGINEER_ONSITE">Engineer Onsite</SelectItem>
                  <SelectItem value="ACCEPTED">Accept SLA</SelectItem>
                  <SelectItem value="ONSITE">Onsite SLA</SelectItem>
                  <SelectItem value="COMPLETED">Complete SLA</SelectItem>
                  <SelectItem value="OVERDUE">Overdue</SelectItem>
                </SelectContent>
              </Select>

              <Select value={resolvedFilter} onValueChange={setResolvedFilter}>
                      <SelectTrigger className="w-40 h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                  <SelectValue placeholder="Resolution" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unresolved">Unresolved</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                  <SelectItem value="all">All</SelectItem>
                </SelectContent>
              </Select>
            </div>
                </div>
              </div>

        {/* Alert Categories */}
        <div className="space-y-12">
          {/* Customer Alerts */}
          <div>
            <h2 className="text-xl font-bold mb-6">Customer Alerts</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredAlerts
                .filter(alert => alert.type.includes("CUSTOMER"))
                .map((alert) => (
                <Card 
                  key={alert.id} 
                  className={`${alert.resolved ? 'opacity-80' : ''} cursor-pointer hover:shadow-md transition-shadow`}
                >
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      {/* Header */}
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-semibold text-sm">{alert.customer} - {alert.site}</p>
                          <p className="text-xs text-muted-foreground">Job Number: {alert.jobNumber}</p>
                          </div>
                        <div className="flex flex-col items-end space-y-1">
                          <Badge 
                            variant="secondary" 
                            className={`${
                              alert.priority === 'Critical' ? 'bg-red-100 text-red-700 border-red-200' : 
                              alert.priority === 'High' ? 'bg-orange-100 text-orange-700 border-orange-200' : 
                              'bg-blue-100 text-blue-700 border-blue-200'
                            } text-xs`}
                          >
                            {alert.priority}
                          </Badge>
                        {alert.resolved && (
                            <Badge variant="default" className="bg-green-100 text-green-700 border-green-200 text-xs">
                            Resolved
                          </Badge>
                        )}
                        </div>
                      </div>
                      
                      {/* Message */}
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {alert.message}
                        </p>
                          </div>

                      {/* Site */}
                      <div className="flex items-center space-x-1">
                        <MapPin className="h-3 w-3 text-gray-400" />
                        <p className="text-xs font-medium">{alert.site}</p>
                        </div>

                      {/* Engineer */}
                      <div className="flex items-center space-x-1">
                        <User className="h-3 w-3 text-gray-400" />
                        <p className="text-xs">{alert.engineer}</p>
                          </div>
                          
                      {/* Time and Action */}
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>{alert.timestamp.toLocaleDateString()}</span>
                          {!alert.resolved && (
                            <Button
                              variant="ghost"
                              size="sm"
                            className="text-green-600 hover:text-green-700 hover:bg-green-50 text-xs px-2 py-1 h-6"
                              onClick={() => {
                                setSelectedAlertForResolution(alert);
                                setShowResolutionModal(true);
                              }}
                            >
                            <Check className="h-3 w-3 mr-1" />
                              Resolve
                            </Button>
                          )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
          
          {/* Job Alerts */}
          <div>
            <h2 className="text-xl font-bold mb-6">Job Alerts</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredAlerts
                .filter(alert => !alert.type.includes("CUSTOMER") && !alert.type.includes("SITE"))
                .map((alert) => (
                <Card 
                  key={alert.id} 
                  className={`${alert.resolved ? 'opacity-80' : ''} cursor-pointer hover:shadow-md transition-shadow`}
                >
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      {/* Header */}
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-semibold text-sm">{alert.customer} - {alert.site}</p>
                          <p className="text-xs text-muted-foreground">Job Number: {alert.jobNumber}</p>
                          </div>
                        <div className="flex flex-col items-end space-y-1">
                          <Badge 
                            variant="secondary" 
                              className={`${
                              alert.priority === 'Critical' ? 'bg-red-100 text-red-700 border-red-200' : 
                              alert.priority === 'High' ? 'bg-orange-100 text-orange-700 border-orange-200' : 
                              'bg-blue-100 text-blue-700 border-blue-200'
                            } text-xs`}
                          >
                              {alert.priority}
                            </Badge>
                        {alert.resolved && (
                            <Badge variant="default" className="bg-green-100 text-green-700 border-green-200 text-xs">
                            Resolved
                          </Badge>
                        )}
                        </div>
                      </div>
                      
                      {/* Message */}
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {alert.message}
                        </p>
                          </div>

                      {/* Site */}
                      <div className="flex items-center space-x-1">
                        <MapPin className="h-3 w-3 text-gray-400" />
                        <p className="text-xs font-medium">{alert.site}</p>
                          </div>

                      {/* Engineer */}
                      <div className="flex items-center space-x-1">
                        <User className="h-3 w-3 text-gray-400" />
                        <p className="text-xs">{alert.engineer}</p>
                          </div>
                          
                      {/* Time and Action */}
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>{alert.timestamp.toLocaleDateString()}</span>
                          {!alert.resolved && (
                            <Button
                              variant="ghost"
                              size="sm"
                            className="text-green-600 hover:text-green-700 hover:bg-green-50 text-xs px-2 py-1 h-6"
                              onClick={() => {
                                setSelectedAlertForResolution(alert);
                                setShowResolutionModal(true);
                              }}
                            >
                            <Check className="h-3 w-3 mr-1" />
                              Resolve
                            </Button>
                          )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
          
          {/* Site Alerts */}
          <div>
            <h2 className="text-xl font-bold mb-6">Site Alerts</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredAlerts
                .filter(alert => alert.type.includes("SITE"))
                .map((alert) => (
                <Card 
                  key={alert.id} 
                  className={`${alert.resolved ? 'opacity-80' : ''} cursor-pointer hover:shadow-md transition-shadow`}
                >
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      {/* Header */}
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-semibold text-sm">{alert.customer} - {alert.site}</p>
                          <p className="text-xs text-muted-foreground">Job Number: {alert.jobNumber}</p>
                          </div>
                        <div className="flex flex-col items-end space-y-1">
                          <Badge 
                            variant="secondary" 
                            className={`${
                              alert.priority === 'Critical' ? 'bg-red-100 text-red-700 border-red-200' : 
                              alert.priority === 'High' ? 'bg-orange-100 text-orange-700 border-orange-200' : 
                              'bg-blue-100 text-blue-700 border-blue-200'
                            } text-xs`}
                          >
                            {alert.priority}
                          </Badge>
                        {alert.resolved && (
                            <Badge variant="default" className="bg-green-100 text-green-700 border-green-200 text-xs">
                            Resolved
                          </Badge>
                        )}
                        </div>
                      </div>
                      
                      {/* Message */}
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {alert.message}
                        </p>
                          </div>

                      {/* Site */}
                      <div className="flex items-center space-x-1">
                        <MapPin className="h-3 w-3 text-gray-400" />
                        <p className="text-xs font-medium">{alert.site}</p>
                          </div>

                      {/* Engineer */}
                      <div className="flex items-center space-x-1">
                        <User className="h-3 w-3 text-gray-400" />
                        <p className="text-xs">{alert.engineer}</p>
                          </div>
                          
                      {/* Time and Action */}
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>{alert.timestamp.toLocaleDateString()}</span>
                          {!alert.resolved && (
                            <Button
                              variant="ghost"
                              size="sm"
                            className="text-green-600 hover:text-green-700 hover:bg-green-50 text-xs px-2 py-1 h-6"
                              onClick={() => {
                                setSelectedAlertForResolution(alert);
                                setShowResolutionModal(true);
                              }}
                            >
                            <Check className="h-3 w-3 mr-1" />
                              Resolve
                            </Button>
                          )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
        
        {/* Empty State */}
        {filteredAlerts.length === 0 && (
          <div className="text-center py-12 mt-4">
            <Bell className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-2 text-sm font-semibold text-gray-900">No alerts found</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              {searchQuery || statusFilter !== 'all' || priorityFilter !== 'all' || alertTypeFilter !== 'all' || resolvedFilter !== 'unresolved'
                ? 'Try adjusting your search or filter criteria.'
                : 'All alerts have been resolved. Great job!'}
            </p>
          </div>
        )}
      </TabsContent>

      <TabsContent value="engineer-alerts" className="mt-8 min-h-[calc(100vh-300px)]">
        <div className="space-y-12 h-full">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">Engineer Action Alerts</h2>
              <p className="text-muted-foreground mt-2 text-lg">
                Monitor engineer job acceptance and onsite status
              </p>
            </div>
            
            <div className="flex items-center gap-6">
              {/* Notification Bell */}
              <div className="relative">
                <Button 
                  onClick={() => setShowEngineerNotificationsDropdown(!showEngineerNotificationsDropdown)} 
                  variant="outline" 
                  className="relative flex items-center gap-2 hover:bg-gray-50 transition-colors"
                >
                  <Bell className="h-5 w-5 text-gray-600" />
                  <span className="text-gray-700 font-medium">Notifications</span>
                  {activeEngineerAlerts.length > 0 && (
                    <Badge 
                      variant="destructive" 
                      className="absolute -top-2 -right-2 h-6 w-6 flex items-center justify-center p-0 text-xs font-bold"
                    >
                      {activeEngineerAlerts.length > 99 ? '99+' : activeEngineerAlerts.length}
                    </Badge>
                  )}
                </Button>

                {/* Notifications Dropdown */}
                {showEngineerNotificationsDropdown && (
                  <div 
                    className="engineer-notifications-dropdown fixed right-0 top-16 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-[9999]"
                    onClick={(e) => e.stopPropagation()}
                    style={{ pointerEvents: 'all' }}
                  >
                    <div className="p-4 border-b border-gray-200">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-gray-900">Engineer Alerts</h3>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowEngineerNotificationsDropdown(false)}
                          className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                        >
                          Close
                        </Button>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        {activeEngineerAlerts.length} alert{activeEngineerAlerts.length !== 1 ? 's' : ''} requiring attention
                      </p>
                    </div>
                    
                    <div className="max-h-96 overflow-y-auto overscroll-contain" style={{ pointerEvents: 'auto' }}>
                      {activeEngineerAlerts.length === 0 ? (
                        <div className="p-4 text-center text-gray-500">
                          <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-500" />
                          <p className="text-sm">No active alerts</p>
                          <p className="text-xs">All engineers have accepted their jobs and are on site</p>
                        </div>
                      ) : (
                        <div className="divide-y divide-gray-100">
                          {activeEngineerAlerts.slice(0, 5).map((alert) => (
                            <div 
                              key={alert.id}
                              className="p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                              onClick={() => {
                                handleEngineerAlertClick(alert);
                                setShowEngineerNotificationsDropdown(false);
                              }}
                            >
                              <div className="flex items-start justify-between">
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-1">
                                    <Badge 
                                      variant={alert.priority === 'Critical' ? 'destructive' : 'secondary'}
                                      className="text-xs"
                                    >
                                      {alert.priority}
                                    </Badge>
                                    <span className="text-xs text-gray-500">
                                      {alert.timestamp.toLocaleDateString()}
                                    </span>
                                  </div>
                                  <h4 className="text-sm font-medium text-gray-900 mb-1">
                                    {alert.customer} - {alert.site}
                                  </h4>
                                  <p className="text-xs text-gray-600 mb-1">
                                    Job Number: {alert.jobNumber}
                                  </p>
                                  <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                                    {getAlertDescription(alert.type, alert.jobNumber)}
                                  </p>
                                  <div className="flex items-center gap-2 text-xs text-gray-500">
                                    <MapPin className="h-3 w-3" />
                                    <span>{alert.site}</span>
                                    <span>•</span>
                                    <User className="h-3 w-3" />
                                    <span>{alert.engineer}</span>
                                  </div>
                                  
                                  {/* Visit Status in notifications */}
                                  <div className="flex items-center gap-2 mt-1">
                                    <span className="text-xs text-gray-500">Status:</span>
                                    {(() => {
                                      const job = jobs.find(j => j.id === alert.jobId);
                                      if (!job) return <span className="text-gray-400">Unknown</span>;
                                      
                                      return <StatusBadge status={job.status} />;
                                    })()}
                                  </div>
                                </div>
                                <div className="ml-3">
                                  <div className={`w-3 h-3 rounded-full ${
                                    alert.type === 'ENGINEER_ACCEPT' ? 'bg-blue-500' : 'bg-green-500'
                                  }`} />
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
             
              {/* Stats */}
              <div className="flex items-center gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{activeEngineerAlerts.length}</div>
                  <div className="text-sm text-gray-600">Active Alerts</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{resolvedEngineerAlerts.length}</div>
                  <div className="text-sm text-gray-600">Resolved</div>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <Tabs value={activeEngineerTab} onValueChange={setActiveEngineerTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="active" className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                Active Alerts ({activeEngineerAlerts.length})
              </TabsTrigger>
              <TabsTrigger value="resolved" className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                Resolved ({resolvedEngineerAlerts.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="active" className="space-y-6 mt-6">
              {activeEngineerAlerts.length === 0 ? (
                <Card className="bg-green-50 border-2 border-green-200">
                  <CardContent className="p-8 text-center">
                    <CheckCircle className="mx-auto h-16 w-16 text-green-600 mb-4" />
                    <h3 className="text-xl font-semibold text-green-800 mb-2">All Engineer Alerts Resolved</h3>
                    <p className="text-green-700 text-lg">Great job! All engineers have accepted their jobs and are on site.</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {activeEngineerAlerts.map(alert => (
                    <Card 
                      key={alert.id} 
                      className={`${alert.resolved ? 'opacity-80' : ''} cursor-pointer hover:shadow-md transition-shadow`}
                      onClick={() => handleEngineerAlertClick(alert)}
                    >
                      <CardContent className="p-4">
                        <div className="space-y-3">
                          {/* Header */}
                          <div className="flex items-start justify-between">
                            <div>
                              <p className="font-semibold text-sm">{alert.customer} - {alert.site}</p>
                              <p className="text-xs text-muted-foreground">Job Number: {alert.jobNumber}</p>
                          </div>
                            <div className="flex flex-col items-end space-y-1">
                              <Badge 
                                variant="secondary" 
                                className={`${
                                  alert.priority === 'Critical' ? 'bg-red-100 text-red-700 border-red-200' : 
                                  alert.priority === 'High' ? 'bg-orange-100 text-orange-700 border-orange-200' : 
                                  'bg-blue-100 text-blue-700 border-blue-200'
                                } text-xs`}
                              >
                                {alert.priority}
                              </Badge>
                              {alert.resolved && (
                                <Badge variant="default" className="bg-green-100 text-green-700 border-green-200 text-xs">
                                  Resolved
                                </Badge>
                              )}
                            </div>
                            </div>
                            
                          {/* Message */}
                          <div className="space-y-1">
                            <p className="text-xs text-muted-foreground line-clamp-2">
                              {getAlertDescription(alert.type, alert.jobNumber)}
                            </p>
                            </div>
                            
                          {/* Site */}
                          <div className="flex items-center space-x-1">
                            <MapPin className="h-3 w-3 text-gray-400" />
                            <p className="text-xs font-medium">{alert.site}</p>
                            </div>

                          {/* Engineer */}
                          <div className="flex items-center space-x-1">
                            <User className="h-3 w-3 text-gray-400" />
                            <p className="text-xs">{alert.engineer}</p>
                            </div>
                            
                          {/* Time and Action */}
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span>{alert.timestamp.toLocaleDateString()}</span>
                            {!alert.resolved && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-green-600 hover:text-green-700 hover:bg-green-50 text-xs px-2 py-1 h-6"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedEngineerAlert(alert);
                                  setShowEngineerResolutionModal(true);
                                }}
                              >
                                <Check className="h-3 w-3 mr-1" />
                                Resolve
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="resolved" className="space-y-6 mt-6">
              {resolvedEngineerAlerts.length === 0 ? (
                <Card className="bg-gray-50 border-2 border-gray-200">
                  <CardContent className="p-8 text-center">
                    <CheckCircle className="mx-auto h-16 w-16 text-gray-600 mb-4" />
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">No Resolved Alerts</h3>
                    <p className="text-gray-700 text-lg">Resolved alerts will appear here once you start resolving them.</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {resolvedEngineerAlerts.map(alert => (
                    <Card key={alert.id} className="bg-gray-50 border-2 border-gray-200 opacity-75">
                      <CardContent className="p-4">
                        <div className="space-y-3">
                          {/* Header */}
                          <div className="flex items-start justify-between">
                            <div>
                              <p className="font-semibold text-sm">{alert.customer} - {alert.site}</p>
                              <p className="text-xs text-muted-foreground">Job Number: {alert.jobNumber}</p>
                          </div>
                            <div className="flex flex-col items-end space-y-1">
                              <Badge 
                                variant="secondary" 
                                className={`${
                                  alert.priority === 'Critical' ? 'bg-red-100 text-red-700 border-red-200' : 
                                  alert.priority === 'High' ? 'bg-orange-100 text-orange-700 border-orange-200' : 
                                  'bg-blue-100 text-blue-700 border-blue-200'
                                } text-xs`}
                              >
                                {alert.priority}
                              </Badge>
                              <Badge variant="default" className="bg-green-100 text-green-700 border-green-200 text-xs">
                                Resolved
                              </Badge>
                            </div>
                            </div>
                            
                          {/* Message */}
                          <div className="space-y-1">
                            <p className="text-xs text-muted-foreground line-clamp-2">
                              {getAlertDescription(alert.type, alert.jobNumber)}
                            </p>
                          </div>

                          {/* Site */}
                          <div className="flex items-center space-x-1">
                            <MapPin className="h-3 w-3 text-gray-400" />
                            <p className="text-xs font-medium">{alert.site}</p>
                              </div>

                          {/* Engineer */}
                          <div className="flex items-center space-x-1">
                            <User className="h-3 w-3 text-gray-400" />
                            <p className="text-xs">{alert.engineer}</p>
                              </div>

                          {/* Resolution Info */}
                          <div className="space-y-1">
                            <div className="text-xs text-gray-500">
                              <span className="font-medium">Resolved by:</span> {alert.resolvedBy || 'System'}
                              </div>
                            <div className="text-xs text-gray-500">
                              <span className="font-medium">Resolved at:</span> {alert.resolvedAt ? 
                                `${alert.resolvedAt.toLocaleDateString()} at ${alert.resolvedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` 
                                : 'Not recorded'}
                              </div>
                            </div>
                            
                          {/* Resolution Notes */}
                            {alert.resolution && (
                            <div className="bg-white p-2 rounded border text-xs">
                                <span className="font-medium text-gray-700">Resolution:</span>
                                <p className="text-gray-600 mt-1">{alert.resolution}</p>
                              </div>
                            )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </TabsContent>
      </Tabs>
        </div>
      </div>

      {/* Create Alert Modal */}
      <CreateAlertModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        jobs={mockJobs}
        onAlertCreate={handleCreateAlert}
      />

      {/* Resolution Modal */}
      <CustomPromptModal
        isOpen={showResolutionModal}
        onClose={() => {
          setShowResolutionModal(false);
          setSelectedAlertForResolution(null);
        }}
        onSubmit={(resolution) => {
          if (selectedAlertForResolution) {
            handleResolveAlert(selectedAlertForResolution.id, resolution);
          }
        }}
        title="Resolve Alert"
        message="Please enter resolution notes for this alert:"
        placeholder="Enter resolution details..."
        type="textarea"
        submitText="Resolve Alert"
        cancelText="Cancel"
        icon="success"
        required={true}
        maxLength={500}
      />

      {/* Engineer Resolution Modal */}
      <CustomPromptModal
        isOpen={showEngineerResolutionModal}
        onClose={() => {
          setShowEngineerResolutionModal(false);
        }}
        onSubmit={(resolution) => {
          if (selectedEngineerAlert) {
            handleResolveEngineerAlert(selectedEngineerAlert.id, resolution);
          }
        }}
        title="Resolve Engineer Alert"
        message="Please enter resolution notes for this engineer alert:"
        placeholder="Enter resolution details..."
        type="textarea"
        submitText="Resolve Alert"
        cancelText="Cancel"
        icon="success"
        required={true}
        maxLength={500}
      />

      {/* Engineer Details Modal */}
      <Dialog open={isEngineerDetailModalOpen} onOpenChange={setIsEngineerDetailModalOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3 text-xl">
              {selectedEngineerAlert && getAlertIcon(selectedEngineerAlert.type)}
              {selectedEngineerAlert && getAlertTitle(selectedEngineerAlert.type)}
            </DialogTitle>
          </DialogHeader>
          
          {selectedEngineerAlert && (
            <div className="space-y-6">
              {/* Job Information */}
              <Card className="bg-gray-50 border-2 border-gray-200">
                <CardHeader>
                  <CardTitle className="text-lg text-gray-900">Job Details</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-gray-700">Job Number:</span>
                      <p className="text-gray-900 font-mono">{selectedEngineerAlert.jobNumber}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Priority:</span>
                      <Badge className={`${getPriorityColor(selectedEngineerAlert.priority)} ml-2`}>
                        {selectedEngineerAlert.priority}
                      </Badge>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Customer:</span>
                      <p className="text-gray-900">{selectedEngineerAlert.customer}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Site:</span>
                      <p className="text-gray-900">{selectedEngineerAlert.site}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Visit Status */}
              <Card className="bg-amber-50 border-2 border-amber-200">
                <CardHeader>
                  <CardTitle className="text-lg text-amber-900">Visit Status</CardTitle>
                </CardHeader>
                <CardContent>
                  {(() => {
                    const job = jobs.find(j => j.id === selectedEngineerAlert.jobId);
                    if (!job) return <p className="text-red-600">Job not found</p>;

                    return (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-amber-900">Current Status:</span>
                          <StatusBadge status={job.status} />
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="font-medium text-amber-900">Date Logged:</span>
                            <p className="text-amber-800">{job.dateLogged.toLocaleDateString()}</p>
                          </div>
                          <div>
                            <span className="font-medium text-amber-900">Date Accepted:</span>
                            <p className="text-amber-800">
                              {job.dateAccepted ? job.dateAccepted.toLocaleDateString() : 'Not yet accepted'}
                            </p>
                          </div>
                          <div>
                            <span className="font-medium text-amber-900">Date On Site:</span>
                            <p className="text-amber-800">
                              {job.dateOnSite ? job.dateOnSite.toLocaleDateString() : 'Not yet on site'}
                            </p>
                          </div>
                          <div>
                            <span className="font-medium text-amber-900">Date Completed:</span>
                            <p className="text-amber-800">
                              {job.dateCompleted ? job.dateCompleted.toLocaleDateString() : 'Not yet completed'}
                            </p>
                          </div>
                        </div>

                        {job.dateAccepted && (
                          <div className="bg-green-50 border border-green-200 p-3 rounded-lg">
                            <div className="flex items-center gap-2 text-green-800">
                              <CheckCircle className="h-4 w-4" />
                              <span className="font-medium">Engineer accepted job on {job.dateAccepted.toLocaleDateString()}</span>
                            </div>
                          </div>
                        )}

                        {job.dateOnSite && (
                          <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg">
                            <div className="flex items-center gap-2 text-blue-800">
                              <MapPin className="h-4 w-4" />
                              <span className="font-medium">Engineer arrived on site on {job.dateOnSite.toLocaleDateString()}</span>
                            </div>
                          </div>
                        )}

                        {job.dateCompleted && (
                          <div className="bg-green-50 border border-green-200 p-3 rounded-lg">
                            <div className="flex items-center gap-2 text-green-800">
                              <CheckCircle className="h-4 w-4" />
                              <span className="font-medium">Job completed on {job.dateCompleted.toLocaleDateString()}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </CardContent>
              </Card>

              {/* Engineer Information */}
              <Card className="bg-blue-50 border-2 border-blue-200">
                <CardHeader>
                  <CardTitle className="text-lg text-blue-900">Engineer Details</CardTitle>
                </CardHeader>
                <CardContent>
                  {(() => {
                    const engineer = getEngineerDetails(selectedEngineerAlert.engineer);
                    if (!engineer) {
                      return <p className="text-red-600">Engineer information not found</p>;
                    }
                    
                    return (
                      <div className="space-y-4">
                        <div className="flex items-center gap-4">
                          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                            <User className="h-8 w-8 text-blue-600" />
                          </div>
                          <div>
                            <h4 className="text-xl font-semibold text-blue-900">{engineer.name}</h4>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="secondary" className="text-blue-700 bg-blue-100">
                                {engineer.status}
                              </Badge>
                              {engineer.isOnHoliday && (
                                <Badge variant="destructive" className="text-xs">
                                  <Calendar className="h-3 w-3 mr-1" />
                                  Holiday
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="flex items-center gap-3">
                            <Phone className="h-5 w-5 text-blue-600" />
                            <span className="text-blue-900 font-medium">{engineer.phone}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <Mail className="h-5 w-5 text-blue-600" />
                            <span className="text-blue-900 font-medium">{engineer.email}</span>
                          </div>
                          {engineer.shiftTiming && (
                            <div className="flex items-center gap-3">
                              <Clock className="h-5 w-5 text-blue-600" />
                              <span className="text-blue-900 font-medium">{engineer.shiftTiming}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-3">
                            <Briefcase className="h-5 w-5 text-blue-600" />
                            <Badge variant={engineer.isOnHoliday ? 'destructive' : 'secondary'}>
                              {engineer.isOnHoliday ? 'On Holiday' : 'Available'}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </CardContent>
              </Card>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-6 border-t-2 border-gray-200">
                <div className="flex items-center gap-4">
                  <Button
                    onClick={() => {
                      const engineer = getEngineerDetails(selectedEngineerAlert.engineer);
                      if (engineer) {
                        handleCallEngineer(engineer.name);
                      }
                    }}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 h-12 text-base font-medium"
                  >
                    <Phone className="h-5 w-5 mr-2" />
                    Call Engineer
                  </Button>
                  
                  <Button
                    onClick={() => {
                      const engineer = getEngineerDetails(selectedEngineerAlert.engineer);
                      if (engineer) {
                        window.open(`mailto:${engineer.email}`, '_blank');
                      }
                    }}
                    variant="outline"
                    className="border-2 border-blue-200 text-blue-700 hover:bg-blue-50 px-6 py-3 h-12 text-base font-medium"
                  >
                    <Mail className="h-5 w-5 mr-2" />
                    Email Engineer
                  </Button>
                </div>
                
                <Button
                  onClick={() => setShowEngineerResolutionModal(true)}
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 h-12 text-base font-medium"
                >
                  <Check className="h-5 w-5 mr-2" />
                  Resolve Alert
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
