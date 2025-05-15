
import React, { useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Navigate, useLocation } from 'react-router-dom';
import LoginForm from '@/components/auth/LoginForm';
import useAuthStore from '@/stores/authStore';
import useThemeStore from '@/stores/themeStore';

const Login = () => {
  const { isAuthenticated } = useAuthStore();
  const { theme } = useThemeStore();
  const location = useLocation();
  
  // Extract the "from" location from state, if available
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || "/dashboard";

  // If already authenticated, redirect to dashboard
  if (isAuthenticated) {
    return <Navigate to={from} replace />;
  }

  return (
    <>
      <Helmet>
        <title>Login | OSB CI/CD Platform</title>
      </Helmet>
      
      <div className="min-h-screen flex flex-col items-center justify-center bg-muted/30 p-4">
        <div className="text-center mb-8">
          <img 
            src="/assets/logo.svg" 
            alt={`${theme.companyName || 'OSB DevOps'} Logo`} 
            className="h-16 w-auto mx-auto mb-4"
            onError={(e) => {
              // If logo fails to load, show a fallback
              const target = e.target as HTMLImageElement;
              target.onerror = null;
              target.style.display = 'none';
            }}
          />
          <h1 className="text-3xl font-bold">{theme.companyName || 'OSB DevOps'}</h1>
          <p className="text-muted-foreground">Enterprise CI/CD Platform for Oracle Service Bus</p>
        </div>
        
        <LoginForm />
        
        <div className="mt-8 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} {theme.companyName || 'Your Company'}. All rights reserved.</p>
          <p className="mt-1">Version 1.0.0</p>
        </div>
      </div>
    </>
  );
};

export default Login;
