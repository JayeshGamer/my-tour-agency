import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { Sparkles, Sliders, Settings2, Zap } from "lucide-react";
import Link from "next/link";
import SettingsForm from "@/components/admin/SettingsForm";

async function getSettings() {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/admin/settings`, {
      cache: 'no-store'
    });
    
    if (response.ok) {
      const data = await response.json();
      return data.settings;
    }
  } catch (error) {
    console.error('Failed to load settings:', error);
  }
  
  // Return default settings if fetch fails
  return {
    siteName: "Travel Agency",
    siteDescription: "Discover and book unforgettable tours worldwide",
    supportEmail: "support@touragency.com",
    timeZone: "UTC",
    emailNotifications: true,
    marketingEmails: false,
    newBookingAlerts: true,
    paymentFailureAlerts: true,
    systemErrorAlerts: true,
    apiRateLimit: true,
    maxRequestsPerMinute: 100,
    allowGuestBooking: true,
    requireEmailVerification: false,
    autoApproveBookings: false,
    maintenanceMode: false
  };
}

export default async function SettingsPage() {
  // Check authentication and admin role
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user || session.user.role !== 'Admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-destructive mb-4">Unauthorized Access</h1>
          <p className="text-muted-foreground mb-4">You do not have permission to access this area.</p>
          <Link href="/" className="text-primary hover:underline">
            Return to Home
          </Link>
        </div>
      </div>
    );
  }

  const initialSettings = await getSettings();
  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      {/* Enhanced Page Header with gradient */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-pink-500/5 to-transparent rounded-3xl blur-3xl" />
        <div className="relative space-y-3 pb-4">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="absolute inset-0 bg-purple-500/20 blur-xl rounded-full" />
                  <div className="relative bg-gradient-to-br from-purple-500/10 to-pink-500/10 p-3 rounded-2xl border border-purple-500/20 backdrop-blur-sm">
                    <Settings2 className="h-8 w-8 text-purple-600 dark:text-purple-400" />
                  </div>
                </div>
                <div>
                  <h1 className="text-5xl font-bold tracking-tight bg-gradient-to-br from-purple-600 to-pink-600 bg-clip-text text-transparent">
                    Platform Settings
                  </h1>
                  <div className="flex items-center gap-2 mt-2">
                    <Zap className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                    <p className="text-muted-foreground font-medium">
                      Configure platform preferences and integrations
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Settings Form */}
      <div className="pb-8">
        <SettingsForm initialSettings={initialSettings} />
      </div>
    </div>
  );
}
