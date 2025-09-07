import React, { useState, useEffect, useRef } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { 
  Palette, 
  Upload, 
  X, 
  Check,
  AlertCircle,
  Image as ImageIcon,
  RotateCcw
} from 'lucide-react';
import { showNotification } from './ui/toast-notification';

interface FaviconChangerProps {
  isEditing?: boolean;
}

const DEFAULT_FAVICON = 'https://public-frontend-cos.metadl.com/mgx/img/favicon.png';

export default function FaviconChanger({ isEditing = false }: FaviconChangerProps) {
  const [currentFavicon, setCurrentFavicon] = useState<string>(DEFAULT_FAVICON);
  const [uploadError, setUploadError] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load saved favicon preference on component mount
  useEffect(() => {
    const savedFavicon = localStorage.getItem('cs-portal-favicon');
    if (savedFavicon) {
      setCurrentFavicon(savedFavicon);
      changeFavicon(savedFavicon, false);
    }
  }, []);

  const changeFavicon = (faviconUrl: string, showNotification: boolean = true) => {
    // Remove existing favicon links
    const existingLinks = document.querySelectorAll('link[rel*="icon"]');
    existingLinks.forEach(link => link.remove());

    // Create new favicon link
    const link = document.createElement('link');
    link.rel = 'icon';
    link.href = faviconUrl;
    
    // Determine the correct type based on the URL
    if (faviconUrl.includes('svg')) {
      link.type = 'image/svg+xml';
    } else if (faviconUrl.includes('ico')) {
      link.type = 'image/x-icon';
    } else {
      link.type = 'image/png';
    }
    
    // Add to document head
    document.head.appendChild(link);

    // Also add apple-touch-icon for better browser support
    const appleLink = document.createElement('link');
    appleLink.rel = 'apple-touch-icon';
    appleLink.href = faviconUrl;
    document.head.appendChild(appleLink);

    // Update state and save to localStorage
    setCurrentFavicon(faviconUrl);
    localStorage.setItem('cs-portal-favicon', faviconUrl);

    if (showNotification) {
      showNotification({
        type: 'success',
        title: 'Favicon Updated',
        message: 'Favicon has been updated successfully. Refresh the page to see changes in browser tabs.'
      });
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    console.log('File selected:', file.name, file.type, file.size);
    setUploadError('');

    // Validate file type
    const allowedTypes = ['image/png', 'image/x-icon', 'image/vnd.microsoft.icon'];
    if (!allowedTypes.includes(file.type)) {
      setUploadError('Please upload a PNG or ICO file only.');
      return;
    }

    // Validate file size (max 1MB)
    const maxSize = 1024 * 1024; // 1MB
    if (file.size > maxSize) {
      setUploadError('File size must be less than 1MB.');
      return;
    }

    // Validate dimensions for PNG files
    if (file.type === 'image/png') {
      const img = new Image();
      img.onload = () => {
        if (img.width > 512 || img.height > 512) {
          setUploadError('Image dimensions should be 512x512 pixels or smaller for best results.');
          return;
        }
        processFile(file);
      };
      img.onerror = () => {
        setUploadError('Invalid image file.');
        return;
      };
      img.src = URL.createObjectURL(file);
    } else {
      processFile(file);
    }
  };

  const processFile = (file: File) => {
    console.log('Processing file:', file.name);
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      console.log('File processed, changing favicon to:', result.substring(0, 50) + '...');
      changeFavicon(result);

      showNotification({
        type: 'success',
        title: 'Custom Favicon Uploaded',
        message: `${file.name} has been uploaded and set as favicon`
      });
    };
    reader.readAsDataURL(file);
  };

  const resetToDefault = () => {
    changeFavicon(DEFAULT_FAVICON);
    showNotification({
      type: 'info',
      title: 'Favicon Reset',
      message: 'Favicon has been reset to default'
    });
  };

  const isDefaultFavicon = currentFavicon === DEFAULT_FAVICON;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Palette className="h-5 w-5" />
          Favicon Settings
        </CardTitle>
        <CardDescription>
          Upload a custom favicon for the CS Portal. PNG or ICO format recommended.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Current Favicon Display */}
        <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 border-2 border-gray-300 rounded-lg flex items-center justify-center bg-white">
              <img 
                src={currentFavicon} 
                alt="Current Favicon" 
                className="w-8 h-8 object-contain"
                onError={(e) => {
                  // Fallback to a default icon if image fails to load
                  e.currentTarget.style.display = 'none';
                  e.currentTarget.parentElement!.innerHTML = '<div class="w-8 h-8 bg-gray-200 rounded flex items-center justify-center"><span class="text-gray-500 text-xs">?</span></div>';
                }}
              />
            </div>
            <div>
              <div className="font-medium text-gray-900">
                {isDefaultFavicon ? 'Default Favicon' : 'Custom Favicon'}
              </div>
              <div className="text-sm text-gray-600">
                {isDefaultFavicon ? 'Original JobLogic favicon' : 'User uploaded favicon'}
              </div>
            </div>
          </div>
          <Badge variant={isDefaultFavicon ? "secondary" : "default"}>
            {isDefaultFavicon ? "Default" : "Custom"}
          </Badge>
        </div>

        {/* File Upload Section */}
        {isEditing && (
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium">Upload Custom Favicon</Label>
              <p className="text-xs text-gray-600 mb-3">
                Recommended: 32x32 or 64x64 pixels, PNG or ICO format, max 1MB
              </p>
              
              <div className="flex items-center gap-3">
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  variant="outline"
                  className="flex items-center gap-2"
                  disabled={!isEditing}
                >
                  <Upload className="h-4 w-4" />
                  Choose File
                </Button>
                
                {!isDefaultFavicon && (
                  <Button
                    onClick={resetToDefault}
                    variant="outline"
                    className="flex items-center gap-2"
                    disabled={!isEditing}
                  >
                    <RotateCcw className="h-4 w-4" />
                    Reset to Default
                  </Button>
                )}
                
                <span className="text-sm text-gray-500">
                  PNG, ICO files only
                </span>
              </div>
              
              <input
                ref={fileInputRef}
                type="file"
                accept=".png,.ico,image/png,image/x-icon,image/vnd.microsoft.icon"
                onChange={handleFileUpload}
                className="hidden"
                disabled={!isEditing}
              />
              
              {uploadError && (
                <div className="flex items-center gap-2 mt-2 text-sm text-red-600">
                  <AlertCircle className="h-4 w-4" />
                  {uploadError}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Recommendations */}
        <div className="p-4 bg-blue-50 rounded-lg">
          <div className="flex items-start gap-3">
            <ImageIcon className="h-5 w-5 text-blue-600 mt-0.5" />
            <div className="text-sm">
              <div className="font-medium text-blue-900 mb-1">Favicon Recommendations</div>
              <ul className="text-blue-800 space-y-1">
                <li>• <strong>Size:</strong> 32x32 or 64x64 pixels for best results</li>
                <li>• <strong>Format:</strong> PNG (recommended) or ICO files</li>
                <li>• <strong>File Size:</strong> Keep under 1MB for fast loading</li>
                <li>• <strong>Design:</strong> Simple, recognizable icons work best at small sizes</li>
              </ul>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}