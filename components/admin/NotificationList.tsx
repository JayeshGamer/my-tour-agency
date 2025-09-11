"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Bell, MoreHorizontal, Check, Trash2 } from "lucide-react";
import { toast } from "react-hot-toast";

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
  getNotificationIcon: (type: string) => JSX.Element;
  getPriorityBadge: (priority: string) => JSX.Element;
}

export default function NotificationList({ 
  notifications, 
  getNotificationIcon, 
  getPriorityBadge 
}: NotificationListProps) {
  const [isUpdating, setIsUpdating] = useState<string | null>(null);

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
      // Refresh the page to update the UI
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
      // Refresh the page to update the UI
      window.location.reload();
    } catch (error) {
      console.error('Error deleting notification:', error);
      toast.error('Failed to delete notification');
    } finally {
      setIsUpdating(null);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Notifications</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className={`flex items-start gap-4 p-4 rounded-lg border transition-colors hover:bg-gray-50 ${
                !notification.isRead ? "bg-blue-50 border-blue-200" : "border-gray-200"
              }`}
            >
              <div className="flex-shrink-0 mt-0.5">
                {getNotificationIcon(notification.type)}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">
                      {notification.title}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {notification.message}
                    </p>
                    <p className="text-xs text-gray-500 mt-2">
                      {new Date(notification.createdAt).toLocaleString()}
                    </p>
                    {notification.relatedEntityType && (
                      <div className="mt-2">
                        <Badge variant="outline" className="text-xs">
                          Related: {notification.relatedEntityType}
                        </Badge>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {getPriorityBadge(notification.priority)}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          disabled={isUpdating === notification.id}
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {!notification.isRead && (
                          <DropdownMenuItem 
                            onClick={() => handleMarkAsRead(notification.id)}
                            disabled={isUpdating === notification.id}
                          >
                            <Check className="mr-2 h-4 w-4" />
                            Mark as Read
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem 
                          onClick={() => handleDelete(notification.id)}
                          disabled={isUpdating === notification.id}
                          className="text-red-600"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </div>
              
              {!notification.isRead && (
                <div className="flex-shrink-0">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                </div>
              )}
            </div>
          ))}
        </div>
        
        {notifications.length === 0 && (
          <div className="text-center py-12">
            <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600">No notifications</h3>
            <p className="text-gray-500 mt-2">You're all caught up!</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
