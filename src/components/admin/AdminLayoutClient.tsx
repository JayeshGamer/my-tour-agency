"use client";

import { useState, useEffect } from "react";
import AdminNavigation from "../../components/admin/AdminNavigation";
import HydrationSafe from "@/components/ui/HydrationSafe";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";

interface AdminLayoutClientProps {
  children: React.ReactNode;
  user: {
    name?: string | null;
    email: string;
  };
}

export default function AdminLayoutClient({ children, user }: AdminLayoutClientProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  useEffect(() => {
    // Subscribe to custom event for sidebar state changes
    const handleSidebarToggle = ((event: CustomEvent) => {
      setSidebarCollapsed(event.detail.collapsed);
    }) as EventListener;

    window.addEventListener('sidebarToggle', handleSidebarToggle);
    return () => window.removeEventListener('sidebarToggle', handleSidebarToggle);
  }, []);

  const toggleSidebar = () => {
    const newState = !sidebarCollapsed;
    setSidebarCollapsed(newState);
    // Dispatch custom event to sync with AdminNavigation
    window.dispatchEvent(new CustomEvent('sidebarToggle', {
      detail: { collapsed: newState }
    }));
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar Container - Conditionally render based on collapsed state */}
      <AnimatePresence mode="wait">
        {!sidebarCollapsed && (
          <HydrationSafe
            fallback={
              <div className="w-72 flex-shrink-0" />
            }
          >
            <AdminNavigation user={user} />
          </HydrationSafe>
        )}
      </AnimatePresence>

      {/* Toggle Button (visible when sidebar is collapsed) - Always rendered here */}
      <AnimatePresence>
        {sidebarCollapsed && (
          <motion.div
            initial={{ x: -64 }}
            animate={{ x: 0 }}
            exit={{ x: -64 }}
            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
            className="fixed left-0 top-4 z-[60]"
          >
            <Button
              onClick={toggleSidebar}
              size="icon"
              className="h-12 w-12 rounded-r-xl rounded-l-none shadow-lg bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content Area - Expands to full width when sidebar is collapsed */}
      <motion.div
        className="flex-1 flex flex-col min-w-0"
        animate={{
          marginLeft: sidebarCollapsed ? 0 : 0,
        }}
        transition={{
          duration: 0.3,
          ease: [0.4, 0, 0.2, 1]
        }}
      >
        <main className="flex-1 p-4 md:p-6 lg:p-8">
          <div className="max-w-[1600px] mx-auto">
            {children}
          </div>
        </main>
        <footer className="bg-card border-t border-border py-4 mt-auto">
          <div className="max-w-[1600px] mx-auto px-4 md:px-6 lg:px-8 text-center">
            <p className="text-sm text-muted-foreground">
              Admin Dashboard v2.0 • {new Date().getFullYear()} Tour Agency Platform
            </p>
          </div>
        </footer>
      </motion.div>
    </div>
  );
}
