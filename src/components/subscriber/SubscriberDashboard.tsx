import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useUserPurchases } from '@/hooks/useMovies';
import { useTopupHistory } from '@/hooks/useTopupHistory';
import { TopupDialog } from './TopupDialog';
import { 
  Wallet, 
  Eye, 
  TrendingUp, 
  History,
  Loader2,
  CheckCircle2,
  XCircle,
  Clock,
  CreditCard
} from 'lucide-react';

export function SubscriberDashboard() {
  const { user, profile } = useAuth();
  const { data: purchases = [], isLoading } = useUserPurchases(user?.id);
  const { data: topupHistory = [], isLoading: isLoadingTopups } = useTopupHistory(user?.id);
  const [topupOpen, setTopupOpen] = useState(false);

  const totalSpent = purchases.reduce((sum, p) => sum + (p.amount || 0), 0);
  const moviesWatched = purchases.length;

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

  return (
    <div className="p-4 space-y-6 animate-fade-in">
      <h1 className="text-xl font-bold">My Dashboard</h1>
      <p className="text-sm text-muted-foreground">
        Welcome, {profile?.username || profile?.phone || 'User'}!
      </p>
      
      <div className="grid grid-cols-2 gap-4">
        <Card className="bg-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Wallet className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Balance</p>
                <p className="text-lg font-bold text-primary">
                  Tsh {profile?.balance?.toLocaleString() || 0}
                </p>
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
                <p className="text-lg font-bold">{moviesWatched}</p>
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
                <p className="text-lg font-bold text-price">
                  Tsh {totalSpent.toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-3">
        <Button 
          className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
          onClick={() => setTopupOpen(true)}
        >
          <Wallet className="h-4 w-4 mr-2" />
          Top Up Balance
        </Button>
      </div>

      {/* Topup History */}
      <div className="space-y-3">
        <h2 className="font-semibold flex items-center gap-2">
          <CreditCard className="h-4 w-4" />
          Topup History
        </h2>
        
        {isLoadingTopups ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : topupHistory.length === 0 ? (
          <Card className="bg-muted/50">
            <CardContent className="p-4 text-center text-muted-foreground">
              No topup transactions yet
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

      {/* Purchase History */}
      <div className="space-y-3">
        <h2 className="font-semibold flex items-center gap-2">
          <History className="h-4 w-4" />
          Purchase History
        </h2>
        
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : purchases.length === 0 ? (
          <Card className="bg-muted/50">
            <CardContent className="p-4 text-center text-muted-foreground">
              No purchases yet
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {purchases.map((purchase) => (
              <Card key={purchase.id} className="bg-card">
                <CardContent className="p-3 flex justify-between items-center">
                  <div>
                    <p className="font-medium text-sm">
                      {(purchase as any).movies?.title || 'Movie'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(purchase.purchased_at).toLocaleDateString()}
                    </p>
                  </div>
                  <span className="text-sm font-bold text-price">
                    Tsh {purchase.amount.toLocaleString()}
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
