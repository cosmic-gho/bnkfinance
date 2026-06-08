"use client";

import { useEffect, useState } from "react";
import { adminNotificationService, adminUserService } from "@/lib/admin-services";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { userService } from "@/lib/supabase-services";

interface Notification {
  id: number;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
  user: {
    id: string;
    username: string;
    first_name: string;
    last_name: string;
  };
}

interface User {
  id: string;
  username: string;
  first_name: string;
  last_name: string;
}

export default function AdminNotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [createForm, setCreateForm] = useState({ user_id: "", title: "", message: "" });
  const { toast } = useToast();

  useEffect(() => {
    fetchNotifications();
    fetchUsers();
  }, []);

  const fetchNotifications = async () => {
    try {
      setIsLoading(true);
      const data = await adminNotificationService.getAllNotifications();
      setNotifications(data as Notification[]);
    } catch (err: any) {
      setError(err.message);
      toast({
        variant: "destructive",
        title: "Error",
        description: err.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const data = await adminUserService.getAllUsers();
      setUsers(data as User[]);
    } catch (err) {
      console.error("Error fetching users:", err);
      // Fallback: extract users from notifications
      const userMap = new Map<string, User>();
      notifications.forEach((notif) => {
        if (notif.user) {
          userMap.set(notif.user.id, notif.user);
        }
      });
      setUsers(Array.from(userMap.values()));
    }
  };

  const handleCreateNotification = async () => {
    if (!createForm.user_id || !createForm.title || !createForm.message) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please fill in all fields",
      });
      return;
    }

    try {
      await adminNotificationService.createNotification(
        createForm.user_id,
        createForm.title,
        createForm.message
      );
      toast({
        title: "Success",
        description: "Notification created successfully",
      });
      setIsCreateDialogOpen(false);
      setCreateForm({ user_id: "", title: "", message: "" });
      fetchNotifications();
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: err.message,
      });
    }
  };

  if (isLoading) {
    return <div className="text-lg">Loading notifications...</div>;
  }

  if (error) {
    return <div className="text-red-600">Error: {error}</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Notification Management</h1>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>Create Notification</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Notification</DialogTitle>
              <DialogDescription>Send a notification to a user</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>User</Label>
                <Select
                  value={createForm.user_id}
                  onValueChange={(value) =>
                    setCreateForm({ ...createForm, user_id: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select user" />
                  </SelectTrigger>
                  <SelectContent>
                    {users.map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.first_name} {user.last_name} ({user.username})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Title</Label>
                <Input
                  value={createForm.title}
                  onChange={(e) =>
                    setCreateForm({ ...createForm, title: e.target.value })
                  }
                  placeholder="Notification title"
                />
              </div>
              <div>
                <Label>Message</Label>
                <Textarea
                  value={createForm.message}
                  onChange={(e) =>
                    setCreateForm({ ...createForm, message: e.target.value })
                  }
                  placeholder="Notification message"
                  rows={4}
                />
              </div>
              <Button onClick={handleCreateNotification} className="w-full">
                Create Notification
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Notifications ({notifications.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Message</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {notifications.map((notification) => (
                <TableRow key={notification.id}>
                  <TableCell className="font-medium">{notification.title}</TableCell>
                  <TableCell>{notification.message}</TableCell>
                  <TableCell>
                    {notification.user?.first_name} {notification.user?.last_name}
                    {notification.user?.username && ` (@${notification.user.username})`}
                  </TableCell>
                  <TableCell>
                    {notification.is_read ? (
                      <Badge variant="secondary">Read</Badge>
                    ) : (
                      <Badge variant="default">Unread</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {new Date(notification.created_at).toLocaleString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

