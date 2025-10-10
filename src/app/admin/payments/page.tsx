import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/lib/db";
import { bookings, users, tours } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { Card, CardContent } from "@/components/ui/card";
import { RainbowButton } from "@/components/ui/rainbow-button";
import PaymentsList from "@/components/admin/PaymentsList";
import { 
  CreditCard, 
  Download,
  CheckCircle,
  Clock,
  DollarSign,
  Sparkles,
  Filter,
  ArrowUpRight
} from "lucide-react";
import Link from "next/link";

async function getPaymentsData() {
  try {
    // Get bookings as proxy for payments
    const bookingsData = await db
      .select({
        id: bookings.id,
        totalPrice: bookings.totalPrice,
        status: bookings.status,
        paymentStatus: bookings.paymentStatus,
        createdAt: bookings.createdAt,
        userName: users.name,
        userEmail: users.email,
        tourTitle: tours.name
      })
      .from(bookings)
      .leftJoin(users, eq(bookings.userId, users.id))
      .leftJoin(tours, eq(bookings.tourId, tours.id))
      .orderBy(desc(bookings.createdAt))
      .limit(100);

    // Transform to payment format for compatibility
    const payments = (bookingsData || []).map(booking => {
      // Ensure all required fields are available
      if (!booking) return null;
      
      return {
        id: booking.id,
        amount: parseFloat((booking.totalPrice || '0').toString()) * 100, // Convert to cents
        status: booking.status === 'Confirmed' ? 'succeeded' : 
               booking.status === 'Pending' ? 'pending' : 'canceled',
        currency: 'inr',
        createdAt: booking.createdAt || new Date(),
        booking: {
          id: booking.id,
          user: {
            name: booking.userName || null,
            email: booking.userEmail || 'unknown@example.com'
          },
          tour: {
            title: booking.tourTitle || 'Unknown Tour'
          }
        }
      };
    }).filter(payment => payment !== null);

    // Calculate statistics
    const totalPayments = payments.length;
    const succeededPayments = payments.filter(p => p.status === "succeeded").length;
    const pendingPayments = payments.filter(p => p.status === "pending").length;
    const canceledPayments = payments.filter(p => p.status === "canceled").length;
    const totalRevenue = payments
      .filter(p => p.status === "succeeded")
      .reduce((sum, p) => sum + (p.amount || 0), 0);

    return {
      payments,
      stats: {
        total: totalPayments,
        succeeded: succeededPayments,
        pending: pendingPayments,
        canceled: canceledPayments,
        totalRevenue
      }
    };
  } catch (error) {
    console.error('Error fetching payments data:', error);
    return {
      payments: [],
      stats: {
        total: 0,
        succeeded: 0,
        pending: 0,
        canceled: 0,
        totalRevenue: 0
      }
    };
  }
}

export default async function PaymentsPage() {
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

  const data = await getPaymentsData();
  
  // Handle case where data might be null or undefined
  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-destructive mb-4">Error Loading Payments</h1>
          <p className="text-muted-foreground mb-4">Unable to load payment data at this time.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      {/* Enhanced Page Header with gradient */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-transparent rounded-3xl blur-3xl" />
        <div className="relative space-y-3 pb-4">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="absolute inset-0 bg-emerald-500/20 blur-xl rounded-full" />
                  <div className="relative bg-gradient-to-br from-emerald-500/10 to-teal-500/10 p-3 rounded-2xl border border-emerald-500/20 backdrop-blur-sm">
                    <CreditCard className="h-8 w-8 text-emerald-600" />
                  </div>
                </div>
                <div>
                  <h1 className="text-5xl font-bold tracking-tight bg-gradient-to-br from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                    Payment Management
                  </h1>
                  <div className="flex items-center gap-2 mt-2">
                    <Sparkles className="h-4 w-4 text-emerald-600" />
                    <p className="text-muted-foreground font-medium">
                      Track transactions and revenue • {data.stats.succeeded} successful
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-3">
              <RainbowButton variant="red" className="gap-2">
                <Filter className="h-4 w-4" />
                Filter
              </RainbowButton>
              <RainbowButton variant="green" className="gap-2">
                <Download className="h-4 w-4" />
                Export
              </RainbowButton>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Summary Stats with Animations */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Payments Card */}
        <Card className="border-border hover:shadow-xl hover:shadow-blue-500/5 transition-all duration-300 hover:-translate-y-1 group overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <CardContent className="p-6 relative">
            <div className="flex items-start justify-between">
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Total Payments</p>
                  <div className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse" />
                </div>
                <div className="flex items-baseline gap-2">
                  <p className="text-4xl font-bold text-foreground">{data.stats.total}</p>
                </div>
                <p className="text-xs text-muted-foreground">All transactions</p>
              </div>
              <div className="relative">
                <div className="absolute inset-0 bg-blue-500/20 blur-lg rounded-full" />
                <div className="relative bg-blue-500/10 p-3 rounded-xl border border-blue-500/20">
                  <CreditCard className="h-7 w-7 text-blue-600" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Successful Payments Card */}
        <Card className="border-border hover:shadow-xl hover:shadow-green-500/5 transition-all duration-300 hover:-translate-y-1 group overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <CardContent className="p-6 relative">
            <div className="flex items-start justify-between">
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Successful</p>
                  <div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
                </div>
                <div className="flex items-baseline gap-2">
                  <p className="text-4xl font-bold text-green-600">{data.stats.succeeded}</p>
                  <span className="text-xs text-muted-foreground">
                    {data.stats.total > 0 ? ((data.stats.succeeded / data.stats.total) * 100).toFixed(0) : 0}%
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">Completed</p>
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
        
        {/* Pending Payments Card */}
        <Card className="border-border hover:shadow-xl hover:shadow-amber-500/5 transition-all duration-300 hover:-translate-y-1 group overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <CardContent className="p-6 relative">
            <div className="flex items-start justify-between">
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Pending</p>
                  <div className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
                </div>
                <div className="flex items-baseline gap-2">
                  <p className="text-4xl font-bold text-amber-600">{data.stats.pending}</p>
                </div>
                <p className="text-xs text-muted-foreground">Processing</p>
              </div>
              <div className="relative">
                <div className="absolute inset-0 bg-amber-500/20 blur-lg rounded-full" />
                <div className="relative bg-amber-500/10 p-3 rounded-xl border border-amber-500/20">
                  <Clock className="h-7 w-7 text-amber-600" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Total Revenue Card */}
        <Card className="border-border hover:shadow-xl hover:shadow-emerald-500/5 transition-all duration-300 hover:-translate-y-1 group overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <CardContent className="p-6 relative">
            <div className="flex items-start justify-between">
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Total Revenue</p>
                  <ArrowUpRight className="h-3.5 w-3.5 text-emerald-600" />
                </div>
                <div className="flex items-baseline gap-1">
                  <p className="text-3xl font-bold bg-gradient-to-br from-emerald-600 to-green-600 bg-clip-text text-transparent">
                    ₹{(data.stats.totalRevenue / 100).toLocaleString('en-IN')}
                  </p>
                </div>
                <p className="text-xs text-muted-foreground">Earnings</p>
              </div>
              <div className="relative">
                <div className="absolute inset-0 bg-emerald-500/20 blur-lg rounded-full" />
                <div className="relative bg-emerald-500/10 p-3 rounded-xl border border-emerald-500/20">
                  <DollarSign className="h-7 w-7 text-emerald-600" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Payments List */}
      <div className="pb-8">
        <PaymentsList payments={data.payments} />
      </div>
    </div>
  );
}
