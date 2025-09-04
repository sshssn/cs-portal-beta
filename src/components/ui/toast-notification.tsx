import { useState, useEffect } from 'react';
import { CheckCircle, AlertCircle, Info, XCircle, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ToastNotification {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message: string;
  duration?: number;
  timestamp: Date;
}

interface ToastNotificationProps {
  notification: ToastNotification;
  onRemove: (id: string) => void;
}

export default function ToastNotification({ notification, onRemove }: ToastNotificationProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);

  useEffect(() => {
    // Animate in
    const timer = setTimeout(() => setIsVisible(true), 100);
    
    // Auto-remove after duration
    if (notification.duration !== 0) {
      const removeTimer = setTimeout(() => {
        handleRemove();
      }, notification.duration || 5000);
      
      return () => clearTimeout(removeTimer);
    }
    
    return () => clearTimeout(timer);
  }, [notification.duration]);

  const handleRemove = () => {
    setIsRemoving(true);
    setTimeout(() => onRemove(notification.id), 300);
  };

  const getIcon = () => {
    switch (notification.type) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'warning':
        return <AlertCircle className="h-5 w-5 text-amber-500" />;
      default:
        return <Info className="h-5 w-5 text-blue-500" />;
    }
  };

  const getToastStyles = () => {
    const baseStyles = "flex items-start gap-3 p-4 rounded-lg shadow-lg border-l-4 transform transition-all duration-300 ease-in-out";
    
    switch (notification.type) {
      case 'success':
        return cn(baseStyles, "bg-green-50 border-green-400 text-green-900");
      case 'error':
        return cn(baseStyles, "bg-red-50 border-red-400 text-red-900");
      case 'warning':
        return cn(baseStyles, "bg-amber-50 border-amber-400 text-amber-900");
      default:
        return cn(baseStyles, "bg-blue-50 border-blue-400 text-blue-900");
    }
  };

  return (
    <div
      className={cn(
        "fixed top-4 right-4 z-50 max-w-sm w-full",
        isVisible && !isRemoving ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"
      )}
    >
      <div className={getToastStyles()}>
        <div className="flex-shrink-0 mt-0.5">
          {getIcon()}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h4 className="font-semibold text-sm mb-1">{notification.title}</h4>
              <p className="text-sm opacity-90 leading-relaxed">{notification.message}</p>
              <p className="text-xs opacity-70 mt-2">
                {notification.timestamp.toLocaleTimeString()}
              </p>
            </div>
            
            <button
              onClick={handleRemove}
              className="flex-shrink-0 ml-2 p-1 rounded-full hover:bg-black/10 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Toast Manager Component
export function ToastManager() {
  const [notifications, setNotifications] = useState<ToastNotification[]>([]);

  useEffect(() => {
    // Listen for new notifications
    const handleNewNotification = (event: CustomEvent) => {
      const newNotification: ToastNotification = {
        id: Date.now().toString(),
        type: event.detail.type || 'info',
        title: event.detail.title || 'Notification',
        message: event.detail.message || '',
        duration: event.detail.duration,
        timestamp: new Date()
      };
      
      setNotifications(prev => [newNotification, ...prev.slice(0, 4)]); // Keep max 5 notifications
    };

    // Listen for global notifications
    window.addEventListener('showNotification', handleNewNotification as EventListener);
    
    // Also listen for the old format
    window.addEventListener('addNotification', handleNewNotification as EventListener);

    return () => {
      window.removeEventListener('showNotification', handleNewNotification as EventListener);
      window.removeEventListener('addNotification', handleNewNotification as EventListener);
    };
  }, []);

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  return (
    <div className="fixed top-4 right-4 z-50 space-y-3">
      {notifications.map((notification) => (
        <ToastNotification
          key={notification.id}
          notification={notification}
          onRemove={removeNotification}
        />
      ))}
    </div>
  );
}

// Global function to show notifications
export const showNotification = (options: {
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message: string;
  duration?: number;
}) => {
  const event = new CustomEvent('showNotification', { detail: options });
  window.dispatchEvent(event);
};
