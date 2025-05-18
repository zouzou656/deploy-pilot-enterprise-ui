
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ThemeConfig } from '../types';

interface ThemeStore {
  theme: ThemeConfig;
  setTheme: (theme: Partial<ThemeConfig>) => void;
  toggleDarkMode: () => void;
  setDarkMode: (darkMode: boolean) => void;
  setCompanyName: (name: string) => void;
}

const defaultTheme: ThemeConfig = {
  primaryColor: 'hsl(221.2 83% 53.3%)',
  accentColor: 'hsl(142.1 70.6% 45.3%)',
  logoUrl: '/assets/logo.svg', // Default logo
  darkMode: false,
  companyName: 'OSB DevOps',
  borderRadius: '0.5rem'
};

const useThemeStore = create<ThemeStore>()(
  persist(
    (set) => ({
      theme: defaultTheme,
      
      setTheme: (newTheme) => {
        set((state) => ({
          theme: { ...state.theme, ...newTheme }
        }));
      },
      
      toggleDarkMode: () => {
        set((state) => {
          const newDarkMode = !state.theme.darkMode;
          
          // Toggle dark mode class on document
          if (newDarkMode) {
            document.documentElement.classList.add('dark');
          } else {
            document.documentElement.classList.remove('dark');
          }
          
          return {
            theme: {
              ...state.theme,
              darkMode: newDarkMode
            }
          };
        });
      },

      setDarkMode: (darkMode) => {
        set((state) => {
          // Set dark mode class on document
          if (darkMode) {
            document.documentElement.classList.add('dark');
          } else {
            document.documentElement.classList.remove('dark');
          }
          
          return {
            theme: {
              ...state.theme,
              darkMode
            }
          };
        });
      },

      setCompanyName: (companyName) => {
        set((state) => ({
          theme: {
            ...state.theme,
            companyName
          }
        }));
      }
    }),
    {
      name: 'osb-ci-theme-storage',
    }
  )
);

// Initialize theme based on stored preference
const initializeTheme = () => {
  const { theme } = useThemeStore.getState();
  if (theme.darkMode) {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
};

// Run once on initial load
if (typeof window !== 'undefined') {
  initializeTheme();
}

export default useThemeStore;
