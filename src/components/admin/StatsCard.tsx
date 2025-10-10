"use client";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import {
  CalendarCheck,
  Package,
  DollarSign,
  Users,
  LucideIcon,
} from "lucide-react";

const iconMap: Record<string, LucideIcon> = {
  CalendarCheck,
  Package,
  DollarSign,
  Users,
};

const iconColorMap: Record<string, string> = {
  CalendarCheck: "bg-gradient-to-br from-blue-500 to-cyan-600",
  Package: "bg-gradient-to-br from-purple-500 to-pink-600",
  DollarSign: "bg-gradient-to-br from-green-500 to-emerald-600",
  Users: "bg-gradient-to-br from-orange-500 to-red-600",
};

interface StatsCardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
  icon: string;
  iconColor?: string;
  delay?: number;
}

export default function StatsCard({
  title,
  value,
  change,
  changeType = "neutral",
  icon,
  iconColor = "text-foreground",
  delay = 0
}: StatsCardProps) {
  const Icon = iconMap[icon] || Package;
  const gradientBg = iconColorMap[icon] || "bg-gradient-to-br from-gray-500 to-gray-600";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
    >
      <Card className="relative overflow-hidden border-border/50 bg-card hover:shadow-lg transition-all duration-300 group">
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary/5 to-transparent rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500" />

        <CardContent className="p-6 relative">
          <div className="flex items-start justify-between">
            <div className="space-y-2 flex-1">
              <p className="text-sm font-medium text-muted-foreground">{title}</p>
              <div className="space-y-1">
                <h3 className="text-3xl font-bold tracking-tight text-foreground">
                  {value}
                </h3>
                {change && (
                  <p className={cn(
                    "text-xs font-medium flex items-center gap-1",
                    changeType === "positive" && "text-green-600 dark:text-green-400",
                    changeType === "negative" && "text-red-600 dark:text-red-400",
                    changeType === "neutral" && "text-muted-foreground"
                  )}>
                    {change}
                  </p>
                )}
              </div>
            </div>
            <div className={cn(
              "p-3 rounded-xl ring-1 ring-white/20 group-hover:scale-110 transition-transform duration-300 shadow-lg",
              gradientBg
            )}>
              <Icon className="h-6 w-6 text-white" />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
