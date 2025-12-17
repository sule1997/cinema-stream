import { Check, X, Loader2, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useWithdrawRequests, useApproveWithdraw, useRejectWithdraw } from '@/hooks/useAdmin';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export function WithdrawRequests() {
  const { toast } = useToast();
  const { user } = useAuth();
  const { data: requests = [], isLoading } = useWithdrawRequests();
  const approveWithdraw = useApproveWithdraw();
  const rejectWithdraw = useRejectWithdraw();

  const pendingRequests = requests.filter(r => r.status === 'pending');

  const handleApprove = async (id: string) => {
    if (!user) return;
    try {
      await approveWithdraw.mutateAsync({ id, adminId: user.id });
      toast({ title: 'Success', description: 'Withdrawal approved' });
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to approve', variant: 'destructive' });
    }
  };

  const handleReject = async (id: string) => {
    if (!user) return;
    try {
      await rejectWithdraw.mutateAsync({ id, adminId: user.id });
      toast({ title: 'Success', description: 'Withdrawal rejected' });
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to reject', variant: 'destructive' });
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
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Withdraw Requests
          {pendingRequests.length > 0 && (
            <Badge variant="destructive">{pendingRequests.length}</Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 max-h-[300px] overflow-y-auto">
        {requests.map((request) => (
          <div 
            key={request.id} 
            className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-medium">
                  {request.profiles?.username || request.profiles?.phone || 'Unknown'}
                </span>
                <Badge 
                  variant={
                    request.status === 'approved' ? 'default' : 
                    request.status === 'rejected' ? 'destructive' : 
                    'secondary'
                  }
                >
                  {request.status}
                </Badge>
              </div>
              <p className="text-lg font-bold text-primary">
                Tsh {request.amount.toLocaleString()}
              </p>
              <p className="text-xs text-muted-foreground">
                {new Date(request.created_at).toLocaleDateString()}
              </p>
            </div>
            
            {request.status === 'pending' && (
              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  variant="default"
                  onClick={() => handleApprove(request.id)}
                  disabled={approveWithdraw.isPending}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Check className="h-4 w-4" />
                </Button>
                <Button 
                  size="sm" 
                  variant="destructive"
                  onClick={() => handleReject(request.id)}
                  disabled={rejectWithdraw.isPending}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        ))}
        
        {requests.length === 0 && (
          <p className="text-center text-muted-foreground py-4">
            No withdrawal requests
          </p>
        )}
      </CardContent>
    </Card>
  );
}
