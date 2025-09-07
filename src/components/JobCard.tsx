import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Job } from '@/types/job';
import { Clock, User, MapPin, Phone, Mail, AlertTriangle, CheckCircle, Wrench } from 'lucide-react';
import { format, isValid } from 'date-fns';

interface JobCardProps {
  job: Job;
  onUpdateStatus: (jobId: string, status: Job['status'], reason?: string) => void;
}

export default function JobCard({ job, onUpdateStatus }: JobCardProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [statusReason, setStatusReason] = useState('');

  const handleStatusUpdate = (newStatus: Job['status']) => {
    onUpdateStatus(job.id, newStatus, statusReason);
    setIsDialogOpen(false);
    setStatusReason('');
  };

  const getStatusColor = (status: Job['status']) => {
    switch (status) {
      case 'green':
        return 'bg-green-500';
      case 'amber':
        return 'bg-amber-500';
      case 'red':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getPriorityColor = (priority: Job['priority']) => {
    switch (priority) {
      case 'Critical':
        return 'bg-red-600 text-white border-red-700 shadow-sm';
      case 'High':
        return 'bg-orange-500 text-white border-orange-600 shadow-sm';
      case 'Medium':
        return 'bg-yellow-500 text-white border-yellow-600 shadow-sm';
      case 'Low':
        return 'bg-green-500 text-white border-green-600 shadow-sm';
      default:
        return 'bg-gray-500 text-white border-gray-600 shadow-sm';
    }
  };

  const formatDate = (date: Date | null | undefined): string => {
    if (!date) return 'Not set';
    
    // Ensure we have a valid Date object
    const dateObj = date instanceof Date ? date : new Date(date);
    
    if (!isValid(dateObj)) {
      return 'Invalid date';
    }
    
    try {
      return format(dateObj, 'MMM dd, yyyy HH:mm');
    } catch (error) {
      console.error('Date formatting error:', error, 'Date:', date);
      return 'Invalid date';
    }
  };

  const formatTimeElapsed = (date: Date | null | undefined): string => {
    if (!date) return 'Unknown';
    
    const dateObj = date instanceof Date ? date : new Date(date);
    
    if (!isValid(dateObj)) {
      return 'Invalid date';
    }
    
    try {
      const now = new Date();
      const diffMs = now.getTime() - dateObj.getTime();
      const diffMinutes = Math.floor(diffMs / (1000 * 60));
      
      if (diffMinutes < 60) {
        return `${diffMinutes}m ago`;
      } else if (diffMinutes < 1440) {
        const hours = Math.floor(diffMinutes / 60);
        return `${hours}h ago`;
      } else {
        const days = Math.floor(diffMinutes / 1440);
        return `${days}d ago`;
      }
    } catch (error) {
      console.error('Time elapsed calculation error:', error, 'Date:', date);
      return 'Unknown';
    }
  };

  return (
    <Card className="shadow-md hover:shadow-lg transition-shadow duration-200">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-4 h-4 rounded-full ${getStatusColor(job.status)}`} />
            <div>
              <CardTitle className="text-lg font-semibold text-gray-900">
                {job.customer} - {job.site}
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Job Number: {job.jobNumber}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                {job.description}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge className={getPriorityColor(job.priority)}>
              {job.priority}
            </Badge>
            <Badge variant="outline">
              {job.category}
            </Badge>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Job Description */}
        <div>
          <p className="text-sm text-gray-700 leading-relaxed">
            {job.description}
          </p>
        </div>

        {/* Job Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <User size={16} className="text-blue-600" />
            <span className="text-gray-600">Engineer:</span>
            <span className="font-medium">{job.engineer}</span>
          </div>
          
          <div className="flex items-center gap-2">
            <Wrench size={16} className="text-green-600" />
            <span className="text-gray-600">Trade:</span>
            <span className="font-medium">{job.primaryJobTrade}</span>
          </div>
          
          <div className="flex items-center gap-2">
            <Clock size={16} className="text-amber-600" />
            <span className="text-gray-600">Created:</span>
            <span className="font-medium">{formatTimeElapsed(job.dateLogged)}</span>
          </div>
          
          <div className="flex items-center gap-2">
            <AlertTriangle size={16} className="text-red-600" />
            <span className="text-gray-600">Target:</span>
            <span className="font-medium">{job.targetCompletionTime}min</span>
          </div>
        </div>

        {/* Contact Information */}
        <div className="bg-gray-50 p-3 rounded-lg">
          <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
            <User size={16} />
            Contact Information
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-gray-600">Name:</span>
              <span className="font-medium">{job.contact.name}</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone size={12} />
              <span className="font-medium">{job.contact.number}</span>
            </div>
            {job.contact.email && (
              <div className="flex items-center gap-2">
                <Mail size={12} />
                <span className="font-medium">{job.contact.email}</span>
              </div>
            )}
            {job.contact.relationship && (
              <div className="flex items-center gap-2">
                <span className="text-gray-600">Role:</span>
                <span className="font-medium">{job.contact.relationship}</span>
              </div>
            )}
          </div>
        </div>

        {/* SLA Alerts */}
        <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
          <h4 className="font-medium text-blue-900 mb-2">SLA Settings</h4>
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div className="text-center">
              <div className="text-blue-700 font-medium">Accept</div>
              <div className="text-blue-600">{job.customAlerts.acceptSLA}min</div>
            </div>
            <div className="text-center">
              <div className="text-blue-700 font-medium">On Site</div>
              <div className="text-blue-600">{job.customAlerts.onsiteSLA}min</div>
            </div>
            <div className="text-center">
              <div className="text-blue-700 font-medium">Complete</div>
              <div className="text-blue-600">{job.customAlerts.completedSLA}min</div>
            </div>
          </div>
        </div>

        {/* Tags */}
        {job.tags && job.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {job.tags.map(tag => (
              <Badge key={tag} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        )}

        {/* Timestamps */}
        <div className="text-xs text-muted-foreground border-t pt-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-1">
            <div>Created: {formatDate(job.dateLogged)}</div>
            {job.startDate && (
              <div>Started: {formatDate(job.startDate)}</div>
            )}
            {job.endDate && (
              <div>Target End: {formatDate(job.endDate)}</div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2 border-t">
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleStatusUpdate('green')}
            className="flex-1"
          >
            <CheckCircle size={16} className="mr-1" />
            Complete
          </Button>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" variant="outline" className="flex-1">
                <AlertTriangle size={16} className="mr-1" />
                Update Status
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Update Job Status</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-2">
                    Job: {job.jobNumber} - {job.description}
                  </p>
                </div>
                
                <div>
                  <label className="text-sm font-medium">Status Reason (Optional)</label>
                  <Textarea
                    placeholder="Enter reason for status change..."
                    value={statusReason}
                    onChange={(e) => setStatusReason(e.target.value)}
                    className="mt-1"
                  />
                </div>
                
                <div className="flex gap-2">
                  <Button
                    onClick={() => handleStatusUpdate('green')}
                    className="flex-1 bg-green-600 hover:bg-green-700"
                  >
                    Mark Complete
                  </Button>
                  <Button
                    onClick={() => handleStatusUpdate('amber')}
                    className="flex-1 bg-amber-600 hover:bg-amber-700"
                  >
                    In Progress
                  </Button>
                  <Button
                    onClick={() => handleStatusUpdate('red')}
                    className="flex-1 bg-red-600 hover:bg-red-700"
                  >
                    Issue/Delay
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardContent>
    </Card>
  );
}