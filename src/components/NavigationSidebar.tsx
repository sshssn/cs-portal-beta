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
  FileText,
  Users,
  Moon,
  Phone,
  History,
  Bell
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

type ViewType = 'dashboard' | 'create-job' | 'all-jobs' | 'reports' | 'call-handling' | 'history' | 'reminders' | 'profile' | 'settings' | 'job-detail' | 'tickets' | 'tickets-new' | 'ticket-detail' | 'service-providers';

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
  const navigate = useNavigate();

  // Main navigation items
  const mainMenuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: (props: any) => <Home {...props} className="w-8 h-8" />, path: null },
    { id: 'tickets', label: 'Ticket Manager', icon: (props: any) => <FileText {...props} className="w-8 h-8" />, path: '/tickets' },
    { id: 'all-jobs', label: 'All Jobs', icon: (props: any) => <Target {...props} className="w-8 h-8" />, path: null },
    { id: 'service-providers', label: 'Service Providers', icon: (props: any) => <Users {...props} className="w-8 h-8" />, path: '/service-providers' },
    { id: 'call-handling', label: 'Call Handling', icon: (props: any) => <Phone {...props} className="w-8 h-8" />, path: null },
    { id: 'reports', label: 'Night Shift Reports', icon: (props: any) => <Moon {...props} className="w-8 h-8" />, path: null },
    { id: 'history', label: 'History', icon: (props: any) => <History {...props} className="w-8 h-8" />, path: null },
    { id: 'reminders', label: 'My Reminders', icon: (props: any) => <Bell {...props} className="w-8 h-8" />, path: null },
  ];

  // Bottom navigation items
  const bottomMenuItems = [
    { id: 'profile', label: 'Profile', icon: (props: any) => <User {...props} className="w-8 h-8" />, path: null },
    { id: 'settings', label: 'Settings', icon: (props: any) => <Settings {...props} className="w-8 h-8" />, path: null },
  ];

  const handleNavClick = (viewId: string, path: string | null) => {
    // Always call onViewChange for proper view switching
    onViewChange(viewId as ViewType);
    // Navigate if there's a specific path
    if (path) {
      navigate(path);
    }
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
                const isActive = currentView === item.id || 
                  (item.id === 'tickets' && (currentView === 'tickets-new' || currentView === 'ticket-detail'));

                return (
                  <SidebarMenuItem key={item.id} className="relative">
                    {isActive && (
                      <div className="absolute left-0 top-1 bottom-1 w-1 bg-blue-600 rounded-r-md z-10" />
                    )}
                    <SidebarMenuButton
                      onClick={() => handleNavClick(item.id, item.path)}
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
                      onClick={() => handleNavClick(item.id, item.path)}
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