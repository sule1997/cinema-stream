import { useState, useMemo } from 'react';
import { Loader2 } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { MovieGrid } from '@/components/movies/MovieGrid';
import { MovieSearch, FilterType } from '@/components/movies/MovieSearch';
import { useMovies, useIncrementViews } from '@/hooks/useMovies';

const MOVIES_PER_PAGE = 20;

const Index = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  
  const { data: movies = [], isLoading } = useMovies(selectedCategory || undefined);
  const incrementViews = useIncrementViews();

  const categories = useMemo(() => {
    const uniqueCategories = [...new Set(movies.map(m => m.category))];
    return uniqueCategories.sort();
  }, [movies]);

  // Filter and search movies
  const filteredMovies = useMemo(() => {
    let result = [...movies];
    
    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (m) =>
          m.title.toLowerCase().includes(query) ||
          m.dj_name.toLowerCase().includes(query) ||
          m.category.toLowerCase().includes(query)
      );
    }
    
    // Type filter
    switch (activeFilter) {
      case 'views':
        result = result.sort((a, b) => b.views - a.views);
        break;
      case 'free':
        result = result.filter((m) => m.price === 0);
        break;
      case 'paid':
        result = result.filter((m) => m.price > 0);
        break;
      default:
        break;
    }
    
    return result;
  }, [movies, searchQuery, activeFilter]);

  const totalPages = Math.ceil(filteredMovies.length / MOVIES_PER_PAGE);
  
  const paginatedMovies = useMemo(() => {
    const start = (currentPage - 1) * MOVIES_PER_PAGE;
    const end = start + MOVIES_PER_PAGE;
    return filteredMovies.slice(start, end);
  }, [filteredMovies, currentPage]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCategoryChange = (category: string | null) => {
    setSelectedCategory(category);
    setCurrentPage(1);
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
  };

  const handleFilterChange = (filter: FilterType) => {
    setActiveFilter(filter);
    setCurrentPage(1);
  };

  const handleViewIncrement = (movieId: string) => {
    incrementViews.mutate(movieId);
  };

  if (isLoading) {
    return (
      <MainLayout showTopNav={true}>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout 
      showTopNav={true}
      selectedCategory={selectedCategory}
      onSelectCategory={handleCategoryChange}
    >
      <div className="pb-4">
        {/* Search and Filter */}
        <MovieSearch
          searchQuery={searchQuery}
          onSearchChange={handleSearchChange}
          activeFilter={activeFilter}
          onFilterChange={handleFilterChange}
        />

        {/* Category Header */}
        {selectedCategory && (
          <div className="px-4 pt-4 pb-2">
            <h2 className="text-lg font-semibold text-foreground">
              {selectedCategory} Movies
            </h2>
            <p className="text-sm text-muted-foreground">
              {filteredMovies.length} movies found
            </p>
          </div>
        )}

        <MovieGrid
          movies={paginatedMovies}
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
          onViewIncrement={handleViewIncrement}
        />
      </div>
    </MainLayout>
  );
};

export default Index;
