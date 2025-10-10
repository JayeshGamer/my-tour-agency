import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { bookings, tours, users } from "@/lib/db/schema";
import { eq, desc, sql, and } from "drizzle-orm";
import { Card, CardContent } from "@/components/ui/card";
import BookingsList from "@/components/admin/BookingsList";
import BookingFilters from "@/components/admin/BookingFilters";
import { RainbowButton } from "@/components/ui/rainbow-button";
import {
  CalendarCheck, 
  CheckCircle,
  Clock,
  Download,
  TrendingUp,
  AlertCircle,
  DollarSign,
  Users,
  Sparkles
} from "lucide-react";
import Link from "next/link";

async function getBookingsData(filters?: {
  search?: string;
  status?: string;
  paymentStatus?: string;
  dateFrom?: string;
  dateTo?: string;
}) {
  const conditions = [];
  
  // Search by customer name, email, or booking ID
  if (filters?.search) {
    conditions.push(
      sql`(
        ${users.name} ILIKE ${'%' + filters.search + '%'} OR 
        ${users.email} ILIKE ${'%' + filters.search + '%'} OR 
        ${bookings.id} ILIKE ${'%' + filters.search + '%'}
      )`
    );
  }
  
  // Filter by status
  if (filters?.status && filters.status !== 'all') {
    conditions.push(eq(bookings.status, filters.status as any));
  }
  
  // Date range filters
  if (filters?.dateFrom) {
    conditions.push(sql`${bookings.bookingDate} >= ${filters.dateFrom}`);
  }
  if (filters?.dateTo) {
    conditions.push(sql`${bookings.bookingDate} <= ${filters.dateTo}`);
  }

  // Get bookings with user and tour data
  const bookingsData = await db
    .select({
      booking: bookings,
      tour: tours,
      user: users,
    })
    .from(bookings)
    .innerJoin(tours, eq(bookings.tourId, tours.id))
    .innerJoin(users, eq(bookings.userId, users.id))
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(desc(bookings.createdAt))
    .limit(100);

  // Get summary statistics
  const totalBookings = bookingsData.length;
  const confirmedBookings = bookingsData.filter(b => b.booking.status === 'Confirmed').length;
  const pendingBookings = bookingsData.filter(b => b.booking.status === 'Pending').length;
  const cancelledBookings = bookingsData.filter(b => b.booking.status === 'Canceled').length;
  
  const totalRevenue = bookingsData
    .filter(b => b.booking.status === 'Confirmed')
    .reduce((sum, b) => sum + parseFloat(b.booking.totalPrice), 0);

  return {
    bookings: bookingsData,
    stats: {
      total: totalBookings,
      confirmed: confirmedBookings,
      pending: pendingBookings,
      cancelled: cancelledBookings,
      revenue: totalRevenue,
    }
  };
}
export default async function BookingsPage({
  searchParams,
}: {
  searchParams: Promise<{
    search?: string;
    status?: string;
    paymentStatus?: string;
    dateFrom?: string;
    dateTo?: string;
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
  const data = await getBookingsData(params);

  // Calculate growth percentage (mock data for now)
  const growthRate = data.stats.total > 0 ?
    ((data.stats.confirmed / data.stats.total) * 100).toFixed(1) : 0;

  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      {/* Enhanced Page Header with gradient */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 via-blue-500/5 to-transparent rounded-3xl blur-3xl" />
        <div className="relative space-y-3 pb-4">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="absolute inset-0 bg-indigo-500/20 blur-xl rounded-full" />
                  <div className="relative bg-gradient-to-br from-indigo-500/10 to-blue-500/10 p-3 rounded-2xl border border-indigo-500/20 backdrop-blur-sm">
                    <CalendarCheck className="h-8 w-8 text-indigo-600" />
                  </div>
                </div>
                <div>
                  <h1 className="text-5xl font-bold tracking-tight bg-gradient-to-br from-indigo-600 to-blue-600 bg-clip-text text-transparent">
                    Bookings Management
                  </h1>
                  <div className="flex items-center gap-2 mt-2">
                    <Sparkles className="h-4 w-4 text-indigo-600" />
                    <p className="text-muted-foreground font-medium">
                      Manage all tour reservations and bookings • {data.stats.pending} awaiting confirmation
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-3">
              <RainbowButton variant="white" className="gap-2">
                <Download className="h-4 w-4" />
                Export Report
              </RainbowButton>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Summary Stats with Animations */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Bookings Card */}
        <Card className="border-border hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 hover:-translate-y-1 group overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <CardContent className="p-6 relative">
            <div className="flex items-start justify-between">
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Total Bookings</p>
                  <div className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse" />
                </div>
                <div className="flex items-baseline gap-2">
                  <p className="text-4xl font-bold text-foreground">{data.stats.total}</p>
                  <span className="text-xs font-medium text-green-600 bg-green-100 dark:bg-green-900/30 px-2 py-1 rounded-full flex items-center gap-1">
                    <TrendingUp className="h-3 w-3" />
                    +12%
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">All time bookings</p>
              </div>
              <div className="relative">
                <div className="absolute inset-0 bg-blue-500/20 blur-lg rounded-full" />
                <div className="relative bg-blue-500/10 p-3 rounded-xl border border-blue-500/20">
                  <CalendarCheck className="h-7 w-7 text-blue-600" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Confirmed Card */}
        <Card className="border-border hover:shadow-xl hover:shadow-green-500/5 transition-all duration-300 hover:-translate-y-1 group overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <CardContent className="p-6 relative">
            <div className="flex items-start justify-between">
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Confirmed</p>
                  <div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
                </div>
                <div className="flex items-baseline gap-2">
                  <p className="text-4xl font-bold text-green-600">{data.stats.confirmed}</p>
                  <span className="text-xs text-muted-foreground">
                    {growthRate}% rate
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">Successfully confirmed</p>
              </div>
              <div className="relative">
                <div className="absolute inset-0 bg-green-500/20 blur-lg rounded-full" />
                <div className="relative bg-green-500/10 p-3 rounded-xl border border-green-500/20">
                  <CheckCircle className="h-7 w-7 text-green-600" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Pending Card */}
        <Card className="border-border hover:shadow-xl hover:shadow-orange-500/5 transition-all duration-300 hover:-translate-y-1 group overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <CardContent className="p-6 relative">
            <div className="flex items-start justify-between">
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Pending</p>
                  <div className="h-1.5 w-1.5 rounded-full bg-orange-500 animate-pulse" />
                </div>
                <div className="flex items-baseline gap-2">
                  <p className="text-4xl font-bold text-orange-600">{data.stats.pending}</p>
                  {data.stats.pending > 0 && (
                    <AlertCircle className="h-4 w-4 text-orange-600" />
                  )}
                </div>
                <p className="text-xs text-muted-foreground">Awaiting confirmation</p>
              </div>
              <div className="relative">
                <div className="absolute inset-0 bg-orange-500/20 blur-lg rounded-full" />
                <div className="relative bg-orange-500/10 p-3 rounded-xl border border-orange-500/20">
                  <Clock className="h-7 w-7 text-orange-600" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Revenue Card */}
        <Card className="border-border hover:shadow-xl hover:shadow-purple-500/5 transition-all duration-300 hover:-translate-y-1 group overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <CardContent className="p-6 relative">
            <div className="flex items-start justify-between">
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Total Revenue</p>
                  <div className="h-1.5 w-1.5 rounded-full bg-purple-500 animate-pulse" />
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-bold text-purple-600">₹</span>
                  <p className="text-3xl font-bold bg-gradient-to-br from-purple-600 to-blue-600 bg-clip-text text-transparent">
                    {(data.stats.revenue / 1000).toFixed(1)}K
                  </p>
                </div>
                <p className="text-xs text-muted-foreground">From confirmed bookings</p>
              </div>
              <div className="relative">
                <div className="absolute inset-0 bg-purple-500/20 blur-lg rounded-full" />
                <div className="relative bg-purple-500/10 p-3 rounded-xl border border-purple-500/20">
                  <DollarSign className="h-7 w-7 text-purple-600" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters with tighter spacing - integrated better */}
      <BookingFilters />

      {/* Bookings List */}
      <div className="pb-8">
        <BookingsList bookings={data.bookings} />
      </div>
    </div>
  );
}
