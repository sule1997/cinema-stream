import { useNavigate } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Settings as SettingsIcon, 
  User, 
  Lock, 
  LogOut,
  Search,
  FileText,
  Key,
  Globe
} from 'lucide-react';

// Mock user state
const mockUser = null;

const Settings = () => {
  const navigate = useNavigate();

  if (!mockUser) {
    return (
      <MainLayout showTopNav={false}>
        <div className="flex flex-col items-center justify-center min-h-[80vh] p-6 animate-fade-in">
          <div className="text-center space-y-4 max-w-sm">
            <div className="w-20 h-20 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
              <SettingsIcon className="w-10 h-10 text-primary" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">Sign In Required</h1>
            <p className="text-muted-foreground">
              Please sign in to access your settings and preferences.
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

  const renderAdminSettings = () => (
    <div className="p-4 space-y-6 animate-fade-in">
      <h1 className="text-xl font-bold">Admin Settings</h1>
      
      {/* SEO Control */}
      <div className="space-y-3">
        <h2 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">
          SEO Control
        </h2>
        <Card className="bg-card">
          <CardContent className="p-0">
            <SettingItem icon={Globe} label="Site Title" description="Configure your site title" />
            <SettingItem icon={FileText} label="Site Description" description="Edit meta description" />
            <SettingItem icon={Search} label="Keywords" description="Manage SEO keywords" last />
          </CardContent>
        </Card>
      </div>

      {/* Access Settings */}
      <div className="space-y-3">
        <h2 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">
          Access Settings
        </h2>
        <Card className="bg-card">
          <CardContent className="p-0">
            <SettingItem icon={Key} label="API Settings" description="Manage API keys" />
            <SettingItem icon={Lock} label="Update Password" description="Change your password" last />
          </CardContent>
        </Card>
      </div>

      <Button variant="destructive" className="w-full">
        <LogOut className="h-4 w-4 mr-2" />
        Logout
      </Button>
    </div>
  );

  const renderUserSettings = () => (
    <div className="p-4 space-y-6 animate-fade-in">
      <h1 className="text-xl font-bold">Settings</h1>
      
      {/* User Info */}
      <div className="space-y-3">
        <h2 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">
          Account
        </h2>
        <Card className="bg-card">
          <CardContent className="p-0">
            <SettingItem icon={User} label="Profile" description="View and edit your profile" />
            <SettingItem icon={Lock} label="Update Password" description="Change your password" last />
          </CardContent>
        </Card>
      </div>

      <Button variant="destructive" className="w-full">
        <LogOut className="h-4 w-4 mr-2" />
        Logout
      </Button>
    </div>
  );

  return (
    <MainLayout showTopNav={false}>
      {mockUser?.role === 'admin' ? renderAdminSettings() : renderUserSettings()}
    </MainLayout>
  );
};

interface SettingItemProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  description: string;
  last?: boolean;
}

function SettingItem({ icon: Icon, label, description, last }: SettingItemProps) {
  return (
    <button className={`w-full flex items-center gap-4 p-4 hover:bg-secondary/50 transition-colors ${!last ? 'border-b border-border' : ''}`}>
      <div className="p-2 rounded-lg bg-primary/10">
        <Icon className="h-5 w-5 text-primary" />
      </div>
      <div className="flex-1 text-left">
        <p className="font-medium text-sm">{label}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
    </button>
  );
}

export default Settings;
