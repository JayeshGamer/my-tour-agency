"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Plus, FileText, Users, Bell, Settings, Package } from "lucide-react";
import { motion } from "framer-motion";

const actions = [
  {
    label: "New Tour",
    href: "/admin/tours/new",
    icon: Plus,
    color: "bg-blue-500/10 text-blue-600 hover:bg-blue-500/20",
  },
  {
    label: "View Bookings",
    href: "/admin/bookings",
    icon: FileText,
    color: "bg-green-500/10 text-green-600 hover:bg-green-500/20",
  },
  {
    label: "Manage Users",
    href: "/admin/users",
    icon: Users,
    color: "bg-purple-500/10 text-purple-600 hover:bg-purple-500/20",
  },
  {
    label: "Notifications",
    href: "/admin/notifications",
    icon: Bell,
    color: "bg-orange-500/10 text-orange-600 hover:bg-orange-500/20",
  },
  {
    label: "Tour Requests",
    href: "/admin/custom-tour-requests",
    icon: Package,
    color: "bg-pink-500/10 text-pink-600 hover:bg-pink-500/20",
  },
  {
    label: "Settings",
    href: "/admin/settings",
    icon: Settings,
    color: "bg-gray-500/10 text-gray-600 hover:bg-gray-500/20",
  },
];

export default function QuickActions() {
  return (
    <Card className="border-border/50 shadow-sm">
      <CardContent className="p-6">
        <h3 className="text-lg font-bold mb-4 text-foreground">Quick Actions</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {actions.map((action, index) => (
            <motion.div
              key={action.href}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.2, delay: index * 0.05 }}
            >
              <Button
                asChild
                variant="outline"
                className="w-full h-auto flex-col gap-2 py-4 border-border/50 hover:shadow-md transition-all"
              >
                <Link href={action.href}>
                  <div className={`p-2 rounded-lg ${action.color} transition-colors`}>
                    <action.icon className="h-5 w-5" />
                  </div>
                  <span className="text-xs font-medium text-foreground">{action.label}</span>
                </Link>
              </Button>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

