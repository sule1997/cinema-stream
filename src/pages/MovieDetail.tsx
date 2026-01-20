import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Eye, Download, Play, Loader2, ExternalLink, Crown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useMovie, useIncrementViews, getImageUrl } from '@/hooks/useMovies';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useHasActiveSubscription } from '@/hooks/useSubscription';
import VideoPlayer from '@/components/video/VideoPlayer';
import { AdUnit } from '@/components/ads/AdUnit';
const formatViews = (views: number): string => {
  if (views >= 1000000) return `${(views / 1000000).toFixed(1)}M`;
  if (views >= 1000) return `${(views / 1000).toFixed(1)}K`;
  return views.toString();
};

const toSentenceCase = (str: string): string => {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

const MovieDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, profile } = useAuth();
  const [isPlaying, setIsPlaying] = useState(false);
  
  const { data: movie, isLoading } = useMovie(slug || '');
  const { data: hasSubscription } = useHasActiveSubscription(user?.id);
  const incrementViews = useIncrementViews();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background mobile-container flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="min-h-screen bg-background mobile-container flex items-center justify-center">
        <div className="text-center p-6">
          <h1 className="text-xl font-bold mb-2">Movie Not Found</h1>
          <p className="text-muted-foreground mb-4">The movie you're looking for doesn't exist.</p>
          <Button onClick={() => navigate('/')}>Go Back</Button>
        </div>
      </div>
    );
  }

  const isFree = movie.price === 0;
  const isPremium = !isFree;
  const canWatch = isFree || hasSubscription;
  const imageUrl = getImageUrl(movie.image_path);
  const isSeason = movie.movie_type === 'season';

  const handleWatch = () => {
    if (!movie.video_url) {
      toast({
        title: "Video Unavailable",
        description: "This movie doesn't have a video available yet.",
        variant: "destructive",
      });
      return;
    }

    // Check if premium and user needs subscription
    if (isPremium && !hasSubscription) {
      if (!user) {
        toast({
          title: "Sign In Required",
          description: "Please sign in to watch premium movies.",
        });
        navigate('/auth');
        return;
      }
      toast({
        title: "Subscription Required",
        description: "Please subscribe to watch premium movies.",
      });
      navigate('/dashboard');
      return;
    }
    
    incrementViews.mutate(movie.id);
    setIsPlaying(true);
    
    toast({
      title: "Now Playing",
      description: `Playing: ${toSentenceCase(movie.title)}`,
    });
  };

  const handleSubscribe = () => {
    if (!user) {
      toast({
        title: "Sign In Required",
        description: "Please sign in to subscribe.",
      });
      navigate('/auth');
      return;
    }
    navigate('/dashboard');
  };

  const handleDownload = (url?: string) => {
    const downloadUrl = url || movie.google_drive_url;
    if (downloadUrl) {
      window.open(downloadUrl, '_blank');
    } else {
      toast({
        title: "Download Unavailable",
        description: "Download link is not available for this movie.",
        variant: "destructive",
      });
    }
  };

  const currentVideoUrl = movie.video_url;

  return (
    <div className="min-h-screen bg-background mobile-container">
      {/* Header with back button */}
      <div className="relative">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => {
            setIsPlaying(false);
            navigate('/');
          }}
          className="absolute top-4 left-4 z-10 bg-background/80 backdrop-blur-sm"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>

        {/* Video Player or Poster */}
        {isPlaying && currentVideoUrl ? (
          <div className="w-full aspect-video">
            <VideoPlayer 
              src={currentVideoUrl} 
              poster={imageUrl}
              className="w-full"
              autoplay={true}
            />
          </div>
        ) : (
          <div className="relative aspect-[16/10] overflow-hidden">
            <img
              src={imageUrl}
              alt={toSentenceCase(movie.title)}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
          </div>
        )}
      </div>

      {/* Movie Info */}
      <div className="p-4 space-y-6 animate-slide-up">
        {/* Title and Meta */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-foreground">
              {toSentenceCase(movie.title)}
            </h1>
            {isSeason && movie.season_number && (
              <span className="px-2 py-0.5 rounded-full bg-accent text-accent-foreground text-xs font-bold">
                S {movie.season_number}
              </span>
            )}
          </div>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span className="px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground text-xs">
              {movie.category}
            </span>
            <div className="flex items-center gap-1 text-views">
              <Eye className="h-4 w-4" />
              <span>{formatViews(movie.views)}</span>
            </div>
          </div>
        </div>

        {/* Premium/Free Badge */}
        <div className="flex items-center justify-between p-4 rounded-xl bg-card border border-border">
          <div>
            <p className="text-xs text-muted-foreground">Access</p>
            <p className={`text-xl font-bold flex items-center gap-2 ${isFree ? 'text-primary' : 'text-accent-foreground'}`}>
              {isFree ? 'FREE' : (
                <>
                  <Crown className="h-5 w-5" />
                  Premium
                </>
              )}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground">Uploaded by</p>
            <p className="font-medium">{movie.dj_name}</p>
          </div>
        </div>

        {/* Description */}
        {movie.description && (
          <div className="space-y-2">
            <h2 className="font-semibold">Description</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {movie.description}
            </p>
          </div>
        )}

        {/* Episode Download Links for Seasons */}
        {isSeason && movie.video_links && movie.video_links.length > 0 && canWatch && (
          <div className="space-y-3">
            <h2 className="font-semibold">Episode Downloads</h2>
            <div className="grid gap-2">
              {movie.video_links.map((episode, index) => (
                <Card 
                  key={index} 
                  className="transition-all hover:bg-secondary/50"
                >
                  <CardContent className="p-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Download className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">{episode.name}</p>
                        <p className="text-xs text-muted-foreground">Tap to download</p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDownload(episode.url)}
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Display Ad */}
        <div className="w-full">
          <AdUnit type="display" className="w-full min-h-[90px]" />
        </div>

        {/* Action Buttons */}
        <div className="space-y-3 pb-4">
          {canWatch ? (
            <>
              <Button 
                onClick={() => handleWatch()}
                className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground text-lg font-semibold"
                disabled={!movie.video_url}
              >
                <Play className="h-5 w-5 mr-2" />
                {isPlaying ? 'Playing...' : 'Watch Now'}
              </Button>
            </>
          ) : (
            <Button 
              onClick={handleSubscribe}
              className="w-full h-12 bg-accent hover:bg-accent/90 text-accent-foreground text-lg font-semibold"
            >
              <Crown className="h-5 w-5 mr-2" />
              Subscribe to Watch
            </Button>
          )}
          
          {canWatch && !isSeason && (
            <Button 
              variant="outline" 
              onClick={() => handleDownload()}
              className="w-full"
              disabled={!movie.google_drive_url}
            >
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default MovieDetail;
