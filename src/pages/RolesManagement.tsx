import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { roleService } from '@/services/roleService';
import { permissionService } from '@/services/permissionService';
import { useToast } from '@/hooks/use-toast';
import { Plus, Search, ChevronDown, ChevronRight, Settings, Shield } from 'lucide-react';

import PageHeader from '@/components/ui-custom/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import useAuthStore, { PERMISSIONS } from '@/stores/authStore';
import { Role, Permission } from '@/types/rbac';

const RolesManagement: React.FC = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { hasPermission } = useAuthStore();

  const [activeTab, setActiveTab] = useState<'roles' | 'permissions'>('roles');
  const [roleSearch, setRoleSearch] = useState('');
  const [permissionSearch, setPermissionSearch] = useState('');
  const [rolesOpen, setRolesOpen] = useState(true);
  const [permissionsOpen, setPermissionsOpen] = useState(false);

  // Fetch data
  const { data: roles = [], isLoading: loadingRoles } = useQuery({
    queryKey: ['roles'],
    queryFn: roleService.getRoles,
  });

  const { data: allPerms = [] } = useQuery({
    queryKey: ['permissions'],
    queryFn: permissionService.getPermissions,
  });

  // Filter data
  const filteredRoles = roles.filter(r =>
    r.name.toLowerCase().includes(roleSearch.toLowerCase()) ||
    (r.description || '').toLowerCase().includes(roleSearch.toLowerCase())
  );

  const filteredPermissions = allPerms.filter(p =>
    p.name.toLowerCase().includes(permissionSearch.toLowerCase()) ||
    p.description.toLowerCase().includes(permissionSearch.toLowerCase()) ||
    p.group.toLowerCase().includes(permissionSearch.toLowerCase())
  );

  // Group permissions by group name
  const permissionGroups = filteredPermissions.reduce<Record<string, Permission[]>>((acc, p) => {
    (acc[p.group] ||= []).push(p);
    return acc;
  }, {});

  const canCreate = hasPermission(PERMISSIONS.ROLE_CREATE);
  const canEdit = hasPermission(PERMISSIONS.ROLE_UPDATE);

  return (
    <div className="space-y-4">
      <PageHeader 
        title="Role Management" 
        description="Define roles and manage permissions"
      />

      <Tabs value={activeTab} onValueChange={(value: string) => setActiveTab(value as any)} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="roles">Roles</TabsTrigger>
          <TabsTrigger value="permissions">Permissions</TabsTrigger>
        </TabsList>

        <TabsContent value="roles" className="space-y-4">
          <Collapsible open={rolesOpen} onOpenChange={setRolesOpen}>
            <Card>
              <CollapsibleTrigger asChild>
                <CardHeader className="cursor-pointer hover:bg-muted/50">
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Shield className="h-5 w-5" />
                      Roles ({filteredRoles.length})
                    </div>
                    {rolesOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                  </CardTitle>
                </CardHeader>
              </CollapsibleTrigger>
              
              <CollapsibleContent>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center gap-4">
                    <div className="relative flex-1 max-w-sm">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search roles..."
                        value={roleSearch}
                        onChange={(e) => setRoleSearch(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    {canCreate && (
                      <Button size="sm">
                        <Plus className="mr-2 h-4 w-4" /> Add Role
                      </Button>
                    )}
                  </div>

                  {loadingRoles ? (
                    <div className="text-center py-8 text-muted-foreground">Loading roles...</div>
                  ) : filteredRoles.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">No roles found</div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {filteredRoles.map(role => (
                        <Card key={role.id} className="hover:shadow-md transition-shadow">
                          <CardHeader className="pb-3">
                            <CardTitle className="flex items-center gap-2 text-base">
                              <Shield className="h-4 w-4 text-primary" />
                              {role.name}
                            </CardTitle>
                            {role.description && (
                              <p className="text-sm text-muted-foreground">{role.description}</p>
                            )}
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-3">
                              <div className="text-sm text-muted-foreground">
                                Click to view permissions
                              </div>
                              {canEdit && (
                                <div className="flex gap-2">
                                  <Button variant="outline" size="sm" className="flex-1">
                                    Edit
                                  </Button>
                                  <Button variant="outline" size="sm" className="text-destructive hover:text-destructive">
                                    Delete
                                  </Button>
                                </div>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </CardContent>
              </CollapsibleContent>
            </Card>
          </Collapsible>
        </TabsContent>

        <TabsContent value="permissions" className="space-y-4">
          <Collapsible open={permissionsOpen} onOpenChange={setPermissionsOpen}>
            <Card>
              <CollapsibleTrigger asChild>
                <CardHeader className="cursor-pointer hover:bg-muted/50">
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Settings className="h-5 w-5" />
                      Permissions ({filteredPermissions.length})
                    </div>
                    {permissionsOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                  </CardTitle>
                </CardHeader>
              </CollapsibleTrigger>
              
              <CollapsibleContent>
                <CardContent className="space-y-4">
                  <div className="relative max-w-sm">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search permissions..."
                      value={permissionSearch}
                      onChange={(e) => setPermissionSearch(e.target.value)}
                      className="pl-10"
                    />
                  </div>

                  {Object.entries(permissionGroups).length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">No permissions found</div>
                  ) : (
                    <div className="space-y-6">
                      {Object.entries(permissionGroups).map(([group, perms]) => (
                        <Card key={group} className="border-l-4 border-l-primary/20">
                          <CardHeader className="pb-3">
                            <CardTitle className="text-lg">{group}</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              {perms.map(permission => (
                                <div key={permission.id} className="flex flex-col p-3 bg-muted/30 rounded-lg">
                                  <h4 className="font-medium text-sm">{permission.name}</h4>
                                  <p className="text-xs text-muted-foreground mt-1">{permission.description}</p>
                                </div>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </CardContent>
              </CollapsibleContent>
            </Card>
          </Collapsible>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default RolesManagement;
