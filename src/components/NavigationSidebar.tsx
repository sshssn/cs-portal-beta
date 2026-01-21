import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar
} from '@/components/ui/sidebar';
import { SearchInput } from '@/components/ui/search-input';
import {
  Home,
  PlusCircle,
  Settings,
  User,
  Target,
  Phone,
  History,
  Bell,
  BarChart3
} from 'lucide-react';

type ViewType = 'dashboard' | 'create-job' | 'all-jobs' | 'reports' | 'call-handling' | 'history' | 'reminders' | 'profile' | 'settings' | 'job-detail';

interface NavigationSidebarProps {
  currentView: ViewType;
  onViewChange: (view: ViewType) => void;
  onHomepageClick?: () => void;
  selectedCustomer?: string | null;
}

export default function NavigationSidebar({
  currentView,
  onViewChange,
  onHomepageClick,
}: NavigationSidebarProps) {
  const { setOpenMobile, isMobile } = useSidebar();

  // Main navigation items
  const mainMenuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: (props: any) => <Home {...props} className="w-8 h-8" /> },
    { id: 'create-job', label: 'Create Job', icon: (props: any) => <PlusCircle {...props} className="w-8 h-8" /> },
    { id: 'all-jobs', label: 'All Jobs', icon: (props: any) => <Target {...props} className="w-8 h-8" /> },
    { id: 'reports', label: 'Night shift Reports', icon: (props: any) => <BarChart3 {...props} className="w-8 h-8" /> },
    { id: 'call-handling', label: 'Call Handling', icon: (props: any) => <Phone {...props} className="w-8 h-8" /> },
    { id: 'history', label: 'History', icon: (props: any) => <History {...props} className="w-8 h-8" /> },
  ];

  // Bottom navigation items
  const bottomMenuItems = [
    { id: 'reminders', label: 'My Reminders', icon: (props: any) => <Bell {...props} className="w-8 h-8" /> },
    { id: 'profile', label: 'Profile', icon: (props: any) => <User {...props} className="w-8 h-8" /> },
    { id: 'settings', label: 'Settings', icon: (props: any) => <Settings {...props} className="w-8 h-8" /> },
  ];

  const handleNavClick = (viewId: string) => {
    onViewChange(viewId as ViewType);
    if (isMobile) {
      setOpenMobile(false);
    }
  };

  const handleLogoClick = () => {
    if (onHomepageClick) {
      onHomepageClick();
    } else {
      onViewChange('dashboard');
    }
  };

  return (
    <Sidebar collapsible="offcanvas" className="border-r border-gray-200">
      <SidebarHeader className="p-4 flex flex-col items-center justify-center gap-4">
        <button onClick={handleLogoClick} className="flex items-center justify-center hover:opacity-90 transition-opacity">
          <img
            src="/joblogic-logo.png"
            alt="joblogic"
            className="w-[160px] h-auto object-contain"
          />
        </button>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainMenuItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentView === item.id;

                return (
                  <SidebarMenuItem key={item.id} className="relative">
                    {isActive && (
                      <div className="absolute left-0 top-1 bottom-1 w-1 bg-blue-600 rounded-r-md z-10" />
                    )}
                    <SidebarMenuButton
                      onClick={() => handleNavClick(item.id)}
                      isActive={isActive}
                      className={`w-full transition-all duration-200 ${isActive
                        ? 'bg-blue-50/80 text-blue-600 hover:bg-blue-100/80'
                        : 'text-gray-600 hover:bg-gray-100/80 hover:text-gray-900'
                        }`}
                    >
                      <Icon className={`h-4 w-4 transition-colors ${isActive ? 'text-blue-600' : 'text-gray-500'}`} />
                      <span className={`text-sm ${isActive ? 'font-semibold' : 'font-medium'}`}>{item.label}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="mt-auto">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {bottomMenuItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentView === item.id;

                return (
                  <SidebarMenuItem key={item.id} className="relative">
                    {isActive && (
                      <div className="absolute left-0 top-1 bottom-1 w-1 bg-blue-600 rounded-r-md z-10" />
                    )}
                    <SidebarMenuButton
                      onClick={() => handleNavClick(item.id)}
                      isActive={isActive}
                      className={`w-full transition-all duration-200 ${isActive
                        ? 'bg-blue-50/80 text-blue-600 hover:bg-blue-100/80'
                        : 'text-gray-600 hover:bg-gray-100/80 hover:text-gray-900'
                        }`}
                    >
                      <Icon className={`h-4 w-4 transition-colors ${isActive ? 'text-blue-600' : 'text-gray-500'}`} />
                      <span className={`text-sm ${isActive ? 'font-semibold' : 'font-medium'}`}>{item.label}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarFooter>
    </Sidebar>
  );
}