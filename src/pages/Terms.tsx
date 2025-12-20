import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';

const Terms = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background mobile-container">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="flex items-center gap-4 p-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-bold">Terms of Service</h1>
        </div>
      </div>

      <div className="p-4 space-y-4 pb-24">
        <p className="text-sm text-muted-foreground">
          Last updated: {new Date().toLocaleDateString()}
        </p>

        <Card className="bg-card">
          <CardContent className="p-4 space-y-3">
            <h3 className="font-semibold">1. Acceptance of Terms</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              By accessing and using Movietz, you accept and agree to be bound by these 
              Terms of Service. If you do not agree to these terms, please do not use our services.
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card">
          <CardContent className="p-4 space-y-3">
            <h3 className="font-semibold">2. User Accounts</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              You are responsible for maintaining the confidentiality of your account and password. 
              You agree to accept responsibility for all activities that occur under your account.
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card">
          <CardContent className="p-4 space-y-3">
            <h3 className="font-semibold">3. Content and Purchases</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              All purchases are final. Content purchased is for personal use only and may not be 
              redistributed, shared, or sold without explicit permission from the content creator.
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card">
          <CardContent className="p-4 space-y-3">
            <h3 className="font-semibold">4. Creator Guidelines</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Content creators agree to upload only original content or content they have rights to 
              distribute. Violation of copyright laws may result in account termination.
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card">
          <CardContent className="p-4 space-y-3">
            <h3 className="font-semibold">5. Payments and Refunds</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Payments are processed through secure mobile money channels. Refunds may be issued 
              at our discretion in cases of technical issues preventing access to purchased content.
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card">
          <CardContent className="p-4 space-y-3">
            <h3 className="font-semibold">6. Prohibited Activities</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Users may not engage in any activity that interferes with or disrupts our services, 
              including attempting to bypass payment systems or downloading content illegally.
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card">
          <CardContent className="p-4 space-y-3">
            <h3 className="font-semibold">7. Changes to Terms</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              We reserve the right to modify these terms at any time. Continued use of the platform 
              after changes constitutes acceptance of the new terms.
            </p>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-muted-foreground pt-4">
          For questions about these terms, contact support@movietz.app
        </p>
      </div>
    </div>
  );
};

export default Terms;
