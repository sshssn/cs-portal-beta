import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Job } from '@/types/job';
import { Save } from 'lucide-react';

interface JobEditModalProps {
  job: Job | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedJob: Job) => void;
}

export default function JobEditModal({ job, isOpen, onClose, onSave }: JobEditModalProps) {
  const [formData, setFormData] = useState<Job | null>(job);

  const handleSave = () => {
    if (formData) {
      onSave({ ...formData });
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
