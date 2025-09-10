"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { 
  Users, 
  UserPlus, 
  TrendingUp, 
  Globe, 
  ShoppingCart,
  ChevronDown 
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface CustomerRetentionProps {
  newUsers: number;
  returningUsers: number;
}

export default function CustomerRetention({
  newUsers,
  returningUsers,
}: CustomerRetentionProps) {
  const totalUsers = newUsers + returningUsers;
  const returningPercentage = totalUsers > 0 ? (returningUsers / totalUsers) * 100 : 0;
  const newPercentage = totalUsers > 0 ? (newUsers / totalUsers) * 100 : 0;

  // Mock data for additional metrics
  const metrics = {
    topSource: "Google Ads",
    mostActiveRegion: "UK",
    avgBookingsPerUser: 1.7,
    monthlyGrowth: 12.5,
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            📊 Customer Retention
          </CardTitle>
          <ChevronDown className="h-4 w-4 text-gray-400" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* User Distribution */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Returning Users
                </span>
                <span className="text-2xl font-bold text-green-600">
                  {returningPercentage.toFixed(0)}%
                </span>
              </div>
              <Progress value={returningPercentage} className="h-2" />
              <p className="text-xs text-gray-500">{returningUsers} users</p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium flex items-center gap-2">
                  <UserPlus className="h-4 w-4" />
                  New Users
                </span>
                <span className="text-2xl font-bold text-blue-600">
                  {newPercentage.toFixed(0)}%
                </span>
              </div>
              <Progress value={newPercentage} className="h-2" />
              <p className="text-xs text-gray-500">{newUsers} users</p>
            </div>
          </div>

          <div className="border-t pt-4" />

          {/* Key Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <TrendingUp className="h-5 w-5 text-green-500" />
              </div>
              <p className="text-xs text-gray-500">Top Source</p>
              <p className="font-semibold">{metrics.topSource}</p>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Globe className="h-5 w-5 text-blue-500" />
              </div>
              <p className="text-xs text-gray-500">Most Active Region</p>
              <p className="font-semibold">{metrics.mostActiveRegion}</p>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <ShoppingCart className="h-5 w-5 text-purple-500" />
              </div>
              <p className="text-xs text-gray-500">Avg. Bookings/User</p>
              <p className="font-semibold">{metrics.avgBookingsPerUser}</p>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Badge variant="secondary" className="bg-green-100 text-green-700">
                  +{metrics.monthlyGrowth}%
                </Badge>
              </div>
              <p className="text-xs text-gray-500">Monthly Growth</p>
              <p className="font-semibold">Trending Up</p>
            </div>
          </div>

          {/* Additional Insights */}
          <div className="bg-gray-50 rounded-lg p-4 space-y-2">
            <h4 className="font-medium text-sm">Key Insights</h4>
            <ul className="space-y-1 text-sm text-gray-600">
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-1">•</span>
                <span>Customer retention rate has improved by 8% this month</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500 mt-1">•</span>
                <span>UK region shows highest engagement with 32% of total bookings</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-500 mt-1">•</span>
                <span>Email campaigns driving 45% of returning customer bookings</span>
              </li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
