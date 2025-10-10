import { db } from "@/lib/db";
import { bookings, tours, users } from "@/lib/db/schema";
import { eq, desc, sql, and, gte, lte } from "drizzle-orm";
import StatsCard from "@/components/admin/StatsCard";
import ModernEarningsChart from "@/components/admin/ModernEarningsChart";
import BookingsRadialChart from "@/components/admin/BookingsRadialChart";
import TopDestinations from "@/components/admin/TopDestinations";
import QuickActions from "@/components/admin/QuickActions";
import RecentActivity from "@/components/admin/RecentActivity";

async function getDashboardData() {
  // Get date range for this month
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  const startOfYear = new Date(now.getFullYear(), 0, 1);

  // Get total bookings this month
  const totalBookingsQuery = await db
    .select({ count: sql<number>`count(*)` })
    .from(bookings)
    .where(
      and(
        gte(bookings.bookingDate, startOfMonth),
        lte(bookings.bookingDate, endOfMonth)
      )
    );
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
        gte(bookings.bookingDate, startOfMonth),
        lte(bookings.bookingDate, endOfMonth)
      )
    );
  const monthlyRevenue = parseFloat(revenueQuery[0]?.total || '0');

  // Get booking status counts
  const bookingStatusQuery = await db
    .select({
      status: bookings.status,
      count: sql<number>`count(*)`,
    })
    .from(bookings)
    .where(
      and(
        gte(bookings.bookingDate, startOfMonth),
        lte(bookings.bookingDate, endOfMonth)
      )
    )
    .groupBy(bookings.status);

  const bookingStats = {
    confirmed: bookingStatusQuery.find(b => b.status === 'Confirmed')?.count || 0,
    pending: bookingStatusQuery.find(b => b.status === 'Pending')?.count || 0,
    cancelled: bookingStatusQuery.find(b => b.status === 'Canceled')?.count || 0,
  };

  // Get total users
  const totalUsersQuery = await db
    .select({ count: sql<number>`count(*)` })
    .from(users);
  const totalUsers = totalUsersQuery[0]?.count || 0;

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
    .where(
      and(
        gte(bookings.bookingDate, startOfMonth),
        lte(bookings.bookingDate, endOfMonth)
      )
    )
    .groupBy(bookings.tourId, tours.name, tours.location)
    .orderBy(desc(sql`count(${bookings.id})`))
    .limit(10);

  // Get recent bookings for activity feed
  const recentBookingsData = await db
    .select({
      id: bookings.id,
      bookingDate: bookings.bookingDate,
      status: bookings.status,
      totalPrice: bookings.totalPrice,
      user: {
        name: users.name,
        email: users.email,
      },
      tour: {
        name: tours.name,
      },
    })
    .from(bookings)
    .innerJoin(tours, eq(bookings.tourId, tours.id))
    .innerJoin(users, eq(bookings.userId, users.id))
    .orderBy(desc(bookings.createdAt))
    .limit(10);

  // Get monthly earnings for chart
  const monthlyEarnings = await db
    .select({
      month: sql<number>`EXTRACT(month FROM ${bookings.bookingDate})`,
      monthName: sql<string>`TO_CHAR(${bookings.bookingDate}, 'Mon')`,
      earnings: sql<string>`COALESCE(SUM(${bookings.totalPrice}::numeric), 0)`,
      bookingCount: sql<number>`count(${bookings.id})`,
    })
    .from(bookings)
    .where(
      and(
        eq(bookings.status, 'Confirmed'),
        gte(bookings.bookingDate, startOfYear),
        lte(bookings.bookingDate, now)
      )
    )
    .groupBy(sql`EXTRACT(month FROM ${bookings.bookingDate})`, sql`TO_CHAR(${bookings.bookingDate}, 'Mon')`)
    .orderBy(sql`EXTRACT(month FROM ${bookings.bookingDate})`);

  const earningsChartData = monthlyEarnings.map(item => ({
    name: item.monthName,
    earnings: parseFloat(item.earnings),
    bookings: item.bookingCount,
  }));

  return {
    totalBookings,
    totalPackages,
    monthlyRevenue,
    totalUsers,
    bookingStats,
    hotDestinations,
    recentBookings: recentBookingsData,
    earningsChartData,
  };
}

export default async function AdminDashboard() {
  const data = await getDashboardData();

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Page Header */}
      <div className="space-y-2">
        <h1 className="text-4xl font-bold tracking-tight text-foreground">
          Dashboard Overview
        </h1>
        <p className="text-muted-foreground">
          Welcome back! Here's what's happening with your tours today.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Bookings"
          value={data.totalBookings.toLocaleString()}
          change="+12.5% from last month"
          changeType="positive"
          icon="CalendarCheck"
          delay={0}
        />
        <StatsCard
          title="Active Tours"
          value={data.totalPackages}
          change={`${data.totalPackages} packages available`}
          changeType="neutral"
          icon="Package"
          delay={0.1}
        />
        <StatsCard
          title="Revenue This Month"
          value={`₹${data.monthlyRevenue.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`}
          change="+18.2% from last month"
          changeType="positive"
          icon="DollarSign"
          delay={0.2}
        />
        <StatsCard
          title="Total Users"
          value={data.totalUsers.toLocaleString()}
          change="Active user base"
          changeType="neutral"
          icon="Users"
          delay={0.3}
        />
      </div>

      {/* Quick Actions */}
      <QuickActions />

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ModernEarningsChart data={data.earningsChartData} />
        </div>
        <div className="lg:col-span-1">
          <BookingsRadialChart
            confirmed={data.bookingStats.confirmed}
            pending={data.bookingStats.pending}
            cancelled={data.bookingStats.cancelled}
          />
        </div>
      </div>

      {/* Destinations and Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TopDestinations destinations={data.hotDestinations} />
        <RecentActivity activities={data.recentBookings} />
      </div>
    </div>
  );
}
