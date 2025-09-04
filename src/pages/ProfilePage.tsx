import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Clock, 
  Shield, 
  Edit3, 
  Save, 
  X,
  Building,
  UserCheck,
  Award
} from 'lucide-react';
import { showNotification } from '@/components/ui/toast-notification';
import { UserProfile } from '@/types/company';

const mockUserProfile: UserProfile = {
  id: 'user-001',
  firstName: 'John',
  lastName: 'Doe',
  email: 'john.doe@company.com',
  phone: '+1 (555) 123-4567',
  role: 'System Administrator',
  department: 'IT Operations',
  location: 'Main Office',
  startDate: new Date('2022-03-15'),
  permissions: ['job_create', 'job_edit', 'customer_manage', 'reports_view', 'settings_edit'],
  lastLogin: new Date(),
  status: 'active'
};

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile>(mockUserProfile);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<UserProfile>(mockUserProfile);
  const [isLoading, setIsLoading] = useState(true);

  const handleEdit = () => {
    setEditForm(profile);
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditForm(profile);
  };

  const handleResetProfile = () => {
    setProfile(mockUserProfile);
    setEditForm(mockUserProfile);
    localStorage.removeItem('userProfile');
    showNotification({
      type: 'success',
      title: 'Profile Reset',
      message: 'Profile has been reset to default values.'
    });
  };

  const handleSave = () => {
    // Validate required fields
    if (!editForm.firstName.trim() || !editForm.lastName.trim() || !editForm.email.trim()) {
      showNotification({
        type: 'error',
        title: 'Validation Error',
        message: 'Please fill in all required fields (First Name, Last Name, Email).'
      });
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(editForm.email)) {
      showNotification({
        type: 'error',
        title: 'Validation Error',
        message: 'Please enter a valid email address.'
      });
      return;
    }

    setProfile(editForm);
    setIsEditing(false);
    
    // Save to localStorage
    try {
      localStorage.setItem('userProfile', JSON.stringify(editForm));
      showNotification({
        type: 'success',
        title: 'Profile Updated',
        message: 'Your profile has been updated successfully.'
      });
    } catch (error) {
      console.error('Error saving profile:', error);
      showNotification({
        type: 'error',
        title: 'Save Error',
        message: 'Failed to save profile. Please try again.'
      });
    }
  };

  const handleInputChange = (field: keyof UserProfile, value: string) => {
    setEditForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const getPermissionLabel = (permission: string): string => {
    const labels: Record<string, string> = {
      'job_create': 'Create Jobs',
      'job_edit': 'Edit Jobs',
      'customer_manage': 'Manage Customers',
      'reports_view': 'View Reports',
      'settings_edit': 'Edit Settings'
    };
    return labels[permission] || permission;
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'inactive':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'suspended':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  useEffect(() => {
    console.log('ProfilePage: Loading profile data...');
    
    // Load profile from localStorage if available
    const savedProfile = localStorage.getItem('userProfile');
    if (savedProfile) {
      try {
        const parsed = JSON.parse(savedProfile);
        console.log('ProfilePage: Parsed profile from localStorage:', parsed);
        
        // Convert date strings back to Date objects
        const profileWithDates = {
          ...parsed,
          startDate: new Date(parsed.startDate),
          lastLogin: new Date(parsed.lastLogin)
        };
        
        console.log('ProfilePage: Profile with dates:', profileWithDates);
        setProfile(profileWithDates);
        setEditForm(profileWithDates);
      } catch (error) {
        console.error('ProfilePage: Error parsing saved profile:', error);
        // If there's an error, use the mock profile
        setProfile(mockUserProfile);
        setEditForm(mockUserProfile);
      }
    } else {
      console.log('ProfilePage: No saved profile found, using mock data');
    }
    
    setIsLoading(false);
  }, []);

  // Show loading state
  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-gray-600">Loading profile...</p>
          </div>
        </div>
      </div>
    );
  }

  // Safety check for profile data
  if (!profile || !editForm) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Profile Error</h3>
          <p className="text-gray-600 mb-4">Unable to load profile data.</p>
          <div className="flex gap-2 justify-center">
            <Button onClick={() => window.location.reload()}>
              Reload Page
            </Button>
            <Button onClick={handleResetProfile} variant="outline">
              Reset Profile
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Profile</h1>
          <p className="text-muted-foreground mt-2">Manage your account information and preferences</p>
        </div>
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
              <Edit3 className="h-4 w-4" />
              Edit Profile
            </>
          )}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Overview Card */}
        <Card className="lg:col-span-1">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <Avatar className="h-24 w-24">
                <AvatarImage src={profile.avatar} alt={`${profile.firstName} ${profile.lastName}`} />
                <AvatarFallback className="text-2xl bg-primary text-primary-foreground">
                  {profile.firstName.charAt(0)}{profile.lastName.charAt(0)}
                </AvatarFallback>
              </Avatar>
            </div>
            <CardTitle className="text-xl">{profile.firstName} {profile.lastName}</CardTitle>
            <CardDescription className="text-base">{profile.role}</CardDescription>
            <Badge className={`mt-2 ${getStatusColor(profile.status)}`}>
              {profile.status.charAt(0).toUpperCase() + profile.status.slice(1)}
            </Badge>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3 text-sm">
              <Building className="h-4 w-4 text-gray-500" />
              <span className="text-gray-700">{profile.department}</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <MapPin className="h-4 w-4 text-gray-500" />
              <span className="text-gray-700">{profile.location}</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Calendar className="h-4 w-4 text-gray-500" />
              <span className="text-gray-700">
                Started {profile.startDate instanceof Date && !isNaN(profile.startDate.getTime()) 
                  ? profile.startDate.toLocaleDateString() 
                  : 'Date not set'}
              </span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Clock className="h-4 w-4 text-gray-500" />
              <span className="text-gray-700">
                Last login: {profile.lastLogin instanceof Date && !isNaN(profile.lastLogin.getTime()) 
                  ? profile.lastLogin.toLocaleDateString() 
                  : 'Date not set'}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Profile Details Card */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Personal Information
            </CardTitle>
            <CardDescription>
              Update your personal details and contact information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                {isEditing ? (
                  <Input
                    id="firstName"
                    value={editForm.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                  />
                ) : (
                  <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-md">
                    <User className="h-4 w-4 text-gray-500" />
                    <span>{profile.firstName}</span>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                {isEditing ? (
                  <Input
                    id="lastName"
                    value={editForm.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                  />
                ) : (
                  <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-md">
                    <User className="h-4 w-4 text-gray-500" />
                    <span>{profile.lastName}</span>
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
                    <span>{profile.email}</span>
                  </div>
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
                    <span>{profile.phone}</span>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                {isEditing ? (
                  <Input
                    id="role"
                    value={editForm.role}
                    onChange={(e) => handleInputChange('role', e.target.value)}
                  />
                ) : (
                  <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-md">
                    <UserCheck className="h-4 w-4 text-gray-500" />
                    <span>{profile.role}</span>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="department">Department</Label>
                {isEditing ? (
                  <Input
                    id="department"
                    value={editForm.department}
                    onChange={(e) => handleInputChange('department', e.target.value)}
                  />
                ) : (
                  <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-md">
                    <Building className="h-4 w-4 text-gray-500" />
                    <span>{profile.department}</span>
                  </div>
                )}
              </div>
            </div>

            {isEditing && (
              <div className="flex gap-2 pt-4">
                <Button onClick={handleSave} className="flex-1">
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
                <Button onClick={handleCancel} variant="outline" className="flex-1">
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Permissions Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Permissions & Access
          </CardTitle>
          <CardDescription>
            Your current system permissions and access levels
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {profile.permissions.map((permission) => (
              <Badge key={permission} variant="secondary" className="flex items-center gap-2">
                <Award className="h-3 w-3" />
                {getPermissionLabel(permission)}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
