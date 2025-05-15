
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Command, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem } from '@/components/ui/command';
import { 
  LayoutDashboard, 
  GitBranch, 
  FileText, 
  Package, 
  Server, 
  History, 
  Database, 
  Settings,
  Code,
  LogOut,
  Moon,
  Sun,
  RefreshCcw
} from 'lucide-react';
import useAuthStore from '@/stores/authStore';
import useThemeStore from '@/stores/themeStore';

interface CommandPaletteProps {
  onClose: () => void;
}

const CommandPalette: React.FC<CommandPaletteProps> = ({ onClose }) => {
  const [open, setOpen] = useState(true);
  const navigate = useNavigate();
  const { logout, checkPermission } = useAuthStore();
  const { theme, toggleDarkMode } = useThemeStore();
  const commandRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (commandRef.current && !commandRef.current.contains(event.target as Node)) {
        setOpen(false);
        onClose();
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);
  
  const handleSelect = (value: string) => {
    switch (value) {
      case 'theme:toggle':
        toggleDarkMode();
        break;
      case 'auth:logout':
        logout();
        navigate('/login');
        break;
      default:
        if (value.startsWith('nav:')) {
          const route = value.replace('nav:', '');
          navigate(route);
        }
    }
    
    setOpen(false);
    onClose();
  };

  if (!open) return null;

  return (
    <div className="command-palette animate-fade-in">
      <Command ref={commandRef} className="rounded-lg border shadow-md">
        <CommandInput placeholder="Type a command or search..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          
          <CommandGroup heading="Navigation">
            <CommandItem value="nav:/dashboard" onSelect={handleSelect}>
              <LayoutDashboard className="mr-2 h-4 w-4" />
              <span>Dashboard</span>
            </CommandItem>
            <CommandItem value="nav:/git" onSelect={handleSelect}>
              <GitBranch className="mr-2 h-4 w-4" />
              <span>Git Management</span>
            </CommandItem>
            {checkPermission('DEVELOPER') && (
              <>
                <CommandItem value="nav:/settings-file" onSelect={handleSelect}>
                  <FileText className="mr-2 h-4 w-4" />
                  <span>Settings File</span>
                </CommandItem>
                <CommandItem value="nav:/jar-generation" onSelect={handleSelect}>
                  <Package className="mr-2 h-4 w-4" />
                  <span>JAR Generation</span>
                </CommandItem>
                <CommandItem value="nav:/weblogic-deployment" onSelect={handleSelect}>
                  <Server className="mr-2 h-4 w-4" />
                  <span>WebLogic Deployment</span>
                </CommandItem>
              </>
            )}
            <CommandItem value="nav:/logs" onSelect={handleSelect}>
              <History className="mr-2 h-4 w-4" />
              <span>Logs & History</span>
            </CommandItem>
            {checkPermission('DEVELOPER') && (
              <CommandItem value="nav:/metadata" onSelect={handleSelect}>
                <Database className="mr-2 h-4 w-4" />
                <span>Metadata Management</span>
              </CommandItem>
            )}
            <CommandItem value="nav:/code-explorer" onSelect={handleSelect}>
              <Code className="mr-2 h-4 w-4" />
              <span>Code Explorer</span>
            </CommandItem>
            {checkPermission('ADMIN') && (
              <CommandItem value="nav:/settings" onSelect={handleSelect}>
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </CommandItem>
            )}
          </CommandGroup>
          
          <CommandGroup heading="Actions">
            <CommandItem value="theme:toggle" onSelect={handleSelect}>
              {theme.darkMode ? (
                <>
                  <Sun className="mr-2 h-4 w-4" />
                  <span>Light Mode</span>
                </>
              ) : (
                <>
                  <Moon className="mr-2 h-4 w-4" />
                  <span>Dark Mode</span>
                </>
              )}
            </CommandItem>
            <CommandItem value="auth:logout" onSelect={handleSelect}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log Out</span>
            </CommandItem>
          </CommandGroup>
          
          <CommandGroup heading="Quick Actions">
            <CommandItem value="nav:/jar-generation" onSelect={handleSelect}>
              <Package className="mr-2 h-4 w-4" />
              <span>Generate New JAR</span>
            </CommandItem>
            <CommandItem value="nav:/git" onSelect={handleSelect}>
              <RefreshCcw className="mr-2 h-4 w-4" />
              <span>Pull Latest Changes</span>
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </Command>
    </div>
  );
};

export default CommandPalette;
