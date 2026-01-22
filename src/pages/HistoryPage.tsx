import { useState } from 'react';
import { Job } from '@/types/job';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button'; // Assuming you have this
import { SearchInput } from '@/components/ui/search-input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Search, Phone, MessageSquare, RefreshCw, Calendar as CalendarIcon, Filter, Trash2 } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';

interface HistoryPageProps {
    jobs: Job[];
}

export default function HistoryPage({ jobs }: HistoryPageProps) {
    const [activeTab, setActiveTab] = useState<'call' | 'sms'>('call');
    const [searchQuery, setSearchQuery] = useState('');
    const [quickFilter, setQuickFilter] = useState<'all' | 'missed' | 'received' | 'outbound'>('all'); // refined for call history
    const [dateFilter, setDateFilter] = useState<'today' | 'yesterday' | 'week' | 'all'>('today');

    return (
        <div className="space-y-6 font-sans">
            {/* Header / Tabs */}
            <div className="flex items-center gap-2 mb-2">
                <div className="bg-gray-100 p-1 rounded-lg flex w-full max-w-4xl border border-gray-200">
                    <button
                        onClick={() => setActiveTab('call')}
                        className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-md transition-all ${activeTab === 'call'
                            ? 'bg-white text-gray-900 shadow-sm border border-gray-200'
                            : 'text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        <Phone className="h-4 w-4" />
                        Call History
                    </button>
                    <button
                        onClick={() => setActiveTab('sms')}
                        className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-md transition-all ${activeTab === 'sms'
                            ? 'bg-white text-gray-900 shadow-sm border border-gray-200'
                            : 'text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        <MessageSquare className="h-4 w-4" />
                        SMS History
                    </button>
                </div>
            </div>

            {/* Quick Filters Row */}
            <div className="flex items-center gap-3">
                <span className="text-xs font-semibold text-gray-900">Quick filters:</span>

                {activeTab === 'call' ? (
                    <>
                        <button className="flex items-center gap-2 px-3 py-1.5 bg-gray-900 text-white rounded-full text-xs font-medium shadow-sm border border-transparent">
                            <div className="w-4 h-4 rounded-full bg-blue-600 flex items-center justify-center">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="w-2.5 h-2.5 text-white">
                                    <polyline points="20 6 9 17 4 12"></polyline>
                                </svg>
                            </div>
                            All Calls
                            <span className="bg-gray-700 px-1.5 py-0.5 rounded-full text-[10px]">0</span>
                        </button>
                        <button className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-200 text-gray-600 rounded-full text-xs font-medium hover:bg-gray-50">
                            <div className="w-4 h-4 rounded-full border border-gray-300"></div>
                            Today
                            <span className="bg-gray-100 px-1.5 py-0.5 rounded-full text-[10px]">0</span>
                        </button>
                    </>
                ) : (
                    <>
                        <button className="flex items-center gap-2 px-3 py-1.5 bg-gray-900 text-white rounded-full text-xs font-medium shadow-sm border border-transparent">
                            <div className="w-4 h-4 rounded-full bg-blue-600 flex items-center justify-center">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="w-2.5 h-2.5 text-white">
                                    <polyline points="20 6 9 17 4 12"></polyline>
                                </svg>
                            </div>
                            All SMS
                            <span className="bg-gray-700 px-1.5 py-0.5 rounded-full text-[10px]">0</span>
                        </button>
                        <button className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-200 text-gray-600 rounded-full text-xs font-medium hover:bg-gray-50">
                            <div className="w-4 h-4 rounded-full border border-gray-300"></div>
                            Today
                            <span className="bg-gray-100 px-1.5 py-0.5 rounded-full text-[10px]">0</span>
                        </button>
                        <button className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-200 text-gray-600 rounded-full text-xs font-medium hover:bg-gray-50">
                            <div className="w-4 h-4 rounded-full border border-gray-300"></div>
                            Failed
                            <span className="bg-gray-100 px-1.5 py-0.5 rounded-full text-[10px]">0</span>
                        </button>
                    </>
                )}
            </div>

            {/* Main Filter Bar */}
            <div className="flex items-center gap-2">
                <div className="relative flex-1">
                    <SearchInput
                        placeholder={activeTab === 'call' ? "Search by phone, name, or customer..." : "Search by phone, name, or message..."}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onClear={() => setSearchQuery('')}
                        className="bg-white border-gray-200"
                    />
                </div>

                <Select value={dateFilter} onValueChange={(v: any) => setDateFilter(v)}>
                    <SelectTrigger className="w-40 h-10 bg-white border-gray-200 text-gray-600">
                        <SelectValue placeholder="All Time" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Time</SelectItem>
                        <SelectItem value="today">Today</SelectItem>
                        <SelectItem value="yesterday">Yesterday</SelectItem>
                        <SelectItem value="week">Last 7 Days</SelectItem>
                    </SelectContent>
                </Select>

                <Button variant="outline" size="icon" className="h-10 w-10 border-gray-200">
                    <RefreshCw className="h-4 w-4 text-gray-500" />
                </Button>
            </div>

            {/* Content Area - Empty State */}
            <Card className="border border-gray-200 shadow-sm min-h-[400px] flex items-center justify-center bg-white">
                <div className="text-center">
                    <div className="flex justify-center mb-4">
                        {activeTab === 'call' ? (
                            <Phone className="h-12 w-12 text-gray-300 transform -rotate-12" />
                        ) : (
                            <MessageSquare className="h-12 w-12 text-gray-300" />
                        )}
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {activeTab === 'call' ? 'No calls found' : 'No SMS messages found'}
                    </h3>
                    <p className="text-sm text-gray-500">
                        Try adjusting your filters or search query
                    </p>
                </div>
            </Card>
        </div>
    );
}
