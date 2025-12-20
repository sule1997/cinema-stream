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
      <DialogContent className="max-w-sm bg-gradient-to-br from-blue-950 via-blue-900 to-blue-950 border-2 border-blue-500/30 shadow-2xl">
        <DialogHeader>
          <div className="mx-auto w-24 h-24 rounded-3xl bg-gradient-to-br from-blue-600 via-blue-500 to-blue-600 flex items-center justify-center mb-6 shadow-xl animate-pulse-glow">
            <Download className="h-12 w-12 text-white" />
          </div>
          <DialogTitle className="text-center text-3xl font-bold text-white mb-2">
            Install Muvietz
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          {isIOS ? (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-blue-900/40 border border-blue-500/20">
                <div className="space-y-3 text-sm text-blue-100">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-500/30 flex items-center justify-center shrink-0 text-white font-bold">
                      1
                    </div>
                    <p>Tap <Share className="h-4 w-4 inline mx-1" /> Share</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-500/30 flex items-center justify-center shrink-0 text-white font-bold">
                      2
                    </div>
                    <p>Add to Home Screen</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-500/30 flex items-center justify-center shrink-0 text-white font-bold">
                      3
                    </div>
                    <p>Tap Add</p>
                  </div>
                </div>
              </div>
              <Button
                onClick={handleClose}
                className="w-full h-12 bg-blue-500 hover:bg-blue-600 text-white font-semibold"
              >
                Got it!
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              <Button
                onClick={handleInstallClick}
                disabled={!deferredPrompt}
                className="w-full h-14 bg-gradient-to-r from-blue-600 via-blue-500 to-blue-600 hover:from-blue-700 hover:via-blue-600 hover:to-blue-700 text-white text-lg font-bold shadow-xl"
              >
                <Download className="h-6 w-6 mr-2" />
                Install Now
              </Button>
              <Button
                variant="ghost"
                onClick={handleClose}
                className="w-full text-sm text-blue-200 hover:text-white hover:bg-blue-900/40"
              >
                Maybe Later
              </Button>
            </div>
          )}
        </div>

        <button
          onClick={handleClose}
          className="absolute right-4 top-4 rounded-sm opacity-70 text-white transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
        >
          <X className="h-5 w-5" />
          <span className="sr-only">Close</span>
        </button>
      </DialogContent>
    </Dialog>
  );
}
