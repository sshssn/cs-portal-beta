import { Badge } from '@/components/ui/badge';
import { Job } from '@/types/job';
import { Clock, CheckCircle, AlertTriangle, User, Play, Package, Wrench, Square } from 'lucide-react';

interface StatusBadgeProps {
  status: Job['status'];
  reason?: string | null;
}

export default function StatusBadge({ status, reason }: StatusBadgeProps) {
  const getStatusConfig = (status: Job['status']) => {
    switch (status) {
      case 'new':
        return {
          icon: Square,
          text: 'New',
          className: 'bg-blue-500 hover:bg-blue-700 text-white border-blue-600 shadow-sm transition-colors duration-200',
        };
      case 'allocated':
        return {
          icon: User,
          text: 'Allocated',
          className: 'bg-yellow-500 hover:bg-yellow-700 text-white border-yellow-600 shadow-sm transition-colors duration-200',
        };
      case 'attended':
        return {
          icon: Play,
          text: 'Attended',
          className: 'bg-orange-500 hover:bg-orange-700 text-white border-orange-600 shadow-sm transition-colors duration-200',
        };
      case 'awaiting_parts':
        return {
          icon: Package,
          text: 'Awaiting Parts',
          className: 'bg-purple-500 hover:bg-purple-700 text-white border-purple-600 shadow-sm transition-colors duration-200',
        };
      case 'parts_to_fit':
        return {
          icon: Wrench,
          text: 'Parts to Fit',
          className: 'bg-indigo-500 hover:bg-indigo-700 text-white border-indigo-600 shadow-sm transition-colors duration-200',
        };
      case 'completed':
        return {
          icon: CheckCircle,
          text: 'Completed',
          className: 'bg-emerald-500 hover:bg-emerald-700 text-white border-emerald-600 shadow-sm transition-colors duration-200',
        };
      case 'costed':
        return {
          icon: CheckCircle,
          text: 'Costed',
          className: 'bg-emerald-500 hover:bg-emerald-700 text-white border-emerald-600 shadow-sm transition-colors duration-200',
        };
      case 'reqs_invoice':
        return {
          icon: CheckCircle,
          text: 'Invoice Ready',
          className: 'bg-emerald-500 hover:bg-emerald-700 text-white border-emerald-600 shadow-sm transition-colors duration-200',
        };
      // Legacy statuses for backward compatibility
      case 'green':
        return {
          icon: CheckCircle,
          text: 'Completed',
          className: 'bg-emerald-500 hover:bg-emerald-700 text-white border-emerald-600 shadow-sm transition-colors duration-200',
        };
      case 'amber':
        return {
          icon: Clock,
          text: 'In Progress',
          className: 'bg-amber-500 hover:bg-amber-700 text-white border-amber-600 shadow-sm transition-colors duration-200',
        };
      case 'red':
        return {
          icon: AlertTriangle,
          text: 'Issue',
          className: 'bg-red-500 hover:bg-red-700 text-white border-red-600 shadow-sm transition-colors duration-200',
        };
      default:
        return {
          icon: Clock,
          text: 'Unknown',
          className: 'bg-gray-500 hover:bg-gray-700 text-white border-gray-600 shadow-sm transition-colors duration-200',
        };
    }
  };

  const config = getStatusConfig(status);
  const Icon = config.icon;

  return (
    <div className="flex flex-col gap-1">
      <Badge className={`${config.className} flex items-center gap-1 w-fit transition-colors duration-200`}>
        <Icon size={12} />
        {config.text}
      </Badge>
      {reason && (
        <span className="text-xs text-muted-foreground">{reason}</span>
      )}
    </div>
  );
}