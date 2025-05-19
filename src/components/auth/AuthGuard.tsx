
import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import useAuthStore from '@/stores/authStore';
import { Role } from '@/types';

interface AuthGuardProps {
  children: React.ReactNode;
  requiredRole?: Role | string;
  requiredPermission?: string;
  requiredPermissions?: string[]; // Multiple permissions support (AND logic)
  requireAnyPermission?: string[]; // Multiple permissions support (OR logic)
}

const AuthGuard: React.FC<AuthGuardProps> = ({ 
  children, 
  requiredRole = 'VIEWER',
  requiredPermission,
  requiredPermissions = [],
  requireAnyPermission = [],
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

  // Check permissions logic - most specific to least specific
  
  // 1. Check for ALL required permissions (stricter)
  if (requiredPermissions.length > 0) {
    const hasAllPermissions = requiredPermissions.every(perm => hasPermission(perm));
    if (!hasAllPermissions) {
      console.log(`Access denied: User is missing some required permissions: ${requiredPermissions.join(', ')}`);
      return <Navigate to="/unauthorized" replace />;
    }
  }
  
  // 2. Check for ANY required permission (more lenient)
  if (requireAnyPermission.length > 0) {
    const hasAnyPermission = requireAnyPermission.some(perm => hasPermission(perm));
    if (!hasAnyPermission) {
      console.log(`Access denied: User doesn't have any of the required permissions: ${requireAnyPermission.join(', ')}`);
      return <Navigate to="/unauthorized" replace />;
    }
  }

  // 3. Check for a single required permission
  if (requiredPermission && !hasPermission(requiredPermission)) {
    console.log(`Access denied: Missing specific permission: ${requiredPermission}`);
    return <Navigate to="/unauthorized" replace />;
  }
  
  // 4. Check role-based permission
  if (!checkPermission(requiredRole)) {
    console.log(`Access denied: User role ${user?.role} doesn't meet required role ${requiredRole}`);
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
};

export default AuthGuard;
