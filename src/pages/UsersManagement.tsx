// src/pages/UsersManagement.tsx
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userService } from '@/services/userService';
import { roleService } from '@/services/roleService';
import { useToast } from '@/hooks/use-toast';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { format } from 'date-fns';

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
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
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
import { Badge } from '@/components/ui/badge';

import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import useAuthStore, { PERMISSIONS } from '@/stores/authStore';
import { UserListItem } from '@/types/rbac';

const userFormSchema = z.object({
    email: z.string().email(),
    firstName: z.string().min(2).optional(),
    lastName: z.string().min(2).optional(),
    password: z.string().min(6).optional(),
    roleIds: z.array(z.string()).min(1),
    status: z.enum(['active', 'inactive', 'pending']),
});
type UserFormValues = z.infer<typeof userFormSchema>;

const UsersManagement: React.FC = () => {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const { hasPermission } = useAuthStore();

    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<UserListItem | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    // Queries
    const { data: users = [], isLoading: isLoadingUsers } = useQuery({
        queryKey: ['users'],
        queryFn: userService.getUsers,
    });
    const { data: roles = [] } = useQuery({
        queryKey: ['roles'],
        queryFn: roleService.getRoles,
    });

    // Mutations (using v5 signature: pass an options object)
    const createUserMutation = useMutation({
        mutationFn: userService.createUser,
        onSuccess: () => {
            queryClient.invalidateQueries(['users']);
            setIsCreateDialogOpen(false);
            toast({ title: 'Success', description: 'User created successfully' });
        },
        onError: (error: any) => {
            toast({
                title: 'Error',
                description: `Failed to create user: ${error.message}`,
                variant: 'destructive',
            });
        },
    });

    const updateUserMutation = useMutation({
        mutationFn: ({ id, data }: { id: string; data: any }) =>
            userService.updateUser(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries(['users']);
            setIsUpdateDialogOpen(false);
            setSelectedUser(null);
            toast({ title: 'Success', description: 'User updated successfully' });
        },
        onError: (error: any) => {
            toast({
                title: 'Error',
                description: `Failed to update user: ${error.message}`,
                variant: 'destructive',
            });
        },
    });

    const deleteUserMutation = useMutation({
        mutationFn: (id: string) => userService.deleteUser(id),
        onSuccess: () => {
            queryClient.invalidateQueries(['users']);
            setIsDeleteDialogOpen(false);
            setSelectedUser(null);
            toast({ title: 'Success', description: 'User deleted successfully' });
        },
        onError: (error: any) => {
            toast({
                title: 'Error',
                description: `Failed to delete user: ${error.message}`,
                variant: 'destructive',
            });
        },
    });

    // Forms
    const createForm = useForm<UserFormValues>({
        resolver: zodResolver(userFormSchema),
        defaultValues: {
            email: '',
            firstName: '',
            lastName: '',
            password: '',
            roleIds: [],
            status: 'active',
        },
    });
    const updateForm = useForm<UserFormValues>({
        resolver: zodResolver(userFormSchema),
        defaultValues: {
            email: '',
            firstName: '',
            lastName: '',
            password: '',
            roleIds: [],
            status: 'active',
        },
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
            firstName: user.firstName ?? '',
            lastName: user.lastName ?? '',
            roleIds: Array.isArray(user.roleIds)
                ? user.roleIds
                : user.role
                    ? [user.role]
                    : [],
            status: user.status,
        });
        setIsUpdateDialogOpen(true);
    };

    const handleDeleteClick = (user: UserListItem) => {
        setSelectedUser(user);
        setIsDeleteDialogOpen(true);
    };

    // Filter & utilities
    const filteredUsers = users.filter((u) =>
        u.email.toLowerCase().includes(searchQuery.toLowerCase())
    );
    const getRoleName = (rid: string) => roles.find((r) => r.id === rid)?.name ?? 'Unknown';
    const formatDate = (d: string | null) =>
        !d ? 'Never' : (() => { try { return format(new Date(d), 'MMM dd, yyyy HH:mm'); } catch { return 'Invalid'; } })();

    const canCreate = hasPermission(PERMISSIONS.USER_CREATE);
    const canEdit   = hasPermission(PERMISSIONS.USER_UPDATE);
    const canDelete = hasPermission(PERMISSIONS.USER_DELETE);

    return (
        <div className="space-y-6">
            <PageHeader title="User Management" description="Create and manage users" />

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
                                <TableCell colSpan={5} className="text-center">Loading...</TableCell>
                            </TableRow>
                        ) : filteredUsers.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center">No users found</TableCell>
                            </TableRow>
                        ) : (
                            filteredUsers.map((user) => (
                                <TableRow key={user.id}>
                                    <TableCell>{user.email}</TableCell>
                                    <TableCell>
                                        <div className="flex flex-wrap gap-1">
                                            {(
                                                Array.isArray(user.roleIds)
                                                    ? user.roleIds
                                                    : user.role
                                                        ? [user.role]
                                                        : []
                                            ).map((rid) => (
                                                <Badge key={rid} variant="outline">{getRoleName(rid)}</Badge>
                                            ))}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={ user.status === 'active' ? 'default' : user.status === 'inactive' ? 'secondary' : 'outline' }>
                                            {user.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>{formatDate(user.lastLogin)}</TableCell>
                                    <TableCell className="text-right space-x-2">
                                        {canEdit && (
                                            <Button variant="ghost" size="sm" onClick={() => handleEditUser(user)}>
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                        )}
                                        {canDelete && (
                                            <Button variant="ghost" size="sm" onClick={() => handleDeleteClick(user)}>
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        )}
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
                        <DialogDescription>Add a user; they will receive credentials by email.</DialogDescription>
                    </DialogHeader>
                    <Form {...createForm}>
                        <form onSubmit={createForm.handleSubmit(onCreateSubmit)} className="space-y-4 py-2">
                            {/* ... same form fields as before ... */}
                            <DialogFooter>
                                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>Cancel</Button>
                                <Button type="submit" disabled={createUserMutation.isPending}>
                                    {createUserMutation.isPending ? 'Creating...' : 'Create User'}
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
                        <form onSubmit={updateForm.handleSubmit(onUpdateSubmit)} className="space-y-4 py-2">
                            {/* ... same form fields as before ... */}
                            <DialogFooter>
                                <Button variant="outline" onClick={() => setIsUpdateDialogOpen(false)}>Cancel</Button>
                                <Button type="submit" disabled={updateUserMutation.isPending}>
                                    {updateUserMutation.isPending ? 'Updating...' : 'Update User'}
                                </Button>
                            </DialogFooter>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation */}
            <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
                        <AlertDialogDescription>
                            Delete user <strong>{selectedUser?.email}</strong>? This cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            className="bg-red-600 hover:bg-red-700"
                            onClick={() => selectedUser && deleteUserMutation.mutate(selectedUser.id)}
                        >
                            {deleteUserMutation.isPending ? 'Deleting...' : 'Delete'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
};

export default UsersManagement;
