import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { bookings, tours, reviews, users, systemLogs } from "@/lib/db/schema";
import { eq, desc, sql, and, gte, lte } from "drizzle-orm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Package, 
  CalendarCheck, 
  DollarSign, 
  Flame,
  TrendingUp,
  TrendingDown,
  Users as UsersIcon
} from "lucide-react";
import EarningsChart from "../../../components/admin/EarningsChart";
import RecentBookings from "../../../components/admin/RecentBookings";
import ReviewModeration from "../../../components/admin/ReviewModeration";
import SystemLogs from "../../../components/admin/SystemLogs";
import CustomerRetention from "../../../components/admin/CustomerRetention";
import DashboardFilters from "../../../components/admin/DashboardFilters";

async function getDashboardData(filters?: { country?: string; dateRange?: { from: Date; to: Date } }) {
  // Get date range for this month
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  const startOfYear = new Date(now.getFullYear(), 0, 1);
  const endOfYear = new Date(now.getFullYear(), 11, 31);

  // Build conditions for filtering
  const bookingConditions = [];
  if (filters?.dateRange) {
    bookingConditions.push(
      gte(bookings.bookingDate, filters.dateRange.from),
      lte(bookings.bookingDate, filters.dateRange.to)
    );
  } else {
    bookingConditions.push(
      gte(bookings.bookingDate, startOfMonth),
      lte(bookings.bookingDate, endOfMonth)
    );
  }

  // Get total bookings
  const totalBookingsQuery = await db
    .select({ count: sql<number>`count(*)` })
    .from(bookings)
    .where(bookingConditions.length > 0 ? and(...bookingConditions) : undefined);
  const totalBookings = totalBookingsQuery[0]?.count || 0;

  // Get total active packages (tours)
  const totalPackagesQuery = await db
    .select({ count: sql<number>`count(*)` })
    .from(tours)
    .where(eq(tours.status, 'Active'));
  const totalPackages = totalPackagesQuery[0]?.count || 0;

  // Get revenue this month
  const revenueQuery = await db
    .select({ 
      total: sql<string>`COALESCE(SUM(${bookings.totalPrice}::numeric), 0)` 
    })
    .from(bookings)
    .where(
      and(
        eq(bookings.status, 'Confirmed'),
        ...(bookingConditions.length > 0 ? bookingConditions : [])
      )
    );
  const monthlyRevenue = parseFloat(revenueQuery[0]?.total || '0');

  // Get hot destinations (top 10 booked tours)
  const hotDestinations = await db
    .select({
      tourId: bookings.tourId,
      tourName: tours.name,
      location: tours.location,
      bookingCount: sql<number>`count(${bookings.id})`,
    })
    .from(bookings)
    .innerJoin(tours, eq(bookings.tourId, tours.id))
    .where(bookingConditions.length > 0 ? and(...bookingConditions) : undefined)
    .groupBy(bookings.tourId, tours.name, tours.location)
    .orderBy(desc(sql`count(${bookings.id})`))
    .limit(10);

  // Get recent bookings
  const recentBookingsData = await db
    .select({
      booking: bookings,
      tour: tours,
      user: users,
    })
    .from(bookings)
    .innerJoin(tours, eq(bookings.tourId, tours.id))
    .innerJoin(users, eq(bookings.userId, users.id))
    .orderBy(desc(bookings.createdAt))
    .limit(10);

  // Get pending reviews
  const pendingReviews = await db
    .select({
      review: reviews,
      user: users,
      tour: tours,
    })
    .from(reviews)
    .innerJoin(users, eq(reviews.userId, users.id))
    .innerJoin(tours, eq(reviews.tourId, tours.id))
    .where(eq(reviews.status, 'pending'))
    .orderBy(desc(reviews.createdAt))
    .limit(10);

  // Get system logs
  const recentLogs = await db
    .select()
    .from(systemLogs)
    .orderBy(desc(systemLogs.createdAt))
    .limit(10);

  // Get customer retention data
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const newUsersCount = await db
    .select({ count: sql<number>`count(*)` })
    .from(users)
    .where(gte(users.createdAt, thirtyDaysAgo));

  const returningUsersQuery = await db
    .select({ 
      userId: bookings.userId,
      bookingCount: sql<number>`count(${bookings.id})`,
    })
    .from(bookings)
    .groupBy(bookings.userId)
    .having(sql`count(${bookings.id}) > 1`);

  // Get earnings data for charts
  // Monthly earnings for this year
  const monthlyEarnings = await db
    .select({
      month: sql<number>`EXTRACT(month FROM ${bookings.bookingDate})`,
      monthName: sql<string>`TO_CHAR(${bookings.bookingDate}, 'Mon')`,
      earnings: sql<string>`COALESCE(SUM(${bookings.totalPrice}::numeric), 0)`,
    })
    .from(bookings)
    .where(
      and(
        eq(bookings.status, 'Confirmed'),
        gte(bookings.bookingDate, startOfYear),
        lte(bookings.bookingDate, endOfYear)
      )
    )
    .groupBy(sql`EXTRACT(month FROM ${bookings.bookingDate})`, sql`TO_CHAR(${bookings.bookingDate}, 'Mon')`)
    .orderBy(sql`EXTRACT(month FROM ${bookings.bookingDate})`);

  // Weekly earnings for this month
  const weeklyEarnings = await db
    .select({
      week: sql<number>`EXTRACT(week FROM ${bookings.bookingDate})`,
      weekDay: sql<string>`TO_CHAR(${bookings.bookingDate}, 'Dy')`,
      earnings: sql<string>`COALESCE(SUM(${bookings.totalPrice}::numeric), 0)`,
    })
    .from(bookings)
    .where(
      and(
        eq(bookings.status, 'Confirmed'),
        gte(bookings.bookingDate, startOfMonth),
        lte(bookings.bookingDate, endOfMonth)
      )
    )
    .groupBy(sql`EXTRACT(week FROM ${bookings.bookingDate})`, sql`TO_CHAR(${bookings.bookingDate}, 'Dy')`)
    .orderBy(sql`EXTRACT(week FROM ${bookings.bookingDate})`);

  // Yearly earnings for last 4 years
  const yearlyEarnings = await db
    .select({
      year: sql<number>`EXTRACT(year FROM ${bookings.bookingDate})`,
      earnings: sql<string>`COALESCE(SUM(${bookings.totalPrice}::numeric), 0)`,
    })
    .from(bookings)
    .where(
      and(
        eq(bookings.status, 'Confirmed'),
        gte(bookings.bookingDate, new Date(now.getFullYear() - 3, 0, 1))
      )
    )
    .groupBy(sql`EXTRACT(year FROM ${bookings.bookingDate})`)
    .orderBy(sql`EXTRACT(year FROM ${bookings.bookingDate})`);

  // Format earnings data for chart
  const earningsData = [
    ...monthlyEarnings.map(item => ({
      period: item.monthName,
      earnings: parseFloat(item.earnings),
      timeRange: 'monthly' as const
    })),
    ...weeklyEarnings.map(item => ({
      period: item.weekDay,
      earnings: parseFloat(item.earnings),
      timeRange: 'weekly' as const
    })),
    ...yearlyEarnings.map(item => ({
      period: item.year.toString(),
      earnings: parseFloat(item.earnings),
      timeRange: 'yearly' as const
    }))
  ];

  return {
    totalBookings,
    totalPackages,
    monthlyRevenue,
    hotDestinations,
    recentBookings: recentBookingsData,
    pendingReviews,
    recentLogs,
    newUsers: newUsersCount[0]?.count || 0,
    returningUsers: returningUsersQuery.length,
    earningsData,
  };
}

