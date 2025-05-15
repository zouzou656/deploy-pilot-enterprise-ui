
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import useAuthStore from '@/stores/authStore';

const LoginForm = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const { login, error, loading } = useAuthStore();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username || !password) {
      toast({
        title: 'Validation Error',
        description: 'Username and password are required',
        variant: 'destructive',
      });
      return;
    }
    
    try {
      await login(username, password);
    } catch (error) {
      // Error is handled in the store
      console.error('Login error:', error);
    }
  };

  const handleDemoLogin = async (role: string) => {
    let demoUsername, demoPassword;
    
    switch (role) {
      case 'admin':
        demoUsername = 'admin';
        demoPassword = 'admin123';
        break;
      case 'developer':
        demoUsername = 'developer';
        demoPassword = 'dev123';
        break;
      case 'viewer':
        demoUsername = 'viewer';
        demoPassword = 'view123';
        break;
      default:
        return;
    }
    
    setUsername(demoUsername);
    setPassword(demoPassword);
    await login(demoUsername, demoPassword);
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold">Sign In</CardTitle>
        <CardDescription>
          Enter your credentials to access the OSB CI/CD Platform
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              type="text"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={loading}
            />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password</Label>
              <a href="#" className="text-sm text-primary hover:underline">
                Forgot password?
              </a>
            </div>
            <Input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
            />
          </div>
          <div className="flex items-center space-x-2">
            <Input
              id="remember"
              type="checkbox"
              className="w-4 h-4"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
            />
            <Label htmlFor="remember" className="text-sm font-normal">Remember me</Label>
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex flex-col gap-2">
        <div className="text-sm text-center mb-2">
          Quick access demo accounts:
        </div>
        <div className="flex flex-wrap gap-2 justify-center">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => handleDemoLogin('admin')}
            disabled={loading}
          >
            Admin
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => handleDemoLogin('developer')}
            disabled={loading}
          >
            Developer
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => handleDemoLogin('viewer')}
            disabled={loading}
          >
            Viewer
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default LoginForm;
