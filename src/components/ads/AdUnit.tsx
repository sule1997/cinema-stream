import { useEffect, useRef } from 'react';
import { useAdsenseSettings } from '@/hooks/useAdsense';

interface AdUnitProps {
  type: 'display' | 'in-article';
  className?: string;
}

export function AdUnit({ type, className = '' }: AdUnitProps) {
  const { data: settings } = useAdsenseSettings();
  const adContainerRef = useRef<HTMLDivElement>(null);
  const adSlotId = useRef(`ad-${type}-${Math.random().toString(36).substr(2, 9)}`);
  const adCode = type === 'display' ? settings?.displayAd : settings?.inArticleAd;

  useEffect(() => {
    if (!adCode || !adContainerRef.current) return;

    const container = adContainerRef.current;
    
    // Check if this container already has an initialized ad
    const existingIns = container.querySelector('ins.adsbygoogle');
    if (existingIns && existingIns.getAttribute('data-ad-status')) {
      // Ad already initialized, don't reinitialize
      return;
    }

    // Clear previous content
    container.innerHTML = '';

    // Create a wrapper and inject the ad code
    const adWrapper = document.createElement('div');
    adWrapper.innerHTML = adCode;

    // Append all child nodes to the container
    while (adWrapper.firstChild) {
      container.appendChild(adWrapper.firstChild);
    }

    // Execute any script tags by replacing them with new ones
    const scripts = container.querySelectorAll('script');
    scripts.forEach((script) => {
      const newScript = document.createElement('script');
      
      Array.from(script.attributes).forEach((attr) => {
        newScript.setAttribute(attr.name, attr.value);
      });
      
      if (script.textContent) {
        newScript.textContent = script.textContent;
      }
      
      script.parentNode?.replaceChild(newScript, script);
    });

    // Push to adsbygoogle with a delay to ensure DOM is ready
    const timeoutId = setTimeout(() => {
      try {
        const insElement = container.querySelector('ins.adsbygoogle');
        // Only push if the ins element exists and hasn't been initialized yet
        if (insElement && !insElement.getAttribute('data-ad-status')) {
          // @ts-ignore
          (window.adsbygoogle = window.adsbygoogle || []).push({});
        }
      } catch (e) {
        console.log('AdSense push error:', e);
      }
    }, 150);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [adCode]);

  if (!adCode) return null;

  return (
    <div 
      ref={adContainerRef}
      id={adSlotId.current}
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
