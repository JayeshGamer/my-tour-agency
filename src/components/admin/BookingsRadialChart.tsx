"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadialChart } from "@/components/ui/radial-chart";
import { Calendar } from "lucide-react";

interface BookingsRadialChartProps {
  confirmed: number;
  pending: number;
  cancelled: number;
}

export default function BookingsRadialChart({ confirmed, pending, cancelled }: BookingsRadialChartProps) {
  const total = confirmed + pending + cancelled;

  const data = [
    {
      name: "Confirmed",
      value: total > 0 ? Math.round((confirmed / total) * 100) : 0,
      fill: "#10b981",
    },
    {
      name: "Pending",
      value: total > 0 ? Math.round((pending / total) * 100) : 0,
      fill: "#f59e0b",
    },
    {
      name: "Cancelled",
      value: total > 0 ? Math.round((cancelled / total) * 100) : 0,
      fill: "#ef4444",
    },
  ];

  return (
    <Card className="border-border/50 shadow-sm">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 ring-1 ring-green-400/20">
            <Calendar className="h-5 w-5 text-white" />
          </div>
          <div>
            <CardTitle className="text-xl font-bold">Booking Status</CardTitle>
            <p className="text-sm text-muted-foreground mt-0.5">Distribution overview</p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[280px] w-full">
          <RadialChart data={data} />
        </div>
        <div className="grid grid-cols-3 gap-4 mt-6">
          <div className="text-center space-y-1">
            <p className="text-2xl font-bold text-green-600">{confirmed}</p>
            <div className="flex items-center justify-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <p className="text-xs text-muted-foreground">Confirmed</p>
            </div>
          </div>
          <div className="text-center space-y-1">
            <p className="text-2xl font-bold text-orange-600">{pending}</p>
            <div className="flex items-center justify-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-orange-500"></div>
              <p className="text-xs text-muted-foreground">Pending</p>
            </div>
          </div>
          <div className="text-center space-y-1">
            <p className="text-2xl font-bold text-red-600">{cancelled}</p>
            <div className="flex items-center justify-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <p className="text-xs text-muted-foreground">Cancelled</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
