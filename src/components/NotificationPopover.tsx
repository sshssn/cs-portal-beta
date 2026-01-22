import { useState } from 'react';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Bell, Trash2, Clock, FileText, Briefcase, AlertTriangle, CheckCircle2 } from "lucide-react";
import { useReminders, Notification } from '@/contexts/ReminderContext';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

export default function NotificationPopover() {
    const { notifications, unreadCount, markNotificationRead, markAllNotificationsRead, clearNotifications } = useReminders();
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(false);

    const getNotificationIcon = (type: Notification['type']) => {
        switch (type) {
            case 'job_created':
            case 'job_updated':
                return <Briefcase className="h-4 w-4 text-blue-500" />;
            case 'ticket_created':
            case 'ticket_updated':
                return <FileText className="h-4 w-4 text-purple-500" />;
            case 'reminder_due':
                return <Clock className="h-4 w-4 text-amber-500" />;
            case 'sla_warning':
                return <AlertTriangle className="h-4 w-4 text-red-500" />;
            default:
                return <Bell className="h-4 w-4 text-gray-500" />;
        }
    };

    const handleNotificationClick = (notification: Notification) => {
        markNotificationRead(notification.id);
        
        // Navigate based on type
        if (notification.relatedType === 'job' && notification.relatedId) {
            navigate(`/job/${notification.relatedId}`);
            setIsOpen(false);
        } else if (notification.relatedType === 'ticket' && notification.relatedId) {
            navigate(`/ticket/${notification.relatedId}`);
            setIsOpen(false);
        } else if (notification.relatedType === 'reminder') {
            navigate('/reminders');
            setIsOpen(false);
        }
    };

    const formatTime = (date: Date) => {
        try {
            return formatDistanceToNow(new Date(date), { addSuffix: true });
        } catch {
            return 'Just now';
        }
    };

    return (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-5 w-5 text-gray-500" />
                    {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-white text-xs font-medium flex items-center justify-center">
                            {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-[380px] p-0 shadow-lg border-gray-100">
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                    <h4 className="font-semibold text-gray-900">Notifications</h4>
                    <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500">({notifications.length} total)</span>
                        {unreadCount > 0 && (
                            <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-7 text-xs text-blue-600 hover:text-blue-700"
                                onClick={markAllNotificationsRead}
                            >
                                Mark all read
                            </Button>
                        )}
                    </div>
                </div>

                {/* Notifications List */}
                {notifications.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
                        <div className="mb-4 relative">
                            <div className="absolute inset-0 bg-yellow-400 blur-lg opacity-20 rounded-full"></div>
                            <Bell className="h-12 w-12 text-yellow-400 fill-yellow-400 relative z-10" />
                        </div>
                        <h3 className="text-gray-900 font-medium mb-1">No notifications yet</h3>
                        <p className="text-sm text-gray-500">
                            Your notifications will appear here
                        </p>
                    </div>
                ) : (
                    <div className="max-h-[400px] overflow-y-auto">
                        {notifications.map((notification) => (
                            <div
                                key={notification.id}
                                onClick={() => handleNotificationClick(notification)}
                                className={cn(
                                    "flex items-start gap-3 px-4 py-3 border-b border-gray-50 cursor-pointer transition-colors hover:bg-gray-50",
                                    !notification.read && "bg-blue-50/50"
                                )}
                            >
                                <div className="flex-shrink-0 mt-0.5">
                                    {getNotificationIcon(notification.type)}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <p className={cn(
                                            "text-sm truncate",
                                            notification.read ? "text-gray-700" : "text-gray-900 font-medium"
                                        )}>
                                            {notification.title}
                                        </p>
                                        {!notification.read && (
                                            <span className="h-2 w-2 rounded-full bg-blue-500 flex-shrink-0" />
                                        )}
                                    </div>
                                    <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">
                                        {notification.message}
                                    </p>
                                    <p className="text-xs text-gray-400 mt-1">
                                        {formatTime(notification.timestamp)}
                                    </p>
                                </div>
                                {notification.read && (
                                    <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                                )}
                            </div>
                        ))}
                    </div>
                )}

                {/* Footer */}
                {notifications.length > 0 && (
                    <div className="flex items-center justify-between px-4 py-2 border-t border-gray-100 bg-gray-50">
                        <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-7 text-xs text-gray-600 hover:text-gray-900"
                            onClick={() => {
                                navigate('/reminders');
                                setIsOpen(false);
                            }}
                        >
                            View all reminders
                        </Button>
                        <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-7 text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={clearNotifications}
                        >
                            <Trash2 className="h-3 w-3 mr-1" />
                            Clear all
                        </Button>
                    </div>
                )}
            </PopoverContent>
        </Popover>
    );
}
