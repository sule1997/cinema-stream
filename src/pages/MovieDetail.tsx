import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Eye, Download, Play, ShoppingCart, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useMovie, useHasPurchased, usePurchaseMovie, useIncrementViews, getImageUrl } from '@/hooks/useMovies';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import VideoPlayer from '@/components/video/VideoPlayer';

const formatPrice = (price: number): string => {
  if (price === 0) return 'FREE';
  return `Tsh ${price.toLocaleString()}`;
};

const formatViews = (views: number): string => {
  if (views >= 1000000) return `${(views / 1000000).toFixed(1)}M`;
  if (views >= 1000) return `${(views / 1000).toFixed(1)}K`;
  return views.toString();
};

const toSentenceCase = (str: string): string => {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

const MovieDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, profile } = useAuth();
  const [isPlaying, setIsPlaying] = useState(false);
  
  const { data: movie, isLoading } = useMovie(id || '');
  const { data: hasPurchased } = useHasPurchased(user?.id, id);
  const purchaseMutation = usePurchaseMovie();
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
  const canWatch = isFree || hasPurchased;
  const imageUrl = getImageUrl(movie.image_path);

  const handleWatch = () => {
    if (!movie.video_url) {
      toast({
        title: "Video Unavailable",
        description: "This movie doesn't have a video available yet.",
        variant: "destructive",
      });
      return;
    }
    
    incrementViews.mutate(movie.id);
    setIsPlaying(true);
    
    toast({
      title: "Now Playing",
      description: `Playing: ${toSentenceCase(movie.title)}`,
    });
  };

  const handleBuy = async () => {
    if (!user) {
      toast({
        title: "Sign In Required",
        description: "Please sign in to purchase this movie.",
      });
      navigate('/auth');
      return;
    }

    // Check user balance
    if (profile && profile.balance < movie.price) {
      toast({
        title: "Insufficient Balance",
        description: `You need Tsh ${movie.price.toLocaleString()} to purchase this movie. Your balance is Tsh ${profile.balance.toLocaleString()}.`,
        variant: "destructive",
      });
      return;
    }

    try {
      await purchaseMutation.mutateAsync({
        userId: user.id,
        movieId: movie.id,
        amount: movie.price,
      });

      toast({
        title: "Purchase Successful",
        description: `You can now watch ${toSentenceCase(movie.title)}!`,
      });
    } catch (error) {
      toast({
        title: "Purchase Failed",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDownload = () => {
    if (movie.google_drive_url) {
      window.open(movie.google_drive_url, '_blank');
    } else {
      toast({
        title: "Download Unavailable",
        description: "Download link is not available for this movie.",
        variant: "destructive",
      });
    }
  };

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
        {isPlaying && movie.video_url ? (
          <div className="w-full aspect-video">
            <VideoPlayer 
              src={movie.video_url} 
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
          <h1 className="text-2xl font-bold text-foreground">
            {toSentenceCase(movie.title)}
          </h1>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span>{movie.release_year}</span>
            <span className="px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground text-xs">
              {movie.category}
            </span>
            <div className="flex items-center gap-1 text-views">
              <Eye className="h-4 w-4" />
              <span>{formatViews(movie.views)}</span>
            </div>
          </div>
        </div>

        {/* Price */}
        <div className="flex items-center justify-between p-4 rounded-xl bg-card border border-border">
          <div>
            <p className="text-xs text-muted-foreground">Price</p>
            <p className={`text-xl font-bold ${isFree ? 'text-primary' : 'text-price'}`}>
              {formatPrice(movie.price)}
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

        {/* Action Buttons */}
        <div className="space-y-3 pb-4">
          {canWatch ? (
            <Button 
              onClick={handleWatch}
              className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground text-lg font-semibold"
              disabled={!movie.video_url}
            >
              <Play className="h-5 w-5 mr-2" />
              {isPlaying ? 'Playing...' : 'Watch Now'}
            </Button>
          ) : (
            <Button 
              onClick={handleBuy}
              className="w-full h-12 bg-accent hover:bg-accent/90 text-accent-foreground text-lg font-semibold"
              disabled={purchaseMutation.isPending}
            >
              {purchaseMutation.isPending ? (
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
              ) : (
                <ShoppingCart className="h-5 w-5 mr-2" />
              )}
              Buy for {formatPrice(movie.price)}
            </Button>
          )}
          
          {canWatch && (
            <Button 
              variant="outline" 
              onClick={handleDownload}
              className="w-full"
              disabled={!movie.google_drive_url}
            >
              <Download className="h-4 w-4 mr-2" />
              Download via Google Drive
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default MovieDetail;
