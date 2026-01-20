import { useEffect, useRef, useId } from 'react';
import { useAdsenseSettings } from '@/hooks/useAdsense';

interface AdUnitProps {
  type: 'display' | 'in-article';
  className?: string;
}

export function AdUnit({ type, className = '' }: AdUnitProps) {
  const { data: settings } = useAdsenseSettings();
  const adContainerRef = useRef<HTMLDivElement>(null);
  const adInitialized = useRef(false);
  const uniqueId = useId();
  const adCode = type === 'display' ? settings?.displayAd : settings?.inArticleAd;

  useEffect(() => {
    if (!adCode || !adContainerRef.current || adInitialized.current) return;

    // Mark as initialized to prevent duplicate ad loading
    adInitialized.current = true;

    // Clear previous content
    adContainerRef.current.innerHTML = '';

    // Create a container for the ad
    const adWrapper = document.createElement('div');
    adWrapper.innerHTML = adCode;

    // Append all child nodes to the container
    while (adWrapper.firstChild) {
      adContainerRef.current.appendChild(adWrapper.firstChild);
    }

    // Execute any script tags
    const scripts = adContainerRef.current.querySelectorAll('script');
    scripts.forEach((script) => {
      const newScript = document.createElement('script');
      
      // Copy attributes
      Array.from(script.attributes).forEach((attr) => {
        newScript.setAttribute(attr.name, attr.value);
      });
      
      // Copy inline content
      if (script.textContent) {
        newScript.textContent = script.textContent;
      }
      
      // Replace old script with new one to execute it
      script.parentNode?.replaceChild(newScript, script);
    });

    // Push to adsbygoogle after a small delay to ensure DOM is ready
    const pushAd = () => {
      try {
        // @ts-ignore
        if (window.adsbygoogle && adContainerRef.current?.querySelector('.adsbygoogle')) {
          // @ts-ignore
          (window.adsbygoogle = window.adsbygoogle || []).push({});
        }
      } catch (e) {
        console.log('AdSense push error:', e);
      }
    };

    // Try immediately and also with a delay for SPA navigation
    pushAd();
    const timeoutId = setTimeout(pushAd, 100);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [adCode, uniqueId]);

  // Reset initialization when component unmounts and remounts
  useEffect(() => {
    return () => {
      adInitialized.current = false;
    };
  }, []);

  if (!adCode) return null;

  return (
    <div 
      ref={adContainerRef}
      key={uniqueId}
      className={`ad-unit rounded-lg overflow-hidden bg-muted/30 ${className}`}
      style={{ 
        minHeight: '90px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    />
  );
}
