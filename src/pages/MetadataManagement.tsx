
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Database, ChevronRight, Plus } from 'lucide-react';
import PageHeader from '@/components/ui-custom/PageHeader';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const MetadataManagement = () => {
  return (
    <div className="space-y-6">
      <PageHeader 
        title="Metadata Management" 
        description="Manage database objects and metadata configurations"
      />

      <Tabs defaultValue="objects">
        <TabsList>
          <TabsTrigger value="objects">Database Objects</TabsTrigger>
          <TabsTrigger value="scripts">SQL Scripts</TabsTrigger>
          <TabsTrigger value="migrations">Migrations</TabsTrigger>
        </TabsList>
        
        <TabsContent value="objects" className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  Tables
                </CardTitle>
                <CardDescription>Database tables</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {['CUSTOMER', 'ORDER', 'PRODUCT', 'PAYMENT'].map((table) => (
                    <div key={table} className="flex justify-between items-center p-2 hover:bg-muted rounded cursor-pointer">
                      <span>{table}</span>
                      <ChevronRight className="h-4 w-4" />
                    </div>
                  ))}
                  <Button variant="ghost" size="sm" className="w-full mt-2">
                    <Plus className="h-4 w-4 mr-1" /> Add Table
                  </Button>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  Views
                </CardTitle>
                <CardDescription>Database views</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {['CUSTOMER_ORDER_VIEW', 'PRODUCT_INVENTORY_VIEW'].map((view) => (
                    <div key={view} className="flex justify-between items-center p-2 hover:bg-muted rounded cursor-pointer">
                      <span>{view}</span>
                      <ChevronRight className="h-4 w-4" />
                    </div>
                  ))}
                  <Button variant="ghost" size="sm" className="w-full mt-2">
                    <Plus className="h-4 w-4 mr-1" /> Add View
                  </Button>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  Stored Procedures
                </CardTitle>
                <CardDescription>Database procedures</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {['GET_CUSTOMER_ORDERS', 'PROCESS_PAYMENT', 'UPDATE_INVENTORY'].map((proc) => (
                    <div key={proc} className="flex justify-between items-center p-2 hover:bg-muted rounded cursor-pointer">
                      <span>{proc}</span>
                      <ChevronRight className="h-4 w-4" />
                    </div>
                  ))}
                  <Button variant="ghost" size="sm" className="w-full mt-2">
                    <Plus className="h-4 w-4 mr-1" /> Add Procedure
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="scripts" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>SQL Scripts</CardTitle>
              <CardDescription>Manage database scripts</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {['create_tables.sql', 'seed_data.sql', 'create_views.sql'].map((script) => (
                  <div key={script} className="flex justify-between items-center p-3 border rounded hover:bg-muted/40">
                    <span>{script}</span>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">Edit</Button>
                      <Button variant="outline" size="sm">Run</Button>
                    </div>
                  </div>
                ))}
              </div>
              <Button className="mt-4">
                <Plus className="mr-2 h-4 w-4" />
                Add SQL Script
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="migrations" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Database Migrations</CardTitle>
              <CardDescription>Track and manage schema changes</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { name: 'V1.0.0__Initial_Schema.sql', date: 'Apr 10, 2023', status: 'Applied' },
                  { name: 'V1.1.0__Add_Payment_Table.sql', date: 'Apr 25, 2023', status: 'Applied' },
                  { name: 'V1.2.0__Update_Customer_Fields.sql', date: 'May 15, 2023', status: 'Pending' }
                ].map((migration) => (
                  <div key={migration.name} className="flex justify-between items-center p-3 border rounded hover:bg-muted/40">
                    <div>
                      <div className="font-medium">{migration.name}</div>
                      <div className="text-xs text-muted-foreground">{migration.date}</div>
                    </div>
                    <span className={`text-xs py-1 px-2 rounded-full ${
                      migration.status === 'Applied' 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100' 
                        : 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100'
                    }`}>
                      {migration.status}
                    </span>
                  </div>
                ))}
              </div>
              <Button className="mt-4">
                <Plus className="mr-2 h-4 w-4" />
                Create Migration
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MetadataManagement;
