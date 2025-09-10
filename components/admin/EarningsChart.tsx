"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { TrendingUp } from "lucide-react";

type TimeRange = "weekly" | "monthly" | "yearly";

export default function EarningsChart() {
  const [timeRange, setTimeRange] = useState<TimeRange>("monthly");
  const [chartData, setChartData] = useState<any[]>([]);

  // Mock data - in production, fetch from API
  useEffect(() => {
    const generateData = () => {
      switch (timeRange) {
        case "weekly":
          return [
            { name: "Mon", earnings: 15000 },
            { name: "Tue", earnings: 18000 },
            { name: "Wed", earnings: 22000 },
            { name: "Thu", earnings: 25000 },
            { name: "Fri", earnings: 32000 },
            { name: "Sat", earnings: 38000 },
            { name: "Sun", earnings: 30000 },
          ];
        case "monthly":
          return [
            { name: "Jan", earnings: 120000 },
            { name: "Feb", earnings: 150000 },
            { name: "Mar", earnings: 180000 },
            { name: "Apr", earnings: 220000 },
            { name: "May", earnings: 280000 },
            { name: "Jun", earnings: 320000 },
            { name: "Jul", earnings: 380000 },
            { name: "Aug", earnings: 420000 },
            { name: "Sep", earnings: 480000 },
          ];
        case "yearly":
          return [
            { name: "2021", earnings: 1200000 },
            { name: "2022", earnings: 1800000 },
            { name: "2023", earnings: 2400000 },
            { name: "2024", earnings: 3200000 },
          ];
        default:
          return [];
      }
    };

    setChartData(generateData());
  }, [timeRange]);

  const formatYAxisTick = (value: number) => {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `$${(value / 1000).toFixed(0)}K`;
    }
    return `$${value}`;
  };

  const formatTooltipValue = (value: number) => {
    return `$${value.toLocaleString()}`;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <CardTitle>📈 Earnings Graph</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </div>
          <Tabs value={timeRange} onValueChange={(v) => setTimeRange(v as TimeRange)}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="weekly">Weekly</TabsTrigger>
              <TabsTrigger value="monthly">Monthly</TabsTrigger>
              <TabsTrigger value="yearly">Yearly</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={chartData}
              margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200" />
              <XAxis 
                dataKey="name" 
                className="text-xs"
                tick={{ fill: '#6b7280' }}
              />
              <YAxis 
                className="text-xs"
                tick={{ fill: '#6b7280' }}
                tickFormatter={formatYAxisTick}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#ffffff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '6px'
                }}
                labelStyle={{ color: '#374151' }}
                formatter={formatTooltipValue}
              />
              <Area
                type="monotone"
                dataKey="earnings"
                stroke="#3b82f6"
                fill="#3b82f6"
                fillOpacity={0.1}
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
