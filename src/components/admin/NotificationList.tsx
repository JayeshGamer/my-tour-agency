"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Bell, MoreHorizontal, Check, Trash2, AlertTriangle, Info, CheckCircle, Sparkles, Zap, TrendingUp } from "lucide-react";
import { toast } from "react-hot-toast";
import { cn } from "@/lib/utils";

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  priority: string;
  createdAt: Date;
  relatedEntityType: string | null;
  relatedEntityId: string | null;
  metadata: Record<string, any> | null;
}

interface NotificationListProps {
  notifications: Notification[];
}

const getNotificationIcon = (type: string) => {
  switch (type) {
    case "error":
      return <AlertTriangle className="h-5 w-5" />;
    case "warning":
      return <AlertTriangle className="h-5 w-5" />;
    case "success":
      return <CheckCircle className="h-5 w-5" />;
    case "info":
      return <Info className="h-5 w-5" />;
    default:
      return <Bell className="h-5 w-5" />;
  }
};

const getNotificationStyle = (type: string) => {
  switch (type) {
    case "error":
      return {
        bg: "bg-red-50 dark:bg-red-950/20",
        border: "border-red-200 dark:border-red-900",
        iconBg: "bg-red-100 dark:bg-red-900/30",
        iconColor: "text-red-600 dark:text-red-400",
        glowColor: "from-red-500/20"
      };
    case "warning":
      return {
        bg: "bg-orange-50 dark:bg-orange-950/20",
        border: "border-orange-200 dark:border-orange-900",
        iconBg: "bg-orange-100 dark:bg-orange-900/30",
        iconColor: "text-orange-600 dark:text-orange-400",
        glowColor: "from-orange-500/20"
      };
    case "success":
      return {
        bg: "bg-green-50 dark:bg-green-950/20",
        border: "border-green-200 dark:border-green-900",
        iconBg: "bg-green-100 dark:bg-green-900/30",
        iconColor: "text-green-600 dark:text-green-400",
        glowColor: "from-green-500/20"
      };
    default:
      return {
        bg: "bg-blue-50 dark:bg-blue-950/20",
        border: "border-blue-200 dark:border-blue-900",
        iconBg: "bg-blue-100 dark:bg-blue-900/30",
        iconColor: "text-blue-600 dark:text-blue-400",
        glowColor: "from-blue-500/20"
      };
  }
};

const getPriorityBadge = (priority: string) => {
  switch (priority) {
    case "urgent":
      return (
        <Badge className="bg-gradient-to-r from-red-600 to-pink-600 text-white border-0 shadow-lg shadow-red-500/50">
          <Zap className="h-3 w-3 mr-1" />
          Urgent
        </Badge>
      );
    case "high":
      return (
        <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white border-0">
          <TrendingUp className="h-3 w-3 mr-1" />
          High
        </Badge>
      );
    case "medium":
      return <Badge variant="default">Medium</Badge>;
    default:
      return <Badge variant="secondary">Low</Badge>;
  }
};

const getRelativeTime = (date: Date) => {
  const now = new Date();
  const diff = now.getTime() - new Date(date).getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return new Date(date).toLocaleDateString();
};

