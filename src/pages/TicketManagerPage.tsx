import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { SearchInput } from '@/components/ui/search-input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Search, Plus, Filter, FileText } from 'lucide-react';
import { useTickets } from '@/contexts/TicketContext';
import { getTagColors, getStatusColors } from '@/lib/ticketUtils';
import { format } from 'date-fns';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { cn } from '@/lib/utils';

export default function TicketManagerPage() {
  const navigate = useNavigate();
  const { tickets } = useTickets();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');

  const filteredTickets = tickets.filter(ticket => {
    if (searchQuery && 
        !ticket.reference.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !ticket.shortDescription.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    if (statusFilter !== 'all' && ticket.status.toLowerCase() !== statusFilter.toLowerCase()) {
      return false;
    }
    if (priorityFilter !== 'all' && ticket.priority !== priorityFilter) {
      return false;
    }
    return true;
  });

  const getStatusColor = (status: string) => {
    return getStatusColors(status);
  };

  const getSLAStatus = (ticket: any) => {
    // Check if ticket has breached SLA
    const now = new Date();
    const createdDate = new Date(ticket.createdDate);
    const minutesSinceCreated = (now.getTime() - createdDate.getTime()) / 1000 / 60;

    if (minutesSinceCreated > ticket.sla.completeBefore) {
      return { status: 'breached', label: 'SLA Breached', color: 'bg-red-100 text-red-700 border-red-200' };
    } else if (minutesSinceCreated > ticket.sla.completeBefore * 0.8) {
      return { status: 'warning', label: 'SLA Warning', color: 'bg-amber-100 text-amber-700 border-amber-200' };
    }
    return { status: 'ok', label: 'On Track', color: 'bg-green-100 text-green-700 border-green-200' };
  };

  return (
    <div className="space-y-6">
      {/* Breadcrumbs */}
      <Breadcrumbs items={[{ label: 'Ticket Manager' }]} />

      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Service Tickets</h1>
          <p className="text-sm text-muted-foreground mt-1">View and manage all existing tickets</p>
        </div>
        <Button className="gap-2" onClick={() => navigate('/tickets/new')}>
          <Plus className="h-4 w-4" />
          New Ticket
        </Button>
      </div>

      <Card>
        <CardHeader className="border-b">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <SearchInput
                placeholder="Search tickets by reference or description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onClear={() => setSearchQuery('')}
              />
            </div>

            {/* Filters */}
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="in progress">In Progress</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                </SelectContent>
              </Select>

              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="All Priorities" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priorities</SelectItem>
                  <SelectItem value="1 - High">1 - High</SelectItem>
                  <SelectItem value="2 - High">2 - High</SelectItem>
                  <SelectItem value="3 - Medium">3 - Medium</SelectItem>
                  <SelectItem value="4 - Low">4 - Low</SelectItem>
                  <SelectItem value="5 - Low">5 - Low</SelectItem>
                </SelectContent>
              </Select>

              <Button variant="outline" className="gap-2">
                <Filter className="h-4 w-4" />
                More Filters
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Reference</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>SLA</TableHead>
                  <TableHead>Classification</TableHead>
                  <TableHead>Reported By</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Jobs</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTickets.map((ticket) => {
                  const slaStatus = getSLAStatus(ticket);
                  return (
                    <TableRow
                      key={ticket.id}
                      className="cursor-pointer hover:bg-accent/50"
                      onClick={() => navigate(`/tickets/${ticket.id}`)}
                    >
                      <TableCell className="font-medium">
                        <Badge variant="outline">{ticket.reference}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="max-w-xs">
                          <div className="font-medium">{ticket.shortDescription}</div>
                          {ticket.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1">
                              {ticket.tags.slice(0, 2).map(tag => (
                                <Badge key={tag} variant="outline" className={`text-xs border ${getTagColors(tag)}`}>
                                  {tag}
                                </Badge>
                              ))}
                              {ticket.tags.length > 2 && (
                                <Badge variant="secondary" className="text-xs">
                                  +{ticket.tags.length - 2}
                                </Badge>
                              )}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={cn('border', getStatusColor(ticket.status))}>
                          {ticket.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{ticket.priority}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={cn('border', slaStatus.color)}>
                          {slaStatus.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {ticket.classification}
                      </TableCell>
                      <TableCell className="text-sm">
                        {ticket.reportedBy.name}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {format(new Date(ticket.createdDate), 'dd MMM yyyy')}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          {ticket.jobs.length} {ticket.jobs.length === 1 ? 'Job' : 'Jobs'}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {filteredTickets.length === 0 && (
        <div className="text-center py-12">
          <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
          <p className="text-muted-foreground">No tickets found</p>
          <Button
            variant="link"
            className="mt-2"
            onClick={() => navigate('/tickets/new')}
          >
            Create your first ticket
          </Button>
        </div>
      )}
    </div>
  );
}
