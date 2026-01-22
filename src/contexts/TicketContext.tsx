import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Ticket, TicketNote, TimelineEvent, CreateJobFromTicketData } from '@/types/ticket';
import { mockTickets } from '@/lib/ticketUtils';

interface TicketContextType {
  tickets: Ticket[];
  addTicket: (ticket: Ticket) => void;
  updateTicket: (ticketId: string, updates: Partial<Ticket>) => void;
  getTicket: (ticketId: string) => Ticket | undefined;
  addNoteToTicket: (ticketId: string, note: Omit<TicketNote, 'id' | 'timestamp'>) => void;
  addJobToTicket: (ticketId: string, jobId: string, jobData: CreateJobFromTicketData) => void;
  addTimelineEvent: (ticketId: string, event: Omit<TimelineEvent, 'id'>) => void;
}

const TicketContext = createContext<TicketContextType | undefined>(undefined);

export function TicketProvider({ children }: { children: ReactNode }) {
  const [tickets, setTickets] = useState<Ticket[]>(mockTickets);

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

  return (
    <TicketContext.Provider
      value={{
        tickets,
        addTicket,
        updateTicket,
        getTicket,
        addNoteToTicket,
        addJobToTicket,
        addTimelineEvent
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
