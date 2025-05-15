
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import { Helmet } from "react-helmet";

// Pages
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/NotFound";
import Unauthorized from "./pages/Unauthorized";
import Index from "./pages/Index";
import GitManagement from "./pages/GitManagement";
import SettingsFile from "./pages/SettingsFile";
import JarGeneration from "./pages/JarGeneration";
import WeblogicDeployment from "./pages/WeblogicDeployment";
import LogsHistory from "./pages/LogsHistory";
import MetadataManagement from "./pages/MetadataManagement";
import CodeExplorer from "./pages/CodeExplorer";
import Settings from "./pages/Settings";

// Layout
import AppLayout from "./components/layout/AppLayout";

// Auth
import AuthGuard from "./components/auth/AuthGuard";

// Stores
import useThemeStore from "./stores/themeStore";

const queryClient = new QueryClient();

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
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/unauthorized" element={<Unauthorized />} />
            <Route path="/" element={<Index />} />

            {/* Protected routes */}
            <Route
              path="/dashboard"
              element={
                <AuthGuard>
                  <AppLayout>
                    <Dashboard />
                  </AppLayout>
                </AuthGuard>
              }
            />
            <Route
              path="/git"
              element={
                <AuthGuard>
                  <AppLayout>
                    <GitManagement />
                  </AppLayout>
                </AuthGuard>
              }
            />
            <Route
              path="/settings-file"
              element={
                <AuthGuard>
                  <AppLayout>
                    <SettingsFile />
                  </AppLayout>
                </AuthGuard>
              }
            />
            <Route
              path="/jar-generation"
              element={
                <AuthGuard>
                  <AppLayout>
                    <JarGeneration />
                  </AppLayout>
                </AuthGuard>
              }
            />
            <Route
              path="/weblogic-deployment"
              element={
                <AuthGuard>
                  <AppLayout>
                    <WeblogicDeployment />
                  </AppLayout>
                </AuthGuard>
              }
            />
            <Route
              path="/logs"
              element={
                <AuthGuard>
                  <AppLayout>
                    <LogsHistory />
                  </AppLayout>
                </AuthGuard>
              }
            />
            <Route
              path="/metadata"
              element={
                <AuthGuard>
                  <AppLayout>
                    <MetadataManagement />
                  </AppLayout>
                </AuthGuard>
              }
            />
            <Route
              path="/code-explorer"
              element={
                <AuthGuard>
                  <AppLayout>
                    <CodeExplorer />
                  </AppLayout>
                </AuthGuard>
              }
            />
            <Route
              path="/settings"
              element={
                <AuthGuard requiredRole="ADMIN">
                  <AppLayout>
                    <Settings />
                  </AppLayout>
                </AuthGuard>
              }
            />

            {/* 404 route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
