"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "react-hot-toast";

export default function NotificationActions() {
  const [isMarkingAllRead, setIsMarkingAllRead] = useState(false);
  const [isClearingAll, setIsClearingAll] = useState(false);

  const handleMarkAllRead = async () => {
    setIsMarkingAllRead(true);
    try {
      const response = await fetch('/api/admin/notifications/mark-all-read', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to mark all notifications as read');
      }

      toast.success('All notifications marked as read');
      // Refresh the page to update the UI
      window.location.reload();
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      toast.error('Failed to mark all notifications as read');
    } finally {
      setIsMarkingAllRead(false);
    }
  };

  const handleClearAll = async () => {
    if (!confirm('Are you sure you want to delete all notifications? This action cannot be undone.')) {
      return;
    }

    setIsClearingAll(true);
    try {
      const response = await fetch('/api/admin/notifications/clear-all', {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to clear all notifications');
      }

      toast.success('All notifications cleared');
      // Refresh the page to update the UI
      window.location.reload();
    } catch (error) {
      console.error('Error clearing all notifications:', error);
      toast.error('Failed to clear all notifications');
    } finally {
      setIsClearingAll(false);
    }
  };

  return (
    <div className="flex gap-2">
      <Button 
        variant="outline" 
        onClick={handleMarkAllRead}
        disabled={isMarkingAllRead || isClearingAll}
      >
        {isMarkingAllRead ? 'Marking...' : 'Mark All Read'}
      </Button>
      <Button 
        onClick={handleClearAll}
        disabled={isMarkingAllRead || isClearingAll}
      >
        {isClearingAll ? 'Clearing...' : 'Clear All'}
      </Button>
    </div>
  );
}
