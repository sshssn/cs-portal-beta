import { useState, useCallback } from 'react';
import NotificationToast, { Notification } from './NotificationToast';

export default function NotificationManager() {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = useCallback((notification: Omit<Notification, 'id' | 'timestamp'>) => {
    const newNotification: Notification = {
      ...notification,
      id: `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date()
    };
    
    setNotifications(prev => [...prev, newNotification]);
  }, []);

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  }, []);

  // Expose addNotification method globally for other components to use
  if (typeof window !== 'undefined') {
    (window as any).addNotification = addNotification;
  }

  return (
    <div className="fixed top-4 right-4 z-50 space-y-3">
      {notifications.map((notification, index) => (
        <div
          key={notification.id}
          className="transform transition-all duration-300 ease-in-out"
          style={{
            transform: `translateY(${index * 5}px)`,
            zIndex: 1000 - index
          }}
        >
          <NotificationToast
            notification={notification}
            onDismiss={removeNotification}
          />
        </div>
      ))}
    </div>
  );
}
