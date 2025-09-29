"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
  LayoutDashboard, 
  CalendarCheck, 
  Map, 
  MessageSquare, 
  Users, 
  FileText, 
  LogOut,
  MapPin,
  CreditCard,
  AlertTriangle,
  Settings,
  Bell,
  DollarSign,
  Shield,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { signOut } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface AdminNavigationProps {
  user: {
    name?: string | null;
    email: string;
  };
}

const navSections = [
  {
    title: "Main",
    items: [
      {
        label: "Dashboard",
        href: "/admin/dashboard",
        icon: LayoutDashboard,
        description: "Overview and analytics",
      },
      {
        label: "Notifications",
        href: "/admin/notifications",
        icon: Bell,
        description: "System alerts and updates",
        badge: 5,
      },
    ],
  },
  {
    title: "Management",
    items: [
      {
        label: "Tours",
        href: "/admin/tours",
        icon: Map,
        description: "Manage tour packages",
      },
      {
        label: "Bookings",
        href: "/admin/bookings",
        icon: CalendarCheck,
        description: "View and manage bookings",
      },
      {
        label: "Users",
        href: "/admin/users",
        icon: Users,
        description: "Manage user accounts",
      },
      {
        label: "Reviews",
        href: "/admin/reviews",
        icon: MessageSquare,
        description: "Moderate user reviews",
        badge: 3,
      },
    ],
  },
  {
    title: "Financial",
    items: [
      {
        label: "Payments",
        href: "/admin/payments",
        icon: CreditCard,
        description: "Stripe transactions",
      },
      {
        label: "Coupons",
        href: "/admin/coupons",
        icon: DollarSign,
        description: "Manage discount codes",
      },
    ],
  },
  {
    title: "System",
    items: [
      {
        label: "Logs",
        href: "/admin/logs",
        icon: FileText,
        description: "System activity logs",
      },
      {
        label: "Errors",
        href: "/admin/errors",
        icon: AlertTriangle,
        description: "Error monitoring",
        badge: 2,
      },
      {
        label: "Settings",
        href: "/admin/settings",
        icon: Settings,
        description: "Platform configuration",
      },
    ],
  },
];

export default function AdminNavigation({ user }: AdminNavigationProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
  };

  const getUserInitials = () => {
    if (user.name) {
      return user.name.split(' ').map(n => n[0]).join('').toUpperCase();
    }
    return user.email[0].toUpperCase();
  };

  return (
    <aside className={cn(
      "bg-white border-r border-gray-200 flex flex-col transition-all duration-300",
      isCollapsed ? "w-20" : "w-64"
    )}>
      {/* Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200">
        <Link href="/admin/dashboard" className="flex items-center space-x-2">
          <Shield className="h-8 w-8 text-primary" />
          {!isCollapsed && (
            <div>
              <span className="text-lg font-bold">Admin Panel</span>
              <p className="text-xs text-gray-500">Tour Management</p>
            </div>
          )}
        </Link>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="ml-auto"
        >
          {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4">
        {navSections.map((section) => (
          <div key={section.title} className="mb-6">
            {!isCollapsed && (
              <h3 className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                {section.title}
              </h3>
            )}
            <div className="space-y-1">
              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center justify-between px-4 py-2.5 text-sm font-medium transition-colors",
                      isActive
                        ? "bg-primary/10 text-primary border-r-2 border-primary"
                        : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                    )}
                  >
                    <div className="flex items-center space-x-3">
                      <Icon className={cn(
                        "flex-shrink-0",
                        isCollapsed ? "h-5 w-5" : "h-4 w-4"
                      )} />
                      {!isCollapsed && (
                        <div className="flex-1">
                          <span className="block">{item.label}</span>
                          <span className="text-xs text-gray-500">{item.description}</span>
                        </div>
                      )}
                    </div>
                    {!isCollapsed && item.badge && (
                      <span className="bg-red-100 text-red-600 text-xs font-bold px-2 py-1 rounded-full">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* User Section */}
      <div className="border-t border-gray-200 p-4">
        <div className={cn(
          "flex items-center",
          isCollapsed ? "justify-center" : "space-x-3"
        )}>
          <Avatar className={isCollapsed ? "h-8 w-8" : "h-10 w-10"}>
            <AvatarImage src="" alt={user.name || user.email} />
            <AvatarFallback className="bg-primary/10 text-primary">
              {getUserInitials()}
            </AvatarFallback>
          </Avatar>
          {!isCollapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {user.name || 'Admin User'}
              </p>
              <p className="text-xs text-gray-500 truncate">
                {user.email}
              </p>
            </div>
          )}
          {!isCollapsed && (
            <Button
              variant="ghost"
              size="icon"
              onClick={handleSignOut}
              className="text-gray-500 hover:text-red-600"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          )}
        </div>
        {isCollapsed && (
          <Button
            variant="ghost"
            size="icon"
            onClick={handleSignOut}
            className="w-full mt-2 text-gray-500 hover:text-red-600"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        )}
      </div>
    </aside>
  );
}
