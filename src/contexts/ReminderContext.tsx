import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface Reminder {
  id: string;
  type: 'job' | 'ticket' | 'general' | 'note';
  relatedId?: string; // job id or ticket id
  relatedReference?: string; // e.g., JOB-123 or SRTK100
  message: string;
  dueDate: Date;
  priority: 'low' | 'medium' | 'high';
  status: 'active' | 'completed' | 'overdue' | 'snoozed';
  createdAt: Date;
  createdBy: string;
  snoozedUntil?: Date;
  completedAt?: Date;
}

export interface Notification {
  id: string;
  type: 'job_created' | 'ticket_created' | 'reminder_due' | 'sla_warning' | 'job_updated' | 'ticket_updated';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  relatedId?: string;
  relatedType?: 'job' | 'ticket' | 'reminder';
}

interface ReminderContextType {
  reminders: Reminder[];
  notifications: Notification[];
  unreadCount: number;
  addReminder: (reminder: Omit<Reminder, 'id' | 'createdAt' | 'status'>) => void;
  updateReminder: (id: string, updates: Partial<Reminder>) => void;
  deleteReminder: (id: string) => void;
  completeReminder: (id: string) => void;
  snoozeReminder: (id: string, until: Date) => void;
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  clearNotifications: () => void;
}

const ReminderContext = createContext<ReminderContextType | undefined>(undefined);

const STORAGE_KEY_REMINDERS = 'ooh-reminders';
const STORAGE_KEY_NOTIFICATIONS = 'ooh-notifications';

// Initial demo reminders
const initialReminders: Reminder[] = [
  {
    id: 'reminder-1',
    type: 'job',
    relatedId: 'job-1',
    relatedReference: 'JOB-2025-0907-001',
    message: 'Follow up with engineer on HVAC repair status',
    dueDate: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours from now
    priority: 'high',
    status: 'active',
    createdAt: new Date(),
    createdBy: 'Current User'
  },
  {
    id: 'reminder-2',
    type: 'ticket',
    relatedId: 'ticket-1',
    relatedReference: 'SRTK100',
    message: 'Check SLA status for ticket SRTK100',
    dueDate: new Date(Date.now() + 4 * 60 * 60 * 1000), // 4 hours from now
    priority: 'medium',
    status: 'active',
    createdAt: new Date(),
    createdBy: 'Current User'
  },
  {
    id: 'reminder-3',
    type: 'general',
    message: 'End of shift report preparation',
    dueDate: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago (overdue)
    priority: 'high',
    status: 'overdue',
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000),
    createdBy: 'Current User'
  }
];

// Initial demo notifications
const initialNotifications: Notification[] = [
  {
    id: 'notif-1',
    type: 'job_created',
    title: 'New Job Created',
    message: 'Job JOB-2025-0907-001 has been created and assigned',
    timestamp: new Date(Date.now() - 30 * 60 * 1000), // 30 mins ago
    read: false,
    relatedId: 'job-1',
    relatedType: 'job'
  },
  {
    id: 'notif-2',
    type: 'ticket_created',
    title: 'New Service Ticket',
    message: 'Ticket SRTK100 has been logged',
    timestamp: new Date(Date.now() - 60 * 60 * 1000), // 1 hour ago
    read: false,
    relatedId: 'ticket-1',
    relatedType: 'ticket'
  },
  {
    id: 'notif-3',
    type: 'sla_warning',
    title: 'SLA Warning',
    message: 'Ticket SRTK101 is approaching attendance SLA breach',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    read: true,
    relatedId: 'ticket-2',
    relatedType: 'ticket'
  },
  {
    id: 'notif-4',
    type: 'reminder_due',
    title: 'Reminder Due',
    message: 'End of shift report preparation is due',
    timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
    read: false,
    relatedId: 'reminder-3',
    relatedType: 'reminder'
  }
];

