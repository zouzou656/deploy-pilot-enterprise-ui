
import React from 'react';
import { Link } from 'react-router-dom';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { CommandIcon, LogOut, Settings, User } from 'lucide-react';
import useAuthStore from '@/stores/authStore';
import useThemeStore from '@/stores/themeStore';
import ProjectSelector from '../project/ProjectSelector';

interface AppHeaderProps {
  onCommandPalette: () => void;
}

const AppHeader: React.FC<AppHeaderProps> = ({ onCommandPalette }) => {
  const { user, logout } = useAuthStore();
  const { theme, toggleDarkMode } = useThemeStore();

  // Safely calculate user initials, handling undefined values
  const userInitials = user ? (
    `${user.firstName?.charAt(0) || ''}${user.lastName?.charAt(0) || ''}`.toUpperCase() ||
    (user.username ? user.username.substring(0, 2).toUpperCase() : 'UN')
  ) : 'UN';

  return (
      <header className="sticky top-0 z-30 bg-background border-b flex h-16 items-center px-4 lg:px-6">
        <SidebarTrigger className="mr-4" />

        <div className="flex items-center gap-2">
          <img
              src="/assets/logo.svg"
              alt="Logo"
              className="h-8 w-auto"
              onError={(e) => {
                // If logo fails to load, show a fallback
                (e.target as HTMLImageElement).style.display = 'none';
              }}
          />
          <span className="font-bold text-xl">{theme.companyName || 'OSB DevOps'}</span>
        </div>

        {/* Project Selector */}
        <div className="ml-8">
          <ProjectSelector />
        </div>

        <div className="ml-auto flex items-center gap-4">
          <Button variant="outline" size="sm" className="hidden md:flex items-center gap-2" onClick={onCommandPalette}>
            <CommandIcon className="h-4 w-4" />
            <span>Command</span>
            <kbd className="pointer-events-none hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 text-sm font-medium text-muted-foreground opacity-100 sm:flex">
              <span className="text-xs">⌘</span>K
            </kbd>
          </Button>

          <Button variant="ghost" size="icon" onClick={toggleDarkMode} className="theme-toggle">
            {theme.darkMode ? (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" />
                </svg>
            ) : (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z" />
                </svg>
            )}
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <Avatar>
                  {user?.avatarUrl ? (
                      <AvatarImage src={user.avatarUrl} alt={user.username || 'User'} />
                  ) : null}
                  <AvatarFallback>{userInitials}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{user?.firstName} {user?.lastName}</p>
                  <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
                  {user?.role && (
                    <div className="mt-1 rounded-md bg-secondary px-1.5 py-0.5 text-xs text-secondary-foreground">
                      {user.role}
                    </div>
                  )}
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link to="/profile" className="cursor-pointer flex w-full">
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/settings" className="cursor-pointer flex w-full">
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={logout} className="cursor-pointer">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>
  );
};

export default AppHeader;
