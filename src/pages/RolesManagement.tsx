
import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash, RefreshCcw, Search } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import AuthGuard from '@/components/auth/AuthGuard';
import PageHeader from '@/components/ui-custom/PageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import useRBACStore from '@/stores/rbacStore';

const RolesManagement = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const { 
    roles, 
    isLoadingRoles, 
    fetchRoles, 
    deleteRole 
  } = useRBACStore();

  useEffect(() => {
    fetchRoles().catch(err => {
      toast({
        title: 'Error loading roles',
        description: err.message,
        variant: 'destructive'
      });
    });
  }, [fetchRoles, toast]);

  const filteredRoles = roles.filter(role =>
    role.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    role.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleRefresh = () => {
    fetchRoles().catch(err => {
      toast({
        title: 'Error refreshing roles',
        description: err.message,
        variant: 'destructive'
      });
    });
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteRole(id);
      toast({
        title: 'Role deleted',
        description: 'Role has been successfully deleted.'
      });
    } catch (err: any) {
      toast({
        title: 'Error deleting role',
        description: err.message,
        variant: 'destructive'
      });
    }
  };

  return (
    <AuthGuard requiredPermission="role:view">
      <div className="space-y-6 p-6">
        <PageHeader 
          title="Role Management" 
          description="Manage user roles and permissions"
        />

        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search roles..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-64"
              />
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isLoadingRoles}
            >
              <RefreshCcw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> 
              Add Role
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Roles ({filteredRoles.length})</CardTitle>
            <CardDescription>Manage system roles and their permissions</CardDescription>
          </CardHeader>
          
          <CardContent>
            <ScrollArea className="h-[500px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="w-[100px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRoles.map((role) => (
                    <TableRow key={role.id}>
                      <TableCell>
                        <div className="font-medium">{role.name}</div>
                      </TableCell>
                      <TableCell>{role.description}</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleDelete(role.id!)}
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  
                  {filteredRoles.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center py-10">
                        {searchTerm ? 'No roles found matching your search.' : 'No roles found.'}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </AuthGuard>
  );
};

export default RolesManagement;
