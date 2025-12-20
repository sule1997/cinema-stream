import { ArrowLeft, Film, Users, Shield, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';

const About = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background mobile-container">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="flex items-center gap-4 p-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-bold">About Us</h1>
        </div>
      </div>

      <div className="p-4 space-y-6 pb-24">
        {/* Hero Section */}
        <div className="text-center space-y-4">
          <div className="w-20 h-20 mx-auto rounded-2xl bg-primary/10 flex items-center justify-center">
            <Film className="h-10 w-10 text-primary" />
          </div>
          <h2 className="text-2xl font-bold">Movietz</h2>
          <p className="text-muted-foreground">
            Your ultimate destination for premium entertainment content.
          </p>
        </div>

        {/* Mission */}
        <Card className="bg-card">
          <CardContent className="p-4 space-y-3">
            <h3 className="font-semibold text-lg">Our Mission</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Movietz is dedicated to bringing you the best entertainment experience. 
              We connect talented DJs and content creators with audiences who appreciate 
              quality content. Our platform makes it easy to discover, purchase, and enjoy 
              movies and series from your favorite creators.
            </p>
          </CardContent>
        </Card>

        {/* Features */}
        <div className="space-y-3">
          <h3 className="font-semibold text-lg">Why Choose Movietz?</h3>
          <div className="grid gap-3">
            <Card className="bg-card">
              <CardContent className="p-4 flex items-start gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Star className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-medium">Quality Content</h4>
                  <p className="text-sm text-muted-foreground">
                    All content is reviewed to ensure the best viewing experience.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card">
              <CardContent className="p-4 flex items-start gap-3">
                <div className="p-2 rounded-lg bg-accent/10">
                  <Users className="h-5 w-5 text-accent" />
                </div>
                <div>
                  <h4 className="font-medium">Creator Support</h4>
                  <p className="text-sm text-muted-foreground">
                    We empower creators to share their work and earn from their talent.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card">
              <CardContent className="p-4 flex items-start gap-3">
                <div className="p-2 rounded-lg bg-price/10">
                  <Shield className="h-5 w-5 text-price" />
                </div>
                <div>
                  <h4 className="font-medium">Secure Payments</h4>
                  <p className="text-sm text-muted-foreground">
                    Fast and secure mobile money payments for hassle-free transactions.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Contact */}
        <Card className="bg-card">
          <CardContent className="p-4 space-y-3 text-center">
            <h3 className="font-semibold">Contact Us</h3>
            <p className="text-sm text-muted-foreground">
              Have questions or need support? Reach out to us anytime.
            </p>
            <p className="text-sm text-primary">support@movietz.app</p>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} Movietz. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default About;
