import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';

const Privacy = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background mobile-container">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="flex items-center gap-4 p-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-bold">Privacy Policy</h1>
        </div>
      </div>

      <div className="p-4 space-y-4 pb-24">
        <p className="text-sm text-muted-foreground">
          Last updated: {new Date().toLocaleDateString()}
        </p>

        <Card className="bg-card">
          <CardContent className="p-4 space-y-3">
            <h3 className="font-semibold">1. Information We Collect</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              We collect information you provide directly, including your phone number, username, 
              and payment information. We also collect usage data to improve our services.
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card">
          <CardContent className="p-4 space-y-3">
            <h3 className="font-semibold">2. How We Use Your Information</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Your information is used to provide and improve our services, process transactions, 
              communicate with you about your account, and ensure platform security.
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card">
          <CardContent className="p-4 space-y-3">
            <h3 className="font-semibold">3. Information Sharing</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              We do not sell your personal information. We may share information with payment 
              processors to complete transactions and with law enforcement when required by law.
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card">
          <CardContent className="p-4 space-y-3">
            <h3 className="font-semibold">4. Data Security</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              We implement industry-standard security measures to protect your data. However, 
              no method of transmission over the internet is 100% secure.
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card">
          <CardContent className="p-4 space-y-3">
            <h3 className="font-semibold">5. Your Rights</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              You have the right to access, update, or delete your personal information. 
              Contact us to exercise these rights or for any privacy-related concerns.
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card">
          <CardContent className="p-4 space-y-3">
            <h3 className="font-semibold">6. Cookies and Tracking</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              We use local storage and similar technologies to enhance your experience 
              and remember your preferences across sessions.
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card">
          <CardContent className="p-4 space-y-3">
            <h3 className="font-semibold">7. Changes to Policy</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              We may update this privacy policy periodically. We will notify you of significant 
              changes through the app or via other means.
            </p>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-muted-foreground pt-4">
          For privacy inquiries, contact privacy@movietz.app
        </p>
      </div>
    </div>
  );
};

export default Privacy;
