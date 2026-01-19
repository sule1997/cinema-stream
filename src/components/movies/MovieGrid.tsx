import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Movie } from '@/hooks/useMovies';
import { MovieCard } from './MovieCard';
import { Button } from '@/components/ui/button';
import { AdUnit } from '@/components/ads/AdUnit';

interface MovieGridProps {
  movies: Movie[];
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onViewIncrement?: (movieId: string) => void;
}

export function MovieGrid({ 
  movies, 
  currentPage, 
  totalPages, 
  onPageChange,
  onViewIncrement
}: MovieGridProps) {
  // Split movies into chunks of 4 (2 rows x 2 columns) to insert ads
  const moviesPerAdSlot = 4;
  const movieChunks: Movie[][] = [];
  
  for (let i = 0; i < movies.length; i += moviesPerAdSlot) {
    movieChunks.push(movies.slice(i, i + moviesPerAdSlot));
  }

  return (
    <div className="space-y-6 p-4">
      {/* Movie Grid with Ads */}
      {movieChunks.map((chunk, chunkIndex) => (
        <div key={chunkIndex}>
          {/* Movie chunk (2 rows) */}
          <div className="grid grid-cols-2 gap-4">
            {chunk.map((movie, index) => (
              <div 
                key={movie.id} 
                className="animate-slide-up"
                style={{ animationDelay: `${(chunkIndex * moviesPerAdSlot + index) * 50}ms` }}
              >
                <MovieCard 
                  movie={movie} 
                  onViewIncrement={onViewIncrement}
                />
              </div>
            ))}
          </div>
          
          {/* Show ad after every 2 rows (except after the last chunk) */}
          {chunkIndex < movieChunks.length - 1 && (
            <div className="my-4">
              <AdUnit type="display" className="w-full" />
            </div>
          )}
        </div>
      ))}

      {/* Empty State */}
      {movies.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No movies found</p>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 pt-4 pb-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="flex items-center gap-1"
          >
            <ChevronLeft className="h-4 w-4" />
            Prev
          </Button>
          
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              Page {currentPage} of {totalPages}
            </span>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="flex items-center gap-1"
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
