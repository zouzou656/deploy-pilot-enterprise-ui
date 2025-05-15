
import React from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ShieldAlert } from 'lucide-react';

const Unauthorized = () => {
  return (
    <>
      <Helmet>
        <title>Access Denied | OSB CI/CD Platform</title>
      </Helmet>
      
      <div className="min-h-screen flex flex-col items-center justify-center bg-muted/30 p-4">
        <div className="text-center max-w-md">
          <div className="mx-auto bg-destructive/10 p-3 rounded-full w-16 h-16 flex items-center justify-center mb-6">
            <ShieldAlert className="h-8 w-8 text-destructive" />
          </div>
          
          <h1 className="text-3xl font-bold mb-2">Access Denied</h1>
          <p className="text-muted-foreground mb-8">
            You don't have permission to access this page. Please contact your administrator
            if you believe this is an error.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild variant="default">
              <Link to="/dashboard">Return to Dashboard</Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/login">Switch Account</Link>
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Unauthorized;