export default async function AdminDashboard({
  searchParams,
}: {
  searchParams: Promise<{ country?: string; from?: string; to?: string }>;
}) {
  const params = await searchParams;
  const filters = {
    country: params.country,
    dateRange: params.from && params.to
      ? { from: new Date(params.from), to: new Date(params.to) }
      : undefined,
  };

  const data = await getDashboardData(filters);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">
          🧭 Admin Dashboard Overview
        </h1>
        <DashboardFilters />
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.totalBookings.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              <TrendingUp className="inline h-3 w-3 mr-1 text-green-500" />
              +12% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Packages</CardTitle>
            <CalendarCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.totalPackages} Tours</div>
            <p className="text-xs text-muted-foreground">Active tour packages</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue This Month</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${data.monthlyRevenue.toLocaleString('en-US', { 
                minimumFractionDigits: 0, 
                maximumFractionDigits: 0 
              })}
            </div>
            <p className="text-xs text-muted-foreground">
              <TrendingUp className="inline h-3 w-3 mr-1 text-green-500" />
              +18% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Hot Destinations</CardTitle>
            <Flame className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.hotDestinations.length} Top Tours</div>
            <p className="text-xs text-muted-foreground">Most booked this month</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts and Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <EarningsChart earningsData={data.earningsData} />
        <RecentBookings bookings={data.recentBookings} />
      </div>

      {/* Review Moderation and System Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ReviewModeration reviews={data.pendingReviews} />
        <SystemLogs logs={data.recentLogs} />
      </div>

      {/* Customer Retention */}
      <CustomerRetention 
        newUsers={data.newUsers}
        returningUsers={data.returningUsers}
      />
    </div>
  );
}
