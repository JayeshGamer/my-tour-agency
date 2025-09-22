"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  Users, 
  Edit,
  MoreHorizontal,
  Shield,
  User,
  Mail,
  UserCheck,
  UserX,
  Key,
  Trash2
} from "lucide-react";
import { toast } from "react-hot-toast";
import { DateDisplay } from "@/components/ui/DateDisplay";
import { useRouter } from "next/navigation";

interface UserData {
  user: {
    id: string;
    name: string | null;
    email: string;
    role: string;
    emailVerified: boolean;
    createdAt: Date;
    image: string | null;
  };
  bookingCount: number;
  totalSpent: string;
}

interface UsersListProps {
  users: UserData[];
}

const getRoleBadge = (role: string) => {
  return (
    <Badge variant={role === "Admin" ? "destructive" : "secondary"} className="flex items-center gap-1">
      {role === "Admin" ? <Shield className="h-3 w-3" /> : <User className="h-3 w-3" />}
      {role}
    </Badge>
  );
};

const getStatusBadge = (isVerified: boolean) => {
  return (
    <Badge variant={isVerified ? "default" : "secondary"}>
      {isVerified ? "Active" : "Inactive"}
    </Badge>
  );
};

const getUserInitials = (name: string | null, email: string) => {
  if (name && typeof name === 'string') {
    const initials = name.split(' ').filter(n => n).map(n => n[0]).join('').toUpperCase();
    return initials || email[0].toUpperCase();
  }
  return email && email.length > 0 ? email[0].toUpperCase() : 'U';
};

export default function UsersList({ users }: UsersListProps) {
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState<string | null>(null);

  const handleToggleStatus = async (userId: string, currentStatus: boolean) => {
    setIsProcessing(userId);
    try {
      const response = await fetch(`/api/admin/users/${userId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ emailVerified: !currentStatus }),
      });

      if (!response.ok) {
        throw new Error('Failed to update user status');
      }

      toast.success(`User ${!currentStatus ? 'activated' : 'deactivated'} successfully`);
      router.refresh();
    } catch (error: any) {
      console.error('Error updating user status:', error);
      toast.error(error.message || 'Failed to update user status');
    } finally {
      setIsProcessing(null);
    }
  };

  const handleChangeRole = async (userId: string, newRole: string) => {
    setIsProcessing(userId);
    try {
      const response = await fetch(`/api/admin/users/${userId}/role`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ role: newRole }),
      });

      if (!response.ok) {
        throw new Error('Failed to update user role');
      }

      toast.success(`User role updated to ${newRole}`);
      router.refresh();
    } catch (error: any) {
      console.error('Error updating user role:', error);
      toast.error(error.message || 'Failed to update user role');
    } finally {
      setIsProcessing(null);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }

    setIsProcessing(userId);
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete user');
      }

      toast.success('User deleted successfully');
      router.refresh();
    } catch (error: any) {
      console.error('Error deleting user:', error);
      toast.error(error.message || 'Failed to delete user');
    } finally {
      setIsProcessing(null);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>All Users ({users.length})</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Join Date</TableHead>
              <TableHead>Bookings</TableHead>
              <TableHead>Total Spent</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.length > 0 ? (
              users.map((userData) => (
                <TableRow key={userData.user.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={userData.user.image || ""} alt={userData.user.name || userData.user.email} />
                        <AvatarFallback className="bg-primary/10 text-primary">
                          {getUserInitials(userData.user.name, userData.user.email)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">
                          {userData.user.name || userData.user.email.split('@')[0]}
                        </div>
                        <div className="text-sm text-gray-500 flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          {userData.user.email}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {getRoleBadge(userData.user.role)}
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(userData.user.emailVerified)}
                  </TableCell>
                  <TableCell className="text-sm">
                    <DateDisplay date={userData.user.createdAt} format="short" />
                  </TableCell>
                  <TableCell className="font-medium">
                    {userData.bookingCount}
                  </TableCell>
                  <TableCell className="font-semibold">
                    ${parseFloat(userData.totalSpent).toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          disabled={isProcessing === userData.user.id}
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit User
                        </DropdownMenuItem>
                        
                        <DropdownMenuItem 
                          onClick={() => handleToggleStatus(userData.user.id, userData.user.emailVerified)}
                        >
                          {userData.user.emailVerified ? (
                            <>
                              <UserX className="mr-2 h-4 w-4" />
                              Deactivate
                            </>
                          ) : (
                            <>
                              <UserCheck className="mr-2 h-4 w-4" />
                              Activate
                            </>
                          )}
                        </DropdownMenuItem>
                        
                        {userData.user.role !== "Admin" && (
                          <DropdownMenuItem 
                            onClick={() => handleChangeRole(userData.user.id, "Admin")}
                          >
                            <Key className="mr-2 h-4 w-4" />
                            Make Admin
                          </DropdownMenuItem>
                        )}
                        
                        {userData.user.role === "Admin" && (
                          <DropdownMenuItem 
                            onClick={() => handleChangeRole(userData.user.id, "User")}
                          >
                            <User className="mr-2 h-4 w-4" />
                            Make User
                          </DropdownMenuItem>
                        )}
                        
                        <DropdownMenuItem 
                          className="text-red-600"
                          onClick={() => handleDeleteUser(userData.user.id)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete User
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-12 text-gray-500">
                  <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-600">No users found</h3>
                  <p className="text-gray-500 mt-2">Users will appear here when they register accounts.</p>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
