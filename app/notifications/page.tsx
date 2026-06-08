"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { notificationService } from "@/lib/supabase-services";
import { supabase } from "@/lib/supabase";
import { Check, CheckCheck, Bell } from "lucide-react";

interface Notification {
  id: number;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

export default function Notifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processingIds, setProcessingIds] = useState<Set<number>>(new Set());
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        setIsLoading(true);
        
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          router.push("/login");
          return;
        }

        const notificationsData = await notificationService.getNotifications();
        setNotifications(notificationsData);
      } catch (err: any) {
        setError(`Failed to load notifications: ${err.message}`);
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchNotifications();
  }, [router]);

  const handleMarkAsRead = async (id: number) => {
    setProcessingIds((prev) => new Set(prev).add(id));
    try {
      await notificationService.markAsRead(id);
      setNotifications((prev) =>
        prev.map((notif) =>
          notif.id === id ? { ...notif, is_read: true } : notif
        )
      );
      toast({
        title: "Success",
        description: "Notification marked as read",
      });
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: err.message || "Failed to mark notification as read",
      });
    } finally {
      setProcessingIds((prev) => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
    }
  };

  const handleMarkAllAsRead = async () => {
    const unreadNotifications = notifications.filter((n) => !n.is_read);
    if (unreadNotifications.length === 0) {
      toast({
        title: "Info",
        description: "All notifications are already read",
      });
      return;
    }

    const unreadIds = unreadNotifications.map((n) => n.id);
    setProcessingIds(new Set(unreadIds));

    try {
      // Mark all unread notifications as read
      await Promise.all(unreadIds.map((id) => notificationService.markAsRead(id)));
      
      setNotifications((prev) =>
        prev.map((notif) => ({ ...notif, is_read: true }))
      );
      
      toast({
        title: "Success",
        description: `Marked ${unreadIds.length} notification(s) as read`,
      });
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: err.message || "Failed to mark notifications as read",
      });
    } finally {
      setProcessingIds(new Set());
    }
  };

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  if (isLoading && typeof window === "undefined") {
    return <div>Loading...</div>;
  }

  return (
    <div className="w-full">
      {error && (
        <div className="mb-4 p-4 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-md">
          {error}
        </div>
      )}
      
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Bell className="h-6 w-6" />
            Notifications
          </h2>
          {unreadCount > 0 && (
            <p className="text-sm text-muted-foreground mt-1">
              {unreadCount} unread notification{unreadCount !== 1 ? "s" : ""}
            </p>
          )}
        </div>
        {unreadCount > 0 && (
          <Button
            onClick={handleMarkAllAsRead}
            disabled={processingIds.size > 0}
            variant="outline"
          >
            <CheckCheck className="mr-2 h-4 w-4" />
            Mark All as Read
          </Button>
        )}
      </div>

      <div className="bg-card p-6 rounded-xl shadow-sm border border-border">
        {isLoading ? (
          <div className="p-6 text-center">Loading...</div>
        ) : notifications.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-border">
              <thead className="bg-muted">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider"
                  >
                    Status
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider"
                  >
                    Title
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider"
                  >
                    Message
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider"
                  >
                    Date
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider"
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-card divide-y divide-border">
                {notifications.map((notification) => (
                  <tr
                    key={notification.id}
                    className={
                      !notification.is_read
                        ? "bg-blue-50 dark:bg-blue-900/10 font-medium"
                        : ""
                    }
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      {notification.is_read ? (
                        <Badge variant="secondary" className="flex items-center gap-1 w-fit">
                          <CheckCheck className="h-3 w-3" />
                          Read
                        </Badge>
                      ) : (
                        <Badge variant="default" className="flex items-center gap-1 w-fit">
                          <Bell className="h-3 w-3" />
                          Unread
                        </Badge>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {notification.title}
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">
                      {notification.message}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                      {new Date(notification.created_at).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {!notification.is_read ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleMarkAsRead(notification.id)}
                          disabled={processingIds.has(notification.id)}
                        >
                          {processingIds.has(notification.id) ? (
                            "Processing..."
                          ) : (
                            <>
                              <Check className="mr-2 h-4 w-4" />
                              Mark as Read
                            </>
                          )}
                        </Button>
                      ) : (
                        <span className="text-xs text-muted-foreground">
                          Read
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-6 text-center">
            <Bell className="h-16 w-16 mx-auto mb-4 opacity-50 text-muted-foreground" />
            <p className="text-muted-foreground text-lg font-medium">
              No notifications found.
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              You'll see your notifications here when you have updates.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}