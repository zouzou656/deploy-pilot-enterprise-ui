// src/pages/RolesManagement.tsx
import React, { useState, useEffect } from 'react';
import {
  useQuery,
  useMutation,
  useQueryClient
} from '@tanstack/react-query';
import { roleService } from '@/services/roleService';
import { permissionService } from '@/services/permissionService';
import { useToast } from '@/hooks/use-toast';
import { Plus, Edit, Trash2, Shield } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

import PageHeader from '@/components/ui-custom/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage
} from '@/components/ui/form';
import { Checkbox } from '@/components/ui/checkbox';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction
} from '@/components/ui/alert-dialog';
import { Textarea } from '@/components/ui/textarea';

import useAuthStore, { PERMISSIONS } from '@/stores/authStore';
import { Role, Permission } from '@/types/rbac';

// validation schema
const roleFormSchema = z.object({
  name: z.string().min(2, { message: 'Role name must be at least 2 characters' }),
  description: z.string().optional(),
  permissions: z.array(z.string()).min(1, { message: 'Select at least one permission' })
});
type RoleFormValues = z.infer<typeof roleFormSchema>;

const RolesManagement: React.FC = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { hasPermission } = useAuthStore();

  // dialog state
  const [isCreateOpen, setCreateOpen] = useState(false);
  const [isEditOpen, setEditOpen]     = useState(false);
  const [isDeleteOpen, setDeleteOpen] = useState(false);

  // search state for main list & permission dialogs
  const [search, setSearch]                   = useState('');
  const [createPermSearch, setCreatePermSearch] = useState('');
  const [editPermSearch, setEditPermSearch]     = useState('');

  // selected role for edit/delete
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);

  // 1) fetch all roles
  const { data: roles = [], isLoading: loadingRoles } = useQuery({
    queryKey: ['roles'],
    queryFn: roleService.getRoles,
  });

  // 2) fetch all permissions
  const { data: allPerms = [] } = useQuery({
    queryKey: ['permissions'],
    queryFn: permissionService.getPermissions,
  });

  // 3) fetch selected role's permissions only when editing
  const {
    data: rolePerms = [],
    isLoading: loadingRolePerms
  } = useQuery({
    queryKey: ['rolePerms', selectedRole?.id],
    queryFn: () => permissionService.getPermissionsForRole(selectedRole!.id),
    enabled: Boolean(selectedRole) && isEditOpen,
  });

  // group permissions by group name
  const permissionGroups = allPerms.reduce<Record<string, Permission[]>>((acc, p) => {
    (acc[p.group] ||= []).push(p);
    return acc;
  }, {});

  // mutations
  const createRole = useMutation({
    mutationFn: roleService.createRole,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      setCreateOpen(false);
      toast({ title: 'Success', description: 'Role created' });
    },
    onError: (err: any) => {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    }
  });

  const updateRole = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
        roleService.updateRole(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      setEditOpen(false);
      setSelectedRole(null);
      toast({ title: 'Success', description: 'Role updated' });
    },
    onError: (err: any) => {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    }
  });

  const deleteRole = useMutation({
    mutationFn: (id: string) => roleService.deleteRole(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      setDeleteOpen(false);
      setSelectedRole(null);
      toast({ title: 'Success', description: 'Role deleted' });
    },
    onError: (err: any) => {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    }
  });

  // forms
  const createForm = useForm<RoleFormValues>({
    resolver: zodResolver(roleFormSchema),
    defaultValues: { name: '', description: '', permissions: [] }
  });
  const editForm = useForm<RoleFormValues>({
    resolver: zodResolver(roleFormSchema),
    defaultValues: { name: '', description: '', permissions: [] }
  });

  // handle create
  const onCreate = (values: RoleFormValues) => {
    createRole.mutate(values);
    createForm.reset();
    setCreatePermSearch('');
  };

  // open edit dialog
  const onStartEdit = (role: Role) => {
    setSelectedRole(role);
    setEditOpen(true);
  };

  // when permissions load, populate edit form
  useEffect(() => {
    if (selectedRole && rolePerms) {
      editForm.reset({
        name: selectedRole.name,
        description: selectedRole.description || '',
        permissions: rolePerms.map(p => p.id)
      });
      setEditPermSearch('');
    }
  }, [selectedRole, rolePerms, editForm]);

  // handle edit submit
  const onEdit = (values: RoleFormValues) => {
    console.log(selectedRole);

    if (!selectedRole) return;
    updateRole.mutate({ id: selectedRole.id, data: values });
  };

  // open delete dialog
  const onStartDelete = (role: Role) => {
    setSelectedRole(role);
    setDeleteOpen(true);
  };

  // filter roles list
  const filteredRoles = roles.filter(r =>
      r.name.toLowerCase().includes(search.toLowerCase())
  );

  // helpers for permission counts
  const totalPerms = () => rolePerms.length;
  const countInGroup = (grp: string) =>
      rolePerms.filter(p => permissionGroups[grp]?.some(x => x.id === p.id)).length;

  // permission checks
  const canCreate = hasPermission(PERMISSIONS.ROLE_CREATE);
  const canEdit   = hasPermission(PERMISSIONS.ROLE_UPDATE);
  const canDelete = hasPermission(PERMISSIONS.ROLE_DELETE);

  return (
      <div className="space-y-6">
        <PageHeader title="Role Management" description="Define roles and their permissions" />

        <div className="flex justify-between items-center">
          <Input
              placeholder="Search roles..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="max-w-sm"
          />
          {canCreate && (
              <Button onClick={() => setCreateOpen(true)}>
                <Plus className="mr-2 h-4 w-4" /> Add Role
              </Button>
          )}
        </div>

        {loadingRoles ? (
            <div className="text-center py-8">Loading roles…</div>
        ) : filteredRoles.length === 0 ? (
            <div className="text-center py-8">No roles found</div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredRoles.map(role => (
                  <Card key={role.id}>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Shield className="h-5 w-5" /> {role.name}
                      </CardTitle>
                      <CardDescription>{role.description || 'No description'}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="font-medium mb-2 text-sm">
                        {selectedRole?.id === role.id ? `Permissions (${totalPerms()})` : 'Permissions hidden'}
                      </p>
                    </CardContent>
                    <CardFooter className="flex justify-end gap-2">
                      {canEdit && (
                          <Button variant="outline" size="sm" onClick={() => onStartEdit(role)}>
                            <Edit className="h-4 w-4 mr-1" /> Edit
                          </Button>
                      )}
                      {canDelete && (
                          <Button
                              variant="outline"
                              size="sm"
                              className="text-red-600 hover:text-red-700"
                              onClick={() => onStartDelete(role)}
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
        <Dialog open={isCreateOpen} onOpenChange={() => { setCreateOpen(false); setCreatePermSearch(''); }}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Create Role</DialogTitle>
              <DialogDescription>Define a new role and assign permissions.</DialogDescription>
            </DialogHeader>
            <Form {...createForm}>
              <form onSubmit={createForm.handleSubmit(onCreate)} className="space-y-4 py-2">
                <FormField
                    control={createForm.control}
                    name="name"
                    render={({ field }) => (
                        <FormItem>
                          <FormLabel>Name</FormLabel>
                          <FormControl><Input {...field} /></FormControl>
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
                          <FormControl><Textarea {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={createForm.control}
                    name="permissions"
                    render={({ field }) => {
                      const visibleIds = allPerms
                          .filter(p => p.name.toLowerCase().includes(createPermSearch.toLowerCase()))
                          .map(p => p.id);

                      return (
                          <FormItem>
                            <FormLabel>Permissions</FormLabel>
                            <FormDescription>
                              <div className="flex items-center justify-between">
                                <Input
                                    placeholder="Search permissions..."
                                    value={createPermSearch}
                                    onChange={e => setCreatePermSearch(e.target.value)}
                                    className="max-w-xs"
                                />
                                <div className="space-x-1">
                                  <Button size="sm" variant="ghost" onClick={() => field.onChange(visibleIds)}>
                                    Select all
                                  </Button>
                                  <Button size="sm" variant="ghost" onClick={() => field.onChange([])}>
                                    Clear all
                                  </Button>
                                </div>
                              </div>
                            </FormDescription>
                            <div className="max-h-64 overflow-y-auto border rounded-md p-4 space-y-6">
                              {Object.entries(permissionGroups).map(([grp, perms]) => {
                                const permsToShow = perms.filter(p =>
                                    p.name.toLowerCase().includes(createPermSearch.toLowerCase())
                                );
                                if (!permsToShow.length) return null;
                                return (
                                    <div key={grp}>
                                      <h4 className="font-medium text-sm mb-2">{grp}</h4>
                                      <div className="space-y-2">
                                        {permsToShow.map(p => (
                                            <div key={p.id} className="flex items-start space-x-2">
                                              <Checkbox
                                                  checked={field.value.includes(p.id)}
                                                  onCheckedChange={checked => {
                                                    const next = checked
                                                        ? [...field.value, p.id]
                                                        : field.value.filter(id => id !== p.id);
                                                    field.onChange(next);
                                                  }}
                                              />
                                              <div>
                                                <p className="text-sm">{p.name}</p>
                                                <p className="text-xs text-muted-foreground">{p.description}</p>
                                              </div>
                                            </div>
                                        ))}
                                      </div>
                                    </div>
                                );
                              })}
                            </div>
                            <FormMessage />
                          </FormItem>
                      );
                    }}
                />
                <DialogFooter>
                  <Button variant="outline" onClick={() => { setCreateOpen(false); setCreatePermSearch(''); }}>Cancel</Button>
                  <Button type="submit" disabled={createRole.isPending}>
                    {createRole.isPending ? 'Creating…' : 'Create'}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

        {/* Edit Role Dialog */}
        <Dialog open={isEditOpen} onOpenChange={() => { setEditOpen(false); setSelectedRole(null); setEditPermSearch(''); }}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Edit Role</DialogTitle>
              <DialogDescription>Edit name, description, and permissions.</DialogDescription>
            </DialogHeader>
            <Form {...editForm}>
              <form onSubmit={editForm.handleSubmit(onEdit)} className="space-y-4 py-2">
                <FormField
                    control={editForm.control}
                    name="name"
                    render={({ field }) => (
                        <FormItem>
                          <FormLabel>Name</FormLabel>
                          <FormControl><Input {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={editForm.control}
                    name="description"
                    render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description</FormLabel>
                          <FormControl><Textarea {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={editForm.control}
                    name="permissions"
                    render={({ field }) => {
                      const visibleIds = allPerms
                          .filter(p => p.name.toLowerCase().includes(editPermSearch.toLowerCase()))
                          .map(p => p.id);

                      return (
                          <FormItem>
                            <FormLabel>Permissions</FormLabel>
                            <FormDescription>
                              <div className="flex items-center justify-between">
                                <Input
                                    placeholder="Search permissions..."
                                    value={editPermSearch}
                                    onChange={e => setEditPermSearch(e.target.value)}
                                    className="max-w-xs"
                                />
                                <div className="space-x-1">
                                  <Button size="sm" variant="ghost" onClick={() => field.onChange(visibleIds)}>
                                    Select all
                                  </Button>
                                  <Button size="sm" variant="ghost" onClick={() => field.onChange([])}>
                                    Clear all
                                  </Button>
                                </div>
                              </div>
                            </FormDescription>
                            {loadingRolePerms ? (
                                <div className="text-center py-4">Loading permissions…</div>
                            ) : (
                                <div className="max-h-64 overflow-y-auto border rounded-md p-4 space-y-6">
                                  {Object.entries(permissionGroups).map(([grp, perms]) => {
                                    const permsToShow = perms.filter(p =>
                                        p.name.toLowerCase().includes(editPermSearch.toLowerCase())
                                    );
                                    if (!permsToShow.length) return null;
                                    return (
                                        <div key={grp}>
                                          <h4 className="font-medium text-sm mb-2">{grp}</h4>
                                          <div className="space-y-2">
                                            {permsToShow.map(p => (
                                                <div key={p.id} className="flex items-start space-x-2">
                                                  <Checkbox
                                                      checked={field.value.includes(p.id)}
                                                      onCheckedChange={checked => {
                                                        const next = checked
                                                            ? [...field.value, p.id]
                                                            : field.value.filter(id => id !== p.id);
                                                        field.onChange(next);
                                                      }}
                                                  />
                                                  <div>
                                                    <p className="text-sm">{p.name}</p>
                                                    <p className="text-xs text-muted-foreground">{p.description}</p>
                                                  </div>
                                                </div>
                                            ))}
                                          </div>
                                        </div>
                                    );
                                  })}
                                </div>
                            )}
                            <FormMessage />
                          </FormItem>
                      );
                    }}
                />
                <DialogFooter>
                  <Button variant="outline" onClick={() => { setEditOpen(false); setSelectedRole(null); setEditPermSearch(''); }}>Cancel</Button>
                  <Button type="submit" disabled={updateRole.isPending}>
                    {updateRole.isPending ? 'Saving…' : 'Save Changes'}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation */}
        <AlertDialog open={isDeleteOpen} onOpenChange={() => { setDeleteOpen(false); setSelectedRole(null); }}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirm Delete</AlertDialogTitle>
              <AlertDialogDescription>
                Delete role “<strong>{selectedRole?.name}</strong>”? This cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                  className="bg-red-600 hover:bg-red-700"
                  onClick={() => selectedRole && deleteRole.mutate(selectedRole.id)}
              >
                {deleteRole.isPending ? 'Deleting…' : 'Delete'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
  );
};

export default RolesManagement;
