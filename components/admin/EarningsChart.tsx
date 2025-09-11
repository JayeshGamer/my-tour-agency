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

interface EarningsChartProps {
  earningsData?: Array<{
    period: string;
    earnings: number;
    timeRange: TimeRange;
  }>;
}

export default function EarningsChart({ earningsData }: EarningsChartProps) {
  const [timeRange, setTimeRange] = useState<TimeRange>("monthly");
  const [chartData, setChartData] = useState<any[]>([]);

  useEffect(() => {
    if (earningsData) {
      // Use real data from props
      const filteredData = earningsData
        .filter(item => item.timeRange === timeRange)
        .map(item => ({
          name: item.period,
          earnings: item.earnings
        }));
      setChartData(filteredData);
    } else {
      // Fallback to mock data if no real data is provided
      const generateMockData = () => {
        switch (timeRange) {
          case "weekly":
            return [
              { name: "Mon", earnings: 1500 },
              { name: "Tue", earnings: 1800 },
              { name: "Wed", earnings: 2200 },
              { name: "Thu", earnings: 2500 },
              { name: "Fri", earnings: 3200 },
              { name: "Sat", earnings: 3800 },
              { name: "Sun", earnings: 3000 },
            ];
          case "monthly":
            return [
              { name: "Jan", earnings: 12000 },
              { name: "Feb", earnings: 15000 },
              { name: "Mar", earnings: 18000 },
              { name: "Apr", earnings: 22000 },
              { name: "May", earnings: 28000 },
              { name: "Jun", earnings: 32000 },
              { name: "Jul", earnings: 38000 },
              { name: "Aug", earnings: 42000 },
              { name: "Sep", earnings: 48000 },
            ];
          case "yearly":
            return [
              { name: "2021", earnings: 120000 },
              { name: "2022", earnings: 180000 },
              { name: "2023", earnings: 240000 },
              { name: "2024", earnings: 320000 },
            ];
          default:
            return [];
        }
      };
      setChartData(generateMockData());
    }
  }, [timeRange, earningsData]);

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
