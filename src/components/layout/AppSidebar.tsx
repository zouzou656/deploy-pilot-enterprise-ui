
import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Sidebar, 
  SidebarMenu, 
  SidebarMenuItem, 
  SidebarTrigger,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Home, 
  Settings, 
  Package, 
  Server, 
  FileText, 
  BarChart, 
  Users, 
  History,
  Menu,
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';
import useAuthStore from '@/stores/authStore';

const AppSidebar = () => {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = React.useState('general');
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);

  const navItems = [
    { 
      section: 'general',
      items: [
        { name: 'Dashboard', path: '/', icon: <Home className="h-5 w-5" /> },
        { name: 'Projects', path: '/projects', icon: <Package className="h-5 w-5" /> },
        { name: 'Deployments', path: '/deployments', icon: <Server className="h-5 w-5" /> },
        { name: 'Logs', path: '/logs', icon: <History className="h-5 w-5" /> },
      ]
    },
    {
      section: 'config',
      items: [
        { name: 'Settings', path: '/settings', icon: <Settings className="h-5 w-5" /> },
        { name: 'Configuration', path: '/settings/file', icon: <FileText className="h-5 w-5" /> },
        { name: 'Analytics', path: '/analytics', icon: <BarChart className="h-5 w-5" /> },
        { name: 'Team', path: '/team', icon: <Users className="h-5 w-5" /> },
      ]
    }
  ];

  return (
    <Sidebar>
      <div className="flex h-16 items-center border-b px-4">
        <SidebarTrigger asChild>
          <Button variant="outline" size="icon" className="md:hidden">
            {isSidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            <span className="sr-only">Toggle Sidebar</span>
          </Button>
        </SidebarTrigger>
        <div className="flex items-center gap-2 ml-2 md:ml-0">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-6 w-6"
          >
            <path d="M15 6v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3V6a3 3 0 1 0-3 3h12a3 3 0 1 0-3-3" />
          </svg>
          <span className="font-semibold text-lg">OSB Admin</span>
        </div>
      </div>
      
      <ScrollArea className="h-[calc(100vh-4rem)]">
        <div className="p-4">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-2 mb-4">
              <TabsTrigger value="general">General</TabsTrigger>
              <TabsTrigger value="config">Config</TabsTrigger>
            </TabsList>
          </Tabs>
          
          <div className="space-y-6">
            {navItems.map((section) => (
              <div 
                key={section.section} 
                className={cn(
                  "space-y-1",
                  section.section !== activeTab && "hidden"
                )}
              >
                <SidebarContent>
                  <SidebarGroup>
                    <SidebarGroupContent>
                      <SidebarMenu>
                        {section.items.map((item) => (
                          <SidebarMenuItem key={item.path}>
                            <NavLink
                              to={item.path}
                              className={({ isActive }) =>
                                cn(
                                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors w-full",
                                  isActive 
                                    ? "bg-accent text-accent-foreground font-medium" 
                                    : "hover:bg-accent hover:text-accent-foreground"
                                )
                              }
                            >
                              {item.icon}
                              <span>{item.name}</span>
                            </NavLink>
                          </SidebarMenuItem>
                        ))}
                      </SidebarMenu>
                    </SidebarGroupContent>
                  </SidebarGroup>
                </SidebarContent>
              </div>
            ))}
          </div>
          
          {user && (
            <div className="mt-6 pt-6 border-t">
              <div className="flex items-center gap-3 rounded-md px-3 py-2">
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                  {user.username ? user.username.charAt(0).toUpperCase() : ''}
                </div>
                <div>
                  <div className="text-sm font-medium">{user.username || 'User'}</div>
                  <div className="text-xs text-muted-foreground">{user.email || ''}</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>
    </Sidebar>
  );
};

export default AppSidebar;
