import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function useSubscriptionPrice() {
  return useQuery({
    queryKey: ['subscription-price'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('app_settings')
        .select('value')
        .eq('key', 'subscription_price')
        .single();

      if (error) throw error;
      return parseInt(data?.value || '5000');
    },
  });
}

export function useHasActiveSubscription(userId?: string) {
  return useQuery({
    queryKey: ['subscription-status', userId],
    queryFn: async () => {
      if (!userId) return false;
      
      const { data, error } = await supabase
        .from('profiles')
        .select('subscription_expires_at')
        .eq('user_id', userId)
        .single();

      if (error) return false;
      
      if (!data?.subscription_expires_at) return false;
      
      return new Date(data.subscription_expires_at) > new Date();
    },
    enabled: !!userId,
  });
}
