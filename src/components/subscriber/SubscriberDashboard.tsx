import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useTopupHistory } from '@/hooks/useTopupHistory';
import { TopupDialog } from './TopupDialog';
import { useHasActiveSubscription } from '@/hooks/useSubscription';
import { 
  Crown,
  History,
  Loader2,
  CheckCircle2,
  XCircle,
  Clock,
  CreditCard,
  Calendar
} from 'lucide-react';

export function SubscriberDashboard() {
  const { user, profile } = useAuth();
  const { data: topupHistory = [], isLoading: isLoadingTopups } = useTopupHistory(user?.id);
  const { data: hasSubscription } = useHasActiveSubscription(user?.id);
  const [topupOpen, setTopupOpen] = useState(false);

  const subscriptionExpiresAt = profile?.subscription_expires_at 
    ? new Date(profile.subscription_expires_at) 
    : null;
  const isSubscriptionActive = subscriptionExpiresAt && subscriptionExpiresAt > new Date();

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-destructive" />;
      default:
        return <Clock className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-500';
      case 'failed':
        return 'text-destructive';
      default:
        return 'text-yellow-500';
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getDaysRemaining = () => {
    if (!subscriptionExpiresAt) return 0;
    const now = new Date();
    const diffTime = subscriptionExpiresAt.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  };

  return (
    <div className="p-4 space-y-6 animate-fade-in">
      <h1 className="text-xl font-bold">My Dashboard</h1>
      <p className="text-sm text-muted-foreground">
        Welcome, {profile?.username || profile?.phone || 'User'}!
      </p>
      
      {/* Subscription Status Card */}
      <Card className={`bg-card border-2 ${isSubscriptionActive ? 'border-primary' : 'border-muted'}`}>
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-full ${isSubscriptionActive ? 'bg-primary/10' : 'bg-muted'}`}>
              <Crown className={`h-8 w-8 ${isSubscriptionActive ? 'text-primary' : 'text-muted-foreground'}`} />
            </div>
            <div className="flex-1">
              <h2 className="font-bold text-lg">
                {isSubscriptionActive ? 'Premium Active' : 'No Active Subscription'}
              </h2>
              {isSubscriptionActive && subscriptionExpiresAt && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>Expires: {formatDate(subscriptionExpiresAt)}</span>
                  <span className="text-primary font-medium">({getDaysRemaining()} days left)</span>
                </div>
              )}
              {!isSubscriptionActive && (
                <p className="text-sm text-muted-foreground">
                  Subscribe to access all premium movies
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-3">
        <Button 
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
          onClick={() => setTopupOpen(true)}
        >
          <Crown className="h-4 w-4 mr-2" />
          {isSubscriptionActive ? 'Extend Subscription' : 'Subscribe Now'}
        </Button>
      </div>

      {/* Subscription History */}
      <div className="space-y-3">
        <h2 className="font-semibold flex items-center gap-2">
          <CreditCard className="h-4 w-4" />
          Subscription History
        </h2>
        
        {isLoadingTopups ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : topupHistory.length === 0 ? (
          <Card className="bg-muted/50">
            <CardContent className="p-4 text-center text-muted-foreground">
              No subscription transactions yet
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {topupHistory.map((tx) => (
              <Card key={tx.id} className="bg-card">
                <CardContent className="p-3 flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(tx.status)}
                    <div>
                      <p className="font-medium text-sm">
                        Tsh {tx.amount.toLocaleString()}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(tx.created_at).toLocaleDateString()} {new Date(tx.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                  <span className={`text-xs font-medium capitalize ${getStatusColor(tx.status)}`}>
                    {tx.status}
                  </span>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <TopupDialog open={topupOpen} onOpenChange={setTopupOpen} />
    </div>
  );
}
