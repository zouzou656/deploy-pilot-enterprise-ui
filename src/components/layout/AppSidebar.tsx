
import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar
} from '@/components/ui/sidebar';
import { 
  LayoutDashboard,
  GitBranch,
  Settings,
  Package,
  Server,
  FileText,
  Database,
  History,
  Code
} from 'lucide-react';
import useAuthStore from '@/stores/authStore';

const AppSidebar = () => {
  const { collapsed } = useSidebar();
  const location = useLocation();
  const currentPath = location.pathname;
  const { checkPermission } = useAuthStore();
  
  // Navigation items with permission requirements
  const navItems = [
    { 
      title: 'Dashboard', 
      path: '/dashboard', 
      icon: LayoutDashboard, 
      requiredRole: 'VIEWER' as const 
    },
    { 
      title: 'Git Management', 
      path: '/git', 
      icon: GitBranch, 
      requiredRole: 'VIEWER' as const 
    },
    { 
      title: 'Settings File', 
      path: '/settings-file', 
      icon: FileText, 
      requiredRole: 'DEVELOPER' as const 
    },
    { 
      title: 'JAR Generation', 
      path: '/jar-generation', 
      icon: Package, 
      requiredRole: 'DEVELOPER' as const 
    },
    { 
      title: 'WebLogic Deployment', 
      path: '/weblogic-deployment', 
      icon: Server, 
      requiredRole: 'DEVELOPER' as const 
    },
    { 
      title: 'Logs & History', 
      path: '/logs', 
      icon: History, 
      requiredRole: 'VIEWER' as const 
    },
    { 
      title: 'Metadata Management', 
      path: '/metadata', 
      icon: Database, 
      requiredRole: 'DEVELOPER' as const 
    },
    { 
      title: 'Code Explorer', 
      path: '/code-explorer', 
      icon: Code, 
      requiredRole: 'VIEWER' as const 
    },
    { 
      title: 'Settings', 
      path: '/settings', 
      icon: Settings, 
      requiredRole: 'ADMIN' as const 
    },
  ];

  // Helper functions
  const isActive = (path: string) => currentPath === path;
  const isInSection = (path: string) => currentPath.startsWith(path);
  
  const getNavLinkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-2 px-3 py-2 rounded-md w-full ${isActive ? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium' : 'hover:bg-sidebar-accent/50 text-sidebar-foreground'}`;

  return (
    <Sidebar
      className={`border-r border-border h-[calc(100vh-4rem)] ${collapsed ? 'w-16' : 'w-64'}`}
      collapsible
    >
      <SidebarContent>
        <SidebarGroup defaultOpen>
          <SidebarGroupLabel className={collapsed ? 'sr-only' : ''}>
            Main Navigation
          </SidebarGroupLabel>
          
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => 
                checkPermission(item.requiredRole) && (
                  <SidebarMenuItem key={item.path}>
                    <SidebarMenuButton asChild>
                      <NavLink to={item.path} className={getNavLinkClass}>
                        <item.icon className="h-5 w-5" />
                        {!collapsed && <span>{item.title}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        
        {!collapsed && (
          <SidebarGroup defaultOpen>
            <SidebarGroupLabel>Recent Projects</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <div className="flex items-center gap-2 px-3 py-2 text-sidebar-foreground hover:bg-sidebar-accent/50 rounded-md cursor-pointer">
                      <div className="h-2 w-2 rounded-full bg-success"></div>
                      <span>OSB Main Integration</span>
                    </div>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <div className="flex items-center gap-2 px-3 py-2 text-sidebar-foreground hover:bg-sidebar-accent/50 rounded-md cursor-pointer">
                      <div className="h-2 w-2 rounded-full bg-warning"></div>
                      <span>Customer API</span>
                    </div>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>
      
      {/* Version info at bottom */}
      {!collapsed && (
        <div className="mt-auto p-4 text-xs text-sidebar-foreground/70">
          <p>OSB CI/CD Platform v1.0.0</p>
        </div>
      )}
    </Sidebar>
  );
};

export default AppSidebar;
