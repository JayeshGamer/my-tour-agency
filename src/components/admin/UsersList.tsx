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
  DropdownMenuSeparator,
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
  Trash2,
  Sparkles,
  TrendingUp,
  ShoppingBag,
  DollarSign,
  Crown,
  Calendar
} from "lucide-react";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";

interface UserData {
  user: {
    id: string;
    name: string | null;
    email: string;
    role: string;
    emailVerified: boolean | null;
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
  if (role === "Admin") {
    return (
      <Badge className="flex items-center gap-1.5 bg-red-600 hover:bg-red-700 text-white border-0 font-medium px-3 py-1 rounded-full shadow-sm">
        <Shield className="h-3 w-3" />
        Admin
      </Badge>
    );
  }
  return (
    <Badge className="flex items-center gap-1.5 bg-gray-100 text-gray-700 border-0 font-medium px-3 py-1 rounded-full dark:bg-gray-800 dark:text-gray-300">
      <User className="h-3 w-3" />
      User
    </Badge>
  );
};

const getStatusBadge = (isVerified: boolean | null) => {
  const verified = isVerified === true;
  if (verified) {
    return (
      <Badge className="flex items-center gap-1.5 bg-black hover:bg-black text-white border-0 font-medium px-3 py-1 rounded-full shadow-sm dark:bg-white dark:text-black">
        Active
      </Badge>
    );
  }
  return (
    <Badge className="flex items-center gap-1.5 bg-gray-100 text-gray-600 border-0 font-medium px-3 py-1 rounded-full dark:bg-gray-800 dark:text-gray-400">
      Inactive
    </Badge>
  );
};

const getUserInitials = (name: string | null, email: string) => {
  if (name && typeof name === 'string') {
    const initials = name.split(' ').filter(n => n).map(n => n[0]).join('').toUpperCase();
    return initials.slice(0, 2) || email[0].toUpperCase();
  }
  return email && email.length > 0 ? email[0].toUpperCase() : 'U';
};

export default function UsersList({ users }: UsersListProps) {
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState<string | null>(null);

  const handleToggleStatus = async (userId: string, currentStatus: boolean | null) => {
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
    <Card className="border-border overflow-hidden shadow-lg">
      <CardHeader className="border-b border-border bg-card px-8 py-6">
        <CardTitle className="text-2xl font-bold text-foreground">
          All Users ({users.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent border-b border-border bg-muted/20">
                <TableHead className="text-sm font-semibold text-muted-foreground/80 px-8 py-4 w-[300px]">User</TableHead>
                <TableHead className="text-sm font-semibold text-muted-foreground/80 py-4">Role</TableHead>
                <TableHead className="text-sm font-semibold text-muted-foreground/80 py-4">Status</TableHead>
                <TableHead className="text-sm font-semibold text-muted-foreground/80 py-4">Join Date</TableHead>
                <TableHead className="text-sm font-semibold text-muted-foreground/80 py-4">Bookings</TableHead>
                <TableHead className="text-sm font-semibold text-muted-foreground/80 py-4">Total Spent</TableHead>
                <TableHead className="text-sm font-semibold text-muted-foreground/80 py-4 pr-8">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.length > 0 ? (
                users.map((userData, index) => (
                  <TableRow
                    key={userData.user.id}
                    className="border-b border-border hover:bg-muted/30 transition-all duration-200 group"
                    style={{ animationDelay: `${index * 30}ms` }}
                  >
                    <TableCell className="px-8 py-5">
                      <div className="flex items-center gap-4">
                        <div className="relative">
                          <Avatar className="h-12 w-12 border-2 border-border shadow-sm ring-2 ring-transparent group-hover:ring-purple-500/20 transition-all">
                            <AvatarImage src={userData.user.image || ""} alt={userData.user.name || userData.user.email} />
                            <AvatarFallback className="bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 text-foreground font-bold text-base">
                              {getUserInitials(userData.user.name, userData.user.email)}
                            </AvatarFallback>
                          </Avatar>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-base text-foreground truncate">
                            {userData.user.name || 'Unnamed User'}
                          </div>
                          <div className="text-sm text-muted-foreground flex items-center gap-1.5 truncate mt-0.5">
                            <Mail className="h-3.5 w-3.5 flex-shrink-0" />
                            <span>{userData.user.email}</span>
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="py-5">
                      {getRoleBadge(userData.user.role)}
                    </TableCell>
                    <TableCell className="py-5">
                      {getStatusBadge(userData.user.emailVerified)}
                    </TableCell>
                    <TableCell className="py-5">
                      <div className="text-sm text-foreground font-normal">
                        {new Date(userData.user.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </div>
                    </TableCell>
                    <TableCell className="py-5">
                      <div className="text-base font-medium text-foreground">
                        {userData.bookingCount}
                      </div>
                    </TableCell>
                    <TableCell className="py-5">
                      <div className="text-base font-semibold text-foreground">
                        ₹{parseFloat(userData.totalSpent).toLocaleString('en-IN')}
                      </div>
                    </TableCell>
                    <TableCell className="py-5 pr-8">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            disabled={isProcessing === userData.user.id}
                            className="hover:bg-muted hover:text-foreground transition-colors h-9 w-9 rounded-lg"
                          >
                            <MoreHorizontal className="h-5 w-5" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-52">
                          <DropdownMenuItem className="cursor-pointer">
                            <Edit className="mr-2 h-4 w-4" />
                            Edit User
                          </DropdownMenuItem>

                          <DropdownMenuItem
                            className="cursor-pointer"
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

                          <DropdownMenuSeparator />

                          {userData.user.role !== "Admin" && (
                            <DropdownMenuItem
                              className="cursor-pointer text-amber-600 focus:text-amber-600 focus:bg-amber-50 dark:focus:bg-amber-900/20"
                              onClick={() => handleChangeRole(userData.user.id, "Admin")}
                            >
                              <Crown className="mr-2 h-4 w-4" />
                              Make Admin
                            </DropdownMenuItem>
                          )}

                          {userData.user.role === "Admin" && (
                            <DropdownMenuItem
                              className="cursor-pointer"
                              onClick={() => handleChangeRole(userData.user.id, "User")}
                            >
                              <User className="mr-2 h-4 w-4" />
                              Make User
                            </DropdownMenuItem>
                          )}

                          <DropdownMenuSeparator />

                          <DropdownMenuItem
                            className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-900/20"
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
                  <TableCell colSpan={7} className="text-center py-20">
                    <div className="flex flex-col items-center gap-4">
                      <div className="relative">
                        <div className="absolute inset-0 bg-purple-500/20 blur-2xl rounded-full" />
                        <div className="relative bg-muted/50 p-6 rounded-2xl">
                          <Users className="h-16 w-16 text-muted-foreground/40" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <h3 className="text-xl font-semibold text-foreground">No users found</h3>
                        <p className="text-muted-foreground max-w-sm text-sm">
                          Users will appear here when they register accounts. Try adjusting your filters.
                        </p>
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
