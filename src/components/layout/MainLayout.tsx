import { useState } from 'react';
import { TopNavbar } from './TopNavbar';
import { BottomNavbar } from './BottomNavbar';
import { SideMenu } from './SideMenu';

interface MainLayoutProps {
  children: React.ReactNode;
  showTopNav?: boolean;
  selectedCategory?: string | null;
  onSelectCategory?: (category: string | null) => void;
}

export function MainLayout({ 
  children, 
  showTopNav = true,
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
