import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { X, AlertCircle, CheckCircle, Info } from 'lucide-react';

interface CustomPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (value: string) => void;
  title: string;
  message?: string;
  placeholder?: string;
  defaultValue?: string;
  type?: 'input' | 'textarea';
  submitText?: string;
  cancelText?: string;
  icon?: 'info' | 'warning' | 'success';
  required?: boolean;
  maxLength?: number;
}

export default function CustomPromptModal({
  isOpen,
  onClose,
  onSubmit,
  title,
  message,
  placeholder = '',
  defaultValue = '',
  type = 'input',
  submitText = 'Submit',
  cancelText = 'Cancel',
  icon = 'info',
  required = false,
  maxLength
}: CustomPromptModalProps) {
  const [value, setValue] = useState(defaultValue);
  const [error, setError] = useState('');

  useEffect(() => {
    setValue(defaultValue);
    setError('');
  }, [defaultValue, isOpen]);

  const handleSubmit = () => {
    if (required && !value.trim()) {
      setError('This field is required');
      return;
    }
    
    if (maxLength && value.length > maxLength) {
      setError(`Maximum ${maxLength} characters allowed`);
      return;
    }

    // Clear any existing errors
    setError('');
    
    
    // Submit the value
    onSubmit(value.trim());
    
    // Close the modal
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  const getIcon = () => {
    switch (icon) {
      case 'warning':
        return <AlertCircle className="h-5 w-5 text-amber-500" />;
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      default:
        return <Info className="h-5 w-5 text-blue-500" />;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {getIcon()}
            {title}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {message && (
            <p className="text-sm text-gray-600">{message}</p>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="prompt-input">
              {type === 'textarea' ? 'Enter details' : 'Enter value'}
              {required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            
            {type === 'textarea' ? (
              <Textarea
                id="prompt-input"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={placeholder}
                rows={4}
                maxLength={maxLength}
                className="resize-none"
                autoFocus
              />
            ) : (
              <Input
                id="prompt-input"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={placeholder}
                maxLength={maxLength}
                autoFocus
              />
            )}
            
            {error && (
              <p className="text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="h-4 w-4" />
                {error}
              </p>
            )}
            
            {maxLength && (
              <p className="text-xs text-gray-500 text-right">
                {value.length}/{maxLength} characters
              </p>
            )}
          </div>
        </div>
        
        <div className="flex justify-end gap-3 pt-4">
          <Button variant="outline" onClick={onClose}>
            {cancelText}
          </Button>
          <Button onClick={handleSubmit}>
            {submitText}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
