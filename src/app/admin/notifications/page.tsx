import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { notifications } from "@/lib/db/schema";
import { eq, desc, sql, and } from "drizzle-orm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import NotificationList from "@/components/admin/NotificationList";
import NotificationActions from "@/components/admin/NotificationActions";
import { 
  Bell, 
  AlertTriangle, 
  Info, 
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

const getNotificationIcon = (type: string) => {
  switch (type) {
    case "error":
      return <AlertTriangle className="h-5 w-5 text-red-500" />;
    case "warning":
      return <AlertTriangle className="h-5 w-5 text-orange-500" />;
    case "success":
      return <CheckCircle className="h-5 w-5 text-green-500" />;
    default:
      return <Info className="h-5 w-5 text-blue-500" />;
  }
};

const getPriorityBadge = (priority: string) => {
  const variants = {
    high: "destructive",
    medium: "default",
    low: "secondary"
  } as const;
  
  return (
    <Badge variant={variants[priority as keyof typeof variants]}>
      {priority.charAt(0).toUpperCase() + priority.slice(1)}
    </Badge>
  );
};

export default async function NotificationsPage() {
  // Get current admin session
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  // Fetch notifications data
  const data = await getNotificationsData(session?.user?.id);
  
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Bell className="h-8 w-8 text-primary" />
            Notifications
          </h1>
          <p className="text-gray-600 mt-2">
            System alerts and updates • {data.stats.unread} unread
          </p>
        </div>
        <NotificationActions />
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total</p>
                <p className="text-2xl font-bold">{data.stats.total}</p>
              </div>
              <Bell className="h-8 w-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Unread</p>
                <p className="text-2xl font-bold text-red-600">{data.stats.unread}</p>
              </div>
              <Clock className="h-8 w-8 text-red-400" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">High Priority</p>
                <p className="text-2xl font-bold text-orange-600">
                  {data.stats.highPriority}
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-orange-400" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Today</p>
                <p className="text-2xl font-bold text-blue-600">
                  {data.stats.today}
                </p>
              </div>
              <Info className="h-8 w-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Notifications List */}
      <NotificationList 
        notifications={data.notifications}
      />
    </div>
  );
}
