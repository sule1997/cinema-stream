import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Eye, CheckCircle, XCircle, Film, Settings } from 'lucide-react';
import { getImageUrl, Movie, VideoLink } from '@/hooks/useMovies';

interface PendingMovie extends Omit<Movie, 'status'> {
  status: string;
}

// Hook to fetch pending movies
export const usePendingMovies = () => {
  return useQuery({
    queryKey: ['pendingMovies'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('movies')
        .select('*')
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data || []).map(movie => ({
        ...movie,
        movie_type: (movie.movie_type || 'single') as 'single' | 'season',
        video_links: (Array.isArray(movie.video_links) ? movie.video_links : []) as unknown as VideoLink[],
      })) as PendingMovie[];
    },
  });
};

// Hook to get review setting
export const useReviewSetting = () => {
  return useQuery({
    queryKey: ['reviewSetting'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('app_settings')
        .select('*')
        .eq('key', 'movie_review_required')
        .single();

      if (error) throw error;
      return data?.value === 'true';
    },
  });
};

// Hook to toggle review setting
export const useToggleReviewSetting = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (enabled: boolean) => {
      const { error } = await supabase
        .from('app_settings')
        .update({ value: enabled ? 'true' : 'false' })
        .eq('key', 'movie_review_required');

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviewSetting'] });
      toast.success('Review setting updated');
    },
    onError: () => {
      toast.error('Failed to update setting');
    },
  });
};

// Hook to approve/reject movie
export const useUpdateMovieStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ movieId, status }: { movieId: string; status: 'approved' | 'rejected' }) => {
      const { error } = await supabase
        .from('movies')
        .update({ status })
        .eq('id', movieId);

      if (error) throw error;
    },
    onSuccess: (_, { status }) => {
      queryClient.invalidateQueries({ queryKey: ['pendingMovies'] });
      queryClient.invalidateQueries({ queryKey: ['movies'] });
      toast.success(`Movie ${status === 'approved' ? 'approved' : 'rejected'} successfully`);
    },
    onError: () => {
      toast.error('Failed to update movie status');
    },
  });
};

export function MovieReview() {
  const { data: pendingMovies = [], isLoading } = usePendingMovies();
  const { data: reviewEnabled, isLoading: settingLoading } = useReviewSetting();
  const toggleSetting = useToggleReviewSetting();
  const updateStatus = useUpdateMovieStatus();
  const [previewMovie, setPreviewMovie] = useState<PendingMovie | null>(null);

  const handleApprove = (movieId: string) => {
    updateStatus.mutate({ movieId, status: 'approved' });
  };

  const handleReject = (movieId: string) => {
    updateStatus.mutate({ movieId, status: 'rejected' });
  };

  return (
    <div className="space-y-4">
      {/* Review Toggle Setting */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Settings className="h-4 w-4 text-primary" />
              Review Settings
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="review-toggle" className="text-sm font-medium">
                Require Movie Review
              </Label>
              <p className="text-xs text-muted-foreground">
                When enabled, DJ movies need approval before going live
              </p>
            </div>
            {settingLoading ? (
              <Skeleton className="h-6 w-10" />
            ) : (
              <Switch
                id="review-toggle"
                checked={reviewEnabled || false}
                onCheckedChange={(checked) => toggleSetting.mutate(checked)}
                disabled={toggleSetting.isPending}
              />
            )}
          </div>
        </CardContent>
      </Card>

      {/* Pending Movies List */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Film className="h-4 w-4 text-primary" />
              Pending Reviews
            </CardTitle>
            <Badge variant="secondary" className="text-xs">
              {pendingMovies.length} pending
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-4 space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-20 w-full" />
              ))}
            </div>
          ) : pendingMovies.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              <Film className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No movies pending review</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {pendingMovies.map((movie) => (
                <div
                  key={movie.id}
                  className="p-3 flex items-center gap-3 hover:bg-secondary/50 transition-colors"
                >
                  {/* Thumbnail */}
                  <div className="w-12 h-16 rounded-md overflow-hidden bg-muted shrink-0">
                    <img
                      src={getImageUrl(movie.image_path)}
                      alt={movie.title}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-sm truncate text-foreground">{movie.title}</h4>
                    <p className="text-xs text-muted-foreground">By {movie.dj_name}</p>
                    <p className="text-xs text-muted-foreground">
                      {movie.price === 0 ? 'Free' : `Tsh ${movie.price.toLocaleString()}`}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 text-muted-foreground hover:text-foreground"
                      onClick={() => setPreviewMovie(movie)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-100 dark:hover:bg-green-900/20"
                      onClick={() => handleApprove(movie.id)}
                      disabled={updateStatus.isPending}
                    >
                      <CheckCircle className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={() => handleReject(movie.id)}
                      disabled={updateStatus.isPending}
                    >
                      <XCircle className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Preview Dialog */}
      <Dialog open={!!previewMovie} onOpenChange={() => setPreviewMovie(null)}>
        <DialogContent className="max-w-lg bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-foreground">Movie Preview</DialogTitle>
          </DialogHeader>
          {previewMovie && (
            <div className="space-y-4">
              <div className="aspect-video rounded-lg overflow-hidden bg-muted">
                {previewMovie.video_url ? (
                  <video
                    src={previewMovie.video_url}
                    controls
                    className="w-full h-full object-cover"
                  />
                ) : previewMovie.google_drive_url ? (
                  <iframe
                    src={previewMovie.google_drive_url.replace('/view', '/preview')}
                    className="w-full h-full"
                    allow="autoplay"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                    No video available
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold text-lg text-foreground">{previewMovie.title}</h3>
                <p className="text-sm text-muted-foreground">{previewMovie.description}</p>
                <div className="flex items-center gap-4 text-sm">
                  <span className="text-foreground">DJ: {previewMovie.dj_name}</span>
                  <span className="text-foreground">
                    Price: {previewMovie.price === 0 ? 'Free' : `Tsh ${previewMovie.price.toLocaleString()}`}
                  </span>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                  onClick={() => {
                    handleApprove(previewMovie.id);
                    setPreviewMovie(null);
                  }}
                  disabled={updateStatus.isPending}
                >
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Approve
                </Button>
                <Button
                  variant="destructive"
                  className="flex-1"
                  onClick={() => {
                    handleReject(previewMovie.id);
                    setPreviewMovie(null);
                  }}
                  disabled={updateStatus.isPending}
                >
                  <XCircle className="h-4 w-4 mr-1" />
                  Reject
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
