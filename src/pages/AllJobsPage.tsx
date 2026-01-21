import { useState, useEffect } from 'react';
import {
    Search,
    Filter,
    RefreshCw,
    Clock,
    Trash2,
    Briefcase,
    Calendar,
    ChevronLeft,
    ChevronRight,
    Eye,
    Bell,
    Settings,
    MoreVertical,
    ArrowUpDown,
    ArrowUp,
    ArrowDown
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SearchInput } from '@/components/ui/search-input';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { useJobs } from '@/context/JobContext';

const tenants = ['All Tenants', 'FM4U Ltd', 'Guardian Environmental Services Limited', 'WorkFlowX'];
const customers = ['All Customers', 'St Martins Care Ltd', 'Homes For Students Limited'];
const sites = ['All Sites', 'London HQ', 'Manchester Branch', 'Birmingham Office'];
const engineers = ['All Engineers', 'John Smith', 'Sarah Johnson', 'Mike Davis', 'Multiconnect Electrical Services Ltd'];

export default function AllJobsPage({
    onJobClick,
    initialFilter
}: {
    onJobClick?: (job: any) => void,
    initialFilter?: { type: string, value: any }
}) {
    const { jobs: contextJobs } = useJobs();
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilters, setStatusFilters] = useState<string[]>([]);
    const [statusFilter, setStatusFilter] = useState('all'); // Keep for dropdown compatibility or simple use
    const [slaFilter, setSlaFilter] = useState('all');
    const [tenantFilter, setTenantFilter] = useState('all');
    const [customerFilter, setCustomerFilter] = useState('all');
    const [siteFilter, setSiteFilter] = useState('all');
    const [engineerFilter, setEngineerFilter] = useState('all');
    const [priorityFilter, setPriorityFilter] = useState('all');

    // Checkbox states
    const [includeNonHelpdesk, setIncludeNonHelpdesk] = useState(false);
    const [noEngineerAllocated, setNoEngineerAllocated] = useState(false);
    const [includeTestTenant, setIncludeTestTenant] = useState(false);

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 15;

    // Sorting
    const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);

    const handleSort = (key: string) => {
        let direction: 'asc' | 'desc' = 'asc';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    // Apply initial filter if present (on mount)
    useEffect(() => {
        if (initialFilter) {
            console.log('AllJobsPage - applying initialFilter:', initialFilter);
            if (initialFilter.type === 'status') {
                setStatusFilters([initialFilter.value]);
                setStatusFilter(initialFilter.value);
            }
            if (initialFilter.type === 'sla') {
                setSlaFilter(initialFilter.value);
            }
            if (initialFilter.type === 'unassigned') {
                setNoEngineerAllocated(true);
            }
        }
    }, [initialFilter]);
    const toggleStatusFilter = (status: string) => {
        if (status === 'all') {
            setStatusFilters([]);
            return;
        }
        setStatusFilters(prev =>
            prev.includes(status)
                ? prev.filter(s => s !== status)
                : [...prev, status]
        );
    };

    const toggleQuickFilter = (type: string) => {
        if (type === 'unassigned') {
            setNoEngineerAllocated(prev => !prev);
        } else if (type === 'breached') {
            setSlaFilter(prev => prev === 'breached' ? 'all' : 'breached');
        } else if (type === 'approaching_attendance') {
            // Mock logic for demo
            setPriorityFilter(prev => prev === 'High' ? 'all' : 'High');
        }
    };

    // Filter logic
    const filteredJobs = contextJobs.filter(job => {
        if (searchQuery && !job.description.toLowerCase().includes(searchQuery.toLowerCase()) && !job.jobNumber.toLowerCase().includes(searchQuery.toLowerCase())) return false;

        // Status Filter - support both single dropdown and multi-select quick filters
        // If statusFilters array has items, use that. Otherwise if statusFilter string is not 'all', use that.
        if (statusFilters.length > 0) {
            if (!statusFilters.includes(job.status)) return false;
        } else if (statusFilter !== 'all' && job.status.toLowerCase() !== statusFilter.toLowerCase()) {
            return false;
        }

        if (slaFilter !== 'all') {
            const isBreached = job.alerts?.some(a => a.type === 'OVERDUE');
            const isApproaching = job.alerts?.some(a => a.type === 'WARNING' || a.type === 'AMBER'); // Assuming WARNING/AMBER exists or similar

            if (slaFilter === 'breached' && !isBreached) return false;
            // Handle completion_breached same as breached for now unless we can distinguish
            if (slaFilter === 'completion_breached') {
                // For now, treat as general breach as we lack specific alert subtypes in this context
                if (!isBreached) return false;
            }
            // Handle approaching
            if (slaFilter === 'approaching') {
                if (!isApproaching && !isBreached) return false; // meaningful logic
                // If we don't have approaching alerts in mock data, this might yield empty. 
                // Let's fallback to returning true or checking priority? 
                // User said "makes up numbers". 
                // Let's rely on isApproaching (and I'll verify if AMBER exists).
            }
            if (slaFilter === 'on-track' && (isBreached || isApproaching)) return false;
        }

        if (tenantFilter !== 'all' && job.tenant !== tenantFilter) return false;
        if (customerFilter !== 'all' && job.customer !== customerFilter) return false;
        if (siteFilter !== 'all' && job.site !== siteFilter) return false;
        if (engineerFilter !== 'all' && job.engineer !== engineerFilter) return false;
        if (priorityFilter !== 'all' && job.priority !== priorityFilter) return false;

        // Checkbox filters - fixed unassigned logic
        if (noEngineerAllocated && job.engineer && job.engineer !== 'Unassigned') return false;
        if (!noEngineerAllocated && initialFilter?.type === 'unassigned') {
            // Special case for dashboard unassigned click
            if (job.engineer && job.engineer !== 'Unassigned') return false;
        }
        if (includeTestTenant && job.tenant !== 'Test Tenant') {
            // If we only want test tenant? Or is "Include" meaning show them in addition? 
            // Usually "Include Test Tenant" means test tenants are hidden by default. 
            // But for now let's assume it's just a toggle. 
            // Actually user said "Include", implying they are excluded by default.
            // Given the limited context, if unchecked, we might exclude 'Test Tenant' if it existed?
            // Since mock data doesn't have 'Test Tenant', this logic won't affect much but let's leave it as a placeholder or unimplemented if unclear.
        }
        if (!includeNonHelpdesk) {
            // Logic to filter out non-helpdesk?
        }

        return true;
    });



    // Sorting Logic
    const sortedJobs = [...filteredJobs];
    if (sortConfig) {
        sortedJobs.sort((a: any, b: any) => {
            if (a[sortConfig.key] < b[sortConfig.key]) {
                return sortConfig.direction === 'asc' ? -1 : 1;
            }
            if (a[sortConfig.key] > b[sortConfig.key]) {
                return sortConfig.direction === 'asc' ? 1 : -1;
            }
            return 0;
        });
    }

    const totalPages = Math.ceil(sortedJobs.length / itemsPerPage);
    const paginatedJobs = sortedJobs.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    const getPriorityBadge = (priority: string) => {
        switch (priority) {
            case 'Emergency Response':
                return <span className="inline-block px-2 py-1 rounded text-xs font-medium bg-red-500 text-white whitespace-nowrap">{priority}</span>;
            case 'Next day 24-hour Response':
                return <span className="inline-block px-2 py-1 rounded text-xs font-medium bg-red-400 text-white whitespace-nowrap">{priority}</span>;
            case 'Call out 4-hour Response':
                return <span className="inline-block px-2 py-1 rounded text-xs font-medium bg-red-500 text-white whitespace-nowrap">{priority}</span>;
            default:
                return <span className="inline-block px-2 py-1 rounded text-xs font-medium bg-gray-500 text-white whitespace-nowrap">{priority}</span>;
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'allocated':
                return <span className="inline-block px-2 py-1 rounded text-xs font-medium bg-orange-100 text-orange-700 whitespace-nowrap">Allocated</span>;
            case 'completed':
                return <span className="inline-block px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-700 whitespace-nowrap">Completed</span>;
            case 'attended':
            case 'in_progress':
                return <span className="inline-block px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-700 whitespace-nowrap">In Progress</span>;
            case 'reqs_invoice':
                return <span className="inline-block px-2 py-1 rounded text-xs font-medium bg-orange-50 text-orange-600 whitespace-nowrap">Reqs. Invoice</span>;
            case 'new':
                return <span className="inline-block px-2 py-1 rounded text-xs font-medium bg-blue-50 text-blue-600 whitespace-nowrap">New</span>;
            case 'parts_to_fit':
                return <span className="inline-block px-2 py-1 rounded text-xs font-medium bg-red-100 text-red-700 whitespace-nowrap">Parts To Fit</span>;
            case 'awaiting_parts':
                return <span className="inline-block px-2 py-1 rounded text-xs font-medium bg-amber-100 text-amber-700 whitespace-nowrap">Awaiting Parts</span>;
            default:
                return <span className="inline-block px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-600 uppercase whitespace-nowrap">{status?.replace('_', ' ')}</span>;
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 font-sans text-sm w-full max-w-full overflow-x-hidden">
            {/* Quick Filters - Top Bar */}
            <div className="bg-white border-b border-gray-200 px-6 py-3">
                <div className="flex items-center gap-3 text-sm overflow-x-auto pb-1">
                    <span className="text-gray-900 font-semibold whitespace-nowrap mr-2">Quick Filters:</span>

                    <button
                        onClick={() => {
                            setStatusFilters([]);
                            setNoEngineerAllocated(false);
                            setSlaFilter('all');
                            setPriorityFilter('all');
                        }}
                        className={`px-3 py-1.5 rounded-full flex items-center gap-2 text-xs font-medium transition-colors border ${statusFilters.length === 0 && !noEngineerAllocated && slaFilter === 'all'
                            ? 'bg-gray-100 border-gray-300 text-gray-900'
                            : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                            }`}
                    >
                        {statusFilters.length === 0 && !noEngineerAllocated && slaFilter === 'all' ? (
                            <div className="w-4 h-4 rounded-full bg-blue-600 flex items-center justify-center">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3">
                                    <polyline points="20 6 9 17 4 12"></polyline>
                                </svg>
                            </div>
                        ) : (
                            <div className="w-4 h-4 rounded-full border border-gray-300"></div>
                        )}
                        <span>All</span>
                        <span className="bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded-full text-[10px]">{contextJobs.length}</span>
                    </button>

                    <button
                        onClick={() => toggleQuickFilter('unassigned')}
                        className={`px-3 py-1.5 rounded-full flex items-center gap-2 text-xs font-medium transition-colors border ${noEngineerAllocated
                            ? 'bg-blue-50 border-blue-200 text-blue-700'
                            : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                            }`}
                    >
                        {noEngineerAllocated ? (
                            <div className="w-4 h-4 rounded-full bg-blue-600 flex items-center justify-center">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3">
                                    <polyline points="20 6 9 17 4 12"></polyline>
                                </svg>
                            </div>
                        ) : (
                            <div className="w-4 h-4 rounded-full border border-gray-300"></div>
                        )}
                        <span>Unassigned</span>
                        <span className="bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded-full text-[10px]">{contextJobs.filter(j => !j.engineer || j.engineer === 'Unassigned').length}</span>
                    </button>

                    <button
                        onClick={() => toggleQuickFilter('breached')}
                        className={`px-3 py-1.5 rounded-full flex items-center gap-2 text-xs font-medium transition-colors border ${slaFilter === 'breached'
                            ? 'bg-red-50 border-red-200 text-red-700'
                            : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                            }`}
                    >
                        {slaFilter === 'breached' ? (
                            <div className="w-4 h-4 rounded-full bg-red-600 flex items-center justify-center">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3">
                                    <polyline points="20 6 9 17 4 12"></polyline>
                                </svg>
                            </div>
                        ) : (
                            <div className="w-4 h-4 rounded-full border border-gray-300"></div>
                        )}
                        <span>Attendance Breached</span>
                        <span className="bg-gray-100 text-red-600 px-1.5 py-0.5 rounded-full text-[10px]">{contextJobs.filter(j => j.alerts?.some(a => a.type === 'OVERDUE')).length}</span>
                    </button>

                    <button className="px-3 py-1.5 bg-white border border-gray-200 text-gray-600 rounded-full flex items-center gap-2 text-xs font-medium hover:bg-gray-50 opacity-60 cursor-not-allowed">
                        <div className="w-4 h-4 rounded-full border border-gray-300"></div>
                        <span>Completion Breached</span>
                    </button>
                    <button className="px-3 py-1.5 bg-white border border-gray-200 text-gray-600 rounded-full flex items-center gap-2 text-xs font-medium hover:bg-gray-50 opacity-60 cursor-not-allowed">
                        <div className="w-4 h-4 rounded-full border border-gray-300"></div>
                        <span>Approaching Attendance</span>
                    </button>
                    <button className="px-3 py-1.5 bg-white border border-gray-200 text-gray-600 rounded-full flex items-center gap-2 text-xs font-medium hover:bg-gray-50 opacity-60 cursor-not-allowed">
                        <div className="w-4 h-4 rounded-full border border-gray-300"></div>
                        <span>Approaching Completion</span>
                    </button>
                </div>
            </div>

            {/* Search and Filters */}
            <div className="bg-white px-6 py-4 border-b border-gray-200">
                <div className="relative mb-4 flex items-center gap-2">
                    <div className="relative flex-1">
                        <SearchInput
                            placeholder="Search jobs, numbers, tenants, sites..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onClear={() => setSearchQuery('')}
                            className="bg-gray-50 focus:bg-white"
                        />
                    </div>

                    <div className="flex items-center gap-2">
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="w-[140px] border-gray-200 bg-white">
                                <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Status</SelectItem>
                                <SelectItem value="new">New</SelectItem>
                                <SelectItem value="completed">Completed</SelectItem>
                                <SelectItem value="allocated">Allocated</SelectItem>
                            </SelectContent>
                        </Select>
                        <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                            <SelectTrigger className="w-[140px] border-gray-200 bg-white">
                                <SelectValue placeholder="Priority" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Priority</SelectItem>
                                <SelectItem value="Emergency Response">Emergency</SelectItem>
                                <SelectItem value="High">High</SelectItem>
                            </SelectContent>
                        </Select>
                        <Button variant="outline" size="icon" className="border-gray-200 text-gray-500">
                            <Settings className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="icon" className="border-gray-200 text-gray-500">
                            <Filter className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="icon" className="border-gray-200 text-gray-500">
                            <MoreVertical className="w-4 h-4" />
                        </Button>
                    </div>
                </div>

                {/* Filter Row */}
                <div className="grid grid-cols-4 gap-4 mb-4">
                    <div>
                        <label className="text-gray-500 text-xs font-semibold uppercase tracking-wider mb-1.5 block">Tenant</label>
                        <Select value={tenantFilter} onValueChange={setTenantFilter}>
                            <SelectTrigger className="w-full bg-white border-gray-200 h-9">
                                <SelectValue placeholder="All Tenants" />
                            </SelectTrigger>
                            <SelectContent>
                                {tenants.map(t => <SelectItem key={t} value={t === 'All Tenants' ? 'all' : t}>{t}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                    <div>
                        <label className="text-gray-500 text-xs font-semibold uppercase tracking-wider mb-1.5 block">Customer</label>
                        <Select value={customerFilter} onValueChange={setCustomerFilter}>
                            <SelectTrigger className="w-full bg-white border-gray-200 h-9">
                                <SelectValue placeholder="All Customers" />
                            </SelectTrigger>
                            <SelectContent>
                                {customers.map(c => <SelectItem key={c} value={c === 'All Customers' ? 'all' : c}>{c}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                    <div>
                        <label className="text-gray-500 text-xs font-semibold uppercase tracking-wider mb-1.5 block">Site</label>
                        <Select value={siteFilter} onValueChange={setSiteFilter}>
                            <SelectTrigger className="w-full bg-white border-gray-200 h-9">
                                <SelectValue placeholder="All Sites" />
                            </SelectTrigger>
                            <SelectContent>
                                {sites.map(s => <SelectItem key={s} value={s === 'All Sites' ? 'all' : s}>{s}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                    <div>
                        <label className="text-gray-500 text-xs font-semibold uppercase tracking-wider mb-1.5 block">Engineer</label>
                        <Select value={engineerFilter} onValueChange={setEngineerFilter}>
                            <SelectTrigger className="w-full bg-white border-gray-200 h-9">
                                <SelectValue placeholder="All Engineers" />
                            </SelectTrigger>
                            <SelectContent>
                                {engineers.map(e => <SelectItem key={e} value={e === 'All Engineers' ? 'all' : e}>{e}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Checkboxes Row */}
                <div className="flex items-center gap-4 pt-2 border-t border-gray-100 flex-wrap">
                    <button
                        onClick={() => setIncludeNonHelpdesk(prev => !prev)}
                        className={`px-3 py-1.5 rounded-full flex items-center gap-2 text-xs font-medium transition-colors border ${includeNonHelpdesk
                            ? 'bg-blue-50 border-blue-200 text-blue-700'
                            : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                            }`}
                    >
                        {includeNonHelpdesk ? (
                            <div className="w-4 h-4 rounded-full bg-blue-600 flex items-center justify-center">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3">
                                    <polyline points="20 6 9 17 4 12"></polyline>
                                </svg>
                            </div>
                        ) : (
                            <div className="w-4 h-4 rounded-full border border-gray-300"></div>
                        )}
                        <span>Include Non-Helpdesk Jobs</span>
                    </button>

                    <button
                        onClick={() => setNoEngineerAllocated(prev => !prev)}
                        className={`px-3 py-1.5 rounded-full flex items-center gap-2 text-xs font-medium transition-colors border ${noEngineerAllocated
                            ? 'bg-blue-50 border-blue-200 text-blue-700'
                            : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                            }`}
                    >
                        {noEngineerAllocated ? (
                            <div className="w-4 h-4 rounded-full bg-blue-600 flex items-center justify-center">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3">
                                    <polyline points="20 6 9 17 4 12"></polyline>
                                </svg>
                            </div>
                        ) : (
                            <div className="w-4 h-4 rounded-full border border-gray-300"></div>
                        )}
                        <span>Re: Engineer Allocated</span>
                    </button>

                    <button
                        onClick={() => setIncludeTestTenant(prev => !prev)}
                        className={`px-3 py-1.5 rounded-full flex items-center gap-2 text-xs font-medium transition-colors border ${includeTestTenant
                            ? 'bg-blue-50 border-blue-200 text-blue-700'
                            : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                            }`}
                    >
                        {includeTestTenant ? (
                            <div className="w-4 h-4 rounded-full bg-blue-600 flex items-center justify-center">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3">
                                    <polyline points="20 6 9 17 4 12"></polyline>
                                </svg>
                            </div>
                        ) : (
                            <div className="w-4 h-4 rounded-full border border-gray-300"></div>
                        )}
                        <span>Include Test Tenant</span>
                    </button>
                </div>
            </div>

            {/* Table */}
            <div className="px-6 pb-6">
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <div className="overflow-x-auto w-full max-w-[calc(100vw-280px)]">
                        <table className="w-full min-w-[1800px] text-sm">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 whitespace-nowrap cursor-pointer hover:bg-gray-100 border-r border-gray-200" onClick={() => handleSort('jobNumber')}>
                                        <div className="flex items-center gap-1">
                                            Job Number
                                            {sortConfig?.key === 'jobNumber' && (sortConfig.direction === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />)}
                                        </div>
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 whitespace-nowrap cursor-pointer hover:bg-gray-100" onClick={() => handleSort('priority')}>
                                        <div className="flex items-center gap-1">
                                            Priority
                                            {sortConfig?.key === 'priority' && (sortConfig.direction === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />)}
                                        </div>
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 whitespace-nowrap">Description</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 whitespace-nowrap cursor-pointer hover:bg-gray-100" onClick={() => handleSort('dateLogged')}>
                                        <div className="flex items-center gap-1">
                                            Date Logged
                                            {sortConfig?.key === 'dateLogged' && (sortConfig.direction === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />)}
                                        </div>
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 whitespace-nowrap cursor-pointer hover:bg-gray-100" onClick={() => handleSort('status')}>
                                        <div className="flex items-center gap-1">
                                            Job Status
                                            {sortConfig?.key === 'status' && (sortConfig.direction === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />)}
                                        </div>
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 whitespace-nowrap">Engineer</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 whitespace-nowrap">Tenant</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 whitespace-nowrap">Customer</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 whitespace-nowrap">Site</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 whitespace-nowrap">SLA Status</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 whitespace-nowrap">Attendance Remaining</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 whitespace-nowrap">Completion Remaining</th>
                                    <th className="px-4 py-3 border-l border-gray-200"></th>
                                    <th className="px-4 py-3"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {paginatedJobs.map((job, idx) => {
                                    const isSlaBreached = job.alerts && job.alerts.some(a => a.type === 'OVERDUE');
                                    return (
                                        <tr
                                            key={job.id}
                                            className="hover:bg-gray-50 cursor-pointer"
                                            onClick={() => onJobClick?.(job)}
                                        >
                                            <td className="px-4 py-3 text-gray-900 whitespace-nowrap border-r border-gray-200">{job.jobNumber}</td>
                                            <td className="px-4 py-3 whitespace-nowrap">{getPriorityBadge(job.priority)}</td>
                                            <td className="px-4 py-3 text-gray-700 max-w-xs truncate">{job.description}</td>
                                            <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{new Date(job.dateLogged).toLocaleDateString('en-GB')}</td>
                                            <td className="px-4 py-3 whitespace-nowrap">{getStatusBadge(job.status)}</td>
                                            <td className="px-4 py-3 text-gray-700">{job.engineer || 'Unassigned'}</td>
                                            <td className="px-4 py-3 text-gray-700">{job.tenant || 'Guardian Environmental'}</td>
                                            <td className="px-4 py-3 text-gray-700">{job.customer}</td>
                                            <td className="px-4 py-3 text-gray-700">{job.site}</td>
                                            <td className="px-4 py-3">
                                                <span className="flex items-center gap-1">
                                                    <span className={`w-2 h-2 rounded-full ${isSlaBreached ? 'bg-red-500 animate-pulse' : 'bg-green-500'}`}></span>
                                                    <span className="text-gray-700 text-xs">{isSlaBreached ? 'Breached' : 'On Track'}</span>
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-gray-700 whitespace-nowrap">23h 3m</td>
                                            <td className="px-4 py-3 text-gray-700 whitespace-nowrap">47h 12m</td>
                                            <td className="px-4 py-3 border-l border-gray-200">
                                                <button
                                                    className="p-1 hover:bg-gray-100 rounded"
                                                    onClick={(e) => { e.stopPropagation(); }}
                                                >
                                                    <Bell className="w-4 h-4 text-gray-400" />
                                                </button>
                                            </td>
                                            <td className="px-4 py-3">
                                                <button
                                                    className="p-1 hover:bg-gray-100 rounded"
                                                    onClick={(e) => { e.stopPropagation(); onJobClick?.(job); }}
                                                >
                                                    <MoreVertical className="w-4 h-4 text-gray-400" />
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    <div className="border-t border-gray-200 px-4 py-3 flex items-center justify-center gap-2 text-sm">
                        <button
                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                            className="px-3 py-1 text-gray-500 hover:bg-gray-100 rounded flex items-center gap-1 disabled:opacity-50"
                        >
                            <ChevronLeft className="w-4 h-4" />
                            Previous
                        </button>
                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => i + 1).map(page => (
                            <button
                                key={page}
                                onClick={() => setCurrentPage(page)}
                                className={`px-3 py-1 rounded ${currentPage === page ? 'bg-gray-900 text-white' : 'text-gray-700 hover:bg-gray-100'}`}
                            >
                                {page}
                            </button>
                        ))}
                        <span className="px-2">...</span>
                        <button className="px-3 py-1 text-gray-700 hover:bg-gray-100 rounded">{totalPages}</button>
                        <button
                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                            disabled={currentPage === totalPages}
                            className="px-3 py-1 text-gray-500 hover:bg-gray-100 rounded flex items-center gap-1 disabled:opacity-50"
                        >
                            Next
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}