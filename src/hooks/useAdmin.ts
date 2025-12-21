import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface Category {
  id: string;
  name: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface ApiSetting {
  id: string;
  name: string;
  api_key: string;
  description: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface WithdrawRequest {
  id: string;
  user_id: string;
  amount: number;
  status: 'pending' | 'approved' | 'rejected';
  processed_by: string | null;
  processed_at: string | null;
  created_at: string;
  profiles?: {
    username: string | null;
    phone: string;
  };
}

export interface UserWithRole {
  id: string;
  user_id: string;
  phone: string;
  username: string | null;
  balance: number;
  earnings: number;
  is_blocked: boolean;
  created_at: string;
  role: 'admin' | 'dj' | 'subscriber';
}

// Categories hooks
export const useCategories = () => {
  return useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('sort_order', { ascending: true });
      
      if (error) throw error;
      return data as Category[];
    },
  });
};

export const useCreateCategory = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ name, sort_order }: { name: string; sort_order: number }) => {
      const { error } = await supabase
        .from('categories')
        .insert({ name, sort_order });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });
};

export const useUpdateCategory = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, name, sort_order }: { id: string; name: string; sort_order: number }) => {
      const { error } = await supabase
        .from('categories')
        .update({ name, sort_order })
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });
};

export const useDeleteCategory = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });
};

// API Settings hooks
export const useApiSettings = () => {
  return useQuery({
    queryKey: ['apiSettings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('api_settings')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as ApiSetting[];
    },
  });
};

export const useCreateApiSetting = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ name, api_key, description }: { name: string; api_key: string; description?: string }) => {
      const { error } = await supabase
        .from('api_settings')
        .insert({ name, api_key, description });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['apiSettings'] });
    },
  });
};

export const useDeleteApiSetting = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('api_settings')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['apiSettings'] });
    },
  });
};

// Withdraw requests hooks
export const useWithdrawRequests = () => {
  return useQuery({
    queryKey: ['withdrawRequests'],
    queryFn: async () => {
      const { data: requests, error } = await supabase
        .from('withdraw_requests')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      // Fetch profiles separately
      const userIds = requests?.map(r => r.user_id) || [];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, username, phone')
        .in('user_id', userIds);
      
      const profileMap = new Map(profiles?.map(p => [p.user_id, p]) || []);
      
      return requests?.map(r => ({
        ...r,
        profiles: profileMap.get(r.user_id),
      })) as WithdrawRequest[];
    },
  });
};

export const useApproveWithdraw = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, adminId }: { id: string; adminId: string }) => {
      const { error } = await supabase
        .from('withdraw_requests')
        .update({ 
          status: 'approved', 
          processed_by: adminId,
          processed_at: new Date().toISOString()
        })
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['withdrawRequests'] });
    },
  });
};

export const useRejectWithdraw = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, adminId }: { id: string; adminId: string }) => {
      const { error } = await supabase
        .from('withdraw_requests')
        .update({ 
          status: 'rejected', 
          processed_by: adminId,
          processed_at: new Date().toISOString()
        })
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['withdrawRequests'] });
    },
  });
};

// Admin stats
export const useAdminStats = () => {
  return useQuery({
    queryKey: ['adminStats'],
    queryFn: async () => {
      const [usersResult, moviesResult, purchasesResult] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact' }),
        supabase.from('movies').select('id', { count: 'exact' }),
        supabase.from('user_purchases').select('amount'),
      ]);
      
      const totalEarnings = purchasesResult.data?.reduce((sum, p) => sum + Number(p.amount), 0) || 0;
      
      return {
        totalUsers: usersResult.count || 0,
        totalMovies: moviesResult.count || 0,
        totalEarnings,
      };
    },
  });
};

// Users with roles
export const useAllUsers = () => {
  return useQuery({
    queryKey: ['allUsers'],
    queryFn: async () => {
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (profilesError) throw profilesError;
      
      const { data: roles, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id, role');
      
      if (rolesError) throw rolesError;
      
      const roleMap = new Map(roles?.map(r => [r.user_id, r.role]) || []);
      
      return profiles?.map(p => ({
        ...p,
        role: roleMap.get(p.user_id) || 'subscriber',
      })) as UserWithRole[];
    },
  });
};

export const useUpdateUserRole = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: 'dj' | 'subscriber' }) => {
      const { error } = await supabase
        .from('user_roles')
        .update({ role })
        .eq('user_id', userId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allUsers'] });
    },
  });
};

export const useBlockUser = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ userId, isBlocked }: { userId: string; isBlocked: boolean }) => {
      const { error } = await supabase
        .from('profiles')
        .update({ is_blocked: isBlocked })
        .eq('user_id', userId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allUsers'] });
    },
  });
};

export const useDeleteUser = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (userId: string) => {
      // Delete from profiles first (user_roles will cascade)
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('user_id', userId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allUsers'] });
    },
  });
};

// DJ Stats
export const useDjStats = (userId?: string) => {
  return useQuery({
    queryKey: ['djStats', userId],
    queryFn: async () => {
      if (!userId) return { totalMovies: 0, totalEarnings: 0 };
      
      const { data: movies, error } = await supabase
        .from('movies')
        .select('id, views')
        .eq('created_by', userId);
      
      if (error) throw error;
      
      const { data: profile } = await supabase
        .from('profiles')
        .select('earnings')
        .eq('user_id', userId)
        .single();
      
      return {
        totalMovies: movies?.length || 0,
        totalViews: movies?.reduce((sum, m) => sum + m.views, 0) || 0,
        totalEarnings: profile?.earnings || 0,
      };
    },
    enabled: !!userId,
  });
};

export const useDjMovies = (userId?: string) => {
  return useQuery({
    queryKey: ['djMovies', userId],
    queryFn: async () => {
      if (!userId) return [];
      
      const { data, error } = await supabase
        .from('movies')
        .select('*')
        .eq('created_by', userId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!userId,
  });
};

// Delete movie hook
export const useDeleteMovie = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (movieId: string) => {
      const { error } = await supabase
        .from('movies')
        .delete()
        .eq('id', movieId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['movies'] });
      queryClient.invalidateQueries({ queryKey: ['djMovies'] });
      queryClient.invalidateQueries({ queryKey: ['pendingMovies'] });
      queryClient.invalidateQueries({ queryKey: ['adminStats'] });
    },
  });
};
