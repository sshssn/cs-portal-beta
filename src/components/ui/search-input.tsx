import * as React from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';

export interface SearchInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  onClear?: () => void;
  wrapperClassName?: string;
}

const SearchInput = React.forwardRef<HTMLInputElement, SearchInputProps>(
  ({ className, wrapperClassName, value, onChange, onClear, type = "text", ...props }, ref) => {
    
    // Check if value is present to determine if we should show the clear button
    const showClear = onClear && value && String(value).length > 0;

    return (
      <div className={cn("relative flex items-center", wrapperClassName)}>
        <Input
          type={type}
          className={cn("pr-8", className)}
          ref={ref}
          value={value}
          onChange={onChange}
          {...props}
        />
        {showClear && (
           <button
             type="button"
             onClick={onClear}
             className="absolute right-3 p-0.5 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
             aria-label="Clear search"
           >
             <X className="h-3 w-3" />
           </button>
        )}
      </div>
    );
  }
);
SearchInput.displayName = 'SearchInput';

export { SearchInput };
