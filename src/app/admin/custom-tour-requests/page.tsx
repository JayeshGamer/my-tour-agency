import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/lib/db";
import { customTourRequests } from "@/lib/db/schema";
import { desc } from "drizzle-orm";
import { Card, CardContent } from "@/components/ui/card";
import { ClipboardList, Clock, AlertCircle, TrendingUp } from "lucide-react";
import AdminCustomTourRequests from "@/components/admin/AdminCustomTourRequests";

async function getCustomTourRequestsStats() {
  try {
    const allRequests = await db
      .select()
      .from(customTourRequests)
      .orderBy(desc(customTourRequests.createdAt));

    const total = allRequests.length;
    const pending = allRequests.filter(r => r.status === 'submitted' || r.status === 'under_review').length;
    const quoted = allRequests.filter(r => r.status === 'quoted').length;
    const converted = allRequests.filter(r => r.status === 'converted_to_booking').length;

    return {
      total,
      pending,
      quoted,
      converted
    };
  } catch (error) {
    console.error('Error fetching stats:', error);
    return {
      total: 0,
      pending: 0,
      quoted: 0,
      converted: 0
    };
  }
}

export default async function AdminCustomTourRequestsPage() {
  try {
    const headersList = await headers();
    const session = await auth.api.getSession({
      headers: headersList
    });

    if (!session?.user || session.user.role !== 'Admin') {
      redirect("/admin");
    }

    const stats = await getCustomTourRequestsStats();

    return (
      <div className="space-y-8 animate-in fade-in duration-500">
        {/* Page Header */}
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 shadow-lg">
              <ClipboardList className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold tracking-tight text-foreground">
                Custom Tour Requests
              </h1>
              <p className="text-muted-foreground mt-1">
                Manage customer requests, provide quotes, and convert them to bookings
              </p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="relative overflow-hidden border-border/50 bg-card hover:shadow-lg transition-all duration-300 group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/10 to-transparent rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500" />
            <CardContent className="p-6 relative">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Total Requests</p>
                  <p className="text-3xl font-bold text-foreground">{stats.total}</p>
                </div>
                <div className="p-3 rounded-xl bg-blue-500/10 ring-1 ring-blue-500/20">
                  <ClipboardList className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden border-border/50 bg-card hover:shadow-lg transition-all duration-300 group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-orange-500/10 to-transparent rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500" />
            <CardContent className="p-6 relative">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Pending Review</p>
                  <p className="text-3xl font-bold text-orange-600">{stats.pending}</p>
                </div>
                <div className="p-3 rounded-xl bg-orange-500/10 ring-1 ring-orange-500/20">
                  <Clock className="h-6 w-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden border-border/50 bg-card hover:shadow-lg transition-all duration-300 group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-500/10 to-transparent rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500" />
            <CardContent className="p-6 relative">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Quoted</p>
                  <p className="text-3xl font-bold text-purple-600">{stats.quoted}</p>
                </div>
                <div className="p-3 rounded-xl bg-purple-500/10 ring-1 ring-purple-500/20">
                  <AlertCircle className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden border-border/50 bg-card hover:shadow-lg transition-all duration-300 group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-500/10 to-transparent rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500" />
            <CardContent className="p-6 relative">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Converted</p>
                  <p className="text-3xl font-bold text-green-600">{stats.converted}</p>
                </div>
                <div className="p-3 rounded-xl bg-green-500/10 ring-1 ring-green-500/20">
                  <TrendingUp className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <AdminCustomTourRequests />
      </div>
    );
  } catch (error) {
    console.error("Admin custom tour requests page error:", error);
    redirect("/admin");
  }
}
