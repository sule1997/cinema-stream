import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { AdminStats, UserManagement } from '@/components/admin/AdminStats';
import { CategoryManagement } from '@/components/admin/CategoryManagement';
import { ApiSettings } from '@/components/admin/ApiSettings';
import { WithdrawRequests } from '@/components/admin/WithdrawRequests';
import { MovieReview } from '@/components/admin/MovieReview';
import { DjStats, DjMoviesList } from '@/components/admin/DjDashboard';
import { MovieUploadDialog } from '@/components/admin/MovieUploadDialog';
import { SubscriberDashboard } from '@/components/subscriber/SubscriberDashboard';
import { 
  Users, 
  Upload,
  FolderTree,
  Key,
  Clock,
  Film
} from 'lucide-react';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, profile, role, isLoading } = useAuth();
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);

  if (isLoading) {
    return (
      <MainLayout showTopNav={false}>
        <div className="flex items-center justify-center min-h-[80vh]">
          <div className="animate-pulse text-muted-foreground">Loading...</div>
        </div>
      </MainLayout>
    );
  }

  if (!user) {
    return (
      <MainLayout showTopNav={false}>
        <div className="flex flex-col items-center justify-center min-h-[80vh] p-6 animate-fade-in">
          <div className="text-center space-y-4 max-w-sm">
            <div className="w-20 h-20 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
              <Users className="w-10 h-10 text-primary" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">Sign In Required</h1>
            <p className="text-muted-foreground">
              Please sign in to access your dashboard and manage your account.
            </p>
            <div className="flex flex-col gap-3 pt-4">
              <Button 
                onClick={() => navigate('/auth')} 
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                Sign In
              </Button>
              <Button 
                variant="outline" 
                onClick={() => navigate('/auth?mode=signup')}
                className="w-full"
              >
                Create Account
              </Button>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  // Admin Dashboard
  const renderAdminDashboard = () => (
    <div className="p-4 space-y-4 animate-fade-in pb-20">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-foreground">Admin Dashboard</h1>
        <Button size="sm" onClick={() => setUploadDialogOpen(true)}>
          <Upload className="h-4 w-4 mr-1" />
          Upload
        </Button>
      </div>
      
      <AdminStats />

      <Tabs defaultValue="users" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="users" className="text-xs px-1">
            <Users className="h-4 w-4" />
          </TabsTrigger>
          <TabsTrigger value="review" className="text-xs px-1">
            <Film className="h-4 w-4" />
          </TabsTrigger>
          <TabsTrigger value="withdraw" className="text-xs px-1">
            <Clock className="h-4 w-4" />
          </TabsTrigger>
          <TabsTrigger value="categories" className="text-xs px-1">
            <FolderTree className="h-4 w-4" />
          </TabsTrigger>
          <TabsTrigger value="api" className="text-xs px-1">
            <Key className="h-4 w-4" />
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="users" className="mt-4">
          <UserManagement />
        </TabsContent>

        <TabsContent value="review" className="mt-4">
          <MovieReview />
        </TabsContent>
        
        <TabsContent value="withdraw" className="mt-4">
          <WithdrawRequests />
        </TabsContent>
        
        <TabsContent value="categories" className="mt-4">
          <CategoryManagement />
        </TabsContent>
        
        <TabsContent value="api" className="mt-4">
          <ApiSettings />
        </TabsContent>
      </Tabs>

      <MovieUploadDialog 
        open={uploadDialogOpen} 
        onOpenChange={setUploadDialogOpen} 
      />
    </div>
  );

  // DJ Dashboard
  const renderDJDashboard = () => (
    <div className="p-4 space-y-4 animate-fade-in pb-20">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-foreground">DJ Dashboard</h1>
        <Button size="sm" onClick={() => setUploadDialogOpen(true)}>
          <Upload className="h-4 w-4 mr-1" />
          Upload
        </Button>
      </div>
      
      <DjStats />
      <DjMoviesList />

      <MovieUploadDialog 
        open={uploadDialogOpen} 
        onOpenChange={setUploadDialogOpen} 
      />
    </div>
  );

  return (
    <MainLayout showTopNav={false}>
      {role === 'admin' && renderAdminDashboard()}
      {role === 'dj' && renderDJDashboard()}
      {role === 'subscriber' && <SubscriberDashboard />}
    </MainLayout>
  );
};

export default Dashboard;
