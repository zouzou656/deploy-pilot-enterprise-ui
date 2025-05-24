
import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { SidebarProvider } from '@/components/ui/sidebar';
import AppSidebar from './AppSidebar';
import AppHeader from './AppHeader';
import CommandPalette from '@/components/ui-custom/CommandPalette';
import useThemeStore from '@/stores/themeStore';
import useAuthStore from '@/stores/authStore';
import { useProject } from '@/contexts/ProjectContext';

interface AppLayoutProps {
  children: React.ReactNode;
  requiredRole?: 'ADMIN' | 'DEVELOPER' | 'VIEWER';
  requiredPermission?: string;
}

const AppLayout: React.FC<AppLayoutProps> = ({
                                               children,
                                               requiredRole,
                                               requiredPermission
                                             }) => {
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const location = useLocation();
  const { theme } = useThemeStore();
  const { user, checkPermission, hasPermission } = useAuthStore();
  const { refreshProjects } = useProject();

  // Refresh projects when layout mounts or user changes
  useEffect(() => {
    if (user) {
      refreshProjects();
    }
  }, [user, refreshProjects]);

  // Keyboard shortcuts for command palette
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setShowCommandPalette(prev => !prev);
      }
      if (e.key === 'Escape' && showCommandPalette) {
        setShowCommandPalette(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showCommandPalette]);

  // Close command palette on route change
  useEffect(() => {
    setShowCommandPalette(false);
  }, [location.pathname]);

  // Role-based access control
  if (requiredRole && !checkPermission(requiredRole)) {
    return (
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
            <p className="text-muted-foreground mb-4">
              You need the {requiredRole} role to access this page.
            </p>
          </div>
        </div>
    );
  }

  // Permission-based access control
  if (requiredPermission && !hasPermission(requiredPermission)) {
    return (
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
            <p className="text-muted-foreground mb-4">
              You need the {requiredPermission} permission to access this page.
            </p>
          </div>
        </div>
    );
  }

  return (
      <SidebarProvider>
        <div className="min-h-screen flex flex-col w-full" data-theme={theme}>
          <AppHeader onCommandPalette={() => setShowCommandPalette(true)} />

          <div className="flex flex-1 w-full overflow-hidden">
            <AppSidebar />

            <main className="flex-1 overflow-auto">
              <div className="container py-6">{children}</div>
            </main>
          </div>

          {showCommandPalette && (
              <CommandPalette onClose={() => setShowCommandPalette(false)} />
          )}
        </div>
      </SidebarProvider>
  );
};

export default AppLayout;
