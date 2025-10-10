import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/lib/db";
import { systemLogs } from "@/lib/db/schema";
import { desc } from "drizzle-orm";
import { Card, CardContent } from "@/components/ui/card";
import { RainbowButton } from "@/components/ui/rainbow-button";
import LogsList from "@/components/admin/LogsList";
import { FileText, AlertTriangle, Activity, RefreshCw, Sparkles, Filter, Download, ScrollText } from "lucide-react";
import Link from "next/link";

async function getSystemLogsData() {
  // Get all system logs ordered by most recent
  const logsData = await db
    .select()
    .from(systemLogs)
    .orderBy(desc(systemLogs.createdAt))
    .limit(1000);

  // Transform to match expected format and categorize by type
  const transformedLogs = logsData.map(log => ({
    id: log.id,
    level: log.type === 'error' ? 'error' as const :
           log.type === 'warning' ? 'warning' as const :
           log.type === 'contact_form' ? 'info' as const :
           log.type === 'payment' ? 'info' as const :
           'info' as const,
    category: log.type === 'contact_form' ? 'Contact' :
              log.type === 'payment' ? 'Payment' :
              log.type === 'booking' ? 'Booking' :
              log.type === 'user' ? 'User' :
              log.type === 'admin' ? 'Admin' :
              log.type === 'system' ? 'System' :
              'General',
    message: log.message,
    userEmail: (log.metadata as any)?.userEmail || (log.metadata as any)?.email,
    ipAddress: (log.metadata as any)?.ipAddress,
    metadata: log.metadata,
    createdAt: log.createdAt
  }));

  // Calculate statistics
  const totalLogs = transformedLogs.length;
  const errorLogs = transformedLogs.filter(log => log.level === "error").length;
  const warningLogs = transformedLogs.filter(log => log.level === "warning").length;
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const recentLogs = transformedLogs.filter(log => 
    new Date(log.createdAt) > oneDayAgo
  ).length;

  return {
    logs: transformedLogs,
    stats: {
      total: totalLogs,
      errors: errorLogs, 
      warnings: warningLogs,
      recent: recentLogs
    }
  };
}

export default async function LogsPage() {
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

  const data = await getSystemLogsData();

  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      {/* Enhanced Page Header with gradient */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 via-violet-500/5 to-transparent rounded-3xl blur-3xl" />
        <div className="relative space-y-3 pb-4">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="absolute inset-0 bg-indigo-500/20 blur-xl rounded-full" />
                  <div className="relative bg-indigo-500/10 p-3 rounded-2xl border border-indigo-500/20">
                    <ScrollText className="h-8 w-8 text-indigo-600" />
                  </div>
                </div>
                <div>
                  <h1 className="text-5xl font-bold tracking-tight bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent">
                    System Activity Logs
                  </h1>
                  <div className="flex items-center gap-2 mt-2">
                    <Sparkles className="h-4 w-4 text-indigo-600" />
                    <p className="text-muted-foreground font-medium">
                      Monitor system activity • {data.stats.recent} new in last 24h
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-3">
              <RainbowButton variant="red" className="gap-2">
                <Filter className="h-4 w-4" />
                Filter
              </RainbowButton>
              <RainbowButton variant="black" className="gap-2">
                <RefreshCw className="h-4 w-4" />
                Refresh
              </RainbowButton>
              <RainbowButton variant="green" className="gap-2">
                <Download className="h-4 w-4" />
                Export
              </RainbowButton>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Summary Stats with Animations */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Logs Card */}
        <Card className="border-border hover:shadow-xl hover:shadow-indigo-500/5 transition-all duration-300 hover:-translate-y-1 group overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <CardContent className="p-6 relative">
            <div className="flex items-start justify-between">
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Total Logs</p>
                  <div className="h-1.5 w-1.5 rounded-full bg-indigo-500 animate-pulse" />
                </div>
                <div className="flex items-baseline gap-2">
                  <p className="text-4xl font-bold text-foreground">{data.stats.total}</p>
                </div>
                <p className="text-xs text-muted-foreground">All events</p>
              </div>
              <div className="relative">
                <div className="absolute inset-0 bg-indigo-500/20 blur-lg rounded-full" />
                <div className="relative bg-indigo-500/10 p-3 rounded-xl border border-indigo-500/20">
                  <FileText className="h-7 w-7 text-indigo-600" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Errors Card */}
        <Card className="border-border hover:shadow-xl hover:shadow-red-500/5 transition-all duration-300 hover:-translate-y-1 group overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <CardContent className="p-6 relative">
            <div className="flex items-start justify-between">
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Errors</p>
                  <div className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />
                </div>
                <div className="flex items-baseline gap-2">
                  <p className="text-4xl font-bold text-red-600">{data.stats.errors}</p>
                </div>
                <p className="text-xs text-muted-foreground">Error logs</p>
              </div>
              <div className="relative">
                <div className="absolute inset-0 bg-red-500/20 blur-lg rounded-full" />
                <div className="relative bg-red-500/10 p-3 rounded-xl border border-red-500/20">
                  <AlertTriangle className="h-7 w-7 text-red-600" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Warnings Card */}
        <Card className="border-border hover:shadow-xl hover:shadow-orange-500/5 transition-all duration-300 hover:-translate-y-1 group overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <CardContent className="p-6 relative">
            <div className="flex items-start justify-between">
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Warnings</p>
                  <div className="h-1.5 w-1.5 rounded-full bg-orange-500 animate-pulse" />
                </div>
                <div className="flex items-baseline gap-2">
                  <p className="text-4xl font-bold text-orange-600">{data.stats.warnings}</p>
                </div>
                <p className="text-xs text-muted-foreground">Warning logs</p>
              </div>
              <div className="relative">
                <div className="absolute inset-0 bg-orange-500/20 blur-lg rounded-full" />
                <div className="relative bg-orange-500/10 p-3 rounded-xl border border-orange-500/20">
                  <AlertTriangle className="h-7 w-7 text-orange-600" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Recent Activity Card */}
        <Card className="border-border hover:shadow-xl hover:shadow-blue-500/5 transition-all duration-300 hover:-translate-y-1 group overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <CardContent className="p-6 relative">
            <div className="flex items-start justify-between">
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Recent (24h)</p>
                  <Activity className="h-3.5 w-3.5 text-blue-600" />
                </div>
                <div className="flex items-baseline gap-2">
                  <p className="text-4xl font-bold bg-gradient-to-br from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                    {data.stats.recent}
                  </p>
                </div>
                <p className="text-xs text-muted-foreground">Latest activity</p>
              </div>
              <div className="relative">
                <div className="absolute inset-0 bg-blue-500/20 blur-lg rounded-full" />
                <div className="relative bg-blue-500/10 p-3 rounded-xl border border-blue-500/20">
                  <Activity className="h-7 w-7 text-blue-600" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Logs List */}
      <div className="pb-8">
        <LogsList logs={data.logs} />
      </div>
    </div>
  );
}
