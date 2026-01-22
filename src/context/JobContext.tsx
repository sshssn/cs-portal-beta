import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { Job } from '@/types/job';
import { 
  loadJobsFromStorage, 
  saveJobsToStorage, 
  initialJobs,
  generateJobNumber 
} from '@/lib/demoData';

interface JobContextType {
    jobs: Job[];
    loading: boolean;
    refreshJobs: () => void;
    getJobById: (id: string) => Job | undefined;
    getJobByJobNumber: (jobNumber: string) => Job | undefined;
    getJobsByTicketReference: (ticketRef: string) => Job[];
    addJob: (job: Job) => void;
    updateJob: (job: Job) => void;
    generateNewJobNumber: () => string;
    resetToDefaults: () => void;
}

const JobContext = createContext<JobContextType | undefined>(undefined);

export function JobProvider({ children }: { children: ReactNode }) {
    const [jobs, setJobs] = useState<Job[]>([]);
    const [loading, setLoading] = useState(true);

    // Load from localStorage on mount
    useEffect(() => {
        const loaded = loadJobsFromStorage();
        setJobs(loaded);
        setLoading(false);
    }, []);

    // Save to localStorage whenever jobs change (after initial load)
    useEffect(() => {
        if (!loading && jobs.length > 0) {
            saveJobsToStorage(jobs);
        }
    }, [jobs, loading]);

    const refreshJobs = useCallback(() => {
        const loaded = loadJobsFromStorage();
        setJobs(loaded);
    }, []);

    const getJobById = useCallback((id: string) => {
        return jobs.find(j => 
            j.id === id || 
            j.jobNumber === id || 
            j.jobNumber?.toLowerCase() === id.toLowerCase()
        );
    }, [jobs]);

    const getJobByJobNumber = useCallback((jobNumber: string) => {
        return jobs.find(j => j.jobNumber === jobNumber || j.jobNumber?.toLowerCase() === jobNumber.toLowerCase());
    }, [jobs]);

    const getJobsByTicketReference = useCallback((ticketRef: string) => {
        return jobs.filter(j => j.ticketReference === ticketRef);
    }, [jobs]);

    const addJob = useCallback((job: Job) => {
        setJobs(prev => [...prev, job]);
    }, []);

    const updateJob = useCallback((updatedJob: Job) => {
        setJobs(prev => prev.map(j => j.id === updatedJob.id ? updatedJob : j));
    }, []);

    const generateNewJobNumber = useCallback(() => {
        return generateJobNumber(jobs);
    }, [jobs]);

    const resetToDefaults = useCallback(() => {
        setJobs(initialJobs);
        saveJobsToStorage(initialJobs);
    }, []);

    return (
        <JobContext.Provider value={{
            jobs,
            loading,
            refreshJobs,
            getJobById,
            getJobByJobNumber,
            getJobsByTicketReference,
            addJob,
            updateJob,
            generateNewJobNumber,
            resetToDefaults
        }}>
            {children}
        </JobContext.Provider>
    );
}

export function useJobs() {
    const context = useContext(JobContext);
    if (!context) {
        throw new Error('useJobs must be used within a JobProvider');
    }
    return context;
}
