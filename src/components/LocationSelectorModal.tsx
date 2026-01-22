import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { SearchInput } from '@/components/ui/search-input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ChevronRight, ChevronDown, MapPin } from 'lucide-react';
import { Location } from '@/types/ticket';
import { cn } from '@/lib/utils';

interface LocationSelectorModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  locations: Location[];
  selectedLocations: string[];
  onSelectLocations: (locationIds: string[]) => void;
  multiSelect?: boolean;
  title?: string;
}

export function LocationSelectorModal({
  open,
  onOpenChange,
  locations,
  selectedLocations,
  onSelectLocations,
  multiSelect = false,
  title = 'Select Location'
}: LocationSelectorModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const [tempSelected, setTempSelected] = useState<string[]>(selectedLocations);

  useEffect(() => {
    setTempSelected(selectedLocations);
  }, [selectedLocations, open]);

  const toggleNode = (locationId: string) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(locationId)) {
      newExpanded.delete(locationId);
    } else {
      newExpanded.add(locationId);
    }
    setExpandedNodes(newExpanded);
  };

  const handleLocationToggle = (locationId: string) => {
    if (multiSelect) {
      if (tempSelected.includes(locationId)) {
        setTempSelected(tempSelected.filter(id => id !== locationId));
      } else {
        setTempSelected([...tempSelected, locationId]);
      }
    } else {
      setTempSelected([locationId]);
    }
  };

  const handleConfirm = () => {
    onSelectLocations(tempSelected);
    onOpenChange(false);
  };

  const filterLocations = (locs: Location[], query: string): Location[] => {
    if (!query) return locs;
    
    return locs.filter(loc => {
      const matches = loc.name.toLowerCase().includes(query.toLowerCase());
      const childMatches = loc.children ? filterLocations(loc.children, query).length > 0 : false;
      return matches || childMatches;
    }).map(loc => ({
      ...loc,
      children: loc.children ? filterLocations(loc.children, query) : undefined
    }));
  };

  const renderLocationTree = (locs: Location[], level: number = 0) => {
    const filtered = searchQuery ? filterLocations(locs, searchQuery) : locs;

    return filtered.map(location => {
      const hasChildren = location.children && location.children.length > 0;
      const isExpanded = expandedNodes.has(location.id);
      const isSelected = tempSelected.includes(location.id);

      return (
        <div key={location.id} style={{ marginLeft: `${level * 20}px` }}>
          <div className={cn(
            "flex items-center gap-2 py-2 px-2 rounded hover:bg-accent cursor-pointer group",
            isSelected && "bg-accent/50"
          )}>
            {hasChildren ? (
              <button
                onClick={() => toggleNode(location.id)}
                className="p-0.5 hover:bg-accent-foreground/10 rounded"
              >
                {isExpanded ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </button>
            ) : (
              <div className="w-5" />
            )}
            
            <div
              onClick={() => handleLocationToggle(location.id)}
              className={cn(
                "h-4 w-4 rounded-full border-2 flex items-center justify-center cursor-pointer transition-colors",
                isSelected 
                  ? "border-primary bg-primary" 
                  : "border-muted-foreground/30 hover:border-primary/50"
              )}
            >
              {isSelected && <div className="h-2 w-2 rounded-full bg-white" />}
            </div>
            
            <div className="flex items-center gap-2 flex-1">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <div>
                <div className="text-sm font-medium">{location.name}</div>
                <div className="text-xs text-muted-foreground">{location.type}</div>
              </div>
            </div>
          </div>

          {hasChildren && isExpanded && (
            <div className="mt-1">
              {renderLocationTree(location.children!, level + 1)}
            </div>
          )}
        </div>
      );
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[600px] flex flex-col">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <div className="mb-4">
          <SearchInput
            placeholder="Search locations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onClear={() => setSearchQuery('')}
          />
        </div>

        <ScrollArea className="flex-1 -mx-6 px-6">
          <div className="space-y-1">
            {renderLocationTree(locations)}
          </div>
        </ScrollArea>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleConfirm}>
            {multiSelect 
              ? `Select ${tempSelected.length} Location${tempSelected.length !== 1 ? 's' : ''}`
              : 'Select Location'
            }
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
