import { useEffect, useRef } from 'react';
import { useAdsenseSettings } from '@/hooks/useAdsense';

interface AdUnitProps {
  type: 'display' | 'in-article';
  className?: string;
}

export function AdUnit({ type, className = '' }: AdUnitProps) {
  const { data: settings } = useAdsenseSettings();
  const adContainerRef = useRef<HTMLDivElement>(null);
  const adCode = type === 'display' ? settings?.displayAd : settings?.inArticleAd;

  useEffect(() => {
    if (!adCode || !adContainerRef.current) return;

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

    // Push to adsbygoogle if available
    try {
      // @ts-ignore
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (e) {
      // AdSense may not be loaded yet
    }
  }, [adCode]);

  if (!adCode) return null;

  return (
    <div 
      ref={adContainerRef}
      className={`ad-unit rounded-lg overflow-hidden bg-muted/30 ${className}`}
      style={{ 
        minHeight: '100px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    />
  );
}
