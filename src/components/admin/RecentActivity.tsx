"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Activity } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ActivityItem {
  id: string;
  user: {
    name: string | null;
    email: string;
  };
  tour: {
    name: string;
  };
  bookingDate: Date;
  status: string;
  totalPrice: string;
}

interface RecentActivityProps {
  activities: ActivityItem[];
}

const statusColors: Record<string, string> = {
  Confirmed: "bg-green-500/10 text-green-600 border-green-500/20",
  Pending: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
  Canceled: "bg-red-500/10 text-red-600 border-red-500/20",
};

export default function RecentActivity({ activities }: RecentActivityProps) {
  return (
    <Card className="border-border/50 shadow-sm">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-primary/10 ring-1 ring-primary/20">
            <Activity className="h-5 w-5 text-primary" />
          </div>
          <div>
            <CardTitle className="text-xl font-bold">Recent Activity</CardTitle>
            <p className="text-sm text-muted-foreground mt-0.5">Latest bookings and updates</p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-4">
            {activities.map((activity) => {
              const initials = activity.user.name
                ?.split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase() || activity.user.email[0].toUpperCase();

              return (
                <div
                  key={activity.id}
                  className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors border border-transparent hover:border-border/50"
                >
                  <Avatar className="h-10 w-10 border-2 border-border">
                    <AvatarFallback className="bg-primary/10 text-primary font-semibold text-sm">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-semibold text-foreground truncate">
                        {activity.user.name || activity.user.email}
                      </p>
                      <Badge variant="outline" className={statusColors[activity.status] || ""}>
                        {activity.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground truncate">
                      Booked <span className="font-medium text-foreground">{activity.tour.name}</span>
                    </p>
                    <div className="flex items-center justify-between text-xs text-muted-foreground pt-1">
                      <span>{formatDistanceToNow(new Date(activity.bookingDate), { addSuffix: true })}</span>
                      <span className="font-semibold text-foreground">₹{parseFloat(activity.totalPrice).toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          {activities.length === 0 && (
            <div className="text-center py-12">
              <p className="text-sm text-muted-foreground">No recent activity</p>
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
