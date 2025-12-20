import { X, Film, Info, FileText, Shield, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useCategories } from '@/hooks/useAdmin';

interface SideMenuProps {
  isOpen: boolean;
  onClose: () => void;
  selectedCategory: string | null;
  onSelectCategory: (category: string | null) => void;
}

const footerLinks = [
  { icon: Info, label: 'About', path: '/about' },
  { icon: FileText, label: 'Terms', path: '/terms' },
  { icon: Shield, label: 'Privacy', path: '/privacy' },
];

export function SideMenu({ 
  isOpen, 
  onClose, 
  selectedCategory, 
  onSelectCategory 
}: SideMenuProps) {
  const navigate = useNavigate();
  const { data: categories = [], isLoading } = useCategories();

  return (
    <>
      {/* Overlay */}
      <div 
        className={cn(
          "fixed inset-0 z-50 bg-background/80 backdrop-blur-sm transition-opacity duration-300",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={onClose}
      />

      {/* Side Menu */}
      <aside 
        className={cn(
          "fixed top-0 left-0 z-50 h-full w-72 max-w-[80vw] bg-card border-r border-border shadow-2xl transition-transform duration-300 ease-out",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border">
            <div className="flex items-center gap-2">
              <Film className="h-5 w-5 text-primary" />
              <span className="font-semibold text-foreground">Categories</span>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Categories List */}
          <div className="flex-1 overflow-y-auto p-2">
            <button
              onClick={() => {
                onSelectCategory(null);
                onClose();
              }}
              className={cn(
                "w-full text-left px-4 py-3 rounded-lg transition-all duration-200 text-sm font-medium",
                selectedCategory === null
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-secondary text-foreground"
              )}
            >
              All Movies
            </button>
            
            {isLoading ? (
              <div className="flex justify-center py-4">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            ) : (
              categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => {
                    onSelectCategory(category.name);
                    onClose();
                  }}
                  className={cn(
                    "w-full text-left px-4 py-3 rounded-lg transition-all duration-200 text-sm font-medium mt-1",
                    selectedCategory === category.name
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-secondary text-foreground"
                  )}
                >
                  {category.name}
                </button>
              ))
            )}
          </div>

          {/* Separator */}
          <div className="px-4">
            <hr className="border-border" />
          </div>

          {/* Footer Links - Horizontal */}
          <div className="p-4 pb-20">
            <div className="flex items-center justify-center gap-4">
              {footerLinks.map((link) => (
                <button
                  key={link.path}
                  onClick={() => {
                    navigate(link.path);
                    onClose();
                  }}
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
                >
                  <link.icon className="h-3 w-3" />
                  {link.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
