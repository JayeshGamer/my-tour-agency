import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/lib/db";
import { users, bookings } from "@/lib/db/schema";
import { eq, desc, ilike, or, count, sum } from "drizzle-orm";
import { Card, CardContent } from "@/components/ui/card";
import UsersList from "@/components/admin/UsersList";
import UsersFilters from "@/components/admin/UsersFilters";
import { RainbowButton } from "@/components/ui/rainbow-button";
import {
  Users, 
  Shield,
  User,
  Calendar,
  UserPlus,
  Sparkles,
  TrendingUp,
  Crown,
  Download
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
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-destructive mb-4">Unauthorized Access</h1>
          <p className="text-muted-foreground mb-4">You do not have permission to access this area.</p>
          <Link href="/" className="text-primary hover:underline">
            Return to Home
          </Link>
        </div>
      </div>
    );
  }

  const params = await searchParams;
  const data = await getUsersData(params);

  // Calculate growth percentage
  const growthRate = data.stats.newThisMonth > 0 ?
    ((data.stats.newThisMonth / data.stats.total) * 100).toFixed(1) : 0;

  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      {/* Enhanced Page Header with gradient */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-purple/10 via-purple/5 to-transparent rounded-3xl blur-3xl" />
        <div className="relative space-y-3 pb-4">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="absolute inset-0 bg-purple-500/20 blur-xl rounded-full" />
                  <div className="relative bg-purple-500/10 p-3 rounded-2xl border border-purple-500/20">
                    <Users className="h-8 w-8 text-purple-600" />
                  </div>
                </div>
                <div>
                  <h1 className="text-5xl font-bold tracking-tight bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent">
                    User Management
                  </h1>
                  <div className="flex items-center gap-2 mt-2">
                    <Sparkles className="h-4 w-4 text-purple-600" />
                    <p className="text-muted-foreground font-medium">
                      Manage user accounts and permissions • {data.stats.active} active members
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-3">
              <RainbowButton variant="green" className="gap-2">
                <UserPlus className="h-4 w-4" />
                Add User
              </RainbowButton>
              <RainbowButton variant="red" className="gap-2">
                <Download className="h-4 w-4" />
                Export
              </RainbowButton>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Summary Stats with Animations */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Users Card */}
        <Card className="border-border hover:shadow-xl hover:shadow-purple-500/5 transition-all duration-300 hover:-translate-y-1 group overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <CardContent className="p-6 relative">
            <div className="flex items-start justify-between">
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Total Users</p>
                  <div className="h-1.5 w-1.5 rounded-full bg-purple-500 animate-pulse" />
                </div>
                <div className="flex items-baseline gap-2">
                  <p className="text-4xl font-bold text-foreground">{data.stats.total}</p>
                  <span className="text-xs font-medium text-purple-600 bg-purple-100 dark:bg-purple-900/30 px-2 py-1 rounded-full flex items-center gap-1">
                    <TrendingUp className="h-3 w-3" />
                    {growthRate}%
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">Registered members</p>
              </div>
              <div className="relative">
                <div className="absolute inset-0 bg-purple-500/20 blur-lg rounded-full" />
                <div className="relative bg-purple-500/10 p-3 rounded-xl border border-purple-500/20">
                  <Users className="h-7 w-7 text-purple-600" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Active Users Card */}
        <Card className="border-border hover:shadow-xl hover:shadow-green-500/5 transition-all duration-300 hover:-translate-y-1 group overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <CardContent className="p-6 relative">
            <div className="flex items-start justify-between">
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Active Users</p>
                  <div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
                </div>
                <div className="flex items-baseline gap-2">
                  <p className="text-4xl font-bold text-green-600">{data.stats.active}</p>
                  <span className="text-xs text-muted-foreground">
                    {((data.stats.active / data.stats.total) * 100).toFixed(0)}%
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">Verified accounts</p>
              </div>
              <div className="relative">
                <div className="absolute inset-0 bg-green-500/20 blur-lg rounded-full" />
                <div className="relative bg-green-500/10 p-3 rounded-xl border border-green-500/20">
                  <User className="h-7 w-7 text-green-600" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Administrators Card */}
        <Card className="border-border hover:shadow-xl hover:shadow-red-500/5 transition-all duration-300 hover:-translate-y-1 group overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <CardContent className="p-6 relative">
            <div className="flex items-start justify-between">
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Administrators</p>
                  <Crown className="h-3.5 w-3.5 text-amber-500" />
                </div>
                <div className="flex items-baseline gap-2">
                  <p className="text-4xl font-bold text-red-600">{data.stats.admin}</p>
                </div>
                <p className="text-xs text-muted-foreground">With admin access</p>
              </div>
              <div className="relative">
                <div className="absolute inset-0 bg-red-500/20 blur-lg rounded-full" />
                <div className="relative bg-red-500/10 p-3 rounded-xl border border-red-500/20">
                  <Shield className="h-7 w-7 text-red-600" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* New This Month Card */}
        <Card className="border-border hover:shadow-xl hover:shadow-blue-500/5 transition-all duration-300 hover:-translate-y-1 group overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <CardContent className="p-6 relative">
            <div className="flex items-start justify-between">
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">New This Month</p>
                  <div className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse" />
                </div>
                <div className="flex items-baseline gap-2">
                  <p className="text-4xl font-bold bg-gradient-to-br from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                    +{data.stats.newThisMonth}
                  </p>
                </div>
                <p className="text-xs text-muted-foreground">Recent signups</p>
              </div>
              <div className="relative">
                <div className="absolute inset-0 bg-blue-500/20 blur-lg rounded-full" />
                <div className="relative bg-blue-500/10 p-3 rounded-xl border border-blue-500/20">
                  <Calendar className="h-7 w-7 text-blue-600" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters with tighter spacing */}
      <UsersFilters />

      {/* Users List */}
      <div className="pb-8">
        <UsersList users={data.users} />
      </div>
    </div>
  );
}
