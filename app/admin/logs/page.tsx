import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/lib/db";
import { systemLogs } from "@/lib/db/schema";
import { desc, gte, count } from "drizzle-orm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import LogsList from "@/components/admin/LogsList";
import { FileText, Info, AlertTriangle, Activity, RefreshCw } from "lucide-react";
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

  const data = await getSystemLogsData();

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <FileText className="h-8 w-8 text-primary" />
            System Activity Logs
          </h1>
          <p className="text-gray-600 mt-2">
            Monitor system activity and events • {data.stats.recent} new in last 24h
          </p>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Logs</p>
                <p className="text-2xl font-bold">{data.stats.total}</p>
              </div>
              <FileText className="h-8 w-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Errors</p>
                <p className="text-2xl font-bold text-red-600">{data.stats.errors}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-400" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Warnings</p>
                <p className="text-2xl font-bold text-orange-600">{data.stats.warnings}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-orange-400" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Recent (24h)</p>
                <p className="text-2xl font-bold text-blue-600">{data.stats.recent}</p>
              </div>
              <Activity className="h-8 w-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Logs List */}
      <LogsList logs={data.logs} />
    </div>
  );
}
