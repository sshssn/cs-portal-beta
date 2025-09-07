import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar
} from '@/components/ui/sidebar';
import { 
  LayoutDashboard, 
  Users, 
  Bell, 
  PlusCircle, 
  Settings,
  LogOut,
  User,
  FileText,
  MapPin
} from 'lucide-react';
import { getCompanyLogo, getCompanyName } from '@/lib/companyUtils';
import { useState, useEffect } from 'react';

interface NavigationSidebarProps {
  currentView: 'master' | 'customer' | 'customer-dashboard' | 'alerts' | 'engineer-alerts' | 'wizard' | 'reports' | 'customer-detail' | 'customer-alerts' | 'job-detail' | 'sites' | 'profile' | 'settings';
  onViewChange: (view: 'master' | 'customer' | 'customer-dashboard' | 'alerts' | 'engineer-alerts' | 'wizard' | 'reports' | 'customer-detail' | 'customer-alerts' | 'job-detail' | 'sites' | 'profile' | 'settings') => void;
  onHomepageClick?: () => void;
  selectedCustomer?: string | null;
}

export default function NavigationSidebar({
  currentView,
  onViewChange,
  onHomepageClick,
  selectedCustomer
}: NavigationSidebarProps) {
  const [companyLogo, setCompanyLogo] = useState<string | null>(null);
  const [companyName, setCompanyName] = useState<string>('Out of Hours Portal');
  const { state } = useSidebar();
  const isOpen = state === 'expanded';

  useEffect(() => {
    // Load company logo and name
    const logo = getCompanyLogo();
    const name = getCompanyName();
    setCompanyLogo(logo);
    setCompanyName(name);

    // Listen for storage changes to update logo/name when settings change
    const handleStorageChange = () => {
      const newLogo = getCompanyLogo();
      const newName = getCompanyName();
      setCompanyLogo(newLogo);
      setCompanyName(newName);
    };
    
    // Listen for company settings changed event
    const handleSettingsChange = () => {
      const newLogo = getCompanyLogo();
      const newName = getCompanyName();
      setCompanyLogo(newLogo);
      setCompanyName(newName);
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('company-settings-changed', handleSettingsChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('company-settings-changed', handleSettingsChange);
    };
  }, []);

  const menuItems = [
    {
      id: 'master',
      label: 'Master Dashboard',
      icon: LayoutDashboard,
      description: 'Overview of all jobs and customers'
    },
    {
      id: 'customer',
      label: 'Customer View',
      icon: Users,
      description: 'Manage and view all customer accounts and their job history'
    },
    {
      id: 'sites',
      label: 'Sites View',
      icon: MapPin,
      description: 'Monitor and manage all customer sites and their job status'
    },
    {
      id: 'alerts',
      label: 'Alerts Portal',
      icon: Bell,
      description: 'Monitor and manage all system alerts across all customers and jobs'
    },
    {
      id: 'wizard',
      label: 'New Job Wizard',
      icon: PlusCircle,
      description: 'Create a new support job'
    },
    {
      id: 'reports',
      label: 'End of Shift Report',
      icon: FileText,
      description: 'Generate and view end of shift reports'
    }
  ];

  const userMenuItems = [
    {
      id: 'profile',
      label: 'Profile',
      icon: User,
      description: 'Manage your account information and preferences'
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: Settings,
      description: 'Configure company settings and system preferences'
    }
  ];

  return (
    <Sidebar className="w-14 group-data-[state=expanded]:w-[13.6rem] transition-all duration-300" collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border h-24 flex items-center justify-center">
        <div
          className="flex flex-col items-center gap-2 px-3 py-4 cursor-pointer hover:bg-sidebar-accent rounded-md transition-colors w-full group"
          onClick={() => {
            onViewChange('master');
            if (onHomepageClick) {
              onHomepageClick();
            }
          }}
          title="Click to return to homepage"
        >
          {/* Logo */}
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-800 text-white overflow-hidden flex-shrink-0 group-data-[collapsible=icon]:h-8 group-data-[collapsible=icon]:w-8 transition-all duration-200">
            {companyLogo ? (
              <img
                src={companyLogo}
                alt="Company Logo"
                className="w-full h-full object-contain"
              />
            ) : (
              <LayoutDashboard className="h-6 w-6 group-data-[collapsible=icon]:h-5 group-data-[collapsible=icon]:w-5" />
            )}
          </div>
          
          {/* Company Name - Only visible when expanded */}
          <div className="flex flex-col items-center min-w-0 opacity-0 group-data-[state=expanded]:opacity-100 transition-opacity duration-200">
            <div className="w-full h-px bg-gradient-to-r from-transparent via-sidebar-border to-transparent mb-2"></div>
            <span className="text-sm font-bold text-center truncate leading-tight text-sidebar-foreground">{companyName}</span>
            <span className="text-xs text-muted-foreground text-center leading-tight">Out of Hours Portal</span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="opacity-0 group-data-[state=expanded]:opacity-100 transition-opacity duration-200">
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentView === item.id;

                return (
                  <SidebarMenuItem key={item.id}>
                    <SidebarMenuButton
                      onClick={() => {
                        onViewChange(item.id as 'master' | 'customer' | 'customer-dashboard' | 'alerts' | 'engineer-alerts' | 'wizard' | 'reports' | 'customer-detail' | 'customer-alerts' | 'job-detail' | 'sites');
                        // If it's Master Dashboard, also trigger homepage navigation
                        if (item.id === 'master' && onHomepageClick) {
                          onHomepageClick();
                        }
                      }}
                      isActive={isActive}
                      tooltip={item.description}
                      className="group relative h-10"
                    >
                      <Icon className={`h-5 w-5 transition-colors duration-200 ${
                        isActive
                          ? 'text-primary'
                          : 'text-muted-foreground group-hover:text-foreground'
                      }`} />
                      <span className="ml-3 opacity-0 group-data-[state=expanded]:opacity-100 transition-opacity duration-200">
                        {item.label}
                      </span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={() => onViewChange('profile')}
              isActive={currentView === 'profile'}
              tooltip="User Settings"
              className="group relative h-10"
            >
              <User className={`h-5 w-5 transition-colors duration-200 ${
                currentView === 'profile'
                  ? 'text-primary'
                  : 'text-muted-foreground group-hover:text-foreground'
              }`} />
              <span className="ml-3 opacity-0 group-data-[state=expanded]:opacity-100 transition-opacity duration-200">
                Profile
              </span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={() => onViewChange('settings')}
              isActive={currentView === 'settings'}
              tooltip="Application Settings"
              className="group relative h-10"
            >
              <Settings className={`h-5 w-5 transition-colors duration-200 ${
                currentView === 'settings'
                  ? 'text-primary'
                  : 'text-muted-foreground group-hover:text-foreground'
              }`} />
              <span className="ml-3 opacity-0 group-data-[state=expanded]:opacity-100 transition-opacity duration-200">
                Settings
              </span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              tooltip="Sign out"
              className="group relative h-10"
            >
              <LogOut className="h-5 w-5 text-muted-foreground group-hover:text-foreground transition-colors duration-200" />
              <span className="ml-3 opacity-0 group-data-[state=expanded]:opacity-100 transition-opacity duration-200">
                Sign Out
              </span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
