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
  ChevronLeft,
  ChevronRight,
  Package,
  ChevronDown,
  ChevronUp,
  Menu
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { signOut } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { motion, AnimatePresence, type Variants } from "framer-motion";

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
        description: "System alerts",
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
        description: "Manage tours",
      },
      {
        label: "Tour Requests",
        href: "/admin/custom-tour-requests",
        icon: MapPin,
        description: "Custom requests",
        badge: 2,
      },
      {
        label: "Bookings",
        href: "/admin/bookings",
        icon: CalendarCheck,
        description: "View bookings",
      },
      {
        label: "Users",
        href: "/admin/users",
        icon: Users,
        description: "Manage users",
      },
      {
        label: "Reviews",
        href: "/admin/reviews",
        icon: MessageSquare,
        description: "Moderate reviews",
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
        description: "Transactions",
      },
      {
        label: "Coupons",
        href: "/admin/coupons",
        icon: DollarSign,
        description: "Discount codes",
      },
    ],
  },
  {
    title: "System",
    items: [
      {
        label: "Errors",
        href: "/admin/errors",
        icon: AlertTriangle,
        description: "Error logs",
      },
      {
        label: "System Logs",
        href: "/admin/logs",
        icon: FileText,
        description: "Activity logs",
      },
      {
        label: "Settings",
        href: "/admin/settings",
        icon: Settings,
        description: "Configuration",
      },
    ],
  },
];

export default function AdminNavigation({ user }: AdminNavigationProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    Main: true,
    Management: true,
    Financial: true,
    System: true,
  });

  // Listen for external toggle events
  useEffect(() => {
    const handleExternalToggle = ((event: CustomEvent) => {
      setCollapsed(event.detail.collapsed);
    }) as EventListener;

    window.addEventListener('sidebarToggle', handleExternalToggle);
    return () => window.removeEventListener('sidebarToggle', handleExternalToggle);
  }, []);

  const handleSignOut = async () => {
    await signOut();
    router.push("/login");
  };

  const toggleSection = (sectionTitle: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionTitle]: !prev[sectionTitle]
    }));
  };

  const toggleSidebar = () => {
    const newState = !collapsed;
    setCollapsed(newState);
    // Dispatch custom event to sync with layout
    window.dispatchEvent(new CustomEvent('sidebarToggle', {
      detail: { collapsed: newState }
    }));
  };

  const sidebarVariants = {
    expanded: { x: 0 },
    collapsed: { x: -288 }
  };

  const sectionVariants: Variants = {
    hidden: {
      opacity: 0,
      height: 0,
      transition: {
        duration: 0.2,
        ease: "easeInOut"
      }
    },
    visible: {
      opacity: 1,
      height: "auto",
      transition: {
        duration: 0.3,
        ease: "easeInOut",
        staggerChildren: 0.05
      }
    }
  };

  const itemVariants: Variants = {
    hidden: {
      opacity: 0,
      x: -20,
      transition: {
        duration: 0.2
      }
    },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.2,
        ease: "easeOut"
      }
    }
  };

  return (
    <>
      {/* Sidebar */}
      <motion.div
        initial={{ x: 0 }}
        animate={{ x: 0 }}
        exit={{ x: -288 }}
        transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
        className="sticky left-0 top-0 h-screen w-72 bg-card border-r border-border flex flex-col z-50 shadow-lg overflow-hidden"
      >
        {/* Header */}
        <div className="p-4 border-b border-border flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 overflow-hidden">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-md flex-shrink-0">
                <Package className="h-5 w-5 text-white" />
              </div>
              <div className="min-w-0">
                <h2 className="font-bold text-foreground text-sm whitespace-nowrap">Admin Panel</h2>
                <p className="text-xs text-muted-foreground whitespace-nowrap">Tour Agency</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleSidebar}
              className="h-8 w-8 ml-auto hover:bg-accent transition-colors flex-shrink-0"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* User Profile */}
        <div className="p-4 border-b border-border flex-shrink-0">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10 border-2 border-border shadow-sm flex-shrink-0">
              <AvatarFallback className="bg-gradient-to-br from-orange-500 to-red-600 text-white font-semibold">
                {user.name?.[0]?.toUpperCase() || user.email[0].toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0 overflow-hidden">
              <p className="text-sm font-semibold text-foreground truncate">
                {user.name || "Admin"}
              </p>
              <p className="text-xs text-muted-foreground truncate">{user.email}</p>
            </div>
          </div>
        </div>

        {/* Navigation - Scrollable Area */}
        <ScrollArea className="flex-1 min-h-0">
          <div className="px-3 py-4">
            <nav className="space-y-6">
              {navSections.map((section, sectionIndex) => (
                <div key={section.title}>
                  <button
                    onClick={() => toggleSection(section.title)}
                    className="w-full flex items-center justify-between px-3 mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider hover:text-foreground transition-colors"
                  >
                    <span>{section.title}</span>
                    {expandedSections[section.title] ? (
                      <ChevronUp className="h-3 w-3 flex-shrink-0" />
                    ) : (
                      <ChevronDown className="h-3 w-3 flex-shrink-0" />
                    )}
                  </button>

                  <AnimatePresence mode="wait">
                    {expandedSections[section.title] && (
                      <motion.div
                        initial="hidden"
                        animate="visible"
                        exit="hidden"
                        variants={sectionVariants}
                        className="space-y-1 overflow-hidden"
                      >
                        {section.items.map((item, itemIndex) => {
                          const isActive = pathname === item.href;
                          const Icon = item.icon;

                          return (
                            <motion.div
                              key={item.href}
                              variants={itemVariants}
                              custom={itemIndex}
                            >
                              <Link
                                href={item.href}
                                className={cn(
                                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                                  "hover:bg-accent hover:text-accent-foreground",
                                  isActive
                                    ? "bg-gradient-to-r from-primary to-primary/80 text-primary-foreground shadow-md"
                                    : "text-muted-foreground hover:scale-105"
                                )}
                              >
                                <Icon className="h-5 w-5 flex-shrink-0" />
                                <span className="flex-1 truncate">{item.label}</span>
                                {item.badge && (
                                  <Badge
                                    variant="secondary"
                                    className="h-5 min-w-5 flex items-center justify-center px-1.5 text-xs animate-pulse flex-shrink-0 ml-2"
                                  >
                                    {item.badge}
                                  </Badge>
                                )}
                              </Link>
                            </motion.div>
                          );
                        })}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </nav>
          </div>
        </ScrollArea>

        {/* Logout Button */}
        <div className="p-4 border-t border-border flex-shrink-0">
          <Button
            onClick={handleSignOut}
            variant="outline"
            className="w-full justify-start gap-3 text-muted-foreground hover:text-foreground hover:bg-destructive/10 hover:border-destructive/20 transition-all"
          >
            <LogOut className="h-5 w-5 flex-shrink-0" />
            <span className="truncate">Sign Out</span>
          </Button>
        </div>
      </motion.div>

      {/* Overlay (when sidebar is open on mobile) */}
      <AnimatePresence>
        {!collapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 lg:hidden"
            onClick={toggleSidebar}
          />
        )}
      </AnimatePresence>
    </>
  );
}
