import { Menu, Sun, Moon } from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';
import { Button } from '@/components/ui/button';

interface TopNavbarProps {
  onMenuClick: () => void;
  title?: string;
}

export function TopNavbar({ onMenuClick, title = "Movietz" }: TopNavbarProps) {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-nav glass-effect border-b border-border/50">
      <div className="mobile-container h-full flex items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={onMenuClick}
            className="hover:bg-secondary"
          >
            <Menu className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-bold tracking-tight bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            {title}
          </h1>
        </div>

        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          className="hover:bg-secondary"
        >
          {theme === 'dark' ? (
            <Sun className="h-5 w-5 text-accent" />
          ) : (
            <Moon className="h-5 w-5 text-primary" />
          )}
        </Button>
      </div>
    </header>
  );
}
