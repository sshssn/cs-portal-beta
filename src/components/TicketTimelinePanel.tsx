import { TimelineEvent } from '@/types/ticket';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, CheckCircle, XCircle, AlertCircle, FileText, Tag as TagIcon, Briefcase, User } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface TicketTimelinePanelProps {
  timeline: TimelineEvent[];
  className?: string;
}

export function TicketTimelinePanel({ timeline, className }: TicketTimelinePanelProps) {
  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'breached':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'approaching':
        return 'text-amber-600 bg-amber-50 border-amber-200';
      case 'pending':
        return 'text-gray-600 bg-gray-50 border-gray-200';
      default:
        return 'text-blue-600 bg-blue-50 border-blue-200';
    }
  };

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5" />;
      case 'breached':
        return <XCircle className="h-5 w-5" />;
      case 'approaching':
        return <AlertCircle className="h-5 w-5" />;
      default:
        return <Clock className="h-5 w-5" />;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'job_created':
        return <Briefcase className="h-4 w-4" />;
      case 'note_added':
        return <FileText className="h-4 w-4" />;
      case 'tag_added':
        return <TagIcon className="h-4 w-4" />;
      case 'sla_milestone':
        return <Clock className="h-4 w-4" />;
      default:
        return <User className="h-4 w-4" />;
    }
  };

  // Sort timeline by date, newest first
  const sortedTimeline = [...timeline].sort((a, b) => 
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  return (
    <Card className={cn("p-6", className)}>
      <div className="flex items-center gap-2 mb-6">
        <Clock className="h-5 w-5 text-muted-foreground" />
        <h3 className="text-lg font-semibold">Timeline</h3>
      </div>

      <div className="space-y-4">
        {sortedTimeline.map((event, index) => (
          <div key={event.id} className="relative">
            {/* Timeline line */}
            {index < sortedTimeline.length - 1 && (
              <div className="absolute left-[21px] top-12 bottom-0 w-0.5 bg-border" />
            )}

            <div className="flex gap-3">
              {/* Icon/Status indicator */}
              <div className={cn(
                "flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center border-2",
                event.status ? getStatusColor(event.status) : 'text-blue-600 bg-blue-50 border-blue-200'
              )}>
                {event.type === 'sla_milestone' ? getStatusIcon(event.status) : getTypeIcon(event.type)}
              </div>

              {/* Event content */}
              <div className="flex-1 min-w-0 pb-6">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <div>
                    {event.type === 'sla_milestone' ? (
                      <div className="flex items-center gap-2">
                        {event.status === 'breached' && (
                          <div className="flex items-center gap-1">
                            <div className="w-2 h-2 rounded-full bg-red-500" />
                          </div>
                        )}
                        {event.status === 'completed' && (
                          <div className="flex items-center gap-1">
                            <div className="w-2 h-2 rounded-full bg-green-500" />
                          </div>
                        )}
                        {event.status === 'approaching' && (
                          <div className="flex items-center gap-1">
                            <div className="w-2 h-2 rounded-full bg-amber-500" />
                          </div>
                        )}
                        <span className="text-sm font-semibold uppercase tracking-wide text-gray-700">
                          {event.title}
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold uppercase tracking-wide text-gray-500">
                          {event.title}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex flex-col items-end">
                    <Badge variant="outline" className="text-xs whitespace-nowrap">
                      {format(new Date(event.timestamp), 'dd MMM')}
                    </Badge>
                    <span className="text-xs text-muted-foreground mt-0.5">
                      {format(new Date(event.timestamp), 'HH:mm')}
                    </span>
                  </div>
                </div>

                {event.description && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {event.description}
                  </p>
                )}

                {event.author && (
                  <p className="text-xs text-muted-foreground mt-1">
                    by {event.author}
                  </p>
                )}

                {event.relatedId && event.type === 'job_created' && (
                  <Badge variant="secondary" className="mt-2">
                    {event.relatedId}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
