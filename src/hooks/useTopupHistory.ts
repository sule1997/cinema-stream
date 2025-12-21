import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface TopupTransaction {
  id: string;
  user_id: string;
  amount: number;
  phone_number: string;
  transaction_id: string | null;
  status: string;
  created_at: string;
  updated_at: string;
}

export const useTopupHistory = (userId?: string) => {
  return useQuery({
    queryKey: ['topupHistory', userId],
    queryFn: async () => {
      if (!userId) return [];
      
      const { data, error } = await supabase
        .from('topup_transactions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return (data || []) as TopupTransaction[];
    },
    enabled: !!userId,
    refetchInterval: 5000, // Refetch every 5 seconds to catch background updates
  });
};
