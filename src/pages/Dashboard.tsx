import { useNavigate } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Users, 
  Film, 
  DollarSign, 
  TrendingUp, 
  Wallet, 
  History,
  Upload,
  Eye
} from 'lucide-react';

// Mock user state - in real app this would come from auth context
const mockUser = null; // Set to { role: 'admin' | 'dj' | 'subscriber' } when logged in

const Dashboard = () => {
  const navigate = useNavigate();

  if (!mockUser) {
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
    <div className="p-4 space-y-6 animate-fade-in">
      <h1 className="text-xl font-bold">Admin Dashboard</h1>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="bg-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Total Users</p>
                <p className="text-lg font-bold">1,234</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-accent/10">
                <Film className="h-5 w-5 text-accent" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Total Movies</p>
                <p className="text-lg font-bold">567</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card col-span-2">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-price/10">
                <DollarSign className="h-5 w-5 text-price" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Total Earnings</p>
                <p className="text-xl font-bold text-price">Tsh 2,450,000</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="space-y-3">
        <h2 className="font-semibold">Quick Actions</h2>
        <div className="grid grid-cols-2 gap-3">
          <Button variant="outline" className="h-auto py-4 flex flex-col gap-2">
            <Upload className="h-5 w-5" />
            <span className="text-xs">Upload Movie</span>
          </Button>
          <Button variant="outline" className="h-auto py-4 flex flex-col gap-2">
            <Users className="h-5 w-5" />
            <span className="text-xs">Manage Users</span>
          </Button>
        </div>
      </div>
    </div>
  );

  // DJ Dashboard
  const renderDJDashboard = () => (
    <div className="p-4 space-y-6 animate-fade-in">
      <h1 className="text-xl font-bold">DJ Dashboard</h1>
      
      <div className="grid grid-cols-2 gap-4">
        <Card className="bg-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Film className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">My Videos</p>
                <p className="text-lg font-bold">45</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-price/10">
                <DollarSign className="h-5 w-5 text-price" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Earnings</p>
                <p className="text-lg font-bold text-price">Tsh 125,000</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Button className="w-full bg-primary hover:bg-primary/90">
        <Upload className="h-4 w-4 mr-2" />
        Upload New Video
      </Button>
    </div>
  );

  // Subscriber Dashboard
  const renderSubscriberDashboard = () => (
    <div className="p-4 space-y-6 animate-fade-in">
      <h1 className="text-xl font-bold">My Dashboard</h1>
      
      <div className="grid grid-cols-2 gap-4">
        <Card className="bg-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Wallet className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Balance</p>
                <p className="text-lg font-bold text-primary">Tsh 5,000</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-views/10">
                <Eye className="h-5 w-5 text-views" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Watched</p>
                <p className="text-lg font-bold">23</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card col-span-2">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-price/10">
                <TrendingUp className="h-5 w-5 text-price" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Total Spent</p>
                <p className="text-lg font-bold text-price">Tsh 45,000</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-3">
        <Button className="w-full bg-accent hover:bg-accent/90 text-accent-foreground">
          <Wallet className="h-4 w-4 mr-2" />
          Top Up Balance
        </Button>
        <Button variant="outline" className="w-full">
          <History className="h-4 w-4 mr-2" />
          Purchase History
        </Button>
      </div>
    </div>
  );

  return (
    <MainLayout showTopNav={false}>
      {mockUser?.role === 'admin' && renderAdminDashboard()}
      {mockUser?.role === 'dj' && renderDJDashboard()}
      {mockUser?.role === 'subscriber' && renderSubscriberDashboard()}
    </MainLayout>
  );
};

export default Dashboard;
