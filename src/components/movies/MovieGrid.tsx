import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Movie } from '@/hooks/useMovies';
import { MovieCard } from './MovieCard';
import { Button } from '@/components/ui/button';

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
  return (
    <div className="space-y-6 p-4">
      {/* Movie Grid */}
      <div className="grid grid-cols-2 gap-4">
        {movies.map((movie, index) => (
          <div 
            key={movie.id} 
            className="animate-slide-up"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <MovieCard 
              movie={movie} 
              onViewIncrement={onViewIncrement}
            />
          </div>
        ))}
      </div>

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
