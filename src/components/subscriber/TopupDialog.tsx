import { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, CheckCircle2, XCircle, Clock, Crown } from 'lucide-react';
import { useSubscriptionPrice } from '@/hooks/useSubscription';
import { useQueryClient } from '@tanstack/react-query';

interface TopupDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TopupDialog({ open, onOpenChange }: TopupDialogProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user, profile, refetchProfile } = useAuth();
  const { data: subscriptionPrice, isLoading: priceLoading } = useSubscriptionPrice();
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
      const { data, error } = await supabase.functions.invoke('fastlipa-topup?action=check-status', {
        body: { transaction_id: tranId },
      });

      const response = typeof data === 'string' ? JSON.parse(data) : data;
      console.log('Status check response:', response);

      if (error) {
        console.error('Status check error:', error);
        return;
      }

      const normalizedStatus = response?.normalized_status || 'UNKNOWN';
      
      if (normalizedStatus === 'SUCCESS' || response?.status === 'completed') {
        setTransactionStatus('success');
        setStatusMessage('Payment successful! Your subscription is now active.');
        
        if (checkIntervalRef.current) {
          clearInterval(checkIntervalRef.current);
        }

        // Refresh profile and subscription status
        await refetchProfile();
        queryClient.invalidateQueries({ queryKey: ['subscription-status'] });
        
        toast({
          title: 'Subscription Activated!',
          description: 'You now have access to all premium movies for 30 days.',
        });

        setTimeout(() => onOpenChange(false), 2000);
      } else if (normalizedStatus === 'FAILED' || response?.status === 'failed') {
        setTransactionStatus('failed');
        setStatusMessage('Payment failed or was cancelled.');
        
        if (checkIntervalRef.current) {
          clearInterval(checkIntervalRef.current);
        }
      } else {
        checkCountRef.current += 1;
        setStatusMessage(`Checking payment status... (${checkCountRef.current}/24)`);
        
        if (checkCountRef.current >= 24) {
          if (checkIntervalRef.current) {
            clearInterval(checkIntervalRef.current);
          }
          setTransactionStatus('failed');
          setStatusMessage('Payment verification timed out. If you made the payment, your subscription will be activated shortly.');
        }
      }
    } catch (err) {
      console.error('Error checking status:', err);
    }
  };

  const handleSubscribe = async () => {
    if (!user || !profile) {
      toast({
        title: 'Error',
        description: 'Please sign in to subscribe.',
        variant: 'destructive',
      });
      return;
    }

    if (!subscriptionPrice) {
      toast({
        title: 'Error',
        description: 'Could not load subscription price. Please try again.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    setStatusMessage('Initiating payment...');

    try {
      const { data, error } = await supabase.functions.invoke('fastlipa-topup?action=subscribe', {
        body: {
          amount: subscriptionPrice,
          phone_number: profile.phone,
          user_id: user.id,
          name: profile.username || 'User',
        },
      });

      console.log('Subscribe response:', data);

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

      checkCountRef.current = 0;
      checkIntervalRef.current = setInterval(() => {
        checkTransactionStatus(response.transaction_id);
      }, 5000);

    } catch (err: any) {
      console.error('Subscribe error:', err);
      toast({
        title: 'Subscription Failed',
        description: err.message || 'Failed to initiate subscription. Please try again.',
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
          <DialogTitle className="flex items-center gap-2">
            <Crown className="h-5 w-5 text-primary" />
            Subscribe to Premium
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {!checkingStatus ? (
            <>
              <div className="p-4 rounded-xl bg-primary/10 text-center space-y-2">
                <Crown className="h-12 w-12 mx-auto text-primary" />
                <h3 className="text-lg font-bold">Monthly Premium</h3>
                {priceLoading ? (
                  <Loader2 className="h-5 w-5 mx-auto animate-spin" />
                ) : (
                  <p className="text-2xl font-bold text-primary">
                    Tsh {subscriptionPrice?.toLocaleString()}
                  </p>
                )}
                <p className="text-sm text-muted-foreground">
                  30 days access to all premium movies
                </p>
              </div>

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

              <Button 
                onClick={handleSubscribe} 
                className="w-full" 
                disabled={isLoading || priceLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Crown className="h-4 w-4 mr-2" />
                    Subscribe Now
                  </>
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
