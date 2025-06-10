
import React, { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { userService } from "@/services/userService";
import { roleService } from "@/services/roleService";
import { permissionService } from "@/services/permissionService";
import { useToast } from "@/hooks/use-toast";
import { Plus, Search, ChevronDown, ChevronRight, users as UsersIcon, UserCog } from "lucide-react";

import PageHeader from "@/components/ui-custom/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

import { UserListItem, Permission } from "@/types/rbac";
import useAuthStore, { PERMISSIONS } from "@/stores/authStore";

const UsersManagement: React.FC = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { hasPermission } = useAuthStore();

  const [userSearch, setUserSearch] = useState("");
  const [usersOpen, setUsersOpen] = useState(true);

  // Queries
  const { data: users = [], isLoading: isLoadingUsers } = useQuery({
    queryKey: ["users"],
    queryFn: userService.getUsers,
  });

  const { data: roles = [] } = useQuery({
    queryKey: ["roles"],
    queryFn: roleService.getRoles,
  });

  // Filter users
  const filteredUsers = users.filter((u) =>
    u.email.toLowerCase().includes(userSearch.toLowerCase()) ||
    (u.firstName || '').toLowerCase().includes(userSearch.toLowerCase()) ||
    (u.lastName || '').toLowerCase().includes(userSearch.toLowerCase())
  );

  const getRoleName = (rid: string) =>
    roles.find((r) => r.id === rid)?.name ?? "Unknown";

  const canCreate = hasPermission(PERMISSIONS.USER_CREATE);
  const canEdit = hasPermission(PERMISSIONS.USER_UPDATE);

  const getInitials = (user: UserListItem) => {
    const first = user.firstName?.charAt(0) || '';
    const last = user.lastName?.charAt(0) || '';
    return first + last || user.email.charAt(0).toUpperCase();
  };

  return (
    <div className="space-y-4">
      <PageHeader
        title="User Management"
        description="Manage users, roles, and permissions"
      />

      <Collapsible open={usersOpen} onOpenChange={setUsersOpen}>
        <Card>
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-muted/50">
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <UsersIcon className="h-5 w-5" />
                  Users ({filteredUsers.length})
                </div>
                {usersOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              </CardTitle>
            </CardHeader>
          </CollapsibleTrigger>
          
          <CollapsibleContent>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center gap-4">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search users..."
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    className="pl-10"
                  />
                </div>
                {canCreate && (
                  <Button size="sm">
                    <Plus className="mr-2 h-4 w-4" /> Add User
                  </Button>
                )}
              </div>

              {isLoadingUsers ? (
                <div className="text-center py-8 text-muted-foreground">Loading users...</div>
              ) : filteredUsers.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">No users found</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredUsers.map((user) => (
                    <Card key={user.id} className="hover:shadow-md transition-shadow">
                      <CardHeader className="pb-3">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarFallback className="bg-primary/10 text-primary font-medium">
                              {getInitials(user)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <CardTitle className="text-base truncate">{user.email}</CardTitle>
                            {(user.firstName || user.lastName) && (
                              <p className="text-sm text-muted-foreground truncate">
                                {user.firstName} {user.lastName}
                              </p>
                            )}
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div>
                          <Badge
                            variant={
                              user.status === "active"
                                ? "default"
                                : user.status === "inactive"
                                ? "secondary"
                                : "outline"
                            }
                            className="text-xs"
                          >
                            {user.status}
                          </Badge>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="text-sm">
                            <span className="font-medium">Roles:</span>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {user.roleIds.map((rid) => (
                                <Badge key={rid} variant="outline" className="text-xs">
                                  {getRoleName(rid)}
                                </Badge>
                              ))}
                            </div>
                          </div>
                          
                          {user.lastLogin && (
                            <div className="text-xs text-muted-foreground">
                              Last login: {new Date(user.lastLogin).toLocaleDateString()}
                            </div>
                          )}
                        </div>

                        {canEdit && (
                          <div className="flex gap-2 pt-2">
                            <Button variant="outline" size="sm" className="flex-1">
                              Edit
                            </Button>
                            <Button variant="outline" size="sm">
                              <UserCog className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>
    </div>
  );
};

export default UsersManagement;
