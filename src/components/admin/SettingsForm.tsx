"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Save, Globe, Mail, Bell, Database, Loader2, CheckCircle } from "lucide-react";
import { toast } from "react-hot-toast";

interface PlatformSettings {
  // General
  siteName: string;
  siteDescription: string;
  supportEmail: string;
  timeZone: string;
  
  // Email
  emailNotifications: boolean;
  marketingEmails: boolean;
  smtpHost?: string;
  smtpPort?: number;
  smtpUsername?: string;
  
  // Notifications
  newBookingAlerts: boolean;
  paymentFailureAlerts: boolean;
  systemErrorAlerts: boolean;
  
  // API
  stripePublishableKey?: string;
  googleAnalyticsId?: string;
  apiRateLimit: boolean;
  maxRequestsPerMinute: number;
  
  // Features
  allowGuestBooking: boolean;
  requireEmailVerification: boolean;
  autoApproveBookings: boolean;
  maintenanceMode: boolean;
}

interface SettingsFormProps {
  initialSettings: PlatformSettings;
}

export default function SettingsForm({ initialSettings }: SettingsFormProps) {
  const [settings, setSettings] = useState<PlatformSettings>(initialSettings);
  const [loading, setLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  
  const handleSaveSettings = async () => {
    setLoading(true);
    setSaveSuccess(false);
    
    try {
      const response = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ settings }),
      });
      
      if (response.ok) {
        setSaveSuccess(true);
        toast.success('Settings saved successfully');
        setTimeout(() => setSaveSuccess(false), 3000);
      } else {
        throw new Error('Failed to save settings');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Failed to save settings');
    } finally {
      setLoading(false);
    }
  };
  
  const handleInputChange = (field: keyof PlatformSettings, value: any) => {
    setSettings(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="space-y-6">
      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSaveSettings} disabled={loading}>
          {loading ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : saveSuccess ? (
            <CheckCircle className="h-4 w-4 mr-2" />
          ) : (
            <Save className="h-4 w-4 mr-2" />
          )}
          {loading ? "Saving..." : saveSuccess ? "Saved!" : "Save Changes"}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* General Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              General Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="site-name">Site Name</Label>
              <Input 
                id="site-name" 
                value={settings.siteName}
                onChange={(e) => handleInputChange("siteName", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="site-description">Site Description</Label>
              <Textarea 
                id="site-description" 
                value={settings.siteDescription}
                onChange={(e) => handleInputChange("siteDescription", e.target.value)}
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="support-email">Support Email</Label>
              <Input 
                id="support-email" 
                type="email" 
                value={settings.supportEmail}
                onChange={(e) => handleInputChange("supportEmail", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="timezone">Time Zone</Label>
              <Select value={settings.timeZone} onValueChange={(value) => handleInputChange("timeZone", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select timezone" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="UTC">UTC</SelectItem>
                  <SelectItem value="America/New_York">Eastern Time</SelectItem>
                  <SelectItem value="America/Chicago">Central Time</SelectItem>
                  <SelectItem value="America/Denver">Mountain Time</SelectItem>
                  <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                  <SelectItem value="Europe/London">London</SelectItem>
                  <SelectItem value="Europe/Paris">Paris</SelectItem>
                  <SelectItem value="Asia/Tokyo">Tokyo</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Email Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Email Configuration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label>Email Notifications</Label>
                <p className="text-sm text-gray-500">Send booking confirmations</p>
              </div>
              <Switch 
                checked={settings.emailNotifications}
                onCheckedChange={(checked) => handleInputChange("emailNotifications", checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label>Marketing Emails</Label>
                <p className="text-sm text-gray-500">Send promotional content</p>
              </div>
              <Switch 
                checked={settings.marketingEmails}
                onCheckedChange={(checked) => handleInputChange("marketingEmails", checked)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Admin Notifications
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label>New Bookings</Label>
                <p className="text-sm text-gray-500">Alert on new bookings</p>
              </div>
              <Switch 
                checked={settings.newBookingAlerts}
                onCheckedChange={(checked) => handleInputChange("newBookingAlerts", checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label>Payment Failures</Label>
                <p className="text-sm text-gray-500">Alert on payment issues</p>
              </div>
              <Switch 
                checked={settings.paymentFailureAlerts}
                onCheckedChange={(checked) => handleInputChange("paymentFailureAlerts", checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label>System Errors</Label>
                <p className="text-sm text-gray-500">Alert on system errors</p>
              </div>
              <Switch 
                checked={settings.systemErrorAlerts}
                onCheckedChange={(checked) => handleInputChange("systemErrorAlerts", checked)}
              />
            </div>
          </CardContent>
        </Card>

        {/* API Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              API Configuration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="stripe-key">Stripe Publishable Key</Label>
              <Input 
                id="stripe-key" 
                type="password" 
                value={settings.stripePublishableKey || ""}
                onChange={(e) => handleInputChange("stripePublishableKey", e.target.value)}
                placeholder="pk_test_..."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="google-analytics">Google Analytics ID</Label>
              <Input 
                id="google-analytics" 
                value={settings.googleAnalyticsId || ""}
                onChange={(e) => handleInputChange("googleAnalyticsId", e.target.value)}
                placeholder="G-XXXXXXXXXX"
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label>API Rate Limiting</Label>
                <p className="text-sm text-gray-500">Enable rate limiting</p>
              </div>
              <Switch 
                checked={settings.apiRateLimit}
                onCheckedChange={(checked) => handleInputChange("apiRateLimit", checked)}
              />
            </div>
            {settings.apiRateLimit && (
              <div className="space-y-2">
                <Label htmlFor="rate-limit">Max Requests Per Minute</Label>
                <Input 
                  id="rate-limit" 
                  type="number" 
                  value={settings.maxRequestsPerMinute}
                  onChange={(e) => handleInputChange("maxRequestsPerMinute", parseInt(e.target.value) || 100)}
                  min={1}
                  max={1000}
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Feature Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Platform Features</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label>Guest Booking</Label>
                <p className="text-sm text-gray-500">Allow bookings without registration</p>
              </div>
              <Switch 
                checked={settings.allowGuestBooking}
                onCheckedChange={(checked) => handleInputChange("allowGuestBooking", checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label>Email Verification</Label>
                <p className="text-sm text-gray-500">Require email verification for new accounts</p>
              </div>
              <Switch 
                checked={settings.requireEmailVerification}
                onCheckedChange={(checked) => handleInputChange("requireEmailVerification", checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label>Auto-Approve Bookings</Label>
                <p className="text-sm text-gray-500">Automatically approve new bookings</p>
              </div>
              <Switch 
                checked={settings.autoApproveBookings}
                onCheckedChange={(checked) => handleInputChange("autoApproveBookings", checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label className="text-red-600">Maintenance Mode</Label>
                <p className="text-sm text-gray-500">Put site into maintenance mode</p>
              </div>
              <Switch 
                checked={settings.maintenanceMode}
                onCheckedChange={(checked) => handleInputChange("maintenanceMode", checked)}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
