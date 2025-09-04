import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Building2, 
  Upload, 
  Save, 
  Clock, 
  MapPin, 
  Phone, 
  Mail, 
  Globe, 
  Settings as SettingsIcon,
  Palette,
  Bell,
  Shield,
  Users,
  FileText,
  Database,
  RefreshCw
} from 'lucide-react';
import { showNotification } from '@/components/ui/toast-notification';
import { CompanySettings, BusinessHours, DaySchedule, NotificationSettings, AppearanceSettings, SecuritySettings } from '@/types/company';
import { saveCompanySettings } from '@/lib/companyUtils';

const defaultBusinessHours: BusinessHours = {
  monday: { open: true, openTime: '09:00', closeTime: '17:00' },
  tuesday: { open: true, openTime: '09:00', closeTime: '17:00' },
  wednesday: { open: true, openTime: '09:00', closeTime: '17:00' },
  thursday: { open: true, openTime: '09:00', closeTime: '17:00' },
  friday: { open: true, openTime: '09:00', closeTime: '17:00' },
  saturday: { open: false, openTime: '10:00', closeTime: '14:00' },
  sunday: { open: false, openTime: '10:00', closeTime: '14:00' }
};

const mockCompanySettings: CompanySettings = {
  id: 'company-001',
  name: 'Tech Solutions Inc.',
  description: 'Leading provider of technical support and field service solutions',
  address: '123 Business Park Drive',
  city: 'Tech City',
  state: 'CA',
  zipCode: '90210',
  country: 'United States',
  phone: '+1 (555) 123-4567',
  email: 'info@techsolutions.com',
  website: 'https://techsolutions.com',
  industry: 'Technology Services',
  founded: '2015',
  employees: '50-100',
  businessHours: defaultBusinessHours,
  notifications: {
    emailNotifications: true,
    pushNotifications: true,
    jobAlerts: true,
    customerUpdates: true,
    systemMaintenance: false
  },
  appearance: {
    theme: 'light',
    primaryColor: '#3b82f6',
    sidebarCollapsed: false,
    compactMode: false
  },
  security: {
    twoFactorAuth: false,
    sessionTimeout: 30,
    passwordExpiry: 90,
    loginAttempts: 5
  }
};

