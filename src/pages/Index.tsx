import { useState, useMemo } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { MovieGrid } from '@/components/movies/MovieGrid';
import { mockMovies } from '@/data/mockMovies';

const MOVIES_PER_PAGE = 20;

const Index = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [movies, setMovies] = useState(mockMovies);

  const categories = useMemo(() => {
    const uniqueCategories = [...new Set(mockMovies.map(m => m.category))];
    return uniqueCategories.sort();
  }, []);

  const filteredMovies = useMemo(() => {
    if (!selectedCategory) return movies;
    return movies.filter(m => m.category === selectedCategory);
  }, [movies, selectedCategory]);

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

  const handleViewIncrement = (movieId: string) => {
    setMovies(prev => 
      prev.map(m => 
        m.id === movieId 
          ? { ...m, views: m.views + 1 } 
          : m
      )
    );
  };

  return (
    <MainLayout 
      showTopNav={true}
      categories={categories}
      selectedCategory={selectedCategory}
      onSelectCategory={handleCategoryChange}
    >
      <div className="pb-4">
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
