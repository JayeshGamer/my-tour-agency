import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/lib/db";
import { systemLogs } from "@/lib/db/schema";
import { desc, eq } from "drizzle-orm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ErrorsList from "@/components/admin/ErrorsList";
import { AlertTriangle, XCircle, CheckCircle, Bug } from "lucide-react";
import Link from "next/link";

async function getSystemErrorsData() {
  // Get error logs from systemLogs table
  const errorLogs = await db
    .select()
    .from(systemLogs)
    .where(eq(systemLogs.type, 'error'))
    .orderBy(desc(systemLogs.createdAt))
    .limit(500);

  // Transform to match expected error format
  const transformedErrors = errorLogs.map(log => {
    const metadata = log.metadata as any || {};
    return {
      id: log.id,
      type: metadata.errorType || 'System Error',
      message: log.message,
      severity: metadata.severity || 'medium' as const,
      category: metadata.category || 'System',
      resolved: metadata.resolved || false,
      userEmail: metadata.userEmail || metadata.email,
      ipAddress: metadata.ipAddress,
      metadata: metadata,
      stack: metadata.stack,
      createdAt: log.createdAt,
      resolvedAt: metadata.resolvedAt ? new Date(metadata.resolvedAt) : undefined
    };
  });

  // Calculate statistics
  const totalErrors = transformedErrors.length;
  const unresolvedCount = transformedErrors.filter(e => !e.resolved).length;
  const criticalErrors = transformedErrors.filter(e => e.severity === "critical").length;
  const resolvedErrors = transformedErrors.filter(e => e.resolved).length;

  return {
    errors: transformedErrors,
    stats: {
      total: totalErrors,
      unresolved: unresolvedCount,
      critical: criticalErrors,
      resolved: resolvedErrors
    }
  };
}

export default async function ErrorsPage() {
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

  const data = await getSystemErrorsData();

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <AlertTriangle className="h-8 w-8 text-primary" />
            Error Monitoring
          </h1>
          <p className="text-gray-600 mt-2">
            System error tracking and resolution • {data.stats.unresolved} unresolved
          </p>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Errors</p>
                <p className="text-2xl font-bold">{data.stats.total}</p>
              </div>
              <Bug className="h-8 w-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Unresolved</p>
                <p className="text-2xl font-bold text-red-600">{data.stats.unresolved}</p>
              </div>
              <XCircle className="h-8 w-8 text-red-400" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Critical</p>
                <p className="text-2xl font-bold text-red-600">{data.stats.critical}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-400" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Resolved</p>
                <p className="text-2xl font-bold text-green-600">{data.stats.resolved}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Errors List */}
      <ErrorsList errors={data.errors} />
    </div>
  );
}
