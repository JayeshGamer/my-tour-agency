import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { bookings, tours, users } from "@/lib/db/schema";
import { eq, desc, sql, and, ilike } from "drizzle-orm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import BookingsList from "@/components/admin/BookingsList";
import BookingFilters from "@/components/admin/BookingFilters";
import { 
  CalendarCheck, 
  Download,
  CheckCircle,
  XCircle,
  Clock
} from "lucide-react";

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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Unauthorized Access</h1>
          <p className="text-gray-600 mb-4">You do not have permission to access this area.</p>
          <a href="/" className="text-blue-600 hover:underline">
            Return to Home
          </a>
        </div>
      </div>
    );
  }

  const params = await searchParams;
  const data = await getBookingsData(params);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <CalendarCheck className="h-8 w-8 text-primary" />
            Bookings Management
          </h1>
          <p className="text-gray-600 mt-2">
            View and manage all tour bookings
          </p>
        </div>
        <Button>
          <Download className="h-4 w-4 mr-2" />
          Export Bookings
        </Button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Bookings</p>
                <p className="text-2xl font-bold">{data.stats.total}</p>
              </div>
              <CalendarCheck className="h-8 w-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Confirmed</p>
                <p className="text-2xl font-bold text-green-600">{data.stats.confirmed}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-400" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-orange-600">{data.stats.pending}</p>
              </div>
              <Clock className="h-8 w-8 text-orange-400" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-blue-600">
                  ${data.stats.revenue.toLocaleString()}
                </p>
              </div>
              <div className="text-blue-400">$</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <BookingFilters />

      {/* Bookings List */}
      <BookingsList bookings={data.bookings} />
    </div>
  );
}
