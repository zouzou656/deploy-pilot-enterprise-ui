
import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { Outlet } from 'react-router-dom';
import AppLayout from '@/components/layout/AppLayout';
import AuthGuard from '@/components/auth/AuthGuard';
import Login from '@/pages/Login';
import Dashboard from '@/pages/Dashboard';
import ProjectManagement from '@/pages/ProjectManagement';
import JarGeneration from '@/pages/JarGeneration';
import JarStatusPage from '@/pages/JarStatusPage';
import WeblogicDeployment from '@/pages/WeblogicDeployment';
import LogsHistory from '@/pages/LogsHistory';
import CodeExplorer from '@/pages/CodeExplorer';
import GitManagement from '@/pages/GitManagement';
import ApiExplorer from '@/pages/ApiExplorer';
import JarViewer from '@/pages/JarViewer';
import MetadataManagement from '@/pages/MetadataManagement';
import UsersManagement from '@/pages/UsersManagement';
import RolesManagement from '@/pages/RolesManagement';
import NotFound from '@/pages/NotFound';
import Unauthorized from '@/pages/Unauthorized';
import { ProjectProvider } from '@/contexts/ProjectContext';
import useAuthStore from '@/stores/authStore';
import './App.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  const { refreshTokens } = useAuthStore();

  useEffect(() => {
    // Try to refresh tokens on app start
    refreshTokens();
  }, [refreshTokens]);

  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <ProjectProvider>
          <div className="min-h-screen bg-background">
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/unauthorized" element={<Unauthorized />} />
              
              <Route path="/" element={
                <AuthGuard>
                  <AppLayout>
                    <Outlet />
                  </AppLayout>
                </AuthGuard>
              }>
                <Route index element={<Dashboard />} />
                <Route path="projects" element={
                  <AuthGuard requiredPermission="project:view">
                    <ProjectManagement />
                  </AuthGuard>
                } />
                <Route path="jar-generation" element={
                  <AuthGuard requiredPermission="deployment:create">
                    <JarGeneration />
                  </AuthGuard>
                } />
                <Route path="weblogic-deployment" element={
                  <AuthGuard requiredPermission="deployment:execute">
                    <WeblogicDeployment />
                  </AuthGuard>
                } />
                <Route path="logs" element={
                  <AuthGuard requiredPermission="deployment:view">
                    <LogsHistory />
                  </AuthGuard>
                } />
                <Route path="code-explorer" element={
                  <AuthGuard requiredPermission="project:view">
                    <CodeExplorer />
                  </AuthGuard>
                } />
                <Route path="git-management" element={
                  <AuthGuard requiredPermission="project:view">
                    <GitManagement />
                  </AuthGuard>
                } />
                <Route path="api-explorer" element={
                  <AuthGuard requiredPermission="project:view">
                    <ApiExplorer />
                  </AuthGuard>
                } />
                <Route path="jar-viewer" element={
                  <AuthGuard requiredPermission="deployment:view">
                    <JarViewer />
                  </AuthGuard>
                } />
                <Route path="metadata" element={
                  <AuthGuard requiredPermission="project:edit">
                    <MetadataManagement />
                  </AuthGuard>
                } />
                <Route path="users" element={
                  <AuthGuard requiredPermission="user:view">
                    <UsersManagement />
                  </AuthGuard>
                } />
                <Route path="roles" element={
                  <AuthGuard requiredPermission="role:view">
                    <RolesManagement />
                  </AuthGuard>
                } />
              </Route>
              
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
          <Toaster />
        </ProjectProvider>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
