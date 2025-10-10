"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { TrendingUp, DollarSign } from "lucide-react";

type ChartType = "area" | "line";

interface ModernEarningsChartProps {
  data: Array<{
    name: string;
    earnings: number;
    bookings?: number;
  }>;
  title?: string;
}

export default function ModernEarningsChart({ data, title = "Revenue Overview" }: ModernEarningsChartProps) {
  const [chartType, setChartType] = useState<ChartType>("area");

  const formatYAxis = (value: number) => {
    if (value >= 1000000) return `₹${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `₹${(value / 1000).toFixed(0)}K`;
    return `₹${value}`;
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card border border-border rounded-lg shadow-lg p-3">
          <p className="font-semibold text-foreground mb-1">{payload[0].payload.name}</p>
          <p className="text-sm text-blue-600">
            Revenue: <span className="font-semibold">₹{payload[0].value.toLocaleString('en-IN')}</span>
          </p>
          {payload[0].payload.bookings && (
            <p className="text-sm text-purple-600">
              Bookings: <span className="font-semibold">{payload[0].payload.bookings}</span>
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="border-border/50 shadow-sm">
      <CardHeader>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 ring-1 ring-blue-400/20">
              <TrendingUp className="h-5 w-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-xl font-bold">{title}</CardTitle>
              <p className="text-sm text-muted-foreground mt-0.5">Track your business performance</p>
            </div>
          </div>
          <Tabs value={chartType} onValueChange={(v) => setChartType(v as ChartType)}>
            <TabsList className="bg-muted">
              <TabsTrigger value="area" className="text-xs">Area</TabsTrigger>
              <TabsTrigger value="line" className="text-xs">Line</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            {chartType === "area" ? (
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorEarnings" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                <XAxis
                  dataKey="name"
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={formatYAxis}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="earnings"
                  stroke="#3b82f6"
                  strokeWidth={3}
                  fill="url(#colorEarnings)"
                />
              </AreaChart>
            ) : (
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                <XAxis
                  dataKey="name"
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={formatYAxis}
                />
                <Tooltip content={<CustomTooltip />} />
                <Line
                  type="monotone"
                  dataKey="earnings"
                  stroke="#3b82f6"
                  strokeWidth={3}
                  dot={{ fill: "#3b82f6", r: 5 }}
                  activeDot={{ r: 7, fill: "#8b5cf6" }}
                />
              </LineChart>
            )}
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
