import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/lib/db";
import { bookings, users, tours } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import PaymentsList from "@/components/admin/PaymentsList";
import { 
  CreditCard, 
  Download,
  CheckCircle,
  XCircle,
  Clock,
  DollarSign
} from "lucide-react";
import Link from "next/link";

async function getPaymentsData() {
  // Get bookings with payment intent IDs as proxy for payments
  const bookingsData = await db
    .select({
      id: bookings.id,
      paymentIntentId: bookings.paymentIntentId,
      totalPrice: bookings.totalPrice,
      status: bookings.status,
      createdAt: bookings.createdAt,
      userName: users.name,
      userEmail: users.email,
      tourTitle: tours.title
    })
    .from(bookings)
    .leftJoin(users, eq(bookings.userId, users.id))
    .leftJoin(tours, eq(bookings.tourId, tours.id))
    .orderBy(desc(bookings.createdAt))
    .limit(100);

  // Transform to payment format for compatibility
  const payments = bookingsData.map(booking => ({
    id: booking.paymentIntentId || booking.id,
    amount: parseFloat(booking.totalPrice.toString()) * 100, // Convert to cents
    status: booking.status === 'Confirmed' ? 'succeeded' : 
           booking.status === 'Pending' ? 'pending' : 'canceled',
    currency: 'usd',
    createdAt: booking.createdAt,
    booking: {
      id: booking.id,
      user: {
        name: booking.userName,
        email: booking.userEmail
      },
      tour: {
        title: booking.tourTitle
      }
    }
  }));

  // Calculate statistics
  const totalPayments = payments.length;
  const succeededPayments = payments.filter(p => p.status === "succeeded").length;
  const pendingPayments = payments.filter(p => p.status === "pending").length;
  const canceledPayments = payments.filter(p => p.status === "canceled").length;
  const totalRevenue = payments
    .filter(p => p.status === "succeeded")
    .reduce((sum, p) => sum + p.amount, 0);

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
}

export default async function PaymentsPage() {
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

  const data = await getPaymentsData();

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <CreditCard className="h-8 w-8 text-primary" />
            Payment Management
          </h1>
          <p className="text-gray-600 mt-2">
            Stripe transactions and payment processing
          </p>
        </div>
        <Button>
          <Download className="h-4 w-4 mr-2" />
          Export Payments
        </Button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Payments</p>
                <p className="text-2xl font-bold">{data.stats.total}</p>
              </div>
              <CreditCard className="h-8 w-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Successful</p>
                <p className="text-2xl font-bold text-green-600">{data.stats.succeeded}</p>
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
                  ${(data.stats.totalRevenue / 100).toLocaleString()}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Payments List */}
      <PaymentsList payments={data.payments} />
    </div>
  );
}
