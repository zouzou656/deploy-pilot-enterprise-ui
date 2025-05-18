
import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import AppSidebar from './AppSidebar';
import AppHeader from './AppHeader';
import CommandPalette from '../ui-custom/CommandPalette';
import useThemeStore from '@/stores/themeStore';
import useAuthStore from '@/stores/authStore';

interface AppLayoutProps {
  children: React.ReactNode;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const location = useLocation();
  const { theme } = useThemeStore();
  const { user } = useAuthStore();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check for Cmd+K or Ctrl+K
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setShowCommandPalette(prev => !prev);
      }
      
      // Escape to close command palette
      if (e.key === 'Escape' && showCommandPalette) {
        setShowCommandPalette(false);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showCommandPalette]);

  useEffect(() => {
    // Close command palette when route changes
    setShowCommandPalette(false);
  }, [location.pathname]);

  return (
    <SidebarProvider>
      <div className="min-h-screen flex flex-col">
        <AppHeader onCommandPalette={() => setShowCommandPalette(true)} />
        
        <div className="flex flex-1 w-full overflow-hidden">
          <AppSidebar />
          
          <main className="flex-1 overflow-auto">
            <div className="container py-6">
              {children}
            </div>
          </main>
        </div>

        {showCommandPalette && (
          <CommandPalette 
            onClose={() => setShowCommandPalette(false)} 
          />
        )}
      </div>
    </SidebarProvider>
  );
};

export default AppLayout;
