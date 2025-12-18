import { useState } from 'react';
import { Users, Film, DollarSign, Loader2, Shield, Ban, Trash2, UserCheck, Wallet } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAdminStats, useAllUsers, useUpdateUserRole, useBlockUser, useDeleteUser } from '@/hooks/useAdmin';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';

export function AdminStats() {
  const { data: stats, isLoading } = useAdminStats();

  if (isLoading) {
    return (
      <div className="grid grid-cols-3 gap-3">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-4">
              <div className="h-12 bg-muted rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 gap-3">
      <Card className="bg-gradient-to-br from-blue-500/20 to-blue-600/10 border-blue-500/30">
        <CardContent className="p-4 text-center">
          <Users className="h-6 w-6 mx-auto mb-1 text-blue-400" />
          <p className="text-2xl font-bold">{stats?.totalUsers || 0}</p>
          <p className="text-xs text-muted-foreground">Users</p>
        </CardContent>
      </Card>
      
      <Card className="bg-gradient-to-br from-purple-500/20 to-purple-600/10 border-purple-500/30">
        <CardContent className="p-4 text-center">
          <Film className="h-6 w-6 mx-auto mb-1 text-purple-400" />
          <p className="text-2xl font-bold">{stats?.totalMovies || 0}</p>
          <p className="text-xs text-muted-foreground">Movies</p>
        </CardContent>
      </Card>
      
      <Card className="bg-gradient-to-br from-green-500/20 to-green-600/10 border-green-500/30">
        <CardContent className="p-4 text-center">
          <DollarSign className="h-6 w-6 mx-auto mb-1 text-green-400" />
          <p className="text-2xl font-bold">
            {stats?.totalEarnings?.toLocaleString() || 0}
          </p>
          <p className="text-xs text-muted-foreground">Tsh Earned</p>
        </CardContent>
      </Card>
    </div>
  );
}

export function UserManagement() {
  const { toast } = useToast();
  const { data: users = [], isLoading, refetch } = useAllUsers();
  const updateRole = useUpdateUserRole();
  const blockUser = useBlockUser();
  const deleteUser = useDeleteUser();
  
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [balanceDialogOpen, setBalanceDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [newBalance, setNewBalance] = useState('');
  const [isUpdatingBalance, setIsUpdatingBalance] = useState(false);

  const handleMakeDJ = async (userId: string) => {
    try {
      await updateRole.mutateAsync({ userId, role: 'dj' });
      toast({ title: 'Success', description: 'User promoted to DJ' });
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to update role', variant: 'destructive' });
    }
  };

  const handleRevertToSubscriber = async (userId: string) => {
    try {
      await updateRole.mutateAsync({ userId, role: 'subscriber' });
      toast({ title: 'Success', description: 'User reverted to subscriber' });
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to update role', variant: 'destructive' });
    }
  };

  const handleBlock = async (userId: string, isBlocked: boolean) => {
    try {
      await blockUser.mutateAsync({ userId, isBlocked: !isBlocked });
      toast({ title: 'Success', description: isBlocked ? 'User unblocked' : 'User blocked' });
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to update user', variant: 'destructive' });
    }
  };

  const handleDelete = async () => {
    if (!selectedUserId) return;
    try {
      await deleteUser.mutateAsync(selectedUserId);
      toast({ title: 'Success', description: 'User deleted' });
      setDeleteDialogOpen(false);
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to delete user', variant: 'destructive' });
    }
  };

  const handleUpdateBalance = async () => {
    if (!selectedUser || !newBalance) return;
    setIsUpdatingBalance(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ balance: parseFloat(newBalance) })
        .eq('user_id', selectedUser.user_id);
      
      if (error) throw error;
      
      toast({ title: 'Success', description: 'Balance updated successfully' });
      setBalanceDialogOpen(false);
      setNewBalance('');
      refetch();
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to update balance', variant: 'destructive' });
    } finally {
      setIsUpdatingBalance(false);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-4 flex justify-center">
          <Loader2 className="h-6 w-6 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">User Management</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 max-h-[400px] overflow-y-auto">
          {users.filter(u => u.role !== 'admin').map((user) => (
            <div 
              key={user.id} 
              className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{user.username || user.phone}</span>
                  <Badge variant={user.role === 'dj' ? 'default' : 'secondary'}>
                    {user.role}
                  </Badge>
                  {user.is_blocked && (
                    <Badge variant="destructive">Blocked</Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">{user.phone}</p>
                <p className="text-xs text-primary">Bal: Tsh {(user.balance || 0).toLocaleString()}</p>
              </div>
              
              <div className="flex gap-1 flex-wrap justify-end">
                {user.role === 'subscriber' && (
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => {
                      setSelectedUser(user);
                      setNewBalance((user.balance || 0).toString());
                      setBalanceDialogOpen(true);
                    }}
                    title="Update Balance"
                  >
                    <Wallet className="h-3 w-3" />
                  </Button>
                )}
                
                {user.role === 'subscriber' ? (
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handleMakeDJ(user.user_id)}
                    disabled={updateRole.isPending}
                    title="Make DJ"
                  >
                    <Shield className="h-3 w-3" />
                  </Button>
                ) : user.role === 'dj' && (
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handleRevertToSubscriber(user.user_id)}
                    disabled={updateRole.isPending}
                    title="Revert to Subscriber"
                  >
                    <UserCheck className="h-3 w-3" />
                  </Button>
                )}
                
                <Button 
                  size="sm" 
                  variant={user.is_blocked ? 'default' : 'outline'}
                  onClick={() => handleBlock(user.user_id, user.is_blocked)}
                  disabled={blockUser.isPending}
                  title={user.is_blocked ? 'Unblock' : 'Block'}
                >
                  <Ban className="h-3 w-3" />
                </Button>
                
                <Button 
                  size="sm" 
                  variant="destructive"
                  onClick={() => {
                    setSelectedUserId(user.user_id);
                    setDeleteDialogOpen(true);
                  }}
                  title="Delete"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </div>
          ))}
          
          {users.filter(u => u.role !== 'admin').length === 0 && (
            <p className="text-center text-muted-foreground py-4">No users found</p>
          )}
        </CardContent>
      </Card>

      {/* Balance Update Dialog */}
      <Dialog open={balanceDialogOpen} onOpenChange={setBalanceDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Update User Balance</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">
                User: {selectedUser?.username || selectedUser?.phone}
              </p>
              <p className="text-sm text-muted-foreground">
                Current Balance: Tsh {(selectedUser?.balance || 0).toLocaleString()}
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="newBalance">New Balance (Tsh)</Label>
              <Input
                id="newBalance"
                type="number"
                value={newBalance}
                onChange={(e) => setNewBalance(e.target.value)}
                placeholder="Enter new balance"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBalanceDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateBalance} disabled={isUpdatingBalance}>
              {isUpdatingBalance ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Update'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete User?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The user and all their data will be permanently deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
