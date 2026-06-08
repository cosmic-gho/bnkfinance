"use client";

import { useEffect, useState } from "react";
import { adminCryptoWalletService } from "@/lib/admin-services";
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
import { Plus, Edit, Trash2, Copy, Check } from "lucide-react";
import { Switch } from "@/components/ui/switch";

interface CryptoWallet {
  id: number;
  name: string;
  symbol: string;
  wallet_address: string;
  logo_url: string | null;
  network: string | null;
  is_active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export default function AdminCryptoWalletsPage() {
  const [wallets, setWallets] = useState<CryptoWallet[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingWallet, setEditingWallet] = useState<CryptoWallet | null>(null);
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: "",
    symbol: "",
    wallet_address: "",
    logo_url: "",
    network: "",
    is_active: true,
    display_order: 0,
  });

  useEffect(() => {
    fetchWallets();
  }, []);

  const fetchWallets = async () => {
    try {
      setIsLoading(true);
      const data = await adminCryptoWalletService.getAllCryptoWallets();
      setWallets(data as CryptoWallet[]);
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

  const handleCreate = async () => {
    if (!formData.name || !formData.symbol || !formData.wallet_address) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please fill in name, symbol, and wallet address",
      });
      return;
    }

    try {
      await adminCryptoWalletService.createCryptoWallet({
        name: formData.name,
        symbol: formData.symbol,
        wallet_address: formData.wallet_address,
        logo_url: formData.logo_url || null,
        network: formData.network || null,
        is_active: formData.is_active,
        display_order: parseInt(formData.display_order.toString()) || 0,
      });

      toast({
        title: "Success",
        description: "Crypto wallet created successfully",
      });

      setIsCreateDialogOpen(false);
      setFormData({
        name: "",
        symbol: "",
        wallet_address: "",
        logo_url: "",
        network: "",
        is_active: true,
        display_order: 0,
      });
      fetchWallets();
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: err.message,
      });
    }
  };

  const handleEdit = (wallet: CryptoWallet) => {
    setEditingWallet(wallet);
    setFormData({
      name: wallet.name,
      symbol: wallet.symbol,
      wallet_address: wallet.wallet_address,
      logo_url: wallet.logo_url || "",
      network: wallet.network || "",
      is_active: wallet.is_active,
      display_order: wallet.display_order,
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdate = async () => {
    if (!editingWallet) return;

    if (!formData.name || !formData.symbol || !formData.wallet_address) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please fill in name, symbol, and wallet address",
      });
      return;
    }

    try {
      await adminCryptoWalletService.updateCryptoWallet(editingWallet.id, {
        name: formData.name,
        symbol: formData.symbol,
        wallet_address: formData.wallet_address,
        logo_url: formData.logo_url || null,
        network: formData.network || null,
        is_active: formData.is_active,
        display_order: parseInt(formData.display_order.toString()) || 0,
      });

      toast({
        title: "Success",
        description: "Crypto wallet updated successfully",
      });

      setIsEditDialogOpen(false);
      setEditingWallet(null);
      setFormData({
        name: "",
        symbol: "",
        wallet_address: "",
        logo_url: "",
        network: "",
        is_active: true,
        display_order: 0,
      });
      fetchWallets();
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: err.message,
      });
    }
  };

  const handleDelete = async (walletId: number) => {
    if (!confirm("Are you sure you want to delete this crypto wallet?")) {
      return;
    }

    try {
      await adminCryptoWalletService.deleteCryptoWallet(walletId);
      toast({
        title: "Success",
        description: "Crypto wallet deleted successfully",
      });
      fetchWallets();
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: err.message,
      });
    }
  };

  const handleCopyAddress = async (address: string, walletId: number) => {
    try {
      await navigator.clipboard.writeText(address);
      setCopiedId(walletId);
      toast({
        title: "Copied!",
        description: "Wallet address copied to clipboard",
      });
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to copy address",
      });
    }
  };

  if (isLoading) {
    return <div className="text-lg">Loading crypto wallets...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Crypto Wallets Management</h1>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Crypto Wallet
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create Crypto Wallet</DialogTitle>
              <DialogDescription>
                Add a new crypto wallet for users to deposit funds
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Crypto Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="e.g., Bitcoin, Ethereum, USDT"
                />
              </div>
              <div>
                <Label htmlFor="symbol">Symbol *</Label>
                <Input
                  id="symbol"
                  value={formData.symbol}
                  onChange={(e) =>
                    setFormData({ ...formData, symbol: e.target.value.toUpperCase() })
                  }
                  placeholder="e.g., BTC, ETH, USDT"
                  maxLength={10}
                />
              </div>
              <div>
                <Label htmlFor="wallet_address">Wallet Address *</Label>
                <Input
                  id="wallet_address"
                  value={formData.wallet_address}
                  onChange={(e) =>
                    setFormData({ ...formData, wallet_address: e.target.value })
                  }
                  placeholder="Enter the crypto wallet address"
                />
              </div>
              <div>
                <Label htmlFor="logo_url">Logo URL</Label>
                <Input
                  id="logo_url"
                  value={formData.logo_url}
                  onChange={(e) =>
                    setFormData({ ...formData, logo_url: e.target.value })
                  }
                  placeholder="https://example.com/logo.png"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  URL to the crypto logo image
                </p>
              </div>
              <div>
                <Label htmlFor="network">Network</Label>
                <Input
                  id="network"
                  value={formData.network}
                  onChange={(e) =>
                    setFormData({ ...formData, network: e.target.value })
                  }
                  placeholder="e.g., Bitcoin, Ethereum, TRC20, BEP20"
                />
              </div>
              <div>
                <Label htmlFor="display_order">Display Order</Label>
                <Input
                  id="display_order"
                  type="number"
                  value={formData.display_order}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      display_order: parseInt(e.target.value) || 0,
                    })
                  }
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Lower numbers appear first
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, is_active: checked })
                  }
                />
                <Label htmlFor="is_active">Active (visible to users)</Label>
              </div>
              <Button onClick={handleCreate} className="w-full">
                Create Wallet
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Crypto Wallets ({wallets.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Logo</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Symbol</TableHead>
                <TableHead>Network</TableHead>
                <TableHead>Wallet Address</TableHead>
                <TableHead>Order</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {wallets.map((wallet) => (
                <TableRow key={wallet.id}>
                  <TableCell>
                    {wallet.logo_url ? (
                      <img
                        src={wallet.logo_url}
                        alt={wallet.name}
                        className="h-8 w-8 rounded-full object-cover"
                      />
                    ) : (
                      <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-xs font-semibold">
                        {wallet.symbol.slice(0, 2)}
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="font-medium">{wallet.name}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{wallet.symbol}</Badge>
                  </TableCell>
                  <TableCell>{wallet.network || "-"}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <code className="text-xs font-mono max-w-[200px] truncate">
                        {wallet.wallet_address}
                      </code>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          handleCopyAddress(wallet.wallet_address, wallet.id)
                        }
                      >
                        {copiedId === wallet.id ? (
                          <Check className="h-4 w-4 text-green-600" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell>{wallet.display_order}</TableCell>
                  <TableCell>
                    {wallet.is_active ? (
                      <Badge variant="default">Active</Badge>
                    ) : (
                      <Badge variant="secondary">Inactive</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(wallet)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(wallet.id)}
                      >
                        <Trash2 className="h-4 w-4" />
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
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Crypto Wallet</DialogTitle>
            <DialogDescription>
              Update crypto wallet information
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit_name">Crypto Name *</Label>
              <Input
                id="edit_name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
            </div>
            <div>
              <Label htmlFor="edit_symbol">Symbol *</Label>
              <Input
                id="edit_symbol"
                value={formData.symbol}
                onChange={(e) =>
                  setFormData({ ...formData, symbol: e.target.value.toUpperCase() })
                }
                maxLength={10}
              />
            </div>
            <div>
              <Label htmlFor="edit_wallet_address">Wallet Address *</Label>
              <Input
                id="edit_wallet_address"
                value={formData.wallet_address}
                onChange={(e) =>
                  setFormData({ ...formData, wallet_address: e.target.value })
                }
              />
            </div>
            <div>
              <Label htmlFor="edit_logo_url">Logo URL</Label>
              <Input
                id="edit_logo_url"
                value={formData.logo_url}
                onChange={(e) =>
                  setFormData({ ...formData, logo_url: e.target.value })
                }
              />
            </div>
            <div>
              <Label htmlFor="edit_network">Network</Label>
              <Input
                id="edit_network"
                value={formData.network}
                onChange={(e) =>
                  setFormData({ ...formData, network: e.target.value })
                }
              />
            </div>
            <div>
              <Label htmlFor="edit_display_order">Display Order</Label>
              <Input
                id="edit_display_order"
                type="number"
                value={formData.display_order}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    display_order: parseInt(e.target.value) || 0,
                  })
                }
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="edit_is_active"
                checked={formData.is_active}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, is_active: checked })
                }
              />
              <Label htmlFor="edit_is_active">Active</Label>
            </div>
            <Button onClick={handleUpdate} className="w-full">
              Update Wallet
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

