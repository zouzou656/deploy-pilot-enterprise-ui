
import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import useAuthStore from '@/stores/authStore';
import { Role } from '@/types';

interface AuthGuardProps {
  children: React.ReactNode;
  requiredRole?: Role;
  requiredPermission?: string;
}

const AuthGuard: React.FC<AuthGuardProps> = ({ 
  children, 
  requiredRole = 'VIEWER',
  requiredPermission,
}) => {
  const { isAuthenticated, user, loading, refreshUserToken, checkPermission, hasPermission } = useAuthStore();
  const location = useLocation();

  useEffect(() => {
    // Attempt to refresh token if needed
    if (!loading && !isAuthenticated) {
      refreshUserToken().catch(err => {
        console.error('Failed to refresh token:', err);
      });
    }
  }, [refreshUserToken, isAuthenticated, loading]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-pulse text-center">
          <div className="h-12 w-12 mx-auto rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
          <p className="mt-4 text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Redirect to login and remember where they were trying to go
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // First check specific permission if provided
  if (requiredPermission && !hasPermission(requiredPermission)) {
    return <Navigate to="/unauthorized" replace />;
  }
  
  // Then check role-based permission
  if (!checkPermission(requiredRole)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
};

export default AuthGuard;
