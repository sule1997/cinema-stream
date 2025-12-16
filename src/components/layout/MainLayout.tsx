import { useState } from 'react';
import { TopNavbar } from './TopNavbar';
import { BottomNavbar } from './BottomNavbar';
import { SideMenu } from './SideMenu';

interface MainLayoutProps {
  children: React.ReactNode;
  showTopNav?: boolean;
  categories?: string[];
  selectedCategory?: string | null;
  onSelectCategory?: (category: string | null) => void;
}

const defaultCategories = [
  'Action',
  'Comedy',
  'Drama',
  'Horror',
  'Romance',
  'Sci-Fi',
  'Thriller',
  'Documentary',
  'Animation',
  'Adventure',
];

export function MainLayout({ 
  children, 
  showTopNav = true,
  categories = defaultCategories,
  selectedCategory = null,
  onSelectCategory = () => {}
}: MainLayoutProps) {
  const [isSideMenuOpen, setIsSideMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      {showTopNav && (
        <TopNavbar onMenuClick={() => setIsSideMenuOpen(true)} />
      )}
      
      <SideMenu
        isOpen={isSideMenuOpen}
        onClose={() => setIsSideMenuOpen(false)}
        categories={categories}
        selectedCategory={selectedCategory}
        onSelectCategory={onSelectCategory}
      />

      <main className={`mobile-container ${showTopNav ? 'pt-nav' : ''} pb-bottom-nav min-h-screen`}>
        {children}
      </main>

      <BottomNavbar />
    </div>
  );
}
