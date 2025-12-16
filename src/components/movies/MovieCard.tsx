import { useNavigate } from 'react-router-dom';
import { Eye } from 'lucide-react';
import { Movie, toSentenceCase, formatPrice, formatViews } from '@/types/movie';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface MovieCardProps {
  movie: Movie;
  onViewIncrement?: (movieId: string) => void;
}

export function MovieCard({ movie, onViewIncrement }: MovieCardProps) {
  const navigate = useNavigate();
  const isFree = movie.price === 0;

  const handleClick = () => {
    onViewIncrement?.(movie.id);
    navigate(`/movie/${movie.id}`);
  };

  const handleButtonClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onViewIncrement?.(movie.id);
    if (isFree) {
      navigate(`/movie/${movie.id}`);
    } else {
      navigate(`/movie/${movie.id}?action=buy`);
    }
  };

  return (
    <div 
      className="group relative bg-card rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 animate-scale-in cursor-pointer"
      onClick={handleClick}
    >
      {/* Movie Poster */}
      <div className="relative aspect-[2/3] overflow-hidden">
        <img
          src={movie.imageUrl}
          alt={toSentenceCase(movie.title)}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent opacity-80" />
        
        {/* Free Badge */}
        {isFree && (
          <div className="absolute top-2 right-2 bg-primary text-primary-foreground text-xs font-bold px-2 py-1 rounded-full">
            FREE
          </div>
        )}
      </div>

      {/* Movie Info */}
      <div className="p-3 space-y-2">
        <h3 className="font-semibold text-sm line-clamp-1 text-card-foreground">
          {toSentenceCase(movie.title)}
        </h3>

        <div className="flex items-center justify-between text-xs">
          <span className={cn(
            "font-bold",
            isFree ? "text-primary" : "text-price"
          )}>
            {formatPrice(movie.price)}
          </span>
          
          <div className="flex items-center gap-1 text-views">
            <Eye className="h-3 w-3" />
            <span>{formatViews(movie.views)}</span>
          </div>
        </div>

        <Button
          onClick={handleButtonClick}
          size="sm"
          variant={isFree ? "default" : "secondary"}
          className={cn(
            "w-full text-xs font-semibold transition-all duration-200",
            isFree 
              ? "bg-primary hover:bg-primary/90 text-primary-foreground" 
              : "bg-accent hover:bg-accent/90 text-accent-foreground"
          )}
        >
          {isFree ? 'Watch Now' : 'Buy Now'}
        </Button>
      </div>
    </div>
  );
}
