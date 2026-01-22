import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { FileText, Upload, Globe, Lock, Smile, AtSign } from 'lucide-react';
import { TicketNote } from '@/types/ticket';
import { cn } from '@/lib/utils';

interface AddNoteModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ticketId: string;
  onSave: (note: Omit<TicketNote, 'id' | 'timestamp'>) => void;
}

export function AddNoteModal({ open, onOpenChange, ticketId, onSave }: AddNoteModalProps) {
  const [content, setContent] = useState('');
  const [visibility, setVisibility] = useState<'Public' | 'Private'>('Public');
  const [attachments, setAttachments] = useState<File[]>([]);

  const handleSave = () => {
    if (!content.trim()) return;

    onSave({
      ticketId,
      content: content.trim(),
      author: 'Current User', // This would come from auth context
      visibility,
      attachments: [] // Would handle file upload here
    });

    // Reset form
    setContent('');
    setVisibility('Public');
    setAttachments([]);
    onOpenChange(false);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setAttachments([...attachments, ...Array.from(e.target.files)]);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Add Note</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Note Content */}
          <div>
            <Textarea
              placeholder="Enter your note..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-[150px] resize-none"
            />
            
            {/* Formatting toolbar icons */}
            <div className="flex items-center gap-2 mt-2 text-muted-foreground">
              <button className="p-1 hover:text-foreground rounded hover:bg-accent">
                <Smile className="h-4 w-4" />
              </button>
              <button className="p-1 hover:text-foreground rounded hover:bg-accent">
                <AtSign className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Visibility Options */}
          <div>
            <Label className="mb-3 block">Visibility</Label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setVisibility('Public')}
                className={cn(
                  "flex items-center gap-3 p-4 rounded-lg border-2 transition-colors",
                  visibility === 'Public'
                    ? "border-green-500 bg-green-50"
                    : "border-gray-200 hover:border-gray-300"
                )}
              >
                <div className={cn(
                  "flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center",
                  visibility === 'Public' ? "bg-green-500 text-white" : "bg-gray-100"
                )}>
                  <Globe className="h-5 w-5" />
                </div>
                <div className="text-left">
                  <div className="font-semibold text-sm">Public Note</div>
                  <div className="text-xs text-muted-foreground">Visible to all</div>
                </div>
              </button>

              <button
                onClick={() => setVisibility('Private')}
                className={cn(
                  "flex items-center gap-3 p-4 rounded-lg border-2 transition-colors",
                  visibility === 'Private'
                    ? "border-orange-500 bg-orange-50"
                    : "border-gray-200 hover:border-gray-300"
                )}
              >
                <div className={cn(
                  "flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center",
                  visibility === 'Private' ? "bg-orange-500 text-white" : "bg-gray-100"
                )}>
                  <Lock className="h-5 w-5" />
                </div>
                <div className="text-left">
                  <div className="font-semibold text-sm">Private Note</div>
                  <div className="text-xs text-muted-foreground">Only visible with permissions</div>
                </div>
              </button>
            </div>
          </div>

          {/* Attachments */}
          <div>
            <Label className="mb-2 block">Attachments</Label>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => document.getElementById('note-file-upload')?.click()}
                className="gap-2"
              >
                <Upload className="h-4 w-4" />
                Add Image/Attachment
              </Button>
              <input
                id="note-file-upload"
                type="file"
                multiple
                className="hidden"
                onChange={handleFileSelect}
              />
            </div>
            
            {attachments.length > 0 && (
              <div className="mt-2 space-y-1">
                {attachments.map((file, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <FileText className="h-4 w-4" />
                    <span>{file.name}</span>
                    <button
                      onClick={() => setAttachments(attachments.filter((_, i) => i !== index))}
                      className="text-red-500 hover:text-red-700 ml-auto"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!content.trim()}>
            Add
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
