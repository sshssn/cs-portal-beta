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
  // Main alerts and filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [alertTypeFilter, setAlertTypeFilter] = useState<string>('all');
  const [resolvedFilter, setResolvedFilter] = useState<string>('unresolved');
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
      status: 'amber',
      resolved: false,
      severity: 'high'
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
      status: 'red',
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
  const [activeEngineerTab, setActiveEngineerTab] = useState('active');
  const [showEngineerNotificationsDropdown, setShowEngineerNotificationsDropdown] = useState(false);

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

  // Main tabs
  const [activeMainTab, setActiveMainTab] = useState('system-alerts');

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

      // OVERDUE Alert for red status jobs
      if (job.status === 'red' && !job.dateCompleted) {
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
      // Engineer Accept Alert - when job is allocated but not accepted
      if (job.status === 'allocated' && !job.dateAccepted) {
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
          resolved: false
        });
      }

      // Engineer Onsite Alert - when job is accepted but engineer not on site
      if (job.dateAccepted && !job.dateOnSite && job.status !== 'completed') {
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
          resolved: false
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

      if (['green', 'completed', 'costed', 'reqs_invoice'].includes(job.status)) {
        siteInfo.completedJobs++;
      } else {
        siteInfo.activeJobs++;
      }

      if (job.priority === 'Critical') {
        siteInfo.criticalJobs++;
      }

      if (job.status === 'red') {
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

  const [alerts, setAlerts] = useState<SystemAlert[]>(generateSystemAlerts());
  const allAlerts = [...alerts, ...customAlerts];

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

  // Engineer alerts data
  const activeEngineerAlerts = engineerAlerts.filter(alert => !alert.resolved);
  const resolvedEngineerAlerts = engineerAlerts.filter(alert => alert.resolved);

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
        let updatedJob = { ...job };

        if (alert.type === 'ENGINEER_ACCEPT') {
          updatedJob.dateAccepted = new Date();
          updatedJob.status = 'attended';
        } else if (alert.type === 'ENGINEER_ONSITE') {
          updatedJob.dateOnSite = new Date();
          updatedJob.status = 'attended';
        }

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

        onJobUpdate(updatedJob);
        setIsEngineerDetailModalOpen(false);
        setSelectedEngineerAlert(null);
      }
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
      setAlerts(prev => prev.map(alert => 
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
    }
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

  // Calculate metrics based on selected tab
  const getStats = () => {
    switch (activeMainTab) {
      case 'engineer-alerts':
        return {
          total: engineerAlerts.length,
          unresolved: activeEngineerAlerts.length,
          resolved: resolvedEngineerAlerts.length,
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
    <div className="space-y-6">
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
      
      {/* Main Tabs */}
      <Tabs value={activeMainTab} onValueChange={setActiveMainTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="system-alerts" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            System Alerts
          </TabsTrigger>
          <TabsTrigger value="engineer-alerts" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Engineer Alerts
          </TabsTrigger>
        </TabsList>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-800">{stats.title}</CardTitle>
            <Bell className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-900">{stats.total}</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-red-800">Unresolved</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-900">{stats.unresolved}</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-800">Resolved</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-900">{stats.resolved}</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-800">Critical</CardTitle>
            <XCircle className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-900">{stats.critical}</div>
          </CardContent>
        </Card>
      </div>

      <TabsContent value="system-alerts">
        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={16} />
                <Input
                  placeholder="Search alerts..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Job Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="green">Completed</SelectItem>
                  <SelectItem value="amber">In Progress</SelectItem>
                  <SelectItem value="red">Issues</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Priority" />
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
                <SelectTrigger>
                  <SelectValue placeholder="Alert Type" />
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
                <SelectTrigger>
                  <SelectValue placeholder="Resolution" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unresolved">Unresolved</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                  <SelectItem value="all">All</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Alert Categories */}
        <div className="mt-6 space-y-6">
          {/* Customer Alerts */}
          <div>
            <h2 className="text-xl font-bold mb-4">Customer Alerts</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {filteredAlerts
                .filter(alert => alert.type.includes("CUSTOMER"))
                .map((alert) => (
                <Card 
                  key={alert.id} 
                  className={`${alert.resolved ? 'opacity-80' : ''} overflow-hidden transition-all duration-200 hover:shadow-lg border-l-4 ${
                    alert.priority === 'Critical' ? 'border-l-red-500' : 
                    alert.priority === 'High' ? 'border-l-orange-500' : 
                    'border-l-blue-500'
                  }`}
                >
                  <div className={`absolute top-0 left-0 right-0 h-1 ${
                    alert.priority === 'Critical' ? 'bg-red-500' : 
                    alert.priority === 'High' ? 'bg-orange-500' : 
                    'bg-blue-500'
                  }`}></div>
                  <CardContent className="p-5 pt-6">
                    <div className="flex items-start gap-3 flex-col">
                      <div className="flex items-center gap-2 w-full justify-between">
                        <div className="flex items-center gap-2">
                          <div className={`p-2 rounded-full ${
                            alert.priority === 'Critical' ? 'bg-red-100 text-red-600' : 
                            alert.priority === 'High' ? 'bg-orange-100 text-orange-600' : 
                            'bg-blue-100 text-blue-600'
                          }`}>
                            {getSystemAlertIcon(alert.type)}
                          </div>
                          <Badge variant={alert.priority === 'Critical' ? 'destructive' : 
                                          alert.priority === 'High' ? 'outline' : 'secondary'} 
                            className={`${
                              alert.priority === 'Critical' ? 'bg-red-100 text-red-700 border-red-200 hover:bg-red-200' : 
                              alert.priority === 'High' ? 'bg-orange-100 text-orange-700 border-orange-200 hover:bg-orange-200' : 
                              'bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-200'
                            } font-medium`}>
                            {alert.priority}
                          </Badge>
                        </div>
                        
                        {alert.resolved && (
                          <Badge variant="default" className="bg-green-100 text-green-700 border-green-200">
                            Resolved
                          </Badge>
                        )}
                      </div>
                      
                      <div className="w-full">
                        <h3 className="font-semibold text-md mb-3 text-gray-800">{alert.message}</h3>
                        <div className="bg-gray-50 p-2.5 rounded-md border border-gray-100 mb-3">
                          <div className="text-sm">
                            <span className="font-medium text-gray-700">Customer:</span> 
                            <span className="text-gray-800 ml-1 font-medium">{alert.customer}</span>
                          </div>
                        </div>
                        <div className="flex justify-between items-center">
                          <div className="text-xs text-gray-500 flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {alert.timestamp.toLocaleString()}
                          </div>
                          
                          {!alert.resolved && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className={`hover:bg-green-50 text-green-600 border border-green-200 hover:text-green-700`}
                              onClick={() => {
                                setSelectedAlertForResolution(alert);
                                setShowResolutionModal(true);
                              }}
                            >
                              <Check className="h-3.5 w-3.5 mr-1" />
                              Resolve
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
          
          {/* Job Alerts */}
          <div>
            <h2 className="text-xl font-bold mb-4">Job Alerts</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {filteredAlerts
                .filter(alert => !alert.type.includes("CUSTOMER") && !alert.type.includes("SITE"))
                .map((alert) => (
                <Card 
                  key={alert.id} 
                  className={`${alert.resolved ? 'opacity-80' : ''} overflow-hidden transition-all duration-200 hover:shadow-lg border-l-4 ${
                    alert.priority === 'Critical' ? 'border-l-red-500' : 
                    alert.priority === 'High' ? 'border-l-orange-500' : 
                    'border-l-blue-500'
                  }`}
                >
                  <div className={`absolute top-0 left-0 right-0 h-1 ${
                    alert.priority === 'Critical' ? 'bg-red-500' : 
                    alert.priority === 'High' ? 'bg-orange-500' : 
                    'bg-blue-500'
                  }`}></div>
                  <CardContent className="p-5 pt-6">
                    <div className="flex items-start gap-3 flex-col">
                      <div className="flex items-center gap-2 w-full justify-between">
                        <div className="flex items-center gap-2">
                          <div className={`p-2 rounded-full ${
                            alert.priority === 'Critical' ? 'bg-red-100 text-red-600' : 
                            alert.priority === 'High' ? 'bg-orange-100 text-orange-600' : 
                            'bg-blue-100 text-blue-600'
                          }`}>
                            {getSystemAlertIcon(alert.type)}
                          </div>
                          <div className="flex gap-1.5">
                            <Badge variant={alert.priority === 'Critical' ? 'destructive' : 
                                            alert.priority === 'High' ? 'outline' : 'secondary'} 
                              className={`${
                                alert.priority === 'Critical' ? 'bg-red-100 text-red-700 border-red-200 hover:bg-red-200' : 
                                alert.priority === 'High' ? 'bg-orange-100 text-orange-700 border-orange-200 hover:bg-orange-200' : 
                                'bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-200'
                              } font-medium`}>
                              {alert.priority}
                            </Badge>
                            <Badge variant="outline" className="text-xs bg-gray-100 text-gray-800 border-gray-200">
                              {alert.type}
                            </Badge>
                          </div>
                        </div>
                        
                        {alert.resolved && (
                          <Badge variant="default" className="bg-green-100 text-green-700 border-green-200">
                            Resolved
                          </Badge>
                        )}
                      </div>
                      
                      <div className="w-full">
                        <h3 className="font-semibold text-md mb-3 text-gray-800">{alert.message}</h3>
                        <div className="bg-gray-50 p-2.5 rounded-md border border-gray-100 mb-3 grid grid-cols-3 gap-2">
                          <div className="text-sm">
                            <span className="font-medium text-gray-700">Job:</span> 
                            <span className="text-gray-800 ml-1 font-medium">{alert.jobNumber}</span>
                          </div>
                          <div className="text-sm">
                            <span className="font-medium text-gray-700">Site:</span> 
                            <span className="text-gray-800 ml-1">{alert.site}</span>
                          </div>
                          <div className="text-sm">
                            <span className="font-medium text-gray-700">Engineer:</span> 
                            <span className="text-gray-800 ml-1">{alert.engineer}</span>
                          </div>
                        </div>
                        <div className="flex justify-between items-center">
                          <div className="text-xs text-gray-500 flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {alert.timestamp.toLocaleString()}
                          </div>
                          
                          {!alert.resolved && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className={`hover:bg-green-50 text-green-600 border border-green-200 hover:text-green-700`}
                              onClick={() => {
                                setSelectedAlertForResolution(alert);
                                setShowResolutionModal(true);
                              }}
                            >
                              <Check className="h-3.5 w-3.5 mr-1" />
                              Resolve
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
          
          {/* Site Alerts */}
          <div>
            <h2 className="text-xl font-bold mb-4">Site Alerts</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {filteredAlerts
                .filter(alert => alert.type.includes("SITE"))
                .map((alert) => (
                <Card 
                  key={alert.id} 
                  className={`${alert.resolved ? 'opacity-80' : ''} overflow-hidden transition-all duration-200 hover:shadow-lg border-l-4 ${
                    alert.priority === 'Critical' ? 'border-l-red-500' : 
                    alert.priority === 'High' ? 'border-l-orange-500' : 
                    'border-l-blue-500'
                  }`}
                >
                  <div className={`absolute top-0 left-0 right-0 h-1 ${
                    alert.priority === 'Critical' ? 'bg-red-500' : 
                    alert.priority === 'High' ? 'bg-orange-500' : 
                    'bg-blue-500'
                  }`}></div>
                  <CardContent className="p-5 pt-6">
                    <div className="flex items-start gap-3 flex-col">
                      <div className="flex items-center gap-2 w-full justify-between">
                        <div className="flex items-center gap-2">
                          <div className={`p-2 rounded-full ${
                            alert.priority === 'Critical' ? 'bg-red-100 text-red-600' : 
                            alert.priority === 'High' ? 'bg-orange-100 text-orange-600' : 
                            'bg-blue-100 text-blue-600'
                          }`}>
                            {getSystemAlertIcon(alert.type)}
                          </div>
                          <Badge variant={alert.priority === 'Critical' ? 'destructive' : 
                                          alert.priority === 'High' ? 'outline' : 'secondary'} 
                            className={`${
                              alert.priority === 'Critical' ? 'bg-red-100 text-red-700 border-red-200 hover:bg-red-200' : 
                              alert.priority === 'High' ? 'bg-orange-100 text-orange-700 border-orange-200 hover:bg-orange-200' : 
                              'bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-200'
                            } font-medium`}>
                            {alert.priority}
                          </Badge>
                        </div>
                        
                        {alert.resolved && (
                          <Badge variant="default" className="bg-green-100 text-green-700 border-green-200">
                            Resolved
                          </Badge>
                        )}
                      </div>
                      
                      <div className="w-full">
                        <h3 className="font-semibold text-md mb-3 text-gray-800">{alert.message}</h3>
                        <div className="bg-gray-50 p-2.5 rounded-md border border-gray-100 mb-3 grid grid-cols-2 gap-2">
                          <div className="text-sm">
                            <span className="font-medium text-gray-700">Site:</span> 
                            <span className="text-gray-800 ml-1 font-medium">{alert.site}</span>
                          </div>
                          <div className="text-sm">
                            <span className="font-medium text-gray-700">Customer:</span> 
                            <span className="text-gray-800 ml-1">{alert.customer}</span>
                          </div>
                        </div>
                        <div className="flex justify-between items-center">
                          <div className="text-xs text-gray-500 flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {alert.timestamp.toLocaleString()}
                          </div>
                          
                          {!alert.resolved && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className={`hover:bg-green-50 text-green-600 border border-green-200 hover:text-green-700`}
                              onClick={() => {
                                setSelectedAlertForResolution(alert);
                                setShowResolutionModal(true);
                              }}
                            >
                              <Check className="h-3.5 w-3.5 mr-1" />
                              Resolve
                            </Button>
                          )}
                        </div>
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

      <TabsContent value="engineer-alerts">
        {/* Import and render the EngineerActionAlerts component here */}
        <div className="space-y-6">
          {/* We're using the original EngineerActionAlerts component logic here */}
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Engineer Action Alerts</h2>
            <p className="text-muted-foreground mt-2 text-lg">
              Monitor engineer job acceptance and onsite status
            </p>
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

            <TabsContent value="active" className="space-y-4">
              {activeEngineerAlerts.length === 0 ? (
                <Card className="bg-green-50 border-2 border-green-200">
                  <CardContent className="p-8 text-center">
                    <CheckCircle className="mx-auto h-16 w-16 text-green-600 mb-4" />
                    <h3 className="text-xl font-semibold text-green-800 mb-2">All Engineer Alerts Resolved</h3>
                    <p className="text-green-700 text-lg">Great job! All engineers have accepted their jobs and are on site.</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {activeEngineerAlerts.map(alert => (
                    <Card 
                      key={alert.id} 
                      className={`${getAlertColor(alert.type)} cursor-pointer transition-all duration-200 hover:shadow-md border-2`}
                      onClick={() => handleEngineerAlertClick(alert)}
                    >
                      <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                          <div className="flex-shrink-0 mt-1">
                            {getAlertIcon(alert.type)}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3 mb-3">
                              <h3 className="font-semibold text-lg text-gray-900">
                                {getAlertTitle(alert.type)}
                              </h3>
                              <Badge className={`${getPriorityColor(alert.priority)} text-xs font-medium`}>
                                {alert.priority}
                              </Badge>
                            </div>
                            
                            <p className="text-gray-700 mb-4 text-base">
                              {getAlertDescription(alert.type, alert.jobNumber)}
                            </p>
                            
                            <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 mb-3">
                              <div>
                                <span className="font-medium text-gray-700">Job:</span>
                                <p className="text-gray-900 font-mono">{alert.jobNumber}</p>
                              </div>
                              <div>
                                <span className="font-medium text-gray-700">Engineer:</span>
                                <p className="text-gray-900">{alert.engineer}</p>
                              </div>
                              <div>
                                <span className="font-medium text-gray-700">Customer:</span>
                                <p className="text-gray-900">{alert.customer}</p>
                              </div>
                              <div>
                                <span className="font-medium text-gray-700">Site:</span>
                                <p className="text-gray-900">{alert.site}</p>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                              <Clock className="h-4 w-4" />
                              <span>{alert.timestamp.toLocaleString()}</span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="resolved" className="space-y-4">
              {resolvedEngineerAlerts.length === 0 ? (
                <Card className="bg-gray-50 border-2 border-gray-200">
                  <CardContent className="p-8 text-center">
                    <CheckCircle className="mx-auto h-16 w-16 text-gray-600 mb-4" />
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">No Resolved Alerts</h3>
                    <p className="text-gray-700 text-lg">Resolved alerts will appear here once you start resolving them.</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {resolvedEngineerAlerts.map(alert => (
                    <Card key={alert.id} className="bg-gray-50 border-2 border-gray-200 opacity-75">
                      <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                          <div className="flex-shrink-0 mt-1">
                            {getAlertIcon(alert.type)}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3 mb-3">
                              <h3 className="font-semibold text-lg text-gray-700">
                                {getAlertTitle(alert.type)}
                              </h3>
                              <Badge className="bg-green-600 text-white text-xs font-medium">
                                Resolved
                              </Badge>
                            </div>
                            
                            <p className="text-gray-600 mb-4 text-base">
                              {getAlertDescription(alert.type, alert.jobNumber)}
                            </p>
                            
                            <div className="grid grid-cols-2 gap-4 text-sm text-gray-500 mb-3">
                              <div>
                                <span className="font-medium">Job:</span>
                                <p className="font-mono">{alert.jobNumber}</p>
                              </div>
                              <div>
                                <span className="font-medium">Engineer:</span>
                                <p>{alert.engineer}</p>
                              </div>
                              <div>
                                <span className="font-medium">Resolved by:</span>
                                <p>{alert.resolvedBy || 'Unknown'}</p>
                              </div>
                              <div>
                                <span className="font-medium">Resolved at:</span>
                                <p>{alert.resolvedAt?.toLocaleString() || 'Unknown'}</p>
                              </div>
                            </div>
                            
                            {alert.resolution && (
                              <div className="bg-white p-3 rounded border">
                                <span className="font-medium text-gray-700">Resolution:</span>
                                <p className="text-gray-600 mt-1">{alert.resolution}</p>
                              </div>
                            )}
                          </div>
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
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <Phone className="h-5 w-5 mr-2" />
                    Call Engineer
                  </Button>
                </div>
                
                <Button
                  onClick={() => setShowResolutionModal(true)}
                  className="bg-green-600 hover:bg-green-700 text-white"
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
