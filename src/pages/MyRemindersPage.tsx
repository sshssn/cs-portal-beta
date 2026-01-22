import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SearchInput } from '@/components/ui/search-input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
    Bell,
    RefreshCw,
    Clock,
    CheckCircle,
    List,
    Plus,
    Trash2,
    Edit,
    CalendarIcon,
    FileText,
    Briefcase,
    AlertCircle,
    MoreHorizontal,
    Check,
    Pause
} from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useReminders, Reminder } from '@/contexts/ReminderContext';
import { useNavigate } from 'react-router-dom';
import { format, formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';

type FilterType = 'all' | 'active' | 'overdue' | 'completed';

export default function MyRemindersPage() {
    const { reminders, addReminder, completeReminder, deleteReminder, snoozeReminder, updateReminder } = useReminders();
    const navigate = useNavigate();
    
    const [activeFilter, setActiveFilter] = useState<FilterType>('active');
    const [searchQuery, setSearchQuery] = useState('');
    const [reminderType, setReminderType] = useState('all');
    const [priority, setPriority] = useState('all');
    const [timeFilter, setTimeFilter] = useState('all');
    
    // Create reminder modal state
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [newReminder, setNewReminder] = useState({
        type: 'general' as Reminder['type'],
        message: '',
        dueDate: new Date(),
        priority: 'medium' as Reminder['priority'],
        relatedId: '',
        relatedReference: ''
    });

    // Filter reminders
    const filteredReminders = reminders.filter(reminder => {
        // Status filter
        if (activeFilter === 'active' && reminder.status !== 'active') return false;
        if (activeFilter === 'overdue' && reminder.status !== 'overdue') return false;
        if (activeFilter === 'completed' && reminder.status !== 'completed') return false;
        
        // Search filter
        if (searchQuery && !reminder.message.toLowerCase().includes(searchQuery.toLowerCase())) return false;
        
        // Type filter
        if (reminderType !== 'all' && reminder.type !== reminderType) return false;
        
        // Priority filter
        if (priority !== 'all' && reminder.priority !== priority) return false;
        
        return true;
    });

    const filters: { key: FilterType; label: string; count: number; icon: React.ReactNode }[] = [
        { key: 'all', label: 'All', count: reminders.length, icon: <List className="h-3 w-3" /> },
        { key: 'active', label: 'Active', count: reminders.filter(r => r.status === 'active').length, icon: <Clock className="h-3 w-3" /> },
        { key: 'overdue', label: 'Overdue', count: reminders.filter(r => r.status === 'overdue').length, icon: <AlertCircle className="h-3 w-3" /> },
        { key: 'completed', label: 'Completed', count: reminders.filter(r => r.status === 'completed').length, icon: <CheckCircle className="h-3 w-3" /> },
    ];

    const handleCreateReminder = () => {
        if (!newReminder.message.trim()) return;
        
        addReminder({
            type: newReminder.type,
            message: newReminder.message,
            dueDate: newReminder.dueDate,
            priority: newReminder.priority,
            relatedId: newReminder.relatedId || undefined,
            relatedReference: newReminder.relatedReference || undefined,
            createdBy: 'Current User'
        });
        
        setIsCreateModalOpen(false);
        setNewReminder({
            type: 'general',
            message: '',
            dueDate: new Date(),
            priority: 'medium',
            relatedId: '',
            relatedReference: ''
        });
    };

    const handleSnooze = (reminder: Reminder, hours: number) => {
        const snoozeUntil = new Date(Date.now() + hours * 60 * 60 * 1000);
        snoozeReminder(reminder.id, snoozeUntil);
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'high': return 'bg-red-100 text-red-700 border-red-200';
            case 'medium': return 'bg-amber-100 text-amber-700 border-amber-200';
            case 'low': return 'bg-green-100 text-green-700 border-green-200';
            default: return 'bg-gray-100 text-gray-700 border-gray-200';
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active': return 'bg-blue-100 text-blue-700';
            case 'overdue': return 'bg-red-100 text-red-700';
            case 'completed': return 'bg-green-100 text-green-700';
            case 'snoozed': return 'bg-purple-100 text-purple-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'job': return <Briefcase className="h-4 w-4 text-blue-500" />;
            case 'ticket': return <FileText className="h-4 w-4 text-purple-500" />;
            default: return <Bell className="h-4 w-4 text-gray-500" />;
        }
    };

    return (
        <div className="w-full space-y-4">
            {/* Header */}
            <div className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-gray-600" />
                <h1 className="text-lg font-semibold text-gray-900">My Reminders</h1>
            </div>

            {/* Quick Filters */}
            <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600 font-medium">Quick filters:</span>
                <div className="flex items-center gap-1">
                    {filters.map((filter) => (
                        <button
                            key={filter.key}
                            onClick={() => setActiveFilter(filter.key)}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm transition-colors border ${activeFilter === filter.key
                                ? 'bg-gray-100 border-gray-300 text-gray-900'
                                : 'bg-white text-gray-600 hover:bg-gray-50 border-gray-200'
                                }`}
                        >
                            {activeFilter === filter.key ? (
                                <div className="w-4 h-4 rounded-full bg-blue-600 flex items-center justify-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="w-2.5 h-2.5 text-white">
                                        <polyline points="20 6 9 17 4 12"></polyline>
                                    </svg>
                                </div>
                            ) : (
                                <div className="w-4 h-4 rounded-full border border-gray-300"></div>
                            )}
                            {filter.label}
                            <span className={`ml-1 px-1.5 py-0.5 rounded-full text-xs ${activeFilter === filter.key
                                ? 'bg-gray-200 text-gray-700'
                                : 'bg-gray-100 text-gray-500'
                                }`}>
                                {filter.count}
                            </span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Search and Filters Row */}
            <div className="flex items-center gap-3">
                <div className="relative flex-1 max-w-md">
                    <SearchInput
                        placeholder="Search reminders by message..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onClear={() => setSearchQuery('')}
                        className="bg-white border-gray-200"
                    />
                </div>

                <Select value={reminderType} onValueChange={setReminderType}>
                    <SelectTrigger className="w-40 bg-white border-gray-200">
                        <SelectValue placeholder="All Reminder Type" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Reminder Type</SelectItem>
                        <SelectItem value="job">Job Reminders</SelectItem>
                        <SelectItem value="ticket">Ticket Reminders</SelectItem>
                        <SelectItem value="general">General Reminders</SelectItem>
                    </SelectContent>
                </Select>

                <Select value={priority} onValueChange={setPriority}>
                    <SelectTrigger className="w-32 bg-white border-gray-200">
                        <SelectValue placeholder="All Priority" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Priority</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                </Select>

                <Select value={timeFilter} onValueChange={setTimeFilter}>
                    <SelectTrigger className="w-28 bg-white border-gray-200">
                        <SelectValue placeholder="All Time" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Time</SelectItem>
                        <SelectItem value="today">Today</SelectItem>
                        <SelectItem value="week">This Week</SelectItem>
                        <SelectItem value="month">This Month</SelectItem>
                    </SelectContent>
                </Select>

                <Button variant="ghost" size="icon" className="h-9 w-9">
                    <RefreshCw className="h-4 w-4 text-gray-500" />
                </Button>

                <Button 
                    className="bg-gray-900 hover:bg-gray-800 text-white gap-2"
                    onClick={() => setIsCreateModalOpen(true)}
                >
                    <Plus className="h-4 w-4" />
                    Create Reminder
                </Button>
            </div>

            {/* Divider */}
            <div className="border-t border-gray-200" />

            {/* Reminders List */}
            {filteredReminders.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20">
                    <Bell className="h-12 w-12 text-gray-300 mb-4" />
                    <h2 className="text-lg font-semibold text-gray-900 mb-1">No reminders found</h2>
                    <p className="text-sm text-gray-500">
                        Create reminders from Jobs or notes to see them here.
                    </p>
                </div>
            ) : (
                <div className="space-y-2">
                    {filteredReminders.map((reminder) => (
                        <div 
                            key={reminder.id} 
                            className={cn(
                                "flex items-center gap-4 p-4 bg-white border rounded-lg hover:shadow-sm transition-shadow",
                                reminder.status === 'overdue' && "border-red-200 bg-red-50/30",
                                reminder.status === 'completed' && "opacity-60"
                            )}
                        >
                            {/* Type Icon */}
                            <div className="flex-shrink-0">
                                {getTypeIcon(reminder.type)}
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                    <p className={cn(
                                        "font-medium text-gray-900",
                                        reminder.status === 'completed' && "line-through"
                                    )}>
                                        {reminder.message}
                                    </p>
                                    {reminder.relatedReference && (
                                        <button 
                                            onClick={() => {
                                                if (reminder.type === 'job' && reminder.relatedId) {
                                                    navigate(`/job/${reminder.relatedId}`);
                                                } else if (reminder.type === 'ticket' && reminder.relatedId) {
                                                    navigate(`/ticket/${reminder.relatedId}`);
                                                }
                                            }}
                                            className="text-xs text-blue-600 hover:underline"
                                        >
                                            {reminder.relatedReference}
                                        </button>
                                    )}
                                </div>
                                <div className="flex items-center gap-3 text-xs text-gray-500">
                                    <span className="flex items-center gap-1">
                                        <CalendarIcon className="h-3 w-3" />
                                        Due: {format(new Date(reminder.dueDate), 'MMM d, yyyy h:mm a')}
                                    </span>
                                    <span>•</span>
                                    <span>{formatDistanceToNow(new Date(reminder.dueDate), { addSuffix: true })}</span>
                                </div>
                            </div>

                            {/* Priority Badge */}
                            <span className={cn(
                                "px-2 py-1 text-xs font-medium rounded-full border",
                                getPriorityColor(reminder.priority)
                            )}>
                                {reminder.priority}
                            </span>

                            {/* Status Badge */}
                            <span className={cn(
                                "px-2 py-1 text-xs font-medium rounded-full",
                                getStatusColor(reminder.status)
                            )}>
                                {reminder.status}
                            </span>

                            {/* Actions */}
                            <div className="flex items-center gap-1">
                                {reminder.status !== 'completed' && (
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-50"
                                        onClick={() => completeReminder(reminder.id)}
                                    >
                                        <Check className="h-4 w-4" />
                                    </Button>
                                )}
                                
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon" className="h-8 w-8">
                                            <MoreHorizontal className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        {reminder.status !== 'completed' && (
                                            <>
                                                <DropdownMenuItem onClick={() => handleSnooze(reminder, 1)}>
                                                    <Pause className="h-4 w-4 mr-2" />
                                                    Snooze 1 hour
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => handleSnooze(reminder, 4)}>
                                                    <Pause className="h-4 w-4 mr-2" />
                                                    Snooze 4 hours
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => handleSnooze(reminder, 24)}>
                                                    <Pause className="h-4 w-4 mr-2" />
                                                    Snooze 1 day
                                                </DropdownMenuItem>
                                            </>
                                        )}
                                        <DropdownMenuItem 
                                            className="text-red-600"
                                            onClick={() => deleteReminder(reminder.id)}
                                        >
                                            <Trash2 className="h-4 w-4 mr-2" />
                                            Delete
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Create Reminder Modal */}
            <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>Create New Reminder</DialogTitle>
                    </DialogHeader>
                    
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Reminder Type</Label>
                            <Select 
                                value={newReminder.type} 
                                onValueChange={(value: Reminder['type']) => setNewReminder(prev => ({ ...prev, type: value }))}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="general">General</SelectItem>
                                    <SelectItem value="job">Job Related</SelectItem>
                                    <SelectItem value="ticket">Ticket Related</SelectItem>
                                    <SelectItem value="note">Note</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {(newReminder.type === 'job' || newReminder.type === 'ticket') && (
                            <div className="space-y-2">
                                <Label>Reference (optional)</Label>
                                <Input
                                    placeholder={newReminder.type === 'job' ? 'e.g., JOB-123' : 'e.g., SRTK100'}
                                    value={newReminder.relatedReference}
                                    onChange={(e) => setNewReminder(prev => ({ ...prev, relatedReference: e.target.value }))}
                                />
                            </div>
                        )}

                        <div className="space-y-2">
                            <Label>Message *</Label>
                            <Textarea
                                placeholder="Enter reminder message..."
                                value={newReminder.message}
                                onChange={(e) => setNewReminder(prev => ({ ...prev, message: e.target.value }))}
                                className="min-h-[100px]"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Due Date</Label>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button variant="outline" className="w-full justify-start text-left font-normal">
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {format(newReminder.dueDate, 'PPP')}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="start">
                                        <Calendar
                                            mode="single"
                                            selected={newReminder.dueDate}
                                            onSelect={(date) => date && setNewReminder(prev => ({ ...prev, dueDate: date }))}
                                            initialFocus
                                        />
                                    </PopoverContent>
                                </Popover>
                            </div>

                            <div className="space-y-2">
                                <Label>Priority</Label>
                                <Select 
                                    value={newReminder.priority} 
                                    onValueChange={(value: Reminder['priority']) => setNewReminder(prev => ({ ...prev, priority: value }))}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="low">Low</SelectItem>
                                        <SelectItem value="medium">Medium</SelectItem>
                                        <SelectItem value="high">High</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleCreateReminder} disabled={!newReminder.message.trim()}>
                            Create Reminder
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
