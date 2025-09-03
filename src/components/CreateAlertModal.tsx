import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Job } from '@/types/job';
import { X } from 'lucide-react';

interface CreateAlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  jobs: Job[];
  onAlertCreate: (alert: {
    jobId: string;
    type: string;
    message: string;
    severity: 'low' | 'medium' | 'high';
    priority: string;
  }) => void;
}

export default function CreateAlertModal({ 
  isOpen, 
  onClose, 
  jobs, 
  onAlertCreate 
}: CreateAlertModalProps) {
  const [selectedJobId, setSelectedJobId] = useState<string>('');
  const [alertType, setAlertType] = useState<string>('');
  const [alertMessage, setAlertMessage] = useState<string>('');
  const [severity, setSeverity] = useState<string>('medium');
  const [priority, setPriority] = useState<string>('Medium');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedJobId || !alertType || !alertMessage) {
      return;
    }

    onAlertCreate({
      jobId: selectedJobId,
      type: alertType,
      message: alertMessage,
      severity: severity as 'low' | 'medium' | 'high',
      priority: priority
    });

    // Reset form
    setSelectedJobId('');
    setAlertType('');
    setAlertMessage('');
    setSeverity('medium');
    setPriority('Medium');
    
    onClose();
  };

  const handleClose = () => {
    // Reset form
    setSelectedJobId('');
    setAlertType('');
    setAlertMessage('');
    setSeverity('medium');
    setPriority('Medium');
    
    onClose();
  };

  const selectedJob = jobs.find(job => job.id === selectedJobId);

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span>Create New Alert</span>
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="job">Select Job</Label>
            <Select value={selectedJobId} onValueChange={setSelectedJobId}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a job" />
              </SelectTrigger>
              <SelectContent>
                {jobs.map(job => (
                  <SelectItem key={job.id} value={job.id}>
                    {job.jobNumber} - {job.customer} ({job.site})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedJob && (
              <div className="text-sm text-muted-foreground p-2 bg-gray-50 rounded">
                <p><strong>Customer:</strong> {selectedJob.customer}</p>
                <p><strong>Site:</strong> {selectedJob.site}</p>
                <p><strong>Engineer:</strong> {selectedJob.engineer}</p>
                <p><strong>Status:</strong> {selectedJob.status === 'green' ? 'Completed' :
                   selectedJob.status === 'amber' ? 'In Process' : 
                   selectedJob.status === 'red' ? 'Issue' : 
                   selectedJob.status === 'OOH' ? 'Out of Hours' :
                   selectedJob.status === 'On call' ? 'On Call' :
                   selectedJob.status === 'travel' ? 'Traveling' :
                   selectedJob.status === 'require_revisit' ? 'Requires Revisit' :
                   selectedJob.status === 'sick' ? 'Sick Leave' :
                   selectedJob.status === 'training' ? 'Training' :
                   String(selectedJob.status).toUpperCase()}</p>
                <p><strong>Priority:</strong> {selectedJob.priority}</p>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="alertType">Alert Type</Label>
            <Select value={alertType} onValueChange={setAlertType}>
              <SelectTrigger>
                <SelectValue placeholder="Select alert type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="SLA Breach">SLA Breach</SelectItem>
                <SelectItem value="Critical Priority">Critical Priority</SelectItem>
                <SelectItem value="High Priority In Progress">High Priority In Progress</SelectItem>
                <SelectItem value="Equipment Failure">Equipment Failure</SelectItem>
                <SelectItem value="Site Access Issue">Site Access Issue</SelectItem>
                <SelectItem value="Communication Issue">Communication Issue</SelectItem>
                <SelectItem value="Resource Unavailable">Resource Unavailable</SelectItem>
                <SelectItem value="Custom Alert">Custom Alert</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Alert Message</Label>
            <Textarea
              id="message"
              placeholder="Describe the alert..."
              value={alertMessage}
              onChange={(e) => setAlertMessage(e.target.value)}
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="severity">Severity</Label>
              <Select value={severity} onValueChange={setSeverity}>
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

            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Select value={priority} onValueChange={setPriority}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Low">Low</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="High">High</SelectItem>
                  <SelectItem value="Critical">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={!selectedJobId || !alertType || !alertMessage}
            >
              Create Alert
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
