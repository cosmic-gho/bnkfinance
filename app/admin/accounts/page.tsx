"use client";

import { useEffect, useState } from "react";
import { adminAccountService } from "@/lib/admin-services";
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
import { adminUserService } from "@/lib/admin-services";
import { Plus, Settings } from "lucide-react";

interface Account {
  id: number;
  account_number: string;
  balance: string;
  is_active: boolean;
  transaction_limit?: number;
  daily_limit?: number;
  created_at: string;
  account_type: {
    id: number;
    name: string;
    description: string;
  };
  user: {
    id: string;
    username: string;
    first_name: string;
    last_name: string;
  };
}

interface AccountType {
  id: number;
  name: string;
  description: string;
}

interface User {
  id: string;
  username: string;
  first_name: string;
  last_name: string;
}

export default function AdminAccountsPage() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isLimitDialogOpen, setIsLimitDialogOpen] = useState(false);
  const [editForm, setEditForm] = useState({ balance: "", is_active: true });
  const [limitForm, setLimitForm] = useState({ transaction_limit: "", daily_limit: "" });
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [createForm, setCreateForm] = useState({ 
    user_id: "", 
    account_type_id: "", 
    balance: "0.00",
    account_number: "" 
  });
  const [users, setUsers] = useState<User[]>([]);
  const [accountTypes, setAccountTypes] = useState<AccountType[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [isCreatingAccount, setIsCreatingAccount] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchAccounts();
    fetchUsers();
    fetchAccountTypes();
  }, []);

  const fetchUsers = async () => {
    try {
      setIsLoadingUsers(true);
      const data = await adminUserService.getAllUsers();
      console.log("Fetched users data:", data);
      if (data && Array.isArray(data)) {
        const validUsers = data.filter((user: any) => user && user.id);
        console.log("Valid users:", validUsers);
        setUsers(validUsers as User[]);
        if (validUsers.length === 0) {
          toast({
            variant: "destructive",
            title: "No Users Found",
            description: "There are no users in the system. Please create a user first.",
          });
        }
      } else {
        console.warn("Users data is not an array:", data);
        setUsers([]);
      }
    } catch (err: any) {
      console.error("Error fetching users:", err);
      toast({
        variant: "destructive",
        title: "Error",
        description: `Failed to load users: ${err.message}`,
      });
      setUsers([]);
    } finally {
      setIsLoadingUsers(false);
    }
  };

  const fetchAccountTypes = async () => {
    try {
      const data = await adminAccountService.getAccountTypes();
      setAccountTypes(data as AccountType[]);
    } catch (err: any) {
      console.error("Error fetching account types:", err);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load account types",
      });
    }
  };

  const fetchAccounts = async () => {
    try {
      setIsLoading(true);
      const data = await adminAccountService.getAllAccounts();
      setAccounts(data as Account[]);
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

  const handleEditAccount = (account: Account) => {
    setSelectedAccount(account);
    setEditForm({
      balance: account.balance.toString(),
      is_active: account.is_active,
    });
    setIsEditDialogOpen(true);
  };

  const handleEditLimits = (account: Account) => {
    setSelectedAccount(account);
    setLimitForm({
      transaction_limit: (account.transaction_limit || 500000).toString(),
      daily_limit: (account.daily_limit || 10000).toString(),
    });
    setIsLimitDialogOpen(true);
  };

  const handleSaveLimits = async () => {
    if (!selectedAccount) return;

    try {
      const transactionLimit = parseFloat(limitForm.transaction_limit);
      const dailyLimit = parseFloat(limitForm.daily_limit);

      if (isNaN(transactionLimit) || isNaN(dailyLimit)) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Please enter valid numbers for limits",
        });
        return;
      }

      if (transactionLimit < 0 || dailyLimit < 0) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Limits cannot be negative",
        });
        return;
      }

      await adminAccountService.updateAccountLimits(
        selectedAccount.id,
        transactionLimit,
        dailyLimit
      );

      toast({
        title: "Success",
        description: "Account limits updated successfully",
      });

      setIsLimitDialogOpen(false);
      setSelectedAccount(null);
      setLimitForm({ transaction_limit: "", daily_limit: "" });
      fetchAccounts();
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: err.message || "Failed to update account limits",
      });
    }
  };

  const handleSaveAccount = async () => {
    if (!selectedAccount) return;

    try {
      await adminAccountService.updateAccount(selectedAccount.id, {
        balance: parseFloat(editForm.balance),
        is_active: editForm.is_active,
      });
      toast({
        title: "Success",
        description: "Account updated successfully",
      });
      setIsEditDialogOpen(false);
      fetchAccounts();
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: err.message,
      });
    }
  };

  const handleCreateAccount = async () => {
    console.log("Create account clicked", createForm);
    
    if (!createForm.user_id || !createForm.account_type_id) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please select a user and account type",
      });
      return;
    }

    if (isCreatingAccount) {
      return; // Prevent double submission
    }

    try {
      setIsCreatingAccount(true);
      console.log("Creating account with data:", {
        user_id: createForm.user_id,
        account_type_id: parseInt(createForm.account_type_id),
        balance: parseFloat(createForm.balance) || 0,
        account_number: createForm.account_number || undefined,
      });

      const result = await adminAccountService.createAccount({
        user_id: createForm.user_id,
        account_type_id: parseInt(createForm.account_type_id),
        balance: parseFloat(createForm.balance) || 0,
        account_number: createForm.account_number || undefined,
      });
      
      console.log("Account created successfully:", result);
      
      toast({
        title: "Success",
        description: "Account created successfully",
      });
      setIsCreateDialogOpen(false);
      setCreateForm({ user_id: "", account_type_id: "", balance: "0.00", account_number: "" });
      fetchAccounts();
    } catch (err: any) {
      console.error("Error creating account:", err);
      toast({
        variant: "destructive",
        title: "Error",
        description: err.message || "Failed to create account. Please try again.",
      });
    } finally {
      setIsCreatingAccount(false);
    }
  };

  if (isLoading) {
    return <div className="text-lg">Loading accounts...</div>;
  }

  if (error) {
    return <div className="text-red-600">Error: {error}</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Account Management</h1>
        <Dialog 
          open={isCreateDialogOpen} 
          onOpenChange={(open) => {
            setIsCreateDialogOpen(open);
            if (open) {
              // Refetch users when dialog opens to ensure fresh data
              fetchUsers();
              fetchAccountTypes();
            }
          }}
        >
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Account
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Account</DialogTitle>
              <DialogDescription>Create a new account for a user</DialogDescription>
            </DialogHeader>
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                handleCreateAccount();
              }}
              className="space-y-4"
            >
              <div>
                <Label>User</Label>
                {isLoadingUsers ? (
                  <div className="text-sm text-muted-foreground">Loading users...</div>
                ) : users.length === 0 ? (
                  <div className="text-sm text-destructive">
                    No users available. Please ensure users exist in the system.
                  </div>
                ) : (
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
                          {user.first_name || user.last_name 
                            ? `${user.first_name || ''} ${user.last_name || ''}`.trim()
                            : 'Unnamed User'
                          }
                          {user.username && ` (@${user.username})`}
                          {!user.first_name && !user.last_name && !user.username && ` (ID: ${user.id.substring(0, 8)}...)`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
              <div>
                <Label>Account Type</Label>
                <Select
                  value={createForm.account_type_id}
                  onValueChange={(value) =>
                    setCreateForm({ ...createForm, account_type_id: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select account type" />
                  </SelectTrigger>
                  <SelectContent>
                    {accountTypes.map((type) => (
                      <SelectItem key={type.id} value={type.id.toString()}>
                        {type.name} - {type.description}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Initial Balance</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={createForm.balance}
                  onChange={(e) =>
                    setCreateForm({ ...createForm, balance: e.target.value })
                  }
                  placeholder="0.00"
                />
              </div>
              <div>
                <Label>Account Number (Optional - Auto-generated if empty)</Label>
                <Input
                  value={createForm.account_number}
                  onChange={(e) =>
                    setCreateForm({ ...createForm, account_number: e.target.value })
                  }
                  placeholder="Leave empty for auto-generation"
                />
              </div>
              <Button 
                type="submit"
                className="w-full"
                disabled={isCreatingAccount || !createForm.user_id || !createForm.account_type_id}
              >
                {isCreatingAccount ? "Creating Account..." : "Create Account"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Accounts ({accounts.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Account Number</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Owner</TableHead>
                <TableHead>Balance</TableHead>
                <TableHead>Transaction Limit</TableHead>
                <TableHead>Daily Limit</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {accounts.map((account) => (
                <TableRow key={account.id}>
                  <TableCell className="font-mono">{account.account_number}</TableCell>
                  <TableCell>{account.account_type.name}</TableCell>
                  <TableCell>
                    {account.user?.first_name} {account.user?.last_name}
                    {account.user?.username && ` (@${account.user.username})`}
                  </TableCell>
                  <TableCell>${parseFloat(account.balance).toFixed(2)}</TableCell>
                  <TableCell>
                    ${(account.transaction_limit || 500000).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </TableCell>
                  <TableCell>
                    ${(account.daily_limit || 10000).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </TableCell>
                  <TableCell>
                    {account.is_active ? (
                      <Badge variant="default">Active</Badge>
                    ) : (
                      <Badge variant="secondary">Inactive</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {new Date(account.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditAccount(account)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditLimits(account)}
                        title="Edit Limits"
                      >
                        <Settings className="h-4 w-4" />
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
            <DialogTitle>Edit Account</DialogTitle>
            <DialogDescription>Update account information</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Balance</Label>
              <Input
                type="number"
                step="0.01"
                value={editForm.balance}
                onChange={(e) =>
                  setEditForm({ ...editForm, balance: e.target.value })
                }
              />
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="is_active"
                checked={editForm.is_active}
                onChange={(e) =>
                  setEditForm({ ...editForm, is_active: e.target.checked })
                }
                className="rounded"
              />
              <Label htmlFor="is_active">Active</Label>
            </div>
            <Button onClick={handleSaveAccount} className="w-full">
              Save Changes
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isLimitDialogOpen} onOpenChange={setIsLimitDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Account Limits</DialogTitle>
            <DialogDescription>
              Update transaction and daily limits for account {selectedAccount?.account_number}
            </DialogDescription>
          </DialogHeader>
          {selectedAccount && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="transaction_limit">Transaction Limit</Label>
                <Input
                  id="transaction_limit"
                  type="number"
                  step="0.01"
                  min="0"
                  value={limitForm.transaction_limit}
                  onChange={(e) => setLimitForm({ ...limitForm, transaction_limit: e.target.value })}
                  placeholder="500000"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Maximum amount per transaction
                </p>
              </div>
              <div>
                <Label htmlFor="daily_limit">Daily Limit</Label>
                <Input
                  id="daily_limit"
                  type="number"
                  step="0.01"
                  min="0"
                  value={limitForm.daily_limit}
                  onChange={(e) => setLimitForm({ ...limitForm, daily_limit: e.target.value })}
                  placeholder="10000"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Maximum total amount per day
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsLimitDialogOpen(false);
                    setSelectedAccount(null);
                    setLimitForm({ transaction_limit: "", daily_limit: "" });
                  }}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSaveLimits}
                  className="flex-1"
                  disabled={!limitForm.transaction_limit || !limitForm.daily_limit}
                >
                  Update Limits
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}


