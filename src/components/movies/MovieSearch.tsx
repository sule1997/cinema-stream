import { Search, Filter, ChevronDown } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export type FilterType = 'all' | 'views' | 'free' | 'paid';

interface MovieSearchProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  activeFilter: FilterType;
  onFilterChange: (filter: FilterType) => void;
  isVisible?: boolean;
}

const filterOptions: { value: FilterType; label: string }[] = [
  { value: 'all', label: 'All Movies' },
  { value: 'views', label: 'Most Viewed' },
  { value: 'free', label: 'Free Only' },
  { value: 'paid', label: 'Paid Only' },
];

export function MovieSearch({
  searchQuery,
  onSearchChange,
  activeFilter,
  onFilterChange,
  isVisible = true,
}: MovieSearchProps) {
  const activeLabel = filterOptions.find((f) => f.value === activeFilter)?.label || 'All Movies';

  return (
    <div 
      className={`flex items-center gap-2 px-4 py-3 bg-card/95 backdrop-blur-sm border-b border-border sticky top-14 z-10 transition-all duration-300 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-full pointer-events-none'
      }`}
    >
      {/* Search Input */}
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search movies..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9 pr-4 h-10 bg-background border-border text-foreground placeholder:text-muted-foreground rounded-full text-sm"
        />
      </div>

      {/* Filter Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="h-10 px-3 rounded-full border-border bg-background hover:bg-secondary flex items-center gap-1.5 shrink-0"
          >
            <Filter className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium hidden sm:inline">{activeLabel}</span>
            <ChevronDown className="h-3 w-3 text-muted-foreground" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-40 bg-popover border-border z-50">
          {filterOptions.map((option) => (
            <DropdownMenuItem
              key={option.value}
              onClick={() => onFilterChange(option.value)}
              className={`cursor-pointer ${
                activeFilter === option.value ? 'bg-primary/10 text-primary font-medium' : ''
              }`}
            >
              {option.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
