import { useState, useEffect } from 'react';
import { ExternalLink, Chrome, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { detectBrowser, openInExternalBrowser, BrowserInfo } from '@/utils/browserDetection';

export function BrowserRedirectDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [browserInfo, setBrowserInfo] = useState<BrowserInfo | null>(null);
  const [autoRedirectAttempted, setAutoRedirectAttempted] = useState(false);

  useEffect(() => {
    const info = detectBrowser();
    setBrowserInfo(info);

    if (info.isInAppBrowser && !autoRedirectAttempted) {
      setAutoRedirectAttempted(true);

      const success = openInExternalBrowser(info);

      if (!success) {
        setTimeout(() => {
          setIsOpen(true);
        }, 1000);
      } else {
        setTimeout(() => {
          setIsOpen(true);
        }, 3000);
      }
    }
  }, []);

  const handleOpenExternal = () => {
    if (browserInfo) {
      openInExternalBrowser(browserInfo);
      setTimeout(() => {
        setIsOpen(false);
      }, 1000);
    }
  };

  if (!browserInfo?.isInAppBrowser) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-sm bg-gradient-to-br from-primary/5 via-background to-accent/5 border-2 border-primary/20">
        <DialogHeader>
          <div className="mx-auto w-16 h-16 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center mb-4 animate-pulse-glow">
            <Chrome className="h-8 w-8 text-white" />
          </div>
          <DialogTitle className="text-center text-xl">
            Better Experience Awaits!
          </DialogTitle>
          <DialogDescription className="text-center pt-2">
            You're browsing in {browserInfo.browserName}.
            {browserInfo.isAndroid && (
              <span className="block mt-2">
                Open in Chrome for the best experience with full features and faster performance.
              </span>
            )}
            {browserInfo.isIOS && (
              <span className="block mt-2">
                Open in Safari for the best experience with full features and faster performance.
              </span>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 pt-4">
          <Button
            onClick={handleOpenExternal}
            className="w-full h-12 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white text-base font-semibold shadow-lg"
          >
            <ExternalLink className="h-5 w-5 mr-2" />
            Open in {browserInfo.isAndroid ? 'Chrome' : 'Safari'}
          </Button>

          <Button
            variant="ghost"
            onClick={() => setIsOpen(false)}
            className="w-full"
          >
            Continue Anyway
          </Button>
        </div>

        <button
          onClick={() => setIsOpen(false)}
          className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </button>
      </DialogContent>
    </Dialog>
  );
}
