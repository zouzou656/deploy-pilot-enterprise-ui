
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import { Helmet } from "react-helmet";

// Contexts
import { ProjectProvider } from "./contexts/ProjectContext";

// Pages
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/NotFound";
import Unauthorized from "./pages/Unauthorized";
import Index from "./pages/Index";
import GitManagement from "./pages/GitManagement";
import SettingsFile from "./pages/SettingsFile";
import JarGeneration from "./pages/JarGeneration";
import JarViewer from "./pages/JarViewer";
import WeblogicDeployment from "./pages/WeblogicDeployment";
import LogsHistory from "./pages/LogsHistory";
import CodeExplorer from "./pages/CodeExplorer";
import Settings from "./pages/Settings";
import ApiExplorer from "./pages/ApiExplorer";
import UsersManagement from "./pages/UsersManagement";
import RolesManagement from "./pages/RolesManagement";
import ProjectManagement from "./pages/ProjectManagement";

// Layout
import AppLayout from "./components/layout/AppLayout";

// Auth
import AuthGuard from "./components/auth/AuthGuard";

// Stores
import useThemeStore from "./stores/themeStore";
import { PERMISSIONS } from "./stores/authStore";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

const App = () => {
  const { theme } = useThemeStore();

  // Set document theme class based on store
  useEffect(() => {
    if (theme.darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [theme.darkMode]);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Helmet>
          <title>OSB CI/CD Platform</title>
        </Helmet>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          {/* Wrap authenticated routes in ProjectProvider */}
          <Routes>
            {/* Public routes (no project context needed) */}
            <Route path="/login" element={<Login />} />
            <Route path="/unauthorized" element={<Unauthorized />} />
            <Route path="/" element={<Index />} />

            {/* Protected routes with Project Context */}
            <Route
              path="/*"
              element={
                <AuthGuard>
                  <ProjectProvider>
                    <Routes>
                      <Route
                        path="dashboard"
                        element={
                          <AppLayout>
                            <Dashboard />
                          </AppLayout>
                        }
                      />

                      <Route
                        path="projects"
                        element={
                          <AppLayout>
                            <ProjectManagement />
                          </AppLayout>
                        }
                      />

                      <Route
                        path="git"
                        element={
                          <AppLayout>
                            <GitManagement />
                          </AppLayout>
                        }
                      />
                      
                      <Route
                        path="api-explorer"
                        element={
                          <AppLayout>
                            <ApiExplorer />
                          </AppLayout>
                        }
                      />

                      <Route
                        path="settings-file"
                        element={
                          <AppLayout>
                            <SettingsFile />
                          </AppLayout>
                        }
                      />

                      <Route
                        path="jar-generation"
                        element={
                          <AppLayout>
                            <JarGeneration />
                          </AppLayout>
                        }
                      />

                      <Route
                        path="jar-viewer/:jarName"
                        element={
                          <AppLayout>
                            <JarViewer />
                          </AppLayout>
                        }
                      />

                      <Route
                        path="weblogic-deployment"
                        element={
                          <AppLayout>
                            <WeblogicDeployment />
                          </AppLayout>
                        }
                      />

                      <Route
                        path="logs"
                        element={
                          <AppLayout>
                            <LogsHistory />
                          </AppLayout>
                        }
                      />

                      <Route
                        path="code-explorer"
                        element={
                          <AppLayout>
                            <CodeExplorer />
                          </AppLayout>
                        }
                      />

                      <Route
                        path="settings"
                        element={
                          <AppLayout requiredRole="ADMIN">
                            <Settings />
                          </AppLayout>
                        }
                      />
                      
                      <Route
                        path="users"
                        element={
                          <AppLayout requiredPermission={PERMISSIONS.USER_VIEW}>
                            <UsersManagement />
                          </AppLayout>
                        }
                      />

                      <Route
                        path="roles"
                        element={
                          <AppLayout requiredPermission={PERMISSIONS.ROLE_VIEW}>
                            <RolesManagement />
                          </AppLayout>
                        }
                      />

                      {/* 404 route if no protected route matches */}
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </ProjectProvider>
                </AuthGuard>
              }
            />

            {/* 404 route for root level */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
