
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Package, ChevronRight } from 'lucide-react';
import PageHeader from '@/components/ui-custom/PageHeader';

const JarGeneration = () => {
  return (
    <div className="space-y-6">
      <PageHeader 
        title="JAR Generation" 
        description="Generate JAR files for deployment"
      />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Generate New JAR</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="space-y-2">
                <label htmlFor="project" className="text-sm font-medium">Project</label>
                <select id="project" className="w-full p-2 border rounded">
                  <option>OSB Main Integration</option>
                  <option>Customer API</option>
                  <option>Payment Service</option>
                </select>
              </div>
              
              <div className="space-y-2">
                <label htmlFor="branch" className="text-sm font-medium">Branch</label>
                <select id="branch" className="w-full p-2 border rounded">
                  <option>main</option>
                  <option>develop</option>
                  <option>feature/payment-gateway</option>
                </select>
              </div>
              
              <div className="space-y-2">
                <label htmlFor="version" className="text-sm font-medium">Version</label>
                <input 
                  id="version" 
                  type="text" 
                  value="1.0.0" 
                  className="w-full p-2 border rounded" 
                />
              </div>
              
              <Button className="w-full">
                <Package className="mr-2 h-4 w-4" />
                Generate JAR
              </Button>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Recent JARs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex justify-between items-center p-3 border rounded hover:bg-muted/40 cursor-pointer">
                  <div>
                    <p className="font-medium">integration-{i}.0.0.jar</p>
                    <p className="text-xs text-muted-foreground">Generated on May 1{i}, 2023</p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default JarGeneration;
