import { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';

interface TopupDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TopupDialog({ open, onOpenChange }: TopupDialogProps) {
  const { toast } = useToast();
  const { user, profile } = useAuth();
  const queryClient = useQueryClient();
  const [amount, setAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [transactionId, setTransactionId] = useState<string | null>(null);
  const [checkingStatus, setCheckingStatus] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [transactionStatus, setTransactionStatus] = useState<'pending' | 'success' | 'failed' | null>(null);
  const checkIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const checkCountRef = useRef(0);

  // Cleanup interval on unmount or when dialog closes
  useEffect(() => {
    return () => {
      if (checkIntervalRef.current) {
        clearInterval(checkIntervalRef.current);
      }
    };
  }, []);

  // Reset state when dialog closes
  useEffect(() => {
    if (!open) {
      setAmount('');
      setTransactionId(null);
      setCheckingStatus(false);
      setStatusMessage(null);
      setTransactionStatus(null);
      checkCountRef.current = 0;
      if (checkIntervalRef.current) {
        clearInterval(checkIntervalRef.current);
      }
    }
  }, [open]);

  const checkTransactionStatus = async (tranId: string) => {
    console.log('Checking transaction status for:', tranId);
    try {
      const { data, error } = await supabase.functions.invoke('fastlipa-topup', {
        body: { transaction_id: tranId },
        headers: { 'Content-Type': 'application/json' },
        method: 'POST',
      });

      // Parse response if needed
      const response = typeof data === 'string' ? JSON.parse(data) : data;
      console.log('Status check response:', response);

      if (error) {
        console.error('Status check error:', error);
        return;
      }

      // Check if payment is successful (adjust based on actual Fastlipa response)
      const status = response?.status?.toLowerCase() || response?.transaction_status?.toLowerCase();
      
      if (status === 'success' || status === 'completed' || status === 'successful') {
        // Payment successful - update balance
        setTransactionStatus('success');
        setStatusMessage('Payment successful! Updating your balance...');
        
        // Clear interval
        if (checkIntervalRef.current) {
          clearInterval(checkIntervalRef.current);
        }

        // Update balance
        await supabase.functions.invoke('fastlipa-topup', {
          body: { 
            transaction_id: tranId, 
            user_id: user?.id, 
            amount: parseInt(amount) 
          },
          headers: { 'Content-Type': 'application/json' },
          method: 'POST',
        });

        // Refresh profile data
        queryClient.invalidateQueries({ queryKey: ['profile'] });
        
        toast({
          title: 'Topup Successful!',
          description: `Tsh ${parseInt(amount).toLocaleString()} has been added to your balance.`,
        });

        setTimeout(() => onOpenChange(false), 2000);
      } else if (status === 'failed' || status === 'cancelled') {
        setTransactionStatus('failed');
        setStatusMessage('Payment failed or was cancelled.');
        
        if (checkIntervalRef.current) {
          clearInterval(checkIntervalRef.current);
        }

        // Mark as failed in database
        await supabase.functions.invoke('fastlipa-topup', {
          body: { transaction_id: tranId },
          headers: { 'Content-Type': 'application/json' },
          method: 'POST',
        });
      } else {
        // Still pending
        checkCountRef.current += 1;
        setStatusMessage(`Checking payment status... (${checkCountRef.current}/24)`);
        
        // Stop checking after 2 minutes (24 checks * 5 seconds)
        if (checkCountRef.current >= 24) {
          if (checkIntervalRef.current) {
            clearInterval(checkIntervalRef.current);
          }
          setTransactionStatus('failed');
          setStatusMessage('Payment verification timed out. If you made the payment, please contact support.');
        }
      }
    } catch (err) {
      console.error('Error checking status:', err);
    }
  };

  const handleTopup = async () => {
    if (!user || !profile) {
      toast({
        title: 'Error',
        description: 'Please sign in to top up.',
        variant: 'destructive',
      });
      return;
    }

    const amountNum = parseInt(amount);
    if (!amountNum || amountNum < 500) {
      toast({
        title: 'Invalid Amount',
        description: 'Minimum topup amount is Tsh 500',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    setStatusMessage('Initiating payment...');

    try {
      const { data, error } = await supabase.functions.invoke('fastlipa-topup', {
        body: {
          amount: amountNum,
          phone_number: profile.phone,
          user_id: user.id,
          name: profile.username || 'User',
        },
        headers: { 'Content-Type': 'application/json' },
        method: 'POST',
      });

      console.log('Topup response:', data);

      if (error) throw error;

      const response = typeof data === 'string' ? JSON.parse(data) : data;

      if (response.error) {
        throw new Error(response.error);
      }

      setTransactionId(response.transaction_id);
      setCheckingStatus(true);
      setTransactionStatus('pending');
      setStatusMessage('Payment initiated. Please complete the payment on your phone.');

      toast({
        title: 'Payment Initiated',
        description: 'Please check your phone to complete the payment.',
      });

      // Start checking status every 5 seconds for 2 minutes
      checkCountRef.current = 0;
      checkIntervalRef.current = setInterval(() => {
        checkTransactionStatus(response.transaction_id);
      }, 5000);

    } catch (err: any) {
      console.error('Topup error:', err);
      toast({
        title: 'Topup Failed',
        description: err.message || 'Failed to initiate topup. Please try again.',
        variant: 'destructive',
      });
      setStatusMessage(null);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Top Up Balance</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {!checkingStatus ? (
            <>
              <div className="space-y-2">
                <Label>Phone Number</Label>
                <Input 
                  value={profile?.phone || ''} 
                  disabled 
                  className="bg-muted"
                />
                <p className="text-xs text-muted-foreground">
                  Payment will be requested on this number
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="amount">Amount (Tsh)</Label>
                <Input
                  id="amount"
                  type="number"
                  placeholder="Enter amount (min 500)"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  min={500}
                />
              </div>

              <div className="flex gap-2 flex-wrap">
                {[500, 1000, 2000, 5000, 10000].map((preset) => (
                  <Button
                    key={preset}
                    variant="outline"
                    size="sm"
                    onClick={() => setAmount(preset.toString())}
                    className="flex-1"
                  >
                    {preset.toLocaleString()}
                  </Button>
                ))}
              </div>

              <Button 
                onClick={handleTopup} 
                className="w-full" 
                disabled={isLoading || !amount}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  `Top Up Tsh ${parseInt(amount || '0').toLocaleString()}`
                )}
              </Button>
            </>
          ) : (
            <div className="py-8 text-center space-y-4">
              {transactionStatus === 'pending' && (
                <Clock className="h-16 w-16 mx-auto text-yellow-500 animate-pulse" />
              )}
              {transactionStatus === 'success' && (
                <CheckCircle2 className="h-16 w-16 mx-auto text-green-500" />
              )}
              {transactionStatus === 'failed' && (
                <XCircle className="h-16 w-16 mx-auto text-destructive" />
              )}
              
              <p className="text-sm text-muted-foreground">{statusMessage}</p>
              
              {transactionStatus === 'pending' && (
                <p className="text-xs text-muted-foreground">
                  Checking for up to 2 minutes...
                </p>
              )}

              {transactionStatus === 'failed' && (
                <Button variant="outline" onClick={() => {
                  setCheckingStatus(false);
                  setTransactionId(null);
                  setTransactionStatus(null);
                  setStatusMessage(null);
                }}>
                  Try Again
                </Button>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
