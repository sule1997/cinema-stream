import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface VideoLink {
  name: string;
  url: string;
}

export interface Movie {
  id: string;
  title: string;
  description: string | null;
  price: number;
  views: number;
  category: string;
  release_year: number;
  dj_name: string;
  video_url: string | null;
  google_drive_url: string | null;
  image_path: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  movie_type: 'single' | 'season';
  season_number: number | null;
  video_links: VideoLink[];
}

export const useMovies = (category?: string) => {
  return useQuery({
    queryKey: ['movies', category],
    queryFn: async () => {
      let query = supabase
        .from('movies')
        .select('*')
        .eq('status', 'approved')
        .order('created_at', { ascending: false });
      
      if (category && category !== 'All') {
        query = query.eq('category', category);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      return (data || []).map(movie => ({
        ...movie,
        movie_type: (movie.movie_type || 'single') as 'single' | 'season',
        video_links: (Array.isArray(movie.video_links) ? movie.video_links : []) as unknown as VideoLink[],
      })) as Movie[];
    },
  });
};

export const useMovie = (id: string) => {
  return useQuery({
    queryKey: ['movie', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('movies')
        .select('*')
        .eq('id', id)
        .maybeSingle();
      
      if (error) throw error;
      if (!data) return null;
      
      return {
        ...data,
        movie_type: (data.movie_type || 'single') as 'single' | 'season',
        video_links: (Array.isArray(data.video_links) ? data.video_links : []) as unknown as VideoLink[],
      } as Movie;
    },
    enabled: !!id,
  });
};

export const useIncrementViews = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (movieId: string) => {
      const { data: movie } = await supabase
        .from('movies')
        .select('views')
        .eq('id', movieId)
        .single();
      
      if (movie) {
        const { error } = await supabase
          .from('movies')
          .update({ views: movie.views + 1 })
          .eq('id', movieId);
        
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['movies'] });
    },
  });
};

export const useUserPurchases = (userId?: string) => {
  return useQuery({
    queryKey: ['purchases', userId],
    queryFn: async () => {
      if (!userId) return [];
      
      const { data, error } = await supabase
        .from('user_purchases')
        .select('*, movies(*)')
        .eq('user_id', userId);
      
      if (error) throw error;
      return data;
    },
    enabled: !!userId,
  });
};

export const useHasPurchased = (userId?: string, movieId?: string) => {
  return useQuery({
    queryKey: ['hasPurchased', userId, movieId],
    queryFn: async () => {
      if (!userId || !movieId) return false;
      
      const { data, error } = await supabase
        .from('user_purchases')
        .select('id')
        .eq('user_id', userId)
        .eq('movie_id', movieId)
        .maybeSingle();
      
      if (error) throw error;
      return !!data;
    },
    enabled: !!userId && !!movieId,
  });
};

export const usePurchaseMovie = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ userId, movieId, amount }: { userId: string; movieId: string; amount: number }) => {
      const { error } = await supabase
        .from('user_purchases')
        .insert({ user_id: userId, movie_id: movieId, amount });
      
      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['purchases', variables.userId] });
      queryClient.invalidateQueries({ queryKey: ['hasPurchased'] });
    },
  });
};

export const getImageUrl = (imagePath: string | null) => {
  if (!imagePath) return '/placeholder.svg';
  
  const { data } = supabase.storage
    .from('movie-posters')
    .getPublicUrl(imagePath);
  
  return data.publicUrl;
};