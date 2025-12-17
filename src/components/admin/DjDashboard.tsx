import { Film, DollarSign, Eye, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useDjStats, useDjMovies } from '@/hooks/useAdmin';
import { useAuth } from '@/contexts/AuthContext';
import { getImageUrl } from '@/hooks/useMovies';

export function DjStats() {
  const { user } = useAuth();
  const { data: stats, isLoading } = useDjStats(user?.id);

  if (isLoading) {
    return (
      <div className="grid grid-cols-3 gap-3">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-4">
              <div className="h-12 bg-muted rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 gap-3">
      <Card className="bg-gradient-to-br from-purple-500/20 to-purple-600/10 border-purple-500/30">
        <CardContent className="p-4 text-center">
          <Film className="h-6 w-6 mx-auto mb-1 text-purple-400" />
          <p className="text-2xl font-bold">{stats?.totalMovies || 0}</p>
          <p className="text-xs text-muted-foreground">Videos</p>
        </CardContent>
      </Card>
      
      <Card className="bg-gradient-to-br from-blue-500/20 to-blue-600/10 border-blue-500/30">
        <CardContent className="p-4 text-center">
          <Eye className="h-6 w-6 mx-auto mb-1 text-blue-400" />
          <p className="text-2xl font-bold">{stats?.totalViews?.toLocaleString() || 0}</p>
          <p className="text-xs text-muted-foreground">Views</p>
        </CardContent>
      </Card>
      
      <Card className="bg-gradient-to-br from-green-500/20 to-green-600/10 border-green-500/30">
        <CardContent className="p-4 text-center">
          <DollarSign className="h-6 w-6 mx-auto mb-1 text-green-400" />
          <p className="text-2xl font-bold">
            {stats?.totalEarnings?.toLocaleString() || 0}
          </p>
          <p className="text-xs text-muted-foreground">Tsh</p>
        </CardContent>
      </Card>
    </div>
  );
}

export function DjMoviesList() {
  const { user } = useAuth();
  const { data: movies = [], isLoading } = useDjMovies(user?.id);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-4 flex justify-center">
          <Loader2 className="h-6 w-6 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">My Published Movies</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 max-h-[400px] overflow-y-auto">
        {movies.map((movie) => (
          <div 
            key={movie.id} 
            className="flex items-center gap-3 p-3 rounded-lg bg-muted/50"
          >
            <img 
              src={getImageUrl(movie.image_path)} 
              alt={movie.title}
              className="w-12 h-16 object-cover rounded"
            />
            <div className="flex-1 min-w-0">
              <h4 className="font-medium truncate">{movie.title}</h4>
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Eye className="h-3 w-3" />
                  {movie.views.toLocaleString()}
                </span>
                <span className={movie.price === 0 ? 'text-primary' : 'text-price'}>
                  {movie.price === 0 ? 'FREE' : `Tsh ${movie.price.toLocaleString()}`}
                </span>
              </div>
            </div>
          </div>
        ))}
        
        {movies.length === 0 && (
          <p className="text-center text-muted-foreground py-4">
            No movies published yet
          </p>
        )}
      </CardContent>
    </Card>
  );
}
