
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
  useSidebar,
} from '@/components/ui/sidebar';
import {
  LayoutDashboard,
  GitBranch,
  FileText,
  Package,
  Server,
  History,
  Code,
  Settings,
  FileSearch,
  Users,
  Shield
} from 'lucide-react';
import useAuthStore, { PERMISSIONS } from '@/stores/authStore';

const AppSidebar = () => {
  const { collapsed } = useSidebar(); // Fixed: using collapsed instead of isCollapsed
  const location = useLocation();
  const { checkPermission, hasPermission } = useAuthStore();

  // For active route highlighting
  const isActive = (path: string) => location.pathname === path;

  // For active route class
  const getNavLinkClasses = ({ isActive }: { isActive: boolean }) =>
      isActive
          ? 'w-full flex items-center px-3 py-2 font-medium rounded-md bg-sidebar-accent text-sidebar-accent-foreground'
          : 'w-full flex items-center px-3 py-2 text-sidebar-foreground hover:bg-sidebar-accent/50 rounded-md';

  const menuItems = [
    {
      label: 'Dashboard',
      icon: LayoutDashboard,
      path: '/dashboard',
      requiredRole: null,
    },
    {
      label: 'Git Management',
      icon: GitBranch,
      path: '/git',
      requiredRole: null,
    },
    {
      label: 'Settings File',
      icon: FileText,
      path: '/settings-file',
      requiredRole: null,
    },
    {
      label: 'JAR Generation',
      icon: Package,
      path: '/jar-generation',
      requiredRole: null,
    },
    {
      label: 'WebLogic Deployment',
      icon: Server,
      path: '/weblogic-deployment',
      requiredRole: null,
    },
    {
      label: 'Logs & History',
      icon: History,
      path: '/logs',
      requiredRole: null,
    },
    {
      label: 'Code Explorer',
      icon: Code,
      path: '/code-explorer',
      requiredRole: null,
    },
    {
      label: 'API Explorer',
      icon: FileSearch,
      path: '/api-explorer',
      requiredPermission: 'user:view',
    },
    {
      label: 'Users',
      icon: Users,
      path: '/users',
      requiredPermission: PERMISSIONS.USER_VIEW,
    },
    {
      label: 'Roles',
      icon: Shield,
      path: '/roles',
      requiredPermission: PERMISSIONS.ROLE_VIEW,
    },
    {
      label: 'Settings',
      icon: Settings,
      path: '/settings',
      requiredRole: 'ADMIN',
    },
  ];

  return (
      <Sidebar
          className={`border-r ${
              collapsed ? 'w-[60px]' : 'w-[220px]'
          } transition-all top-[6%] duration-300`}
          collapsible="icon"
      >
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel className={collapsed ? 'sr-only' : ''}>
              Navigation
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {menuItems.map((item) => {
                  // Check if user has required role or permission
                  let permitted = false;
                  
                  if (item.requiredRole === null) {
                    permitted = true;
                  } else if (item.requiredRole) {
                    permitted = checkPermission(item.requiredRole as 'ADMIN' | 'DEVELOPER' | 'VIEWER');
                  }
                  
                  if (item.requiredPermission && !permitted) {
                    permitted = hasPermission(item.requiredPermission);
                  }
                  
                  if (!permitted) return null;

                  return (
                      <SidebarMenuItem key={item.path}>
                        <SidebarMenuButton asChild>
                          <NavLink
                              to={item.path}
                              end
                              className={getNavLinkClasses}
                          >
                            <item.icon className={`h-[18px] w-[18px] ${!collapsed ? 'mr-2' : ''}`} />
                            {!collapsed && <span>{item.label}</span>}
                          </NavLink>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
  );
};

export default AppSidebar;
