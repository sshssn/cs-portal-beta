import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Ticket } from '@/types/ticket';
import { Save } from 'lucide-react';

interface TicketEditModalProps {
  ticket: Ticket | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updates: Partial<Ticket>) => void;
}

export function TicketEditModal({ ticket, isOpen, onClose, onSave }: TicketEditModalProps) {
  const [formData, setFormData] = useState({
    shortDescription: '',
    longDescription: '',
    status: '' as Ticket['status'],
    priority: '' as Ticket['priority'],
    impact: '',
    classification: '',
    ticketQueue: '',
    reportedBy: {
      id: '',
      name: '',
      email: '',
      phone: ''
    }
  });

  useEffect(() => {
    if (ticket) {
      setFormData({
        shortDescription: ticket.shortDescription,
        longDescription: ticket.longDescription,
        status: ticket.status,
        priority: ticket.priority,
        impact: ticket.impact,
        classification: ticket.classification,
        ticketQueue: ticket.ticketQueue,
        reportedBy: { ...ticket.reportedBy }
      });
    }
  }, [ticket]);

  const handleSave = () => {
    onSave(formData);
    onClose();
  };

  if (!ticket) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Ticket - {ticket.reference}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Read-only Info */}
          <div className="bg-gray-50 p-3 rounded-lg text-sm text-gray-600">
            <span className="font-medium">Reference:</span> {ticket.reference} • 
            <span className="font-medium ml-2">Created:</span> {new Date(ticket.createdDate).toLocaleDateString()}
          </div>

          {/* Description Section */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-900 border-b pb-2">Description</h3>
            
            <div className="space-y-2">
              <Label htmlFor="shortDescription">Short Description</Label>
              <Input
                id="shortDescription"
                value={formData.shortDescription}
                onChange={(e) => setFormData(prev => ({ ...prev, shortDescription: e.target.value }))}
                placeholder="Brief description of the issue"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="longDescription">Full Description</Label>
              <Textarea
                id="longDescription"
                value={formData.longDescription}
                onChange={(e) => setFormData(prev => ({ ...prev, longDescription: e.target.value }))}
                rows={4}
                placeholder="Detailed description of the issue"
              />
            </div>
          </div>

          {/* Status & Priority */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-900 border-b pb-2">Status & Priority</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Status</Label>
                <Select 
                  value={formData.status} 
                  onValueChange={(value: Ticket['status']) => 
                    setFormData(prev => ({ ...prev, status: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Open">Open</SelectItem>
                    <SelectItem value="In Progress">In Progress</SelectItem>
                    <SelectItem value="Resolved">Resolved</SelectItem>
                    <SelectItem value="Closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Priority</Label>
                <Select 
                  value={formData.priority} 
                  onValueChange={(value: Ticket['priority']) => 
                    setFormData(prev => ({ ...prev, priority: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1 - High">1 - High</SelectItem>
                    <SelectItem value="2 - High">2 - High</SelectItem>
                    <SelectItem value="3 - Medium">3 - Medium</SelectItem>
                    <SelectItem value="4 - Low">4 - Low</SelectItem>
                    <SelectItem value="5 - Low">5 - Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Classification */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-900 border-b pb-2">Classification</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="impact">Impact</Label>
                <Input
                  id="impact"
                  value={formData.impact}
                  onChange={(e) => setFormData(prev => ({ ...prev, impact: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="classification">Classification</Label>
                <Input
                  id="classification"
                  value={formData.classification}
                  onChange={(e) => setFormData(prev => ({ ...prev, classification: e.target.value }))}
                />
              </div>

              <div className="space-y-2 col-span-2">
                <Label htmlFor="ticketQueue">Ticket Queue</Label>
                <Input
                  id="ticketQueue"
                  value={formData.ticketQueue}
                  onChange={(e) => setFormData(prev => ({ ...prev, ticketQueue: e.target.value }))}
                />
              </div>
            </div>
          </div>

          {/* Reporter Details */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-900 border-b pb-2">Reporter Details</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="reporterName">Name</Label>
                <Input
                  id="reporterName"
                  value={formData.reportedBy.name}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    reportedBy: { ...prev.reportedBy, name: e.target.value }
                  }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="reporterEmail">Email</Label>
                <Input
                  id="reporterEmail"
                  type="email"
                  value={formData.reportedBy.email}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    reportedBy: { ...prev.reportedBy, email: e.target.value }
                  }))}
                />
              </div>

              <div className="space-y-2 col-span-2">
                <Label htmlFor="reporterPhone">Phone</Label>
                <Input
                  id="reporterPhone"
                  value={formData.reportedBy.phone}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    reportedBy: { ...prev.reportedBy, phone: e.target.value }
                  }))}
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSave} className="gap-2">
              <Save className="h-4 w-4" />
              Save Changes
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
