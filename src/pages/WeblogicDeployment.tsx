
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Server, Check, AlertTriangle } from 'lucide-react';
import PageHeader from '@/components/ui-custom/PageHeader';

const WeblogicDeployment = () => {
  return (
    <div className="space-y-6">
      <PageHeader 
        title="WebLogic Deployment" 
        description="Deploy applications to WebLogic servers"
      />
      
      <div className="grid grid-cols-1 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>New Deployment</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="jar" className="text-sm font-medium">JAR File</label>
                  <select id="jar" className="w-full p-2 border rounded">
                    <option>integration-1.0.0.jar</option>
                    <option>integration-0.9.0.jar</option>
                    <option>integration-0.8.5.jar</option>
                  </select>
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="server" className="text-sm font-medium">Target Server</label>
                  <select id="server" className="w-full p-2 border rounded">
                    <option>Development</option>
                    <option>Testing</option>
                    <option>Production</option>
                  </select>
                </div>
              </div>
              
              <div className="space-y-2">
                <label htmlFor="deployment-name" className="text-sm font-medium">Deployment Name</label>
                <input 
                  id="deployment-name" 
                  type="text" 
                  value="OSB-Integration" 
                  className="w-full p-2 border rounded" 
                />
              </div>
              
              <Button className="w-full">
                <Server className="mr-2 h-4 w-4" />
                Deploy to WebLogic
              </Button>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Active Deployments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 border rounded">
                <div className="flex items-center gap-3">
                  <Check className="h-5 w-5 text-green-500" />
                  <div>
                    <p className="font-medium">OSB-Integration</p>
                    <p className="text-xs text-muted-foreground">Development Server</p>
                  </div>
                </div>
                <span className="text-xs bg-green-100 text-green-800 py-1 px-2 rounded-full font-medium dark:bg-green-900 dark:text-green-100">Running</span>
              </div>
              
              <div className="flex justify-between items-center p-3 border rounded">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="h-5 w-5 text-amber-500" />
                  <div>
                    <p className="font-medium">OSB-Integration</p>
                    <p className="text-xs text-muted-foreground">Testing Server</p>
                  </div>
                </div>
                <span className="text-xs bg-amber-100 text-amber-800 py-1 px-2 rounded-full font-medium dark:bg-amber-900 dark:text-amber-100">Warning</span>
              </div>
              
              <div className="flex justify-between items-center p-3 border rounded">
                <div className="flex items-center gap-3">
                  <Check className="h-5 w-5 text-green-500" />
                  <div>
                    <p className="font-medium">Customer-API</p>
                    <p className="text-xs text-muted-foreground">Development Server</p>
                  </div>
                </div>
                <span className="text-xs bg-green-100 text-green-800 py-1 px-2 rounded-full font-medium dark:bg-green-900 dark:text-green-100">Running</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default WeblogicDeployment;
