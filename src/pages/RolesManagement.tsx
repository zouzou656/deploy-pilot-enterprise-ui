
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { roleService } from '@/services/roleService';
import { useToast } from '@/hooks/use-toast';
import { Plus, Edit, Trash2, Shield, ShieldCheck } from 'lucide-react';

// Component imports
import PageHeader from '@/components/ui-custom/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Checkbox } from '@/components/ui/checkbox';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Textarea } from '@/components/ui/textarea';
import useAuthStore, { PERMISSIONS } from '@/stores/authStore';
import { Role } from '@/types/rbac';

// Define available permissions
// In a real app, these would come from an API
const AVAILABLE_PERMISSIONS = [
  { id: 'user:view', name: 'View Users', description: 'Can view user list and details', group: 'Users' },
  { id: 'user:create', name: 'Create Users', description: 'Can create new users', group: 'Users' },
  { id: 'user:edit', name: 'Edit Users', description: 'Can edit existing users', group: 'Users' },
  { id: 'user:delete', name: 'Delete Users', description: 'Can delete users', group: 'Users' },
  { id: 'role:view', name: 'View Roles', description: 'Can view role list and details', group: 'Roles' },
  { id: 'role:create', name: 'Create Roles', description: 'Can create new roles', group: 'Roles' },
  { id: 'role:edit', name: 'Edit Roles', description: 'Can edit existing roles', group: 'Roles' },
  { id: 'role:delete', name: 'Delete Roles', description: 'Can delete roles', group: 'Roles' },
  { id: 'git:view', name: 'View Git', description: 'Can view git repositories and branches', group: 'Git' },
  { id: 'git:pull', name: 'Pull Git', description: 'Can pull from git repositories', group: 'Git' },
  { id: 'git:push', name: 'Push Git', description: 'Can push to git repositories', group: 'Git' },
  { id: 'deployment:view', name: 'View Deployments', description: 'Can view deployment history', group: 'Deployment' },
  { id: 'deployment:create', name: 'Create Deployments', description: 'Can create new deployments', group: 'Deployment' },
  { id: 'deployment:cancel', name: 'Cancel Deployments', description: 'Can cancel ongoing deployments', group: 'Deployment' },
  { id: 'settings:view', name: 'View Settings', description: 'Can view system settings', group: 'Settings' },
  { id: 'settings:edit', name: 'Edit Settings', description: 'Can edit system settings', group: 'Settings' },
];

// Group permissions by their group property
const PERMISSION_GROUPS = AVAILABLE_PERMISSIONS.reduce((groups, permission) => {
  const group = permission.group;
  if (!groups[group]) {
    groups[group] = [];
  }
  groups[group].push(permission);
  return groups;
}, {} as Record<string, typeof AVAILABLE_PERMISSIONS>);

const roleFormSchema = z.object({
  name: z.string().min(2, { message: 'Role name must be at least 2 characters' }),
  description: z.string().optional(),
  permissions: z.array(z.string()),
});

type RoleFormValues = z.infer<typeof roleFormSchema>;

