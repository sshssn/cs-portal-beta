import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Job } from '@/types/job';
import { Save, FileText, X, Plus } from 'lucide-react';
import { useTickets } from '@/contexts/TicketContext';
import { cn } from '@/lib/utils';

interface JobEditModalProps {
  job: Job | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedJob: Job) => void;
}

export default function JobEditModal({ job, isOpen, onClose, onSave }: JobEditModalProps) {
  const [formData, setFormData] = useState<Job | null>(job);
  const { tickets, updateTicket } = useTickets();
  const [selectedTicketIds, setSelectedTicketIds] = useState<string[]>([]);
  const [showTicketSelector, setShowTicketSelector] = useState(false);

  // Initialize selected tickets from job data
  useEffect(() => {
    if (job) {
      setFormData(job);
      // Find tickets that reference this job or match ticketReferences
      const linkedTicketIds: string[] = [];
      
      // Check ticketReferences array first
      if (job.ticketReferences && job.ticketReferences.length > 0) {
        tickets.forEach(t => {
          if (job.ticketReferences?.includes(t.reference)) {
            linkedTicketIds.push(t.id);
          }
        });
      }
      
      // Also check single ticketReference
      if (job.ticketReference) {
        const ticket = tickets.find(t => t.reference === job.ticketReference);
        if (ticket && !linkedTicketIds.includes(ticket.id)) {
          linkedTicketIds.push(ticket.id);
        }
      }
      
      // Check tickets that have this job linked
      tickets.forEach(t => {
        if (t.jobs?.includes(job.id) && !linkedTicketIds.includes(t.id)) {
          linkedTicketIds.push(t.id);
        }
      });
      
      setSelectedTicketIds(linkedTicketIds);
    }
  }, [job, tickets]);

  const handleSave = () => {
    if (formData) {
      // Get ticket references from selected tickets
      const selectedTickets = tickets.filter(t => selectedTicketIds.includes(t.id));
      const ticketRefs = selectedTickets.map(t => t.reference);
      
      const updatedJob = {
        ...formData,
        ticketReference: ticketRefs[0] || formData.ticketReference, // Primary ticket
        ticketReferences: ticketRefs.length > 0 ? ticketRefs : formData.ticketReferences
      };
      
      // Update tickets to link this job
      selectedTicketIds.forEach(ticketId => {
        const ticket = tickets.find(t => t.id === ticketId);
        if (ticket && !ticket.jobs?.includes(formData.id)) {
          updateTicket(ticketId, {
            jobs: [...(ticket.jobs || []), formData.id]
          });
        }
      });
      
      onSave(updatedJob);
      onClose();
    }
  };

  if (!job || !formData) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Job - {job.jobNumber}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Job Number</label>
              <Input
                value={formData.jobNumber}
                onChange={(e) => setFormData(prev => prev ? { ...prev, jobNumber: e.target.value } : null)}
                disabled
              />
            </div>
            <div>
              <label className="text-sm font-medium">Status</label>
              <Select 
                value={formData.status} 
                onValueChange={(value: 'green' | 'amber' | 'red') => 
                  setFormData(prev => prev ? { ...prev, status: value } : null)
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="green">Completed</SelectItem>
                  <SelectItem value="amber">In Progress</SelectItem>
                  <SelectItem value="red">Overdue</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Location</label>
              <Input
                value={formData.customer}
                onChange={(e) => setFormData(prev => prev ? { ...prev, customer: e.target.value } : null)}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Site</label>
              <Input
                value={formData.site}
                onChange={(e) => setFormData(prev => prev ? { ...prev, site: e.target.value } : null)}
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">Description</label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => prev ? { ...prev, description: e.target.value } : null)}
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium">Service Provider</label>
              <Input
                value={formData.engineer}
                onChange={(e) => setFormData(prev => prev ? { ...prev, engineer: e.target.value } : null)}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Priority</label>
              <Select 
                value={formData.priority} 
                onValueChange={(value: Job['priority']) => 
                  setFormData(prev => prev ? { ...prev, priority: value } : null)
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Critical">Critical</SelectItem>
                  <SelectItem value="High">High</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="Low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Job Type</label>
              <Input
                value={formData.jobType}
                onChange={(e) => setFormData(prev => prev ? { ...prev, jobType: e.target.value } : null)}
              />
            </div>
          </div>

          {/* Contact Information */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold mb-4">Contact Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Contact Name</label>
                <Input
                  value={formData.contact?.name || ''}
                  onChange={(e) => setFormData(prev => prev ? { 
                    ...prev, 
                    contact: { ...prev.contact, name: e.target.value }
                  } : null)}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Contact Phone</label>
                <Input
                  value={formData.contact?.number || ''}
                  onChange={(e) => setFormData(prev => prev ? { 
                    ...prev, 
                    contact: { ...prev.contact, number: e.target.value }
                  } : null)}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Contact Email</label>
                <Input
                  value={formData.contact?.email || ''}
                  onChange={(e) => setFormData(prev => prev ? { 
                    ...prev, 
                    contact: { ...prev.contact, email: e.target.value }
                  } : null)}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Relationship</label>
                <Input
                  value={formData.contact?.relationship || ''}
                  onChange={(e) => setFormData(prev => prev ? { 
                    ...prev, 
                    contact: { ...prev.contact, relationship: e.target.value }
                  } : null)}
                />
              </div>
            </div>
          </div>

          {/* SLA Information */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-semibold mb-4">SLA Configuration</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium">Accept SLA (minutes)</label>
                <Input
                  type="number"
                  value={formData.customAlerts?.acceptSLA || 30}
                  onChange={(e) => setFormData(prev => prev ? { 
                    ...prev, 
                    customAlerts: { 
                      ...prev.customAlerts, 
                      acceptSLA: parseInt(e.target.value) || 30 
                    }
                  } : null)}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Onsite SLA (minutes)</label>
                <Input
                  type="number"
                  value={formData.customAlerts?.onsiteSLA || 90}
                  onChange={(e) => setFormData(prev => prev ? { 
                    ...prev, 
                    customAlerts: { 
                      ...prev.customAlerts, 
                      onsiteSLA: parseInt(e.target.value) || 90 
                    }
                  } : null)}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Completion SLA (minutes)</label>
                <Input
                  type="number"
                  value={formData.customAlerts?.completedSLA || 180}
                  onChange={(e) => setFormData(prev => prev ? { 
                    ...prev, 
                    customAlerts: { 
                      ...prev.customAlerts, 
                      completedSLA: parseInt(e.target.value) || 180 
                    }
                  } : null)}
                />
              </div>
            </div>
          </div>

          {/* Job Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Job Owner</label>
              <Input
                value={formData.jobOwner || ''}
                onChange={(e) => setFormData(prev => prev ? { ...prev, jobOwner: e.target.value } : null)}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Primary Trade</label>
              <Input
                value={formData.primaryJobTrade || ''}
                onChange={(e) => setFormData(prev => prev ? { ...prev, primaryJobTrade: e.target.value } : null)}
              />
            </div>
          </div>

          {/* Linked Tickets Section */}
          <div className="bg-purple-50 p-4 rounded-lg">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold flex items-center gap-2">
                <FileText size={18} className="text-purple-600" />
                Linked Tickets ({selectedTicketIds.length})
              </h3>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowTicketSelector(!showTicketSelector)}
                className="text-purple-600 border-purple-300 hover:bg-purple-100"
              >
                <Plus size={14} className="mr-1" />
                Link More Tickets
              </Button>
            </div>

            {/* Display currently linked tickets */}
            {selectedTicketIds.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {selectedTicketIds.map(ticketId => {
                  const ticket = tickets.find(t => t.id === ticketId);
                  if (!ticket) return null;
                  return (
                    <Badge
                      key={ticketId}
                      variant="secondary"
                      className="bg-purple-100 text-purple-800 flex items-center gap-1 px-3 py-1"
                    >
                      <FileText size={12} />
                      {ticket.reference}
                      <button
                        type="button"
                        onClick={() => setSelectedTicketIds(prev => prev.filter(id => id !== ticketId))}
                        className="ml-1 hover:text-purple-900"
                      >
                        <X size={12} />
                      </button>
                    </Badge>
                  );
                })}
              </div>
            )}

            {/* Ticket Selector Panel */}
            {showTicketSelector && (
              <div className="border border-purple-200 rounded-lg p-3 bg-white max-h-48 overflow-y-auto">
                <p className="text-sm text-muted-foreground mb-2">Select tickets to link to this job:</p>
                <div className="space-y-1">
                  {tickets
                    .filter(t => !selectedTicketIds.includes(t.id))
                    .map(ticket => (
                      <div
                        key={ticket.id}
                        className={cn(
                          "flex items-center justify-between p-2 rounded cursor-pointer hover:bg-purple-50",
                          "border border-transparent hover:border-purple-200"
                        )}
                        onClick={() => {
                          setSelectedTicketIds(prev => [...prev, ticket.id]);
                        }}
                      >
                        <div className="flex items-center gap-2">
                          <FileText size={14} className="text-purple-500" />
                          <span className="font-medium text-sm">{ticket.reference}</span>
                          <span className="text-xs text-muted-foreground">- {ticket.caller?.name || 'Unknown'}</span>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {ticket.status}
                        </Badge>
                      </div>
                    ))}
                  {tickets.filter(t => !selectedTicketIds.includes(t.id)).length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-2">No more tickets available to link</p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-2 pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700">
              <Save size={16} className="mr-2" />
              Save Changes
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
