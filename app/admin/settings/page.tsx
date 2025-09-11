import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Settings, Globe, Mail, Bell, Database } from "lucide-react";
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Unauthorized Access</h1>
          <p className="text-gray-600 mb-4">You do not have permission to access this area.</p>
          <Link href="/" className="text-blue-600 hover:underline">
            Return to Home
          </Link>
        </div>
      </div>
    );
  }

  const initialSettings = await getSettings();
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
          <Settings className="h-8 w-8 text-primary" />
          Platform Settings
        </h1>
        <p className="text-gray-600 mt-2">Configure platform preferences and integrations</p>
      </div>

      {/* Settings Form */}
      <SettingsForm initialSettings={initialSettings} />
    </div>
  );
}
