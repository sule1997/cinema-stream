import { useState, useEffect } from 'react';
import { Download, X, Share } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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
      if (!isInStandaloneMode) {
        setIsOpen(true);
      }
    }, 100);

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
    setIsOpen(false);
  };

  if (isStandalone) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-sm bg-card border border-border shadow-2xl">
        <DialogHeader>
          <div className="mx-auto w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
            <Download className="h-10 w-10 text-primary" />
          </div>
          <DialogTitle className="text-center text-2xl font-bold text-foreground">
            Install Mobile App
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          {isIOS ? (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-muted border border-border">
                <div className="space-y-3 text-sm text-muted-foreground">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0 text-primary font-bold">
                      1
                    </div>
                    <p className="text-foreground">Tap <Share className="h-4 w-4 inline mx-1 text-primary" /> Share</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0 text-primary font-bold">
                      2
                    </div>
                    <p className="text-foreground">Add to Home Screen</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0 text-primary font-bold">
                      3
                    </div>
                    <p className="text-foreground">Tap Add</p>
                  </div>
                </div>
              </div>
              <Button
                onClick={handleClose}
                className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
              >
                Got it!
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              <Button
                onClick={handleInstallClick}
                disabled={!deferredPrompt}
                className="w-full h-14 bg-primary hover:bg-primary/90 text-primary-foreground text-lg font-bold shadow-lg"
              >
                <Download className="h-6 w-6 mr-2" />
                Install Now
              </Button>
              <Button
                variant="ghost"
                onClick={handleClose}
                className="w-full text-sm text-muted-foreground hover:text-foreground hover:bg-muted"
              >
                Maybe Later
              </Button>
            </div>
          )}
        </div>

        <button
          onClick={handleClose}
          className="absolute right-4 top-4 rounded-sm opacity-70 text-foreground transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
        >
          <X className="h-5 w-5" />
          <span className="sr-only">Close</span>
        </button>
      </DialogContent>
    </Dialog>
  );
}
