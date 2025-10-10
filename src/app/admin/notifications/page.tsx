import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { notifications } from "@/lib/db/schema";
import { desc, sql } from "drizzle-orm";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import NotificationList from "@/components/admin/NotificationList";
import NotificationActions from "@/components/admin/NotificationActions";
import { 
  Bell, 
  AlertTriangle, 
  CheckCircle,
  Clock 
} from "lucide-react";

async function getNotificationsData(adminId?: string) {
  // Get all notifications for admin or system-wide notifications
  const notificationsQuery = await db
    .select()
    .from(notifications)
    .where(
      adminId 
        ? sql`${notifications.adminId} = ${adminId} OR ${notifications.adminId} IS NULL`
        : sql`${notifications.adminId} IS NULL`
    )
    .orderBy(desc(notifications.createdAt))
    .limit(100);

  // Get stats
  const totalCount = notificationsQuery.length;
  const unreadCount = notificationsQuery.filter(n => !n.isRead).length;
  const highPriorityCount = notificationsQuery.filter(n => n.priority === 'high' || n.priority === 'urgent').length;
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayCount = notificationsQuery.filter(n => {
    const notifDate = new Date(n.createdAt);
    notifDate.setHours(0, 0, 0, 0);
    return notifDate.getTime() === today.getTime();
  }).length;

  return {
    notifications: notificationsQuery,
    stats: {
      total: totalCount,
      unread: unreadCount,
      highPriority: highPriorityCount,
      today: todayCount
    }
  };
}

export default async function NotificationsPage() {
  // Get current admin session
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  // Fetch notifications data
  const data = await getNotificationsData(session?.user?.id);
  
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Page Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg">
            <Bell className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-foreground">
              Notifications Center
            </h1>
            <p className="text-muted-foreground mt-1">
              Stay updated with system alerts and important updates
            </p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="relative overflow-hidden border-border/50 bg-card hover:shadow-lg transition-all duration-300 group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/10 to-transparent rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500" />
          <CardContent className="p-6 relative">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Total Notifications</p>
                <p className="text-3xl font-bold text-foreground">{data.stats.total}</p>
              </div>
              <div className="p-3 rounded-xl bg-blue-500/10 ring-1 ring-blue-500/20">
                <Bell className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="relative overflow-hidden border-border/50 bg-card hover:shadow-lg transition-all duration-300 group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-red-500/10 to-transparent rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500" />
          <CardContent className="p-6 relative">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Unread</p>
                <p className="text-3xl font-bold text-red-600">{data.stats.unread}</p>
                {data.stats.unread > 0 && (
                  <Badge variant="destructive" className="animate-pulse">
                    Needs Attention
                  </Badge>
                )}
              </div>
              <div className="p-3 rounded-xl bg-red-500/10 ring-1 ring-red-500/20">
                <Clock className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="relative overflow-hidden border-border/50 bg-card hover:shadow-lg transition-all duration-300 group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-orange-500/10 to-transparent rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500" />
          <CardContent className="p-6 relative">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">High Priority</p>
                <p className="text-3xl font-bold text-orange-600">{data.stats.highPriority}</p>
              </div>
              <div className="p-3 rounded-xl bg-orange-500/10 ring-1 ring-orange-500/20">
                <AlertTriangle className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="relative overflow-hidden border-border/50 bg-card hover:shadow-lg transition-all duration-300 group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-500/10 to-transparent rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500" />
          <CardContent className="p-6 relative">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Today</p>
                <p className="text-3xl font-bold text-green-600">{data.stats.today}</p>
              </div>
              <div className="p-3 rounded-xl bg-green-500/10 ring-1 ring-green-500/20">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Notifications Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold text-foreground">All Notifications</h2>
          <p className="text-sm text-muted-foreground">
            {data.stats.unread} unread messages
          </p>
        </div>
        <NotificationActions />
      </div>

      {/* Notifications List */}
      <NotificationList notifications={data.notifications} />
    </div>
  );
}
