import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/lib/db";
import { coupons } from "@/lib/db/schema";
import { desc } from "drizzle-orm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import CouponsList from "@/components/admin/CouponsList";
import { DollarSign, Plus, Percent, TrendingUp, ToggleRight } from "lucide-react";
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

  const data = await getCouponsData();
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <DollarSign className="h-8 w-8 text-primary" />
            Coupon Management
          </h1>
          <p className="text-gray-600 mt-2">
            Manage discount codes and promotions
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/coupons/new">
            <Plus className="h-4 w-4 mr-2" />
            Create Coupon
          </Link>
        </Button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Coupons</p>
                <p className="text-2xl font-bold text-green-600">{data.stats.active}</p>
              </div>
              <ToggleRight className="h-8 w-8 text-green-400" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Usage</p>
                <p className="text-2xl font-bold text-blue-600">{data.stats.totalUsage}</p>
              </div>
              <Percent className="h-8 w-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg. Usage Rate</p>
                <p className="text-2xl font-bold text-orange-600">
                  {data.stats.averageUsageRate}%
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-orange-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Coupons List */}
      <CouponsList coupons={data.coupons} />
    </div>
  );
}
