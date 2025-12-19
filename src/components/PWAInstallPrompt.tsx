import { useState, useEffect } from 'react';
import { Download, X, Smartphone, Zap, Share } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function PWAInstallPrompt() {
  const [isOpen, setIsOpen] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    const isIOSDevice = /iphone|ipad|ipod/i.test(navigator.userAgent);
    const isInStandaloneMode = window.matchMedia('(display-mode: standalone)').matches ||
                               (window.navigator as any).standalone === true;

    setIsIOS(isIOSDevice);
    setIsStandalone(isInStandaloneMode);

    const hasSeenPrompt = localStorage.getItem('pwa-prompt-seen');
    const hasInstalled = localStorage.getItem('pwa-installed');

    if (hasInstalled || isInStandaloneMode) {
      return;
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    const timer = setTimeout(() => {
      if (!hasSeenPrompt && !isInStandaloneMode) {
        setIsOpen(true);
      }
    }, 15000);

    const handleAppInstalled = () => {
      localStorage.setItem('pwa-installed', 'true');
      setIsOpen(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      if (isIOS) {
        return;
      }
      setIsOpen(false);
      return;
    }

    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;

      if (outcome === 'accepted') {
        localStorage.setItem('pwa-installed', 'true');
        setIsOpen(false);
      }

      setDeferredPrompt(null);
    } catch (error) {
      console.error('Error showing install prompt:', error);
    }
  };

  const handleClose = () => {
    localStorage.setItem('pwa-prompt-seen', 'true');
    setIsOpen(false);
  };

  if (isStandalone) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-sm bg-gradient-to-br from-accent/10 via-background to-primary/10 border-2 border-accent/30 shadow-2xl">
        <DialogHeader>
          <div className="mx-auto w-20 h-20 rounded-2xl bg-gradient-to-br from-accent via-primary to-accent flex items-center justify-center mb-4 shadow-lg animate-pulse-glow">
            <Download className="h-10 w-10 text-white" />
          </div>
          <DialogTitle className="text-center text-2xl bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Install Muvietz
          </DialogTitle>
          <DialogDescription className="text-center pt-2 text-base">
            Get instant access to your favorite movies with our app!
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 rounded-lg bg-card/50 border border-border/50">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <Zap className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h4 className="font-semibold text-sm">Lightning Fast</h4>
                <p className="text-xs text-muted-foreground">Instant loading with offline support</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-lg bg-card/50 border border-border/50">
              <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center shrink-0">
                <Smartphone className="h-5 w-5 text-accent" />
              </div>
              <div>
                <h4 className="font-semibold text-sm">Home Screen Access</h4>
                <p className="text-xs text-muted-foreground">One tap to open, just like a native app</p>
              </div>
            </div>
          </div>

          {isIOS ? (
            <div className="space-y-3">
              <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                <p className="text-sm text-center mb-3 font-medium">To install on iOS:</p>
                <div className="space-y-2 text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center shrink-0 text-primary font-bold">
                      1
                    </div>
                    <p>Tap the <Share className="h-3 w-3 inline mx-1" /> share button</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center shrink-0 text-primary font-bold">
                      2
                    </div>
                    <p>Scroll and tap "Add to Home Screen"</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center shrink-0 text-primary font-bold">
                      3
                    </div>
                    <p>Tap "Add" in the top right</p>
                  </div>
                </div>
              </div>
              <Button
                variant="outline"
                onClick={handleClose}
                className="w-full"
              >
                Got it!
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              <Button
                onClick={handleInstallClick}
                disabled={!deferredPrompt}
                className="w-full h-12 bg-gradient-to-r from-accent via-primary to-accent hover:from-accent/90 hover:via-primary/90 hover:to-accent/90 text-white text-base font-bold shadow-lg"
              >
                <Download className="h-5 w-5 mr-2" />
                Install Now
              </Button>
              <Button
                variant="ghost"
                onClick={handleClose}
                className="w-full text-sm"
              >
                Maybe Later
              </Button>
            </div>
          )}
        </div>

        <button
          onClick={handleClose}
          className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </button>
      </DialogContent>
    </Dialog>
  );
}
