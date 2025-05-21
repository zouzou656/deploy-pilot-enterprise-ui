
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sidebar, SidebarContent } from '@/components/ui/sidebar';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import {
  Code2,
  FileJson,
  GitBranch,
  Home,
  Package,
  Server,
  Settings,
  Users,
  FileCode,
  ScrollText,
  ShieldCheck,
  Layers,
} from 'lucide-react';
import useAuthStore from '@/stores/authStore';
import { PERMISSIONS } from '@/stores/authStore';

interface NavItemProps {
  icon: React.ElementType;
  title: string;
  to: string;
  isActive?: boolean;
  permission?: string;
  requiredRole?: 'ADMIN' | 'DEVELOPER' | 'VIEWER';
}

const NavItem: React.FC<NavItemProps> = ({
  icon: Icon,
  title,
  to,
  isActive,
  permission,
  requiredRole = 'VIEWER',
}) => {
  const { checkPermission, hasPermission } = useAuthStore();
  // Get collapsed state from document attribute instead of context
  const collapsed = document.documentElement.classList.contains('sidebar-collapsed');

  // Check if user has permission to see this item
  if (permission && !hasPermission(permission)) return null;
  if (!checkPermission(requiredRole)) return null;

  return (
    <Tooltip delayDuration={0}>
      <TooltipTrigger asChild>
        <Button
          asChild
          variant={isActive ? 'secondary' : 'ghost'}
          size={collapsed ? 'icon' : 'default'}
          className={cn(
            'w-full justify-start',
            collapsed ? 'px-2' : 'px-4'
          )}
        >
          <Link to={to}>
            <Icon className={cn('h-5 w-5', collapsed ? 'mr-0' : 'mr-2')} />
            {!collapsed && <span>{title}</span>}
          </Link>
        </Button>
      </TooltipTrigger>
      {collapsed && (
        <TooltipContent side="right" className="flex items-center gap-4">
          {title}
        </TooltipContent>
      )}
    </Tooltip>
  );
};

const AppSidebar: React.FC = () => {
  const location = useLocation();
  // Get collapsed state from document attribute instead of context
  const collapsed = document.documentElement.classList.contains('sidebar-collapsed');

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <Sidebar className="border-r">
      <SidebarContent className="p-2">
        <ScrollArea className="h-[calc(100vh-4rem)]">
          <div className="space-y-1 py-2">
            <NavItem
              icon={Home}
              title="Dashboard"
              to="/dashboard"
              isActive={isActive('/dashboard')}
            />
            <NavItem
              icon={Layers}
              title="Projects"
              to="/projects"
              isActive={isActive('/projects')}
              permission={PERMISSIONS.PROJECT_VIEW}
            />
            <NavItem
              icon={GitBranch}
              title="Git Management"
              to="/git"
              isActive={isActive('/git')}
            />
            <NavItem
              icon={FileJson}
              title="Settings File"
              to="/settings-file"
              isActive={isActive('/settings-file')}
            />
            <NavItem
              icon={Package}
              title="JAR Generation"
              to="/jar-generation"
              isActive={isActive('/jar-generation')}
            />
            <NavItem
              icon={Server}
              title="Weblogic Deployment"
              to="/weblogic-deployment"
              isActive={isActive('/weblogic-deployment')}
              requiredRole="DEVELOPER"
            />
            <NavItem
              icon={ScrollText}
              title="Logs History"
              to="/logs"
              isActive={isActive('/logs')}
            />
            <NavItem
              icon={FileCode}
              title="Code Explorer"
              to="/code-explorer"
              isActive={isActive('/code-explorer')}
            />
            <NavItem
              icon={Code2}
              title="API Explorer"
              to="/api-explorer"
              isActive={isActive('/api-explorer')}
            />
          </div>

          <div className="py-2">
            <div className={cn('px-3 py-2', collapsed ? 'sr-only' : '')}>
              <h2 className="mb-1 text-xs font-medium">Administration</h2>
              <p className="text-xs text-muted-foreground">
                System management
              </p>
            </div>
            <div className="space-y-1 py-2">
              <NavItem
                icon={Users}
                title="Users"
                to="/users"
                isActive={isActive('/users')}
                permission={PERMISSIONS.USER_VIEW}
              />
              <NavItem
                icon={ShieldCheck}
                title="Roles"
                to="/roles"
                isActive={isActive('/roles')}
                permission={PERMISSIONS.ROLE_VIEW}
              />
              <NavItem
                icon={Settings}
                title="Settings"
                to="/settings"
                isActive={isActive('/settings')}
                requiredRole="ADMIN"
              />
            </div>
          </div>
        </ScrollArea>
      </SidebarContent>
    </Sidebar>
  );
};

export default AppSidebar;
