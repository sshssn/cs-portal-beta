import { Badge } from '@/components/ui/badge';
import { Job } from '@/types/job';
import { Clock, CheckCircle, AlertTriangle } from 'lucide-react';

interface StatusBadgeProps {
  status: Job['status'];
  reason?: string | null;
}

export default function StatusBadge({ status, reason }: StatusBadgeProps) {
  const getStatusConfig = (status: Job['status']) => {
    switch (status) {
      case 'green':
        return {
          icon: CheckCircle,
          text: 'Completed',
          className: 'bg-emerald-500 text-white border-emerald-600 shadow-sm',
        };
      case 'amber':
        return {
          icon: Clock,
          text: 'In Progress',
          className: 'bg-amber-500 text-white border-amber-600 shadow-sm',
        };
      case 'red':
        return {
          icon: AlertTriangle,
          text: 'Issue',
          className: 'bg-red-500 text-white border-red-600 shadow-sm',
        };
      default:
        return {
          icon: Clock,
          text: 'Unknown',
          className: 'bg-gray-500 text-white border-gray-600 shadow-sm',
        };
    }
  };

  const config = getStatusConfig(status);
  const Icon = config.icon;

  return (
    <div className="flex flex-col gap-1">
      <Badge className={`${config.className} flex items-center gap-1 w-fit`}>
        <Icon size={12} />
        {config.text}
      </Badge>
      {reason && (
        <span className="text-xs text-muted-foreground">{reason}</span>
      )}
    </div>
  );
}