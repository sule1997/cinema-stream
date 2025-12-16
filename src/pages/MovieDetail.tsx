import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Eye, Download, Play, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { mockMovies } from '@/data/mockMovies';
import { toSentenceCase, formatPrice, formatViews } from '@/types/movie';
import { useToast } from '@/hooks/use-toast';

const MovieDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  
  const movie = mockMovies.find(m => m.id === id);
  const showBuyPrompt = searchParams.get('action') === 'buy';

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

  const handleWatch = () => {
    toast({
      title: "Now Playing",
      description: `Playing: ${toSentenceCase(movie.title)}`,
    });
  };

  const handleBuy = () => {
    // In real app, check if user is logged in
    toast({
      title: "Sign In Required",
      description: "Please sign in to purchase this movie.",
    });
    navigate('/auth');
  };

  const handleDownload = () => {
    if (movie.googleDriveUrl) {
      window.open(movie.googleDriveUrl, '_blank');
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
          onClick={() => navigate('/')}
          className="absolute top-4 left-4 z-10 bg-background/80 backdrop-blur-sm"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>

        {/* Movie Poster */}
        <div className="relative aspect-[16/10] overflow-hidden">
          <img
            src={movie.imageUrl}
            alt={toSentenceCase(movie.title)}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
        </div>
      </div>

      {/* Movie Info */}
      <div className="p-4 space-y-6 animate-slide-up">
        {/* Title and Meta */}
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-foreground">
            {toSentenceCase(movie.title)}
          </h1>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span>{movie.releaseYear}</span>
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
            <p className="font-medium">{movie.djName}</p>
          </div>
        </div>

        {/* Description */}
        <div className="space-y-2">
          <h2 className="font-semibold">Description</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {movie.description}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3 pb-4">
          {isFree ? (
            <Button 
              onClick={handleWatch}
              className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground text-lg font-semibold"
            >
              <Play className="h-5 w-5 mr-2" />
              Watch Now
            </Button>
          ) : (
            <Button 
              onClick={handleBuy}
              className="w-full h-12 bg-accent hover:bg-accent/90 text-accent-foreground text-lg font-semibold"
            >
              <ShoppingCart className="h-5 w-5 mr-2" />
              Buy for {formatPrice(movie.price)}
            </Button>
          )}
          
          <Button 
            variant="outline" 
            onClick={handleDownload}
            className="w-full"
          >
            <Download className="h-4 w-4 mr-2" />
            Download via Google Drive
          </Button>
        </div>
      </div>
    </div>
  );
};

export default MovieDetail;
