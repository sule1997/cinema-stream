import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, CreditCard, Save } from 'lucide-react';
import { useSubscriptionPrice } from '@/hooks/useSubscription';
import { useQueryClient } from '@tanstack/react-query';

export function SubscriptionSettings() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: currentPrice, isLoading } = useSubscriptionPrice();
  const [price, setPrice] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (currentPrice) {
      setPrice(currentPrice.toString());
    }
  }, [currentPrice]);

  const handleSave = async () => {
    const priceNum = parseInt(price);
    if (!priceNum || priceNum < 100) {
      toast({
        title: 'Invalid Price',
        description: 'Subscription price must be at least Tsh 100',
        variant: 'destructive',
      });
      return;
    }

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('app_settings')
        .update({ value: priceNum.toString(), updated_at: new Date().toISOString() })
        .eq('key', 'subscription_price');

      if (error) throw error;

      queryClient.invalidateQueries({ queryKey: ['subscription-price'] });
      
      toast({
        title: 'Success',
        description: 'Subscription price updated',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update subscription price',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
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
          <CreditCard className="h-5 w-5" />
          Subscription Settings
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="subscription-price">Monthly Subscription Price (Tsh)</Label>
          <div className="flex gap-2">
            <Input
              id="subscription-price"
              type="number"
              placeholder="Enter price"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              min={100}
            />
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            This is the price users pay for a 30-day subscription to access premium movies.
          </p>
        </div>

        <div className="p-3 rounded-lg bg-muted/50">
          <p className="text-sm">
            Current Price: <span className="font-bold text-primary">Tsh {currentPrice?.toLocaleString() || 0}</span> / month
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