export default function NotificationList({ 
  notifications
}: NotificationListProps) {
  const [isUpdating, setIsUpdating] = useState<string | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const handleMarkAsRead = async (id: string) => {
    setIsUpdating(id);
    try {
      const response = await fetch(`/api/admin/notifications/${id}/read`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to mark notification as read');
      }

      toast.success('Notification marked as read');
      window.location.reload();
    } catch (error) {
      console.error('Error marking notification as read:', error);
      toast.error('Failed to mark notification as read');
    } finally {
      setIsUpdating(null);
    }
  };

  const handleDelete = async (id: string) => {
    setIsUpdating(id);
    try {
      const response = await fetch(`/api/admin/notifications/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete notification');
      }

      toast.success('Notification deleted');
      window.location.reload();
    } catch (error) {
      console.error('Error deleting notification:', error);
      toast.error('Failed to delete notification');
    } finally {
      setIsUpdating(null);
    }
  };

  if (notifications.length === 0) {
    return (
      <Card className="border-border/50 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-pink-500/5" />
        <CardContent className="text-center py-20 relative">
          <div className="flex flex-col items-center gap-6">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full blur-2xl opacity-20 animate-pulse" />
              <div className="relative p-6 rounded-full bg-gradient-to-br from-blue-500/10 to-purple-600/10 ring-1 ring-blue-500/20">
                <Bell className="h-16 w-16 text-blue-600" />
              </div>
            </div>
            <div className="space-y-3">
              <h3 className="text-2xl font-bold text-foreground">All caught up!</h3>
              <p className="text-muted-foreground max-w-md">
                You have no new notifications at the moment. We'll notify you when something important happens.
              </p>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Sparkles className="h-4 w-4 text-yellow-500" />
              <span>You're doing great!</span>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {notifications.map((notification, index) => {
        const style = getNotificationStyle(notification.type);
        const isUnread = !notification.isRead;
        const isHovered = hoveredId === notification.id;

        return (
          <Card
            key={notification.id}
            onMouseEnter={() => setHoveredId(notification.id)}
            onMouseLeave={() => setHoveredId(null)}
            className={cn(
              "relative overflow-hidden border transition-all duration-300",
              isUnread ? `${style.bg} ${style.border}` : "border-border/50",
              isHovered ? "shadow-lg scale-[1.02] -translate-y-1" : "shadow-sm",
              "animate-in slide-in-from-top-5",
            )}
            style={{ animationDelay: `${index * 50}ms`, animationFillMode: 'backwards' }}
          >
            {/* Glow effect on hover */}
            <div className={cn(
              "absolute inset-0 bg-gradient-to-br to-transparent opacity-0 transition-opacity duration-500",
              style.glowColor,
              isHovered && "opacity-100"
            )} />

            {/* Unread indicator */}
            {isUnread && (
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-500 to-purple-600 animate-pulse" />
            )}

            <CardContent className="p-5 relative">
              <div className="flex items-start gap-4">
                {/* Icon */}
                <div className={cn(
                  "flex-shrink-0 p-3 rounded-xl transition-all duration-300",
                  style.iconBg,
                  isHovered && "scale-110 rotate-3"
                )}>
                  <div className={style.iconColor}>
                    {getNotificationIcon(notification.type)}
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 space-y-3">
                  {/* Header */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className={cn(
                          "font-semibold text-base leading-tight transition-colors",
                          isUnread ? "text-foreground" : "text-muted-foreground"
                        )}>
                          {notification.title}
                        </h3>
                        {isUnread && (
                          <Badge className="bg-blue-500 text-white text-[10px] px-1.5 py-0 h-5 animate-pulse">
                            NEW
                          </Badge>
                        )}
                      </div>

                      <div className="flex items-center gap-2 flex-wrap">
                        {getPriorityBadge(notification.priority)}
                        <span className="text-xs text-muted-foreground">
                          {getRelativeTime(notification.createdAt)}
                        </span>
                        {notification.relatedEntityType && (
                          <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-5">
                            {notification.relatedEntityType}
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Actions dropdown */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          className="h-8 w-8 flex-shrink-0"
                          disabled={isUpdating === notification.id}
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        {!notification.isRead && (
                          <DropdownMenuItem 
                            onClick={() => handleMarkAsRead(notification.id)}
                            disabled={isUpdating === notification.id}
                            className="cursor-pointer"
                          >
                            <Check className="mr-2 h-4 w-4" />
                            Mark as Read
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem 
                          onClick={() => handleDelete(notification.id)}
                          disabled={isUpdating === notification.id}
                          className="text-red-600 dark:text-red-400 cursor-pointer"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  {/* Message */}
                  <p className={cn(
                    "text-sm leading-relaxed",
                    isUnread ? "text-foreground/90" : "text-muted-foreground"
                  )}>
                    {notification.message}
                  </p>

                  {/* Footer with timestamp */}
                  <div className="flex items-center justify-between text-xs text-muted-foreground pt-1">
                    <span>
                      {new Date(notification.createdAt).toLocaleString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                    {isUnread && !isHovered && (
                      <Button
                        variant="link"
                        size="sm"
                        className="h-auto p-0 text-xs"
                        onClick={() => handleMarkAsRead(notification.id)}
                      >
                        Mark as read
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
