// src/pages/UsersManagement.tsx
import React, {useEffect, useState} from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { userService } from "@/services/userService";
import { roleService } from "@/services/roleService";
import { useToast } from "@/hooks/use-toast";
import {Plus, Edit, Trash2, UserCog} from "lucide-react";
import { format } from "date-fns";

import PageHeader from "@/components/ui-custom/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
    Form,
    FormControl, FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import useAuthStore, { PERMISSIONS } from "@/stores/authStore";
import { UserListItem } from "@/types/rbac";
import {permissionService} from "@/services/permissionService.ts";
import {Textarea} from "@/components/ui/textarea.tsx";
import {Checkbox} from "@/components/ui/checkbox.tsx";

const userFormSchema = z.object({
  email: z.string().email(),
  firstName: z.string().min(2).optional(),
  lastName: z.string().min(2).optional(),
  password: z.string().min(6).optional(),
  roleIds: z.array(z.string()).min(1),
  status: z.enum(["active", "inactive", "pending"]),
});
const userPermFormSchema = z.object({
    permissions: z.array(z.string()).min(1, { message: 'Select at least one permission' })
});
type UserFormValues = z.infer<typeof userFormSchema>;
type UserPermFormValues = z.infer<typeof userPermFormSchema>;
const UsersManagement: React.FC = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { hasPermission } = useAuthStore();

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserListItem | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isEditPermOpen, setEditPermOpen]     = useState(false);
  const [editPermSearch, setEditPermSearch]     = useState('');


    // Queries
  const { data: users = [], isLoading: isLoadingUsers } = useQuery({
    queryKey: ["users"],
    queryFn: userService.getUsers,
  });

    const { data: allPerms = [] } = useQuery({
        queryKey: ['permissions'],
        queryFn: permissionService.getPermissions,
    });
  const { data: roles = [] } = useQuery({
    queryKey: ["roles"],
    queryFn: roleService.getRoles,
  });
    const {
        data: userPerms = [],
        isLoading: loadingUserPerms
    } = useQuery({
        queryKey: ['userPerms', selectedUser?.id],
        queryFn: () => permissionService.getPermissionsForUser(selectedUser!.id),
        enabled: Boolean(selectedUser) && isEditPermOpen,
    });
    // group permissions by group name
    const permissionGroups = allPerms.reduce<Record<string, Permission[]>>((acc, p) => {
        (acc[p.group] ||= []).push(p);
        return acc;
    }, {});
  // Mutations (using v5 signature: pass an options object)
  const createUserMutation = useMutation({
    mutationFn: userService.createUser,
    onSuccess: () => {
      queryClient.invalidateQueries(["users"]);
      setIsCreateDialogOpen(false);
      toast({ title: "Success", description: "User created successfully" });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: `Failed to create user: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const updateUserMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      userService.updateUser(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(["users"]);
      setIsUpdateDialogOpen(false);
      setSelectedUser(null);
      toast({ title: "Success", description: "User updated successfully" });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: `Failed to update user: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: (id: string) => userService.deleteUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries(["users"]);
      setIsDeleteDialogOpen(false);
      setSelectedUser(null);
      toast({ title: "Success", description: "User deleted successfully" });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: `Failed to delete user: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Forms
  const createForm = useForm<UserFormValues>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      email: "",
      firstName: "",
      lastName: "",
      password: "",
      roleIds: [],
      status: "active",
    },
  });
  const updateForm = useForm<UserFormValues>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      email: "",
      firstName: "",
      lastName: "",
      password: "",
      roleIds: [],
      status: "active",
    },
  });
    const updatePermForm = useForm<UserPermFormValues>({
        resolver: zodResolver(userPermFormSchema),
    });
  // Handlers
  const onCreateSubmit = (values: UserFormValues) => {
    createUserMutation.mutate({
      email: values.email,
      password: values.password || Math.random().toString(36).slice(-8),
      roleIds: values.roleIds,
      firstName: values.firstName,
      lastName: values.lastName,
      status: values.status,
    });
  };

  const onUpdateSubmit = (values: UserFormValues) => {
    if (!selectedUser) return;
    const data: any = {
      email: values.email,
      firstName: values.firstName,
      lastName: values.lastName,
      roleIds: values.roleIds,
      status: values.status,
    };
    if (values.password) data.password = values.password;
    updateUserMutation.mutate({ id: selectedUser.id, data });
  };

  const handleEditUser = (user: UserListItem) => {
    setSelectedUser(user);
    updateForm.reset({
      email: user.email,
      firstName: user.firstName ?? "",
      lastName: user.lastName ?? "",
      roleIds: Array.isArray(user.roleIds)
        ? user.roleIds
        : user.role
        ? [user.role]
        : [],
      status: user.status,
    });
    setIsUpdateDialogOpen(true);
  };
    const handleEditUserPermissions = (user: UserListItem) => {
        setSelectedUser(user);
        updatePermForm.reset({
            permissions: userPerms.map(p => p.id)
        });
        setEditPermOpen(true);
    };

  const handleDeleteClick = (user: UserListItem) => {
    setSelectedUser(user);
    setIsDeleteDialogOpen(true);
  };
    const onPermEdit = (values: UserFormValues) => {

        if (!selectedUser) return;
        updateUserPerm.mutate({ id: selectedUser.id, data: values });
    };

    const updateUserPerm = useMutation({
        mutationFn: async ({ id, data }: { id: string; data: any }) => {
            await permissionService.UpdateUserPermissions(id, data.permissions);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['roles'] });
            setEditPermOpen(false);
            setSelectedUser(null);
            toast({ title: 'Success', description: 'Role and permissions updated' });
        },
        onError: (err: any) => {
            toast({ title: 'Error', description: err.message, variant: 'destructive' });
        }
    });
  // Filter & utilities
  const filteredUsers = users.filter((u) =>
    u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const getRoleName = (rid: string) =>
    roles.find((r) => r.id === rid)?.name ?? "Unknown";
  const formatDate = (d: string | null) =>
    !d
      ? "Never"
      : (() => {
          try {
            return format(new Date(d), "MMM dd, yyyy HH:mm");
          } catch {
            return "Invalid";
          }
        })();
    const editPermForm = useForm<UserPermFormValues>({
        resolver: zodResolver(userPermFormSchema),
        defaultValues: {permissions: [] }
    });


    useEffect(() => {
        if (selectedUser && userPerms) {
            editPermForm.reset({
                permissions: userPerms.map(p => p.id)
            });
            setEditPermSearch('');
        }
    }, [selectedUser, userPerms, editPermForm]);
  const canCreate = hasPermission(PERMISSIONS.USER_CREATE);
  const canEdit = hasPermission(PERMISSIONS.USER_UPDATE);
  const canDelete = hasPermission(PERMISSIONS.USER_DELETE);

  return (
    <div className="space-y-6">
      <PageHeader
        title="User Management"
        description="Create and manage users"
      />

      <div className="flex justify-between items-center">
        <Input
          placeholder="Search users..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-sm"
        />
        {canCreate && (
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> Add User
          </Button>
        )}
      </div>

      <div className="rounded-md border">
        <Table>
          <TableCaption>List of users</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Email</TableHead>
              <TableHead>Roles</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Last Login</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoadingUsers ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center">
                  Loading...
                </TableCell>
              </TableRow>
            ) : filteredUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center">
                  No users found
                </TableCell>
              </TableRow>
            ) : (
              filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {(Array.isArray(user.roleIds)
                        ? user.roleIds
                        : user.role
                        ? [user.role]
                        : []
                      ).map((rid) => (
                        <Badge key={rid} variant="outline">
                          {getRoleName(rid)}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        user.status === "active"
                          ? "default"
                          : user.status === "inactive"
                          ? "secondary"
                          : "outline"
                      }
                    >
                      {user.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{formatDate(user.lastLogin)}</TableCell>
                  <TableCell className="text-right space-x-2">
                    {canEdit && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditUser(user)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    ) }
                    {canDelete && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteClick(user)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                      {canEdit &&(<Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditUserPermissions(user)} aria-label="Edit user permissions"
                      >
                          <UserCog className="h-4 w-4" />
                      </Button>)}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Create Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Create New User</DialogTitle>
            <DialogDescription>
              Add a user; they will receive credentials by email.
            </DialogDescription>
          </DialogHeader>
          <Form {...createForm}>
            <form
              onSubmit={createForm.handleSubmit(onCreateSubmit)}
              className="space-y-4 py-2"
            >
              <FormField
                control={createForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="user@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={createForm.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>First Name</FormLabel>
                      <FormControl>
                        <Input placeholder="John" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={createForm.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Last Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Doe" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={createForm.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password (Optional)</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="Leave blank for random password"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={createForm.control}
                name="roleIds"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Roles</FormLabel>
                    <div className="grid grid-cols-2 gap-2 border p-2 rounded-md max-h-36 overflow-y-auto">
                      {roles.map((role) => (
                        <div
                          key={role.id}
                          className="flex items-center space-x-2"
                        >
                          <input
                            type="checkbox"
                            id={`role-${role.id}`}
                            className="w-4 h-4 rounded border-gray-300"
                            value={role.id}
                            checked={field.value.includes(role.id)}
                            onChange={(e) => {
                              const checked = e.target.checked;
                              if (checked) {
                                field.onChange([...field.value, role.id]);
                              } else {
                                field.onChange(
                                  field.value.filter((id) => id !== role.id)
                                );
                              }
                            }}
                          />
                          <label
                            htmlFor={`role-${role.id}`}
                            className="text-sm"
                          >
                            {role.name}
                          </label>
                        </div>
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={createForm.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                      </SelectContent>
                    </Select>
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
                <Button type="submit" disabled={createUserMutation.isPending}>
                  {createUserMutation.isPending ? "Creating..." : "Create User"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Update Dialog */}
      <Dialog open={isUpdateDialogOpen} onOpenChange={setIsUpdateDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>Update details and roles.</DialogDescription>
          </DialogHeader>
          <Form {...updateForm}>
            <form
              onSubmit={updateForm.handleSubmit(onUpdateSubmit)}
              className="space-y-4 py-2"
            >
              <FormField
                control={updateForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={updateForm.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>First Name</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={updateForm.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Last Name</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={updateForm.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>New Password (Optional)</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="Leave blank to keep current password"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={updateForm.control}
                name="roleIds"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Roles</FormLabel>
                    <div className="grid grid-cols-2 gap-2 border p-2 rounded-md max-h-36 overflow-y-auto">
                      {roles.map((role) => (
                        <div
                          key={role.id}
                          className="flex items-center space-x-2"
                        >
                          <input
                            type="checkbox"
                            id={`edit-role-${role.id}`}
                            className="w-4 h-4 rounded border-gray-300"
                            value={role.id}
                            checked={field.value.includes(role.id)}
                            onChange={(e) => {
                              const checked = e.target.checked;
                              if (checked) {
                                field.onChange([...field.value, role.id]);
                              } else {
                                field.onChange(
                                  field.value.filter((id) => id !== role.id)
                                );
                              }
                            }}
                          />
                          <label
                            htmlFor={`edit-role-${role.id}`}
                            className="text-sm"
                          >
                            {role.name}
                          </label>
                        </div>
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={updateForm.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                      </SelectContent>
                    </Select>
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
                <Button type="submit" disabled={updateUserMutation.isPending}>
                  {updateUserMutation.isPending ? "Updating..." : "Update User"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
            <AlertDialogDescription>
              Delete user <strong>{selectedUser?.email}</strong>? This cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={() =>
                selectedUser && deleteUserMutation.mutate(selectedUser.id)
              }
            >
              {deleteUserMutation.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
        {/* Edit Role Dialog */}
        <Dialog open={isEditPermOpen} onOpenChange={() => { setEditPermOpen(false); setSelectedUser(null); }}>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle>Edit User Permissions</DialogTitle>
                    <DialogDescription>Edit the user's effective permissions, permissions inherited from the role assigned and extra permissions</DialogDescription>
                </DialogHeader>
                <Form {...editPermForm}>
                    <form onSubmit={editPermForm.handleSubmit(onPermEdit)} className="space-y-4 py-2">
                        <FormField
                            control={editPermForm.control}
                            name="permissions"
                            render={({ field }) => {
                                const visibleIds = allPerms
                                    .filter(p => p.name.toLowerCase().includes(editPermSearch.toLowerCase()))
                                    .map(p => p.id);

                                return (
                                    <FormItem>
                                        <FormLabel>Permissions</FormLabel>
                                        <div className="flex items-center justify-between mb-2">
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
                                        <FormDescription>
                                            Search for permissions or click “Select all” / “Clear all”
                                        </FormDescription>
                                        {loadingUserPerms ? (
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
                            <Button variant="outline" onClick={() => { setEditPermOpen(false); setSelectedUser(null); setEditPermSearch(''); }}>Cancel</Button>
                            <Button type="submit" disabled={updateUserPerm.isPending}>
                                {updateUserPerm.isPending ? 'Saving…' : 'Save Changes'}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>

    </div>
  );
};

export default UsersManagement;
