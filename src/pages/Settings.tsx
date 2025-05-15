
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import PageHeader from '@/components/ui-custom/PageHeader';
import useThemeStore from '@/stores/themeStore';

const Settings = () => {
  const { theme, toggleDarkMode, updateCompanyName } = useThemeStore();

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Settings" 
        description="Configure application settings"
      />
      
      <Tabs defaultValue="general">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="weblogic">WebLogic</TabsTrigger>
          <TabsTrigger value="git">Git</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
        </TabsList>
        
        <TabsContent value="general" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Application Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <label htmlFor="company-name" className="text-sm font-medium">Company Name</label>
                <Input 
                  id="company-name" 
                  value={theme.companyName || 'OSB DevOps'} 
                  onChange={(e) => updateCompanyName(e.target.value)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Dark Mode</h4>
                  <p className="text-sm text-muted-foreground">Toggle dark mode theme</p>
                </div>
                <Switch 
                  checked={theme.darkMode} 
                  onCheckedChange={toggleDarkMode} 
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Email Notifications</h4>
                  <p className="text-sm text-muted-foreground">Receive email notifications</p>
                </div>
                <Switch defaultChecked />
              </div>
              
              <Button>Save Settings</Button>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="weblogic" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>WebLogic Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <label htmlFor="admin-url" className="text-sm font-medium">Admin Server URL</label>
                <Input 
                  id="admin-url" 
                  placeholder="https://weblogic.example.com:7001" 
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="admin-username" className="text-sm font-medium">Admin Username</label>
                  <Input 
                    id="admin-username" 
                    placeholder="weblogic" 
                  />
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="admin-password" className="text-sm font-medium">Admin Password</label>
                  <Input 
                    id="admin-password" 
                    type="password" 
                    placeholder="••••••••" 
                  />
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Save Credentials</h4>
                  <p className="text-sm text-muted-foreground">Store credentials securely</p>
                </div>
                <Switch defaultChecked />
              </div>
              
              <Button>Save Configuration</Button>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="git" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Git Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <label htmlFor="git-repo" className="text-sm font-medium">Git Repository URL</label>
                <Input 
                  id="git-repo" 
                  placeholder="https://github.com/organization/repository.git" 
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="git-username" className="text-sm font-medium">Git Username</label>
                  <Input 
                    id="git-username" 
                    placeholder="username" 
                  />
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="git-token" className="text-sm font-medium">Access Token</label>
                  <Input 
                    id="git-token" 
                    type="password" 
                    placeholder="••••••••" 
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label htmlFor="default-branch" className="text-sm font-medium">Default Branch</label>
                <Input 
                  id="default-branch" 
                  placeholder="main" 
                />
              </div>
              
              <Button>Save Git Settings</Button>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="users" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { name: 'John Admin', email: 'admin@example.com', role: 'ADMIN' },
                  { name: 'Jane Developer', email: 'developer@example.com', role: 'DEVELOPER' },
                  { name: 'Bob Viewer', email: 'viewer@example.com', role: 'VIEWER' },
                ].map((user, index) => (
                  <div key={index} className="flex justify-between items-center p-3 border rounded">
                    <div>
                      <p className="font-medium">{user.name}</p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="rounded-md bg-secondary px-2 py-1 text-xs text-secondary-foreground">
                        {user.role}
                      </div>
                      <Button variant="outline" size="sm">Edit</Button>
                    </div>
                  </div>
                ))}
              </div>
              
              <Button className="mt-4">
                Add User
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;
