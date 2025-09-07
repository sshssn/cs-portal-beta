import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Palette, Monitor, Smartphone, Tablet, Settings } from 'lucide-react';

interface FaviconOption {
  id: string;
  name: string;
  url: string;
  icon: React.ReactNode;
  description: string;
}

const faviconOptions: FaviconOption[] = [
  {
    id: 'default',
    name: 'Default',
    url: 'https://public-frontend-cos.metadl.com/mgx/img/favicon.png',
    icon: <Monitor className="h-4 w-4" />,
    description: 'Original JobLogic favicon'
  },
  {
    id: 'portal',
    name: 'Portal',
    url: '/favicon.svg',
    icon: <Settings className="h-4 w-4" />,
    description: 'CS Portal favicon'
  },
  {
    id: 'emoji-rocket',
    name: 'Rocket',
    url: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">🚀</text></svg>',
    icon: <span className="text-lg">🚀</span>,
    description: 'Rocket emoji favicon'
  },
  {
    id: 'emoji-wrench',
    name: 'Wrench',
    url: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">🔧</text></svg>',
    icon: <span className="text-lg">🔧</span>,
    description: 'Wrench emoji favicon'
  },
  {
    id: 'emoji-gear',
    name: 'Gear',
    url: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">⚙️</text></svg>',
    icon: <span className="text-lg">⚙️</span>,
    description: 'Gear emoji favicon'
  },
  {
    id: 'emoji-bell',
    name: 'Bell',
    url: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">🔔</text></svg>',
    icon: <span className="text-lg">🔔</span>,
    description: 'Bell emoji favicon'
  },
  {
    id: 'emoji-chart',
    name: 'Chart',
    url: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">📊</text></svg>',
    icon: <span className="text-lg">📊</span>,
    description: 'Chart emoji favicon'
  },
  {
    id: 'emoji-shield',
    name: 'Shield',
    url: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">🛡️</text></svg>',
    icon: <span className="text-lg">🛡️</span>,
    description: 'Shield emoji favicon'
  }
];

export default function FaviconChanger() {
  const [currentFavicon, setCurrentFavicon] = useState<string>('default');
  const [isOpen, setIsOpen] = useState(false);

  // Load saved favicon preference on component mount
  useEffect(() => {
    const savedFavicon = localStorage.getItem('cs-portal-favicon');
    if (savedFavicon) {
      setCurrentFavicon(savedFavicon);
      changeFavicon(savedicon);
    }
  }, []);

  const changeFavicon = (faviconId: string) => {
    const faviconOption = faviconOptions.find(option => option.id === faviconId);
    if (!faviconOption) return;

    // Remove existing favicon links
    const existingLinks = document.querySelectorAll('link[rel*="icon"]');
    existingLinks.forEach(link => link.remove());

    // Create new favicon link
    const link = document.createElement('link');
    link.rel = 'icon';
    link.href = faviconOption.url;
    link.type = faviconOption.url.includes('svg') ? 'image/svg+xml' : 'image/png';
    
    // Add to document head
    document.head.appendChild(link);

    // Update state and save to localStorage
    setCurrentFavicon(faviconId);
    localStorage.setItem('cs-portal-favicon', faviconId);

    // Close the changer after selection
    setIsOpen(false);
  };

  const getCurrentFaviconOption = () => {
    return faviconOptions.find(option => option.id === currentFavicon) || faviconOptions[0];
  };

  return (
    <div className="relative">
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 hover:bg-blue-50 transition-colors border-blue-200 text-blue-700"
      >
        <Palette className="h-4 w-4" />
        <span className="hidden sm:inline">Favicon</span>
      </Button>

      {isOpen && (
        <Card className="absolute top-12 right-0 z-50 w-80 shadow-lg border-blue-200 bg-white">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg text-blue-900">
              <Palette className="h-5 w-5 text-blue-600" />
              Favicon Changer
            </CardTitle>
            <CardDescription>
              Choose your preferred favicon for the CS Portal
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              {faviconOptions.map((option) => (
                <Button
                  key={option.id}
                  variant={currentFavicon === option.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => changeFavicon(option.id)}
                  className={`flex items-center gap-2 h-auto p-3 ${
                    currentFavicon === option.id 
                      ? 'bg-blue-600 text-white' 
                      : 'hover:bg-blue-50 border-blue-200 text-blue-700'
                  }`}
                >
                  <div className="flex flex-col items-center gap-1">
                    {option.icon}
                    <span className="text-xs font-medium">{option.name}</span>
                  </div>
                </Button>
              ))}
            </div>
            
            <div className="pt-2 border-t border-gray-200">
              <div className="text-sm text-gray-600">
                <strong>Current:</strong> {getCurrentFaviconOption().name}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {getCurrentFaviconOption().description}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
