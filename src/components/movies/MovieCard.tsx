import { useNavigate } from 'react-router-dom';
import { Eye, Crown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Movie, getImageUrl } from '@/hooks/useMovies';

interface MovieCardProps {
  movie: Movie;
  onViewIncrement?: (movieId: string) => void;
}

const formatViews = (views: number): string => {
  if (views >= 1000000) return `${(views / 1000000).toFixed(1)}M`;
  if (views >= 1000) return `${(views / 1000).toFixed(1)}K`;
  return views.toString();
};

const toSentenceCase = (str: string): string => {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

export function MovieCard({ movie, onViewIncrement }: MovieCardProps) {
  const navigate = useNavigate();
  const isFree = movie.price === 0;
  const isSeason = movie.movie_type === 'season';
  const imageUrl = getImageUrl(movie.image_path);

  const handleClick = () => {
    onViewIncrement?.(movie.id);
    navigate(`/movie/${movie.id}`);
  };

  const handleButtonClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onViewIncrement?.(movie.id);
    navigate(`/movie/${movie.id}`);
  };

  // Determine badge content
  const getBadgeContent = () => {
    if (isSeason && movie.season_number) {
      return `S ${movie.season_number}`;
    }
    if (isFree) {
      return 'FREE';
    }
    // Premium movies show premium badge
    return null;
  };

  const badgeContent = getBadgeContent();
  const isPremium = !isFree;

  return (
    <div 
      className="group relative bg-card rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 animate-scale-in cursor-pointer border border-border"
      onClick={handleClick}
    >
      {/* Movie Poster */}
      <div className="relative aspect-[2/3] overflow-hidden">
        <img
          src={imageUrl}
          alt={toSentenceCase(movie.title)}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-card/90 via-transparent to-transparent" />
        
        {/* Badge */}
        {badgeContent && (
          <div className={cn(
            "absolute top-2 right-2 text-xs font-bold px-2 py-1 rounded-full shadow-md",
            isSeason 
              ? "bg-accent text-accent-foreground" 
              : "bg-primary text-primary-foreground"
          )}>
            {badgeContent}
          </div>
        )}

        {/* Premium Badge */}
        {isPremium && !isSeason && (
          <div className="absolute top-2 right-2 flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full shadow-md bg-accent text-accent-foreground">
            <Crown className="h-3 w-3" />
            Premium
          </div>
        )}
      </div>

      {/* Movie Info */}
      <div className="p-3 space-y-2 bg-card">
        <h3 className="font-semibold text-sm line-clamp-1 text-foreground">
          {toSentenceCase(movie.title)}
        </h3>

        <div className="flex items-center justify-between text-xs">
          <span className={cn(
            "font-bold flex items-center gap-1",
            isFree ? "text-primary" : "text-accent-foreground"
          )}>
            {isFree ? 'FREE' : (
              <>
                <Crown className="h-3 w-3" />
                Premium
              </>
            )}
          </span>
          
          <div className="flex items-center gap-1 text-muted-foreground">
            <Eye className="h-3 w-3" />
            <span>{formatViews(movie.views)}</span>
          </div>
        </div>

        <Button
          onClick={handleButtonClick}
          size="sm"
          variant="default"
          className="w-full text-xs font-semibold transition-all duration-200 bg-primary hover:bg-primary/90 text-primary-foreground"
        >
          Watch Now
        </Button>
      </div>
    </div>
  );
}