const RolesManagement = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { hasPermission } = useAuthStore();
  
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Fetch roles
  const { data: roles = [], isLoading: isLoadingRoles } = useQuery({
    queryKey: ['roles'],
    queryFn: roleService.getRoles,
  });
  
  // Create role mutation
  const createRoleMutation = useMutation({
    mutationFn: roleService.createRole,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      setIsCreateDialogOpen(false);
      toast({
        title: 'Success',
        description: 'Role created successfully',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: `Failed to create role: ${error.message}`,
        variant: 'destructive',
      });
    },
  });
  
  // Update role mutation
  const updateRoleMutation = useMutation({
    mutationFn: ({ id, data }: { id: string, data: any }) => 
      roleService.updateRole(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      setIsUpdateDialogOpen(false);
      setSelectedRole(null);
      toast({
        title: 'Success',
        description: 'Role updated successfully',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: `Failed to update role: ${error.message}`,
        variant: 'destructive',
      });
    },
  });
  
  // Delete role mutation
  const deleteRoleMutation = useMutation({
    mutationFn: (id: string) => roleService.deleteRole(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      setIsDeleteDialogOpen(false);
      setSelectedRole(null);
      toast({
        title: 'Success',
        description: 'Role deleted successfully',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: `Failed to delete role: ${error.message}`,
        variant: 'destructive',
      });
    },
  });
  
  // Create role form
  const createForm = useForm<RoleFormValues>({
    resolver: zodResolver(roleFormSchema),
    defaultValues: {
      name: '',
      description: '',
      permissions: [],
    },
  });
  
  // Update role form
  const updateForm = useForm<RoleFormValues>({
    resolver: zodResolver(roleFormSchema),
    defaultValues: {
      name: '',
      description: '',
      permissions: [],
    },
  });
  
  // Handle create role form submission
  const onCreateSubmit = (values: RoleFormValues) => {
    createRoleMutation.mutate(values);
  };
  
  // Handle update role form submission
  const onUpdateSubmit = (values: RoleFormValues) => {
    if (selectedRole) {
      updateRoleMutation.mutate({
        id: selectedRole.id,
        data: values,
      });
    }
  };
  
  // Handle opening the update dialog and populating form
  const handleEditRole = (role: Role) => {
    setSelectedRole(role);
    updateForm.reset({
      name: role.name,
      description: role.description || '',
      permissions: role.permissions || [],
    });
    setIsUpdateDialogOpen(true);
  };
  
  // Handle opening the delete dialog
  const handleDeleteClick = (role: Role) => {
    setSelectedRole(role);
    setIsDeleteDialogOpen(true);
  };
  
  // Filter roles by search query
  const filteredRoles = roles.filter(role => 
    role.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  // Count permissions by group for a role
  const countPermissionsByGroup = (role: Role, group: string) => {
    if (!role.permissions) return 0;
    return PERMISSION_GROUPS[group]?.filter(p => 
      role.permissions.includes(p.id)
    ).length || 0;
  };
  
  // Get total permissions count for a role
  const totalPermissions = (role: Role) => {
    return role.permissions?.length || 0;
  };
  
  const canCreate = hasPermission(PERMISSIONS.ROLE_CREATE);
  const canEdit = hasPermission(PERMISSIONS.ROLE_EDIT);
  const canDelete = hasPermission(PERMISSIONS.ROLE_DELETE);

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Role Management" 
        description="Create and manage system roles and permissions"
      />
      
      <div className="flex justify-between items-center">
        <Input
          placeholder="Search roles..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-sm"
        />
        
        {canCreate && (
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> Add Role
          </Button>
        )}
      </div>
      
      {isLoadingRoles ? (
        <div className="text-center py-8">Loading...</div>
      ) : filteredRoles.length === 0 ? (
        <div className="text-center py-8">No roles found</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRoles.map((role) => (
            <Card key={role.id}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  {role.name}
                </CardTitle>
                <CardDescription>
                  {role.description || 'No description provided'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-sm">
                  <div className="font-medium mb-2">Permissions ({totalPermissions(role)})</div>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.keys(PERMISSION_GROUPS).map(group => (
                      <div key={group} className="flex items-center justify-between">
                        <span>{group}</span>
                        <span className="text-muted-foreground">
                          {countPermissionsByGroup(role, group)}/{PERMISSION_GROUPS[group].length}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end gap-2">
                {canEdit && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEditRole(role)}
                  >
                    <Edit className="h-4 w-4 mr-1" /> Edit
                  </Button>
                )}
                {canDelete && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-red-600 hover:text-red-700"
                    onClick={() => handleDeleteClick(role)}
                  >
                    <Trash2 className="h-4 w-4 mr-1" /> Delete
                  </Button>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
      
      {/* Create Role Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Create New Role</DialogTitle>
            <DialogDescription>
              Add a new role with specific permissions.
            </DialogDescription>
          </DialogHeader>
          
          <Form {...createForm}>
            <form onSubmit={createForm.handleSubmit(onCreateSubmit)} className="space-y-4 py-2">
              <FormField
                control={createForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Project Manager" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={createForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Brief description of this role's responsibilities"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={createForm.control}
                name="permissions"
                render={() => (
                  <FormItem>
                    <FormLabel>Permissions</FormLabel>
                    <FormDescription>
                      Select the permissions for this role
                    </FormDescription>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 border rounded-md p-4 mt-2">
                      {Object.entries(PERMISSION_GROUPS).map(([group, permissions]) => (
                        <div key={group} className="space-y-2">
                          <h4 className="font-medium text-sm border-b pb-1">{group}</h4>
                          <div className="space-y-1">
                            {permissions.map((permission) => (
                              <FormField
                                key={permission.id}
                                control={createForm.control}
                                name="permissions"
                                render={({ field }) => (
                                  <FormItem className="flex items-start space-x-2 space-y-0">
                                    <FormControl>
                                      <Checkbox
                                        checked={field.value?.includes(permission.id)}
                                        onCheckedChange={(checked) => {
                                          const updatedPermissions = checked
                                            ? [...field.value, permission.id]
                                            : field.value.filter((p) => p !== permission.id);
                                          field.onChange(updatedPermissions);
                                        }}
                                      />
                                    </FormControl>
                                    <div className="space-y-0.5 leading-none">
                                      <FormLabel className="text-sm font-medium cursor-pointer">
                                        {permission.name}
                                      </FormLabel>
                                      <FormDescription className="text-xs">
                                        {permission.description}
                                      </FormDescription>
                                    </div>
                                  </FormItem>
                                )}
                              />
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button 
                  variant="outline" 
                  type="button" 
                  onClick={() => setIsCreateDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={createRoleMutation.isPending}
                >
                  {createRoleMutation.isPending ? 'Creating...' : 'Create Role'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
      {/* Update Role Dialog */}
      <Dialog open={isUpdateDialogOpen} onOpenChange={setIsUpdateDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Role</DialogTitle>
            <DialogDescription>
              Update role details and permissions.
            </DialogDescription>
          </DialogHeader>
          
          <Form {...updateForm}>
            <form onSubmit={updateForm.handleSubmit(onUpdateSubmit)} className="space-y-4 py-2">
              <FormField
                control={updateForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={updateForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={updateForm.control}
                name="permissions"
                render={() => (
                  <FormItem>
                    <FormLabel>Permissions</FormLabel>
                    <FormDescription>
                      Select the permissions for this role
                    </FormDescription>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 border rounded-md p-4 mt-2">
                      {Object.entries(PERMISSION_GROUPS).map(([group, permissions]) => (
                        <div key={group} className="space-y-2">
                          <h4 className="font-medium text-sm border-b pb-1">{group}</h4>
                          <div className="space-y-1">
                            {permissions.map((permission) => (
                              <FormField
                                key={permission.id}
                                control={updateForm.control}
                                name="permissions"
                                render={({ field }) => (
                                  <FormItem className="flex items-start space-x-2 space-y-0">
                                    <FormControl>
                                      <Checkbox
                                        checked={field.value?.includes(permission.id)}
                                        onCheckedChange={(checked) => {
                                          const updatedPermissions = checked
                                            ? [...field.value, permission.id]
                                            : field.value.filter((p) => p !== permission.id);
                                          field.onChange(updatedPermissions);
                                        }}
                                      />
                                    </FormControl>
                                    <div className="space-y-0.5 leading-none">
                                      <FormLabel className="text-sm font-medium cursor-pointer">
                                        {permission.name}
                                      </FormLabel>
                                      <FormDescription className="text-xs">
                                        {permission.description}
                                      </FormDescription>
                                    </div>
                                  </FormItem>
                                )}
                              />
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button 
                  variant="outline" 
                  type="button" 
                  onClick={() => setIsUpdateDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={updateRoleMutation.isPending}
                >
                  {updateRoleMutation.isPending ? 'Updating...' : 'Update Role'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
      {/* Delete Role Confirmation */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the role "{selectedRole?.name}"? Users with this role may lose access to certain features.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => selectedRole && deleteRoleMutation.mutate(selectedRole.id)}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleteRoleMutation.isPending ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default RolesManagement;
