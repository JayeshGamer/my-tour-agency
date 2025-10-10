import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/lib/db";
import { systemLogs } from "@/lib/db/schema";
import { desc, eq } from "drizzle-orm";
import { Card, CardContent } from "@/components/ui/card";
import { RainbowButton } from "@/components/ui/rainbow-button";
import ErrorsList from "@/components/admin/ErrorsList";
import { AlertTriangle, XCircle, CheckCircle, Bug, Sparkles, Filter, Download, ShieldAlert } from "lucide-react";
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

  const data = await getSystemErrorsData();

  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      {/* Enhanced Page Header with gradient */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-red-500/10 via-rose-500/5 to-transparent rounded-3xl blur-3xl" />
        <div className="relative space-y-3 pb-4">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="absolute inset-0 bg-red-500/20 blur-xl rounded-full" />
                  <div className="relative bg-red-500/10 p-3 rounded-2xl border border-red-500/20">
                    <ShieldAlert className="h-8 w-8 text-red-600" />
                  </div>
                </div>
                <div>
                  <h1 className="text-5xl font-bold tracking-tight bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent">
                    Error Monitoring
                  </h1>
                  <div className="flex items-center gap-2 mt-2">
                    <Sparkles className="h-4 w-4 text-red-600" />
                    <p className="text-muted-foreground font-medium">
                      Track system errors • {data.stats.unresolved} unresolved
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
              <RainbowButton variant="red" className="gap-2">
                <Download className="h-4 w-4" />
                Export
              </RainbowButton>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Summary Stats with Animations */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Errors Card */}
        <Card className="border-border hover:shadow-xl hover:shadow-gray-500/5 transition-all duration-300 hover:-translate-y-1 group overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-br from-gray-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <CardContent className="p-6 relative">
            <div className="flex items-start justify-between">
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Total Errors</p>
                  <div className="h-1.5 w-1.5 rounded-full bg-gray-500 animate-pulse" />
                </div>
                <div className="flex items-baseline gap-2">
                  <p className="text-4xl font-bold text-foreground">{data.stats.total}</p>
                </div>
                <p className="text-xs text-muted-foreground">All logged</p>
              </div>
              <div className="relative">
                <div className="absolute inset-0 bg-gray-500/20 blur-lg rounded-full" />
                <div className="relative bg-gray-500/10 p-3 rounded-xl border border-gray-500/20">
                  <Bug className="h-7 w-7 text-gray-600" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Unresolved Errors Card */}
        <Card className="border-border hover:shadow-xl hover:shadow-red-500/5 transition-all duration-300 hover:-translate-y-1 group overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <CardContent className="p-6 relative">
            <div className="flex items-start justify-between">
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Unresolved</p>
                  <div className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />
                </div>
                <div className="flex items-baseline gap-2">
                  <p className="text-4xl font-bold text-red-600">{data.stats.unresolved}</p>
                </div>
                <p className="text-xs text-muted-foreground">Needs attention</p>
              </div>
              <div className="relative">
                <div className="absolute inset-0 bg-red-500/20 blur-lg rounded-full" />
                <div className="relative bg-red-500/10 p-3 rounded-xl border border-red-500/20">
                  <XCircle className="h-7 w-7 text-red-600" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Critical Errors Card */}
        <Card className="border-border hover:shadow-xl hover:shadow-rose-500/5 transition-all duration-300 hover:-translate-y-1 group overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-br from-rose-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <CardContent className="p-6 relative">
            <div className="flex items-start justify-between">
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Critical</p>
                  <AlertTriangle className="h-3.5 w-3.5 text-rose-600" />
                </div>
                <div className="flex items-baseline gap-2">
                  <p className="text-4xl font-bold bg-gradient-to-br from-rose-600 to-red-600 bg-clip-text text-transparent">
                    {data.stats.critical}
                  </p>
                </div>
                <p className="text-xs text-muted-foreground">High priority</p>
              </div>
              <div className="relative">
                <div className="absolute inset-0 bg-rose-500/20 blur-lg rounded-full" />
                <div className="relative bg-rose-500/10 p-3 rounded-xl border border-rose-500/20">
                  <AlertTriangle className="h-7 w-7 text-rose-600" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Resolved Errors Card */}
        <Card className="border-border hover:shadow-xl hover:shadow-green-500/5 transition-all duration-300 hover:-translate-y-1 group overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <CardContent className="p-6 relative">
            <div className="flex items-start justify-between">
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Resolved</p>
                  <div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
                </div>
                <div className="flex items-baseline gap-2">
                  <p className="text-4xl font-bold text-green-600">{data.stats.resolved}</p>
                  <span className="text-xs text-muted-foreground">
                    {data.stats.total > 0 ? ((data.stats.resolved / data.stats.total) * 100).toFixed(0) : 0}%
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">Fixed</p>
              </div>
              <div className="relative">
                <div className="absolute inset-0 bg-green-500/20 blur-lg rounded-full" />
                <div className="relative bg-green-500/10 p-3 rounded-xl border border-green-500/20">
                  <CheckCircle className="h-7 w-7 text-green-600" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Errors List */}
      <div className="pb-8">
        <ErrorsList errors={data.errors} />
      </div>
    </div>
  );
}
