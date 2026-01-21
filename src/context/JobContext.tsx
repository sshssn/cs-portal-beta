import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { Job } from '@/types/job';

interface JobContextType {
    jobs: Job[];
    loading: boolean;
    refreshJobs: () => void;
    getJobById: (id: string) => Job | undefined;
    addJob: (job: Job) => void;
    updateJob: (job: Job) => void;
}

const JobContext = createContext<JobContextType | undefined>(undefined);

// Helper to generate random date within last X days
const randomDate = (daysAgo: number) => {
    const date = new Date();
    date.setDate(date.getDate() - Math.floor(Math.random() * daysAgo));
    date.setHours(Math.floor(Math.random() * 24), Math.floor(Math.random() * 60));
    return date;
};

const generateRandomJobs = (): Job[] => {
    const priorities = ['Emergency Response', 'Next day 24-hour Response', 'Call out 4-hour Response', 'Standard'] as const;
    const statuses = ['allocated', 'completed', 'reqs_invoice', 'new', 'parts_to_fit'] as const;
    const engineers = [
        { name: 'Multiconnect Electrical Services Ltd', phone: '0121 555 1234' },
        { name: 'Keith McLean 0', phone: '+447835682858' },
        { name: 'John Smith', phone: '07700 900123' },
        { name: 'Sarah Johnson', phone: '07700 900456' }
    ];
    const customers = [
        { name: 'Homes For Students Limited', sites: ['HFS ABeleven', 'HFS The Elements', 'HFS The Cube Ealing'] },
        { name: 'St Martins Care Ltd', sites: ['St Martins Care Ltd - Park View', 'Meppershall Care Home'] },
        { name: 'IQSA Services Limited', sites: ['IQ Weston Hall', 'IQ Opal Court'] }
    ];

    const jobScenarios = [
        {
            desc: 'Blown fuse. Affecting the entire floor. Urgent attendance required.',
            detail: 'Client reported power outage on the 2nd floor. Several student rooms affected. Fuse box located in the hallway cupboard.',
            trade: 'Electrical'
        },
        {
            desc: 'Leak underneath the kitchen cupboard unable to isolate the water.',
            detail: 'Flat 24 on the second floor. This leak is not connected to a previous leak that was reported which is the kitchen sink. Water is damaging the flooring.',
            trade: 'Plumbing'
        },
        {
            desc: 'Fire alarm panel showing fault.',
            detail: 'Main panel in reception is beeping. Error code E-204 displayed. System was serviced last month.',
            trade: 'Fire Safety'
        },
        {
            desc: 'Boiler not firing up. No hot water in block B.',
            detail: 'Tenants reporting cold showers. checked pressure, seems fine. Error code F1 flashing.',
            trade: 'HVAC'
        },
        {
            desc: 'Broken window latch in room 104.',
            detail: 'Security risk. Window is on ground floor and cannot be locked.',
            trade: 'General'
        }
    ];

    return Array.from({ length: 25 }).map((_, i) => {
        const scenario = jobScenarios[Math.floor(Math.random() * jobScenarios.length)];
        const customer = customers[Math.floor(Math.random() * customers.length)];
        const site = customer.sites[Math.floor(Math.random() * customer.sites.length)];
        const engineer = engineers[Math.floor(Math.random() * engineers.length)];
        const status = statuses[Math.floor(Math.random() * statuses.length)];
        const loggedDate = randomDate(5);

        return {
            id: `J${i + 1}`,
            jobNumber: `C00${22230 + i}`,
            priority: priorities[Math.floor(Math.random() * priorities.length)] as any,
            description: scenario.desc,
            dateLogged: loggedDate,
            status: status as any,
            engineer: engineer.name,
            tenant: 'Guardian Environmental Services Limited',
            customer: customer.name,
            site: site,
            jobType: 'Call Out',
            category: scenario.trade as any,
            targetCompletionTime: 240,
            reason: null,
            contact: {
                name: 'Site Manager',
                number: '07700 900789',
                email: 'manager@site.com',
                relationship: 'Site Contact'
            },
            reporter: {
                name: ['Jade', 'Andreas', 'Vivienna', 'Chola'][Math.floor(Math.random() * 4)],
                number: '01224 515 225',
                email: 'reporter@client.com',
                relationship: 'Tenant'
            },
            customAlerts: {
                acceptSLA: 60,
                onsiteSLA: 240,
                completedSLA: 480
            },
            // Logic for SLA status mock
            alerts: Math.random() > 0.7 ? [{
                id: `alert-${i}`,
                type: 'OVERDUE',
                message: 'SLA Breached',
                timestamp: new Date(),
                acknowledged: false
            }] : [],
            // Rich descriptions
            jobNotes: scenario.detail,
            primaryJobTrade: scenario.trade,
            customerOrderNumber: `${182000 + i}`,
            dateAccepted: status !== 'new' ? new Date(loggedDate.getTime() + 3600000) : null,
            dateOnSite: ['attended', 'completed', 'reqs_invoice'].includes(status) ? new Date(loggedDate.getTime() + 7200000) : null,
            dateCompleted: ['completed', 'reqs_invoice'].includes(status) ? new Date(loggedDate.getTime() + 10800000) : null,
        };
    });
};

export function JobProvider({ children }: { children: ReactNode }) {
    const [jobs, setJobs] = useState<Job[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const storedJobs = localStorage.getItem('global_jobs_mock_v3');
        if (storedJobs) {
            // Need to revive dates from JSON
            const parsed = JSON.parse(storedJobs, (key, value) => {
                if (key.startsWith('date') && value) return new Date(value);
                return value;
            });
            setJobs(parsed);
            setLoading(false);
        } else {
            const newJobs = generateRandomJobs();
            setJobs(newJobs);
            localStorage.setItem('global_jobs_mock_v3', JSON.stringify(newJobs));
            setLoading(false);
        }
    }, []);

    const refreshJobs = useCallback(() => {
        const newJobs = generateRandomJobs();
        setJobs(newJobs);
        localStorage.setItem('global_jobs_mock_v3', JSON.stringify(newJobs));
    }, []);

    const getJobById = useCallback((id: string) => jobs.find(j => j.id === id), [jobs]);

    const addJob = useCallback((job: Job) => {
        setJobs(prev => {
            const updated = [job, ...prev];
            localStorage.setItem('global_jobs_mock_v3', JSON.stringify(updated));
            return updated;
        });
    }, []);

    const updateJob = useCallback((updatedJob: Job) => {
        setJobs(prev => {
            const updated = prev.map(j => j.id === updatedJob.id ? updatedJob : j);
            localStorage.setItem('global_jobs_mock_v3', JSON.stringify(updated));
            return updated;
        });
    }, []);

    return (
        <JobContext.Provider value={{ jobs, loading, refreshJobs, getJobById, addJob, updateJob }}>
            {children}
        </JobContext.Provider>
    );
}

export function useJobs() {
    const context = useContext(JobContext);
    if (context === undefined) {
        throw new Error('useJobs must be used within a JobProvider');
    }
    return context;
}
