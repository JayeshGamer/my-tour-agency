import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { settings } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { headers } from "next/headers";

// Get all settings
export async function GET() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user || session.user.role !== "Admin") {
      return new Response(
        JSON.stringify({ error: "Unauthorized - Admin access required" }),
        { status: 401 }
      );
    }

    // Get all settings from database
    const allSettings = await db.select().from(settings);

    // Transform to key-value pairs for easier frontend consumption
    const settingsObject: Record<string, any> = {};
    allSettings.forEach(setting => {
      let value = setting.value;
      
      // Parse value based on type
      if (setting.type === 'boolean') {
        value = value === 'true';
      } else if (setting.type === 'number') {
        value = Number(value);
      } else if (setting.type === 'json' && value) {
        try {
          value = JSON.parse(value);
        } catch {
          // Keep as string if parsing fails
        }
      }
      
      settingsObject[setting.key] = value;
    });

    return new Response(
      JSON.stringify({ settings: settingsObject }),
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error fetching settings:", error);
    return new Response(
      JSON.stringify({ error: "Failed to fetch settings" }),
      { status: 500 }
    );
  }
}

// Update settings
export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user || session.user.role !== "Admin") {
      return new Response(
        JSON.stringify({ error: "Unauthorized - Admin access required" }),
        { status: 401 }
      );
    }

    const { settings: newSettings } = await request.json();

    // Define settings schema with their types and categories
    const settingsSchema = [
      // General
      { key: 'siteName', type: 'string', category: 'general', isPublic: true, description: 'Name of the website' },
      { key: 'siteDescription', type: 'string', category: 'general', isPublic: true, description: 'Description of the website' },
      { key: 'supportEmail', type: 'string', category: 'general', isPublic: true, description: 'Support contact email' },
      { key: 'timeZone', type: 'string', category: 'general', isPublic: false, description: 'Server timezone setting' },
      
      // Email
      { key: 'emailNotifications', type: 'boolean', category: 'email', isPublic: false, description: 'Enable email notifications' },
      { key: 'marketingEmails', type: 'boolean', category: 'email', isPublic: false, description: 'Enable marketing emails' },
      { key: 'smtpHost', type: 'string', category: 'email', isPublic: false, description: 'SMTP server host' },
      { key: 'smtpPort', type: 'number', category: 'email', isPublic: false, description: 'SMTP server port' },
      { key: 'smtpUsername', type: 'string', category: 'email', isPublic: false, description: 'SMTP username' },
      
      // Notifications
      { key: 'newBookingAlerts', type: 'boolean', category: 'notifications', isPublic: false, description: 'Alert admins on new bookings' },
      { key: 'paymentFailureAlerts', type: 'boolean', category: 'notifications', isPublic: false, description: 'Alert admins on payment failures' },
      { key: 'systemErrorAlerts', type: 'boolean', category: 'notifications', isPublic: false, description: 'Alert admins on system errors' },
      
      // API
      { key: 'stripePublishableKey', type: 'string', category: 'api', isPublic: true, description: 'Stripe publishable key' },
      { key: 'googleAnalyticsId', type: 'string', category: 'api', isPublic: true, description: 'Google Analytics tracking ID' },
      { key: 'apiRateLimit', type: 'boolean', category: 'api', isPublic: false, description: 'Enable API rate limiting' },
      { key: 'maxRequestsPerMinute', type: 'number', category: 'api', isPublic: false, description: 'Maximum requests per minute per IP' },
      
      // Features
      { key: 'allowGuestBooking', type: 'boolean', category: 'features', isPublic: true, description: 'Allow bookings without registration' },
      { key: 'requireEmailVerification', type: 'boolean', category: 'features', isPublic: false, description: 'Require email verification for new accounts' },
      { key: 'autoApproveBookings', type: 'boolean', category: 'features', isPublic: false, description: 'Automatically approve new bookings' },
      { key: 'maintenanceMode', type: 'boolean', category: 'features', isPublic: true, description: 'Put site into maintenance mode' },
    ];

    // Process and upsert each setting
    for (const settingDef of settingsSchema) {
      if (newSettings.hasOwnProperty(settingDef.key)) {
        let value = newSettings[settingDef.key];
        
        // Convert value to string for storage
        if (settingDef.type === 'boolean') {
          value = value ? 'true' : 'false';
        } else if (settingDef.type === 'number') {
          value = String(value);
        } else if (settingDef.type === 'json') {
          value = JSON.stringify(value);
        } else {
          value = String(value || '');
        }

        // Check if setting exists
        const existingSetting = await db
          .select()
          .from(settings)
          .where(eq(settings.key, settingDef.key))
          .limit(1);

        if (existingSetting.length > 0) {
          // Update existing setting
          await db
            .update(settings)
            .set({
              value,
              updatedBy: session.user.id,
              updatedAt: new Date(),
            })
            .where(eq(settings.key, settingDef.key));
        } else {
          // Insert new setting
          await db.insert(settings).values({
            key: settingDef.key,
            value,
            description: settingDef.description,
            type: settingDef.type,
            category: settingDef.category,
            isPublic: settingDef.isPublic,
            updatedBy: session.user.id,
          });
        }
      }
    }

    return new Response(
      JSON.stringify({ message: "Settings updated successfully" }),
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error updating settings:", error);
    return new Response(
      JSON.stringify({ error: "Failed to update settings" }),
      { status: 500 }
    );
  }
}
