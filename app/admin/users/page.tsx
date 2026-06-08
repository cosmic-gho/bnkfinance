"use client";

import { useEffect, useState } from "react";
import { adminUserService } from "@/lib/admin-services";
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
import { Shield, ShieldOff } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface User {
  id: string;
  username: string;
  first_name: string;
  last_name: string;
  is_admin: boolean;
  currency?: string;
  can_transfer?: boolean;
  created_at: string;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isPinDialogOpen, setIsPinDialogOpen] = useState(false);
  const [pinType, setPinType] = useState<1 | 2>(1);
  const [isCurrencyDialogOpen, setIsCurrencyDialogOpen] = useState(false);
  const [pinForm, setPinForm] = useState({ pin: "", confirmPin: "" });
  const [currencyForm, setCurrencyForm] = useState({ currency: "USD" });
  const [editForm, setEditForm] = useState({ first_name: "", last_name: "", username: "", is_admin: false, currency: "USD" });
  const { toast } = useToast();

  const currencies = [
    { code: "USD", name: "US Dollar" },
    { code: "EUR", name: "Euro" },
    { code: "GBP", name: "British Pound" },
    { code: "JPY", name: "Japanese Yen" },
    { code: "CNY", name: "Chinese Yuan" },
    { code: "AUD", name: "Australian Dollar" },
    { code: "CAD", name: "Canadian Dollar" },
    { code: "CHF", name: "Swiss Franc" },
    { code: "HKD", name: "Hong Kong Dollar" },
    { code: "SGD", name: "Singapore Dollar" },
  ];

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const data = await adminUserService.getAllUsers();
      setUsers(data as User[]);
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

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setEditForm({
      first_name: user.first_name || "",
      last_name: user.last_name || "",
      username: user.username || "",
      is_admin: user.is_admin || false,
      currency: user.currency || "USD",
    });
    setIsEditDialogOpen(true);
  };

  const handleSaveUser = async () => {
    if (!selectedUser) return;

    try {
      await adminUserService.updateUser(selectedUser.id, editForm);
      toast({
        title: "Success",
        description: "User updated successfully",
      });
      setIsEditDialogOpen(false);
      fetchUsers();
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: err.message,
      });
    }
  };

  const handleToggleAdmin = async (user: User) => {
    try {
      await adminUserService.setAdminStatus(user.id, !user.is_admin);
      toast({
        title: "Success",
        description: `User ${!user.is_admin ? "promoted to" : "demoted from"} admin`,
      });
      fetchUsers();
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: err.message,
      });
    }
  };

  const handleSetPin = (user: User, type: 1 | 2 = 1) => {
    setSelectedUser(user);
    setPinType(type);
    setPinForm({ pin: "", confirmPin: "" });
    setIsPinDialogOpen(true);
  };

  const handleSavePin = async () => {
    if (!selectedUser) return;

    if (pinForm.pin.length !== 4 || !/^\d{4}$/.test(pinForm.pin)) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "PIN must be exactly 4 digits",
      });
      return;
    }

    if (pinForm.pin !== pinForm.confirmPin) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "PINs do not match",
      });
      return;
    }

    try {
      if (pinType === 1) {
        await adminUserService.setTransferPin(selectedUser.id, pinForm.pin);
      } else {
        await adminUserService.setTransferPin2(selectedUser.id, pinForm.pin);
      }
      toast({
        title: "Success",
        description: `Transfer PIN ${pinType} set successfully`,
      });
      setIsPinDialogOpen(false);
      setPinForm({ pin: "", confirmPin: "" });
      fetchUsers();
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: err.message,
      });
    }
  };

  const handleClearPin = async (user: User, type: 1 | 2 = 1) => {
    try {
      if (type === 1) {
        await adminUserService.clearTransferPin(user.id);
      } else {
        await adminUserService.clearTransferPin2(user.id);
      }
      toast({
        title: "Success",
        description: `Transfer PIN ${type} cleared successfully`,
      });
      fetchUsers();
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: err.message,
      });
    }
  };

  const handleChangeCurrency = (user: User) => {
    setSelectedUser(user);
    setCurrencyForm({ currency: user.currency || "USD" });
    setIsCurrencyDialogOpen(true);
  };

  const handleSaveCurrency = async () => {
    if (!selectedUser) return;

    try {
      await adminUserService.updateUserCurrency(selectedUser.id, currencyForm.currency);
      toast({
        title: "Success",
        description: `User currency updated to ${currencyForm.currency}`,
      });
      setIsCurrencyDialogOpen(false);
      fetchUsers();
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: err.message,
      });
    }
  };

  const handleToggleTransfer = async (user: User) => {
    try {
      await adminUserService.toggleTransferPermission(user.id, !(user.can_transfer ?? true));
      toast({
        title: "Success",
        description: `Transfer permission ${user.can_transfer ? "disabled" : "enabled"} for user`,
      });
      fetchUsers();
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: err.message,
      });
    }
  };

  if (isLoading) {
    return <div className="text-lg">Loading users...</div>;
  }

  if (error) {
    return <div className="text-red-600">Error: {error}</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">User Management</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Users ({users.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Username</TableHead>
                <TableHead>Currency</TableHead>
                <TableHead>User ID</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    {user.first_name} {user.last_name}
                  </TableCell>
                  <TableCell>{user.username || "-"}</TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      <Badge variant="outline">{user.currency || "USD"}</Badge>
                      {user.can_transfer === false && (
                        <Badge variant="destructive" className="text-xs">Transfers Disabled</Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">
                    {user.id.substring(0, 8)}...
                  </TableCell>
                  <TableCell>
                    {user.is_admin ? (
                      <Badge variant="default">Admin</Badge>
                    ) : (
                      <Badge variant="secondary">User</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {new Date(user.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditUser(user)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleToggleAdmin(user)}
                        title={user.is_admin ? "Remove admin" : "Make admin"}
                      >
                        {user.is_admin ? (
                          <ShieldOff className="h-4 w-4" />
                        ) : (
                          <Shield className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSetPin(user, 1)}
                        title="Set Transfer PIN 1"
                      >
                        PIN 1
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSetPin(user, 2)}
                        title="Set Transfer PIN 2"
                      >
                        PIN 2
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleChangeCurrency(user)}
                        title="Change Currency"
                      >
                        💱
                      </Button>
                      <Button
                        variant={user.can_transfer === false ? "destructive" : "outline"}
                        size="sm"
                        onClick={() => handleToggleTransfer(user)}
                        title={user.can_transfer === false ? "Enable Transfers" : "Disable Transfers"}
                      >
                        {user.can_transfer === false ? "🔒" : "🔓"}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>Update user information</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>First Name</Label>
              <Input
                value={editForm.first_name}
                onChange={(e) =>
                  setEditForm({ ...editForm, first_name: e.target.value })
                }
              />
            </div>
            <div>
              <Label>Last Name</Label>
              <Input
                value={editForm.last_name}
                onChange={(e) =>
                  setEditForm({ ...editForm, last_name: e.target.value })
                }
              />
            </div>
            <div>
              <Label>Username</Label>
              <Input
                value={editForm.username}
                onChange={(e) =>
                  setEditForm({ ...editForm, username: e.target.value })
                }
              />
            </div>
            <div>
              <Label>Currency</Label>
              <Select
                value={editForm.currency}
                onValueChange={(value) =>
                  setEditForm({ ...editForm, currency: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select currency" />
                </SelectTrigger>
                <SelectContent>
                  {currencies.map((curr) => (
                    <SelectItem key={curr.code} value={curr.code}>
                      {curr.code} - {curr.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="is_admin"
                checked={editForm.is_admin}
                onChange={(e) =>
                  setEditForm({ ...editForm, is_admin: e.target.checked })
                }
                className="rounded"
              />
              <Label htmlFor="is_admin">Admin</Label>
            </div>
            <Button onClick={handleSaveUser} className="w-full">
              Save Changes
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isCurrencyDialogOpen} onOpenChange={setIsCurrencyDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Currency</DialogTitle>
            <DialogDescription>
              Change currency for {selectedUser?.first_name} {selectedUser?.last_name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Currency</Label>
              <Select
                value={currencyForm.currency}
                onValueChange={(value) =>
                  setCurrencyForm({ currency: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select currency" />
                </SelectTrigger>
                <SelectContent>
                  {currencies.map((curr) => (
                    <SelectItem key={curr.code} value={curr.code}>
                      {curr.code} - {curr.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleSaveCurrency} className="flex-1">
                Update Currency
              </Button>
              <Button
                variant="outline"
                onClick={() => setIsCurrencyDialogOpen(false)}
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isPinDialogOpen} onOpenChange={setIsPinDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Set Transfer PIN {pinType}</DialogTitle>
            <DialogDescription>
              Set a 4-digit PIN {pinType} for {selectedUser?.first_name} {selectedUser?.last_name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>4-Digit PIN {pinType}</Label>
              <Input
                type="password"
                maxLength={4}
                value={pinForm.pin}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '').slice(0, 4);
                  setPinForm({ ...pinForm, pin: value });
                }}
                placeholder="0000"
                className="font-mono text-center text-2xl tracking-widest"
              />
            </div>
            <div>
              <Label>Confirm PIN {pinType}</Label>
              <Input
                type="password"
                maxLength={4}
                value={pinForm.confirmPin}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '').slice(0, 4);
                  setPinForm({ ...pinForm, confirmPin: value });
                }}
                placeholder="0000"
                className="font-mono text-center text-2xl tracking-widest"
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleSavePin} className="flex-1" disabled={pinForm.pin.length !== 4 || pinForm.pin !== pinForm.confirmPin}>
                Set PIN {pinType}
              </Button>
              {selectedUser && (
                <Button
                  variant="outline"
                  onClick={() => handleClearPin(selectedUser, pinType)}
                >
                  Clear PIN {pinType}
                </Button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

