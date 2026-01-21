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
    Bell,
    Search,
    RefreshCw,
    Clock,
    CheckCircle,
    List
} from 'lucide-react';

type FilterType = 'all' | 'active' | 'overdue' | 'completed';

export default function MyRemindersPage() {
    const [activeFilter, setActiveFilter] = useState<FilterType>('active');
    const [searchQuery, setSearchQuery] = useState('');
    const [reminderType, setReminderType] = useState('all');
    const [priority, setPriority] = useState('all');
    const [timeFilter, setTimeFilter] = useState('all');

    const filters: { key: FilterType; label: string; count: number; icon: React.ReactNode }[] = [
        { key: 'all', label: 'All', count: 0, icon: <List className="h-3 w-3" /> },
        { key: 'active', label: 'Active', count: 0, icon: <Clock className="h-3 w-3" /> },
        { key: 'overdue', label: 'Overdue', count: 0, icon: <Clock className="h-3 w-3" /> },
        { key: 'completed', label: 'Completed', count: 0, icon: <CheckCircle className="h-3 w-3" /> },
    ];

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
                        <SelectItem value="note">Note Reminders</SelectItem>
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

                <Button className="bg-gray-900 hover:bg-gray-800 text-white gap-2">
                    <Bell className="h-4 w-4" />
                    Create Reminder
                </Button>
            </div>

            {/* Divider */}
            <div className="border-t border-gray-200" />

            {/* Empty State */}
            <div className="flex flex-col items-center justify-center py-20">
                <Bell className="h-12 w-12 text-gray-300 mb-4" />
                <h2 className="text-lg font-semibold text-gray-900 mb-1">No reminders found</h2>
                <p className="text-sm text-gray-500">
                    Create reminders from Jobs or notes to see them here.
                </p>
            </div>
        </div>
    );
}
