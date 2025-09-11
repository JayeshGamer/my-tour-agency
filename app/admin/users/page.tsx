import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/lib/db";
import { users, bookings } from "@/lib/db/schema";
import { eq, desc, ilike, or, count, sum } from "drizzle-orm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import UsersList from "@/components/admin/UsersList";
import UsersFilters from "@/components/admin/UsersFilters";
import { 
  Users, 
  UserPlus,
  Shield,
  User,
  Calendar
} from "lucide-react";
import Link from "next/link";

async function getUsersData(filters?: {
  search?: string;
  role?: string;
  status?: string;
}) {
  // Build query conditions
  const conditions = [];
  
  // Search by name or email
  if (filters?.search) {
    conditions.push(
      or(
        ilike(users.name, `%${filters.search}%`),
        ilike(users.email, `%${filters.search}%`)
      )
    );
  }
  
  // Filter by role
  if (filters?.role && filters.role !== 'all') {
    conditions.push(eq(users.role, filters.role as any));
  }
  
  // Filter by status (using emailVerified as status)
  if (filters?.status && filters.status !== 'all') {
    const isActive = filters.status === 'active';
    conditions.push(eq(users.emailVerified, isActive));
  }

  // Get users data
  const usersData = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      role: users.role,
      emailVerified: users.emailVerified,
      createdAt: users.createdAt,
      image: users.image
    })
    .from(users)
    .where(conditions.length > 0 ? conditions[0] : undefined)
    .orderBy(desc(users.createdAt))
    .limit(100);

  // Get booking statistics for each user
  const usersWithStats = await Promise.all(
    usersData.map(async (user) => {
      const bookingStats = await db
        .select({
          count: count(),
          totalSpent: sum(bookings.totalPrice)
        })
        .from(bookings)
        .where(eq(bookings.userId, user.id))
        .then(result => result[0]);

      return {
        user,
        bookingCount: bookingStats?.count || 0,
        totalSpent: bookingStats?.totalSpent?.toString() || '0'
      };
    })
  );

  // Get summary statistics
  const totalUsers = usersWithStats.length;
  const activeUsers = usersWithStats.filter(u => u.user.emailVerified).length;
  const adminUsers = usersWithStats.filter(u => u.user.role === 'Admin').length;
  
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const newUsersThisMonth = usersWithStats.filter(u => 
    new Date(u.user.createdAt) >= thirtyDaysAgo
  ).length;

  return {
    users: usersWithStats,
    stats: {
      total: totalUsers,
      active: activeUsers,
      admin: adminUsers,
      newThisMonth: newUsersThisMonth,
    }
  };
}
export default async function UsersPage({
  searchParams,
}: {
  searchParams: Promise<{
    search?: string;
    role?: string;
    status?: string;
  }>;
}) {
  // Check authentication and admin role
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user || session.user.role !== 'Admin') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Unauthorized Access</h1>
          <p className="text-gray-600 mb-4">You do not have permission to access this area.</p>
          <Link href="/" className="text-blue-600 hover:underline">
            Return to Home
          </Link>
        </div>
      </div>
    );
  }

  const params = await searchParams;
  const data = await getUsersData(params);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Users className="h-8 w-8 text-primary" />
            User Management
          </h1>
          <p className="text-gray-600 mt-2">
            Manage user accounts and permissions
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/users/new">
            <UserPlus className="h-4 w-4 mr-2" />
            Add New User
          </Link>
        </Button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-2xl font-bold">{data.stats.total}</p>
              </div>
              <Users className="h-8 w-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Users</p>
                <p className="text-2xl font-bold text-green-600">{data.stats.active}</p>
              </div>
              <User className="h-8 w-8 text-green-400" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Administrators</p>
                <p className="text-2xl font-bold text-red-600">{data.stats.admin}</p>
              </div>
              <Shield className="h-8 w-8 text-red-400" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">New This Month</p>
                <p className="text-2xl font-bold text-blue-600">{data.stats.newThisMonth}</p>
              </div>
              <Calendar className="h-8 w-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <UsersFilters />

      {/* Users List */}
      <UsersList users={data.users} />
    </div>
  );
}
