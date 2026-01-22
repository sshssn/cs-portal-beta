import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Ticket, TicketNote, TimelineEvent, CreateJobFromTicketData } from '@/types/ticket';
import { 
  loadTicketsFromStorage, 
  saveTicketsToStorage, 
  initialTickets,
  generateTicketReference 
} from '@/lib/demoData';

interface TicketContextType {
  tickets: Ticket[];
  addTicket: (ticket: Ticket) => void;
  updateTicket: (ticketId: string, updates: Partial<Ticket>) => void;
  getTicket: (ticketId: string) => Ticket | undefined;
  addNoteToTicket: (ticketId: string, note: Omit<TicketNote, 'id' | 'timestamp'>) => void;
  addJobToTicket: (ticketId: string, jobId: string, jobData: CreateJobFromTicketData) => void;
  addTimelineEvent: (ticketId: string, event: Omit<TimelineEvent, 'id'>) => void;
  generateNewReference: () => string;
  resetToDefaults: () => void;
}

const TicketContext = createContext<TicketContextType | undefined>(undefined);

export function TicketProvider({ children }: { children: ReactNode }) {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    const loaded = loadTicketsFromStorage();
    setTickets(loaded);
    setIsLoaded(true);
  }, []);

  // Save to localStorage whenever tickets change (after initial load)
  useEffect(() => {
    if (isLoaded && tickets.length > 0) {
      saveTicketsToStorage(tickets);
    }
  }, [tickets, isLoaded]);

  const addTicket = (ticket: Ticket) => {
    setTickets(prev => [...prev, ticket]);
  };

  const updateTicket = (ticketId: string, updates: Partial<Ticket>) => {
    setTickets(prev =>
      prev.map(ticket =>
        ticket.id === ticketId ? { ...ticket, ...updates } : ticket
      )
    );
  };

  const getTicket = (ticketId: string) => {
    return tickets.find(ticket => ticket.id === ticketId || ticket.reference === ticketId);
  };

  const addNoteToTicket = (ticketId: string, note: Omit<TicketNote, 'id' | 'timestamp'>) => {
    const newNote: TicketNote = {
      ...note,
      id: `note-${Date.now()}`,
      timestamp: new Date()
    };

    const timelineEvent: TimelineEvent = {
      id: `timeline-${Date.now()}`,
      type: 'note_added',
      title: 'Note Added',
      description: note.content.substring(0, 100) + (note.content.length > 100 ? '...' : ''),
      timestamp: new Date(),
      author: note.author,
      status: 'completed'
    };

    setTickets(prev =>
      prev.map(ticket =>
        ticket.id === ticketId
          ? {
              ...ticket,
              notes: [...ticket.notes, newNote],
              timeline: [...ticket.timeline, timelineEvent]
            }
          : ticket
      )
    );
  };

  const addJobToTicket = (ticketId: string, jobId: string, jobData: CreateJobFromTicketData) => {
    const timelineEvent: TimelineEvent = {
      id: `timeline-${Date.now()}`,
      type: 'job_created',
      title: 'Job Created',
      description: `${jobId}: ${jobData.shortDescription}`,
      timestamp: new Date(),
      author: 'Current User',
      relatedId: jobId,
      status: 'completed'
    };

    setTickets(prev =>
      prev.map(ticket =>
        ticket.id === ticketId
          ? {
              ...ticket,
              jobs: [...ticket.jobs, jobId],
              timeline: [...ticket.timeline, timelineEvent]
            }
          : ticket
      )
    );
  };

  const addTimelineEvent = (ticketId: string, event: Omit<TimelineEvent, 'id'>) => {
    const newEvent: TimelineEvent = {
      ...event,
      id: `timeline-${Date.now()}`
    };

    setTickets(prev =>
      prev.map(ticket =>
        ticket.id === ticketId
          ? {
              ...ticket,
              timeline: [...ticket.timeline, newEvent]
            }
          : ticket
      )
    );
  };

  const generateNewReference = () => {
    return generateTicketReference(tickets);
  };

  const resetToDefaults = () => {
    setTickets(initialTickets);
    saveTicketsToStorage(initialTickets);
  };

  return (
    <TicketContext.Provider
      value={{
        tickets,
        addTicket,
        updateTicket,
        getTicket,
        addNoteToTicket,
        addJobToTicket,
        addTimelineEvent,
        generateNewReference,
        resetToDefaults
      }}
    >
      {children}
    </TicketContext.Provider>
  );
}

export function useTickets() {
  const context = useContext(TicketContext);
  if (context === undefined) {
    throw new Error('useTickets must be used within a TicketProvider');
  }
  return context;
}