function loadFromStorage<T>(key: string, initial: T): T {
  if (typeof window === 'undefined') return initial;
  try {
    const stored = localStorage.getItem(key);
    if (stored) {
      const parsed = JSON.parse(stored);
      // Convert date strings back to Date objects
      if (Array.isArray(parsed)) {
        return parsed.map((item: any) => ({
          ...item,
          dueDate: item.dueDate ? new Date(item.dueDate) : undefined,
          createdAt: item.createdAt ? new Date(item.createdAt) : undefined,
          completedAt: item.completedAt ? new Date(item.completedAt) : undefined,
          snoozedUntil: item.snoozedUntil ? new Date(item.snoozedUntil) : undefined,
          timestamp: item.timestamp ? new Date(item.timestamp) : undefined
        })) as T;
      }
      return parsed;
    }
  } catch (e) {
    console.error('Error loading from storage:', e);
  }
  return initial;
}

function saveToStorage<T>(key: string, data: T): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error('Error saving to storage:', e);
  }
}

export function ReminderProvider({ children }: { children: ReactNode }) {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    const loadedReminders = loadFromStorage(STORAGE_KEY_REMINDERS, initialReminders);
    const loadedNotifications = loadFromStorage(STORAGE_KEY_NOTIFICATIONS, initialNotifications);
    setReminders(loadedReminders);
    setNotifications(loadedNotifications);
    setIsLoaded(true);
  }, []);

  // Save to localStorage whenever data changes
  useEffect(() => {
    if (isLoaded) {
      saveToStorage(STORAGE_KEY_REMINDERS, reminders);
    }
  }, [reminders, isLoaded]);

  useEffect(() => {
    if (isLoaded) {
      saveToStorage(STORAGE_KEY_NOTIFICATIONS, notifications);
    }
  }, [notifications, isLoaded]);

  // Check for overdue reminders every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setReminders(prev => 
        prev.map(reminder => {
          if (reminder.status === 'active' && new Date(reminder.dueDate) < new Date()) {
            // Add notification for overdue reminder
            const overdueNotif: Notification = {
              id: `notif-overdue-${reminder.id}-${Date.now()}`,
              type: 'reminder_due',
              title: 'Reminder Overdue',
              message: reminder.message,
              timestamp: new Date(),
              read: false,
              relatedId: reminder.id,
              relatedType: 'reminder'
            };
            setNotifications(prev => [overdueNotif, ...prev]);
            return { ...reminder, status: 'overdue' as const };
          }
          return reminder;
        })
      );
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  const addReminder = (reminder: Omit<Reminder, 'id' | 'createdAt' | 'status'>) => {
    const newReminder: Reminder = {
      ...reminder,
      id: `reminder-${Date.now()}`,
      createdAt: new Date(),
      status: 'active'
    };
    setReminders(prev => [newReminder, ...prev]);
  };

  const updateReminder = (id: string, updates: Partial<Reminder>) => {
    setReminders(prev => 
      prev.map(r => r.id === id ? { ...r, ...updates } : r)
    );
  };

  const deleteReminder = (id: string) => {
    setReminders(prev => prev.filter(r => r.id !== id));
  };

  const completeReminder = (id: string) => {
    setReminders(prev => 
      prev.map(r => r.id === id ? { ...r, status: 'completed' as const, completedAt: new Date() } : r)
    );
  };

  const snoozeReminder = (id: string, until: Date) => {
    setReminders(prev => 
      prev.map(r => r.id === id ? { ...r, status: 'snoozed' as const, snoozedUntil: until } : r)
    );
  };

  const addNotification = (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    const newNotification: Notification = {
      ...notification,
      id: `notif-${Date.now()}`,
      timestamp: new Date(),
      read: false
    };
    setNotifications(prev => [newNotification, ...prev]);
  };

  const markNotificationRead = (id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  };

  const markAllNotificationsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  return (
    <ReminderContext.Provider
      value={{
        reminders,
        notifications,
        unreadCount,
        addReminder,
        updateReminder,
        deleteReminder,
        completeReminder,
        snoozeReminder,
        addNotification,
        markNotificationRead,
        markAllNotificationsRead,
        clearNotifications
      }}
    >
      {children}
    </ReminderContext.Provider>
  );
}

export function useReminders() {
  const context = useContext(ReminderContext);
  if (context === undefined) {
    throw new Error('useReminders must be used within a ReminderProvider');
  }
  return context;
}