export default function SettingsPage() {
  const [settings, setSettings] = useState<CompanySettings>(mockCompanySettings);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<CompanySettings>(mockCompanySettings);
  const [activeTab, setActiveTab] = useState('company');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const tabs = [
    { id: 'company', label: 'Company Setup', icon: Building2 },
    { id: 'business-hours', label: 'Business Hours', icon: Clock },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'security', label: 'Security', icon: Shield }
  ];

  useEffect(() => {
    // Load settings from localStorage if available
    const savedSettings = localStorage.getItem('companySettings');
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        setSettings(parsed);
        setEditForm(parsed);
      } catch (error) {
        console.error('Error parsing saved settings:', error);
      }
    }
  }, []);

  const handleEdit = () => {
    setEditForm(settings);
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditForm(settings);
  };

  const handleSave = () => {
    setSettings(editForm);
    setIsEditing(false);
    
    // Save using utility function
    saveCompanySettings(editForm);
    
    // Dispatch custom event to notify other components
    window.dispatchEvent(new CustomEvent('companySettingsChanged'));
    
    showNotification({
      type: 'success',
      title: 'Settings Updated',
      message: 'Company settings have been updated successfully.'
    });
  };

  const handleInputChange = (field: keyof CompanySettings, value: any) => {
    setEditForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleNestedChange = (section: keyof CompanySettings, field: string, value: any) => {
    setEditForm(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        handleInputChange('logo', result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLogoClick = () => {
    fileInputRef.current?.click();
  };

  const getDayLabel = (day: string): string => {
    const labels: Record<string, string> = {
      monday: 'Monday',
      tuesday: 'Tuesday',
      wednesday: 'Wednesday',
      thursday: 'Thursday',
      friday: 'Friday',
      saturday: 'Saturday',
      sunday: 'Sunday'
    };
    return labels[day] || day;
  };

  const renderCompanySetup = () => (
    <div className="space-y-6">
      {/* Company Logo */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Company Logo
          </CardTitle>
          <CardDescription>
            Upload your company logo to replace the default icon throughout the application
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-6">
            <div className="flex flex-col items-center gap-4">
                             <div 
                 className={`w-32 h-32 border-2 border-dashed rounded-lg flex items-center justify-center transition-colors ${
                   isEditing 
                     ? 'border-gray-300 cursor-pointer hover:border-primary' 
                     : 'border-gray-200 cursor-not-allowed opacity-60'
                 }`}
                 onClick={isEditing ? handleLogoClick : undefined}
               >
                 {editForm.logo ? (
                   <img 
                     src={editForm.logo} 
                     alt="Company Logo" 
                     className="w-full h-full object-contain rounded-lg"
                   />
                 ) : (
                   <div className="text-center">
                     <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                     <p className="text-sm text-gray-500">
                       {isEditing ? 'Click to upload' : 'No logo set'}
                     </p>
                   </div>
                 )}
               </div>
               <input
                 ref={fileInputRef}
                 type="file"
                 accept="image/*"
                 onChange={handleLogoUpload}
                 className="hidden"
                 disabled={!isEditing}
               />
               <Button 
                 onClick={isEditing ? handleLogoClick : undefined} 
                 variant="outline" 
                 size="sm"
                 disabled={!isEditing}
               >
                 <Upload className="h-4 w-4 mr-2" />
                 {editForm.logo ? 'Change Logo' : 'Upload Logo'}
               </Button>
            </div>
            
                         <div className="flex-1 space-y-4">
               {/* Current Logo Display */}
               {!isEditing && settings.logo && (
                 <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                   <Label className="text-sm font-medium text-gray-700 mb-2 block">Current Logo</Label>
                   <div className="flex items-center gap-3">
                     <img 
                       src={settings.logo} 
                       alt="Current Company Logo" 
                       className="w-16 h-16 object-contain rounded border"
                     />
                     <div className="text-sm text-gray-600">
                       <p>Logo is currently set and will appear in the sidebar</p>
                       <p className="text-xs mt-1">Click "Edit Settings" to change</p>
                     </div>
                   </div>
                 </div>
               )}
               
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div className="space-y-2">
                   <Label htmlFor="companyName">Company Name</Label>
                   {isEditing ? (
                     <Input
                       id="companyName"
                       value={editForm.name}
                       onChange={(e) => handleInputChange('name', e.target.value)}
                     />
                   ) : (
                     <div className="p-3 bg-gray-50 rounded-md">{settings.name}</div>
                   )}
                 </div>

                <div className="space-y-2">
                  <Label htmlFor="industry">Industry</Label>
                  {isEditing ? (
                    <Input
                      id="industry"
                      value={editForm.industry}
                      onChange={(e) => handleInputChange('industry', e.target.value)}
                    />
                  ) : (
                    <div className="p-3 bg-gray-50 rounded-md">{settings.industry}</div>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                {isEditing ? (
                  <Textarea
                    id="description"
                    value={editForm.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    rows={3}
                  />
                ) : (
                  <div className="p-3 bg-gray-50 rounded-md">{settings.description}</div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Company Details */}
      <Card>
        <CardHeader>
          <CardTitle>Company Details</CardTitle>
          <CardDescription>
            Basic company information and contact details
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="founded">Founded</Label>
              {isEditing ? (
                <Input
                  id="founded"
                  value={editForm.founded}
                  onChange={(e) => handleInputChange('founded', e.target.value)}
                />
              ) : (
                <div className="p-3 bg-gray-50 rounded-md">{settings.founded}</div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="employees">Employees</Label>
              {isEditing ? (
                <Select value={editForm.employees} onValueChange={(value) => handleInputChange('employees', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1-10">1-10</SelectItem>
                    <SelectItem value="11-50">11-50</SelectItem>
                    <SelectItem value="51-100">51-100</SelectItem>
                    <SelectItem value="101-500">101-500</SelectItem>
                    <SelectItem value="500+">500+</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <div className="p-3 bg-gray-50 rounded-md">{settings.employees}</div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              {isEditing ? (
                <Input
                  id="phone"
                  value={editForm.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                />
              ) : (
                <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-md">
                  <Phone className="h-4 w-4 text-gray-500" />
                  <span>{settings.phone}</span>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              {isEditing ? (
                <Input
                  id="email"
                  type="email"
                  value={editForm.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                />
              ) : (
                <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-md">
                  <Mail className="h-4 w-4 text-gray-500" />
                  <span>{settings.email}</span>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="website">Website</Label>
              {isEditing ? (
                <Input
                  id="website"
                  value={editForm.website}
                  onChange={(e) => handleInputChange('website', e.target.value)}
                />
              ) : (
                <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-md">
                  <Globe className="h-4 w-4 text-gray-500" />
                  <span>{settings.website}</span>
                </div>
              )}
            </div>
          </div>

          <div className="mt-4 space-y-4">
            <Label>Address</Label>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="address">Street</Label>
                {isEditing ? (
                  <Input
                    id="address"
                    value={editForm.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                  />
                ) : (
                  <div className="p-3 bg-gray-50 rounded-md">{settings.address}</div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                {isEditing ? (
                  <Input
                    id="city"
                    value={editForm.city}
                    onChange={(e) => handleInputChange('city', e.target.value)}
                  />
                ) : (
                  <div className="p-3 bg-gray-50 rounded-md">{settings.city}</div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="state">State</Label>
                {isEditing ? (
                  <Input
                    id="state"
                    value={editForm.state}
                    onChange={(e) => handleInputChange('state', e.target.value)}
                  />
                ) : (
                  <div className="p-3 bg-gray-50 rounded-md">{settings.state}</div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="zipCode">ZIP Code</Label>
                {isEditing ? (
                  <Input
                    id="zipCode"
                    value={editForm.zipCode}
                    onChange={(e) => handleInputChange('zipCode', e.target.value)}
                  />
                ) : (
                  <div className="p-3 bg-gray-50 rounded-md">{settings.zipCode}</div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderBusinessHours = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Business Hours
        </CardTitle>
        <CardDescription>
          Set your company's operating hours for each day of the week
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {Object.entries(editForm.businessHours).map(([day, schedule]) => (
            <div key={day} className="flex items-center gap-4 p-4 border rounded-lg">
              <div className="w-24">
                <Label className="font-medium">{getDayLabel(day)}</Label>
              </div>
              
              <div className="flex items-center gap-2">
                <Switch
                  checked={schedule.open}
                  onCheckedChange={(checked) => 
                    handleNestedChange('businessHours', day, { ...schedule, open: checked })
                  }
                  disabled={!isEditing}
                />
                <span className="text-sm text-gray-600">
                  {schedule.open ? 'Open' : 'Closed'}
                </span>
              </div>

              {schedule.open && (
                <>
                  <div className="flex items-center gap-2">
                    <Label className="text-sm">Open</Label>
                    {isEditing ? (
                      <Input
                        type="time"
                        value={schedule.openTime}
                        onChange={(e) => 
                          handleNestedChange('businessHours', day, { ...schedule, openTime: e.target.value })
                        }
                        className="w-32"
                      />
                    ) : (
                      <span className="text-sm bg-gray-50 px-3 py-1 rounded">{schedule.openTime}</span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <Label className="text-sm">Close</Label>
                    {isEditing ? (
                      <Input
                        type="time"
                        value={schedule.closeTime}
                        onChange={(e) => 
                          handleNestedChange('businessHours', day, { ...schedule, closeTime: e.target.value })
                        }
                        className="w-32"
                      />
                    ) : (
                      <span className="text-sm bg-gray-50 px-3 py-1 rounded">{schedule.closeTime}</span>
                    )}
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );

  const renderNotifications = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Notification Preferences
        </CardTitle>
        <CardDescription>
          Configure how you receive notifications and alerts
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {Object.entries(editForm.notifications).map(([key, value]) => (
            <div key={key} className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <Label className="font-medium">
                  {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                </Label>
                <p className="text-sm text-gray-600">
                  Receive {key.replace(/([A-Z])/g, ' $1').toLowerCase()} notifications
                </p>
              </div>
              <Switch
                checked={value}
                onCheckedChange={(checked) => 
                  handleNestedChange('notifications', key, checked)
                }
                disabled={!isEditing}
              />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );

  const renderAppearance = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Palette className="h-5 w-5" />
          Appearance Settings
        </CardTitle>
        <CardDescription>
          Customize the look and feel of your application
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
                     <div className="flex items-center justify-between">
             <div>
               <Label className="font-medium">Theme</Label>
               <p className="text-sm text-gray-600">Light mode is currently enabled</p>
             </div>
             <Badge variant="secondary">Light Mode</Badge>
           </div>

          <div className="flex items-center justify-between">
            <div>
              <Label className="font-medium">Compact Mode</Label>
              <p className="text-sm text-gray-600">Reduce spacing for more content</p>
            </div>
            <Switch
              checked={editForm.appearance.compactMode}
              onCheckedChange={(checked) => 
                handleNestedChange('appearance', 'compactMode', checked)
              }
              disabled={!isEditing}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderSecurity = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Security Settings
        </CardTitle>
        <CardDescription>
          Manage your account security and authentication preferences
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label className="font-medium">Two-Factor Authentication</Label>
              <p className="text-sm text-gray-600">Add an extra layer of security</p>
            </div>
            <Switch
              checked={editForm.security.twoFactorAuth}
              onCheckedChange={(checked) => 
                handleNestedChange('security', 'twoFactorAuth', checked)
              }
              disabled={!isEditing}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label className="font-medium">Session Timeout</Label>
              <p className="text-sm text-gray-600">Minutes before automatic logout</p>
            </div>
            {isEditing ? (
              <Select value={editForm.security.sessionTimeout.toString()} onValueChange={(value) => 
                handleNestedChange('security', 'sessionTimeout', parseInt(value))
              }>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="15">15 minutes</SelectItem>
                  <SelectItem value="30">30 minutes</SelectItem>
                  <SelectItem value="60">1 hour</SelectItem>
                  <SelectItem value="120">2 hours</SelectItem>
                </SelectContent>
              </Select>
            ) : (
              <Badge variant="secondary">{settings.security.sessionTimeout} minutes</Badge>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'company':
        return renderCompanySetup();
      case 'business-hours':
        return renderBusinessHours();
      case 'notifications':
        return renderNotifications();
      case 'appearance':
        return renderAppearance();
      case 'security':
        return renderSecurity();
      default:
        return renderCompanySetup();
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Settings</h1>
          <p className="text-muted-foreground mt-2">Manage your company settings and preferences</p>
        </div>
        <div className="flex gap-2">
          {isEditing && (
            <Button onClick={handleCancel} variant="outline">
              Cancel
            </Button>
          )}
          <Button
            onClick={isEditing ? handleSave : handleEdit}
            variant={isEditing ? "default" : "outline"}
            className="flex items-center gap-2"
          >
            {isEditing ? (
              <>
                <Save className="h-4 w-4" />
                Save Changes
              </>
            ) : (
              <>
                <SettingsIcon className="h-4 w-4" />
                Edit Settings
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-muted p-1 rounded-lg">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-background text-primary shadow-sm'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
              }`}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      {renderTabContent()}
    </div>
  );
}
