import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/lib/db";
import { coupons } from "@/lib/db/schema";
import { desc } from "drizzle-orm";
import { Card, CardContent } from "@/components/ui/card";
import { RainbowButton } from "@/components/ui/rainbow-button";
import CouponsList from "@/components/admin/CouponsList";
import { DollarSign, Plus, Percent, TrendingUp, ToggleRight, Sparkles, Tag, Download } from "lucide-react";
import Link from "next/link";

async function getCouponsData() {
  const couponsData = await db
    .select()
    .from(coupons)
    .orderBy(desc(coupons.createdAt));

  // Calculate statistics
  const now = new Date();
  const activeCoupons = couponsData.filter(c => 
    c.isActive && (!c.validUntil || c.validUntil > now)
  ).length;
  const totalUsage = couponsData.reduce((sum, c) => sum + (c.usedCount || 0), 0);
  const averageUsageRate = couponsData.length > 0 
    ? couponsData.reduce((sum, c) => {
        if (!c.usageLimit) return sum;
        return sum + ((c.usedCount || 0) / c.usageLimit * 100);
      }, 0) / couponsData.filter(c => c.usageLimit).length || 0
    : 0;

  return {
    coupons: couponsData,
    stats: {
      active: activeCoupons,
      totalUsage,
      averageUsageRate: Math.round(averageUsageRate)
    }
  };
}

export default async function CouponsPage() {
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

  const data = await getCouponsData();
  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      {/* Enhanced Page Header with gradient */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-rose-500/10 via-orange-500/5 to-transparent rounded-3xl blur-3xl" />
        <div className="relative space-y-3 pb-4">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="absolute inset-0 bg-rose-500/20 blur-xl rounded-full" />
                  <div className="relative bg-gradient-to-br from-rose-500/10 to-orange-500/10 p-3 rounded-2xl border border-rose-500/20 backdrop-blur-sm">
                    <Tag className="h-8 w-8 text-rose-600" />
                  </div>
                </div>
                <div>
                  <h1 className="text-5xl font-bold tracking-tight bg-gradient-to-br from-rose-600 to-orange-600 bg-clip-text text-transparent">
                    Coupon Management
                  </h1>
                  <div className="flex items-center gap-2 mt-2">
                    <Sparkles className="h-4 w-4 text-rose-600" />
                    <p className="text-muted-foreground font-medium">
                      Manage discount codes • {data.stats.active} active promotions
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-3">
              <RainbowButton variant="green" className="gap-2" asChild>
                <Link href="/admin/coupons/new">
                  <Plus className="h-4 w-4" />
                  Create Coupon
                </Link>
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Active Coupons Card */}
        <Card className="border-border hover:shadow-xl hover:shadow-green-500/5 transition-all duration-300 hover:-translate-y-1 group overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <CardContent className="p-6 relative">
            <div className="flex items-start justify-between">
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Active Coupons</p>
                  <div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
                </div>
                <div className="flex items-baseline gap-2">
                  <p className="text-4xl font-bold text-green-600">{data.stats.active}</p>
                </div>
                <p className="text-xs text-muted-foreground">Currently valid</p>
              </div>
              <div className="relative">
                <div className="absolute inset-0 bg-green-500/20 blur-lg rounded-full" />
                <div className="relative bg-green-500/10 p-3 rounded-xl border border-green-500/20">
                  <ToggleRight className="h-7 w-7 text-green-600" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Total Usage Card */}
        <Card className="border-border hover:shadow-xl hover:shadow-blue-500/5 transition-all duration-300 hover:-translate-y-1 group overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <CardContent className="p-6 relative">
            <div className="flex items-start justify-between">
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Total Usage</p>
                  <div className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse" />
                </div>
                <div className="flex items-baseline gap-2">
                  <p className="text-4xl font-bold text-blue-600">{data.stats.totalUsage}</p>
                </div>
                <p className="text-xs text-muted-foreground">Times redeemed</p>
              </div>
              <div className="relative">
                <div className="absolute inset-0 bg-blue-500/20 blur-lg rounded-full" />
                <div className="relative bg-blue-500/10 p-3 rounded-xl border border-blue-500/20">
                  <Percent className="h-7 w-7 text-blue-600" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Average Usage Rate Card */}
        <Card className="border-border hover:shadow-xl hover:shadow-purple-500/5 transition-all duration-300 hover:-translate-y-1 group overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <CardContent className="p-6 relative">
            <div className="flex items-start justify-between">
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Avg. Usage Rate</p>
                  <TrendingUp className="h-3.5 w-3.5 text-purple-600" />
                </div>
                <div className="flex items-baseline gap-2">
                  <p className="text-4xl font-bold bg-gradient-to-br from-purple-600 to-pink-600 bg-clip-text text-transparent">
                    {data.stats.averageUsageRate}%
                  </p>
                </div>
                <p className="text-xs text-muted-foreground">Redemption rate</p>
              </div>
              <div className="relative">
                <div className="absolute inset-0 bg-purple-500/20 blur-lg rounded-full" />
                <div className="relative bg-purple-500/10 p-3 rounded-xl border border-purple-500/20">
                  <TrendingUp className="h-7 w-7 text-purple-600" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Coupons List */}
      <div className="pb-8">
        <CouponsList coupons={data.coupons} />
      </div>
    </div>
  );
}
