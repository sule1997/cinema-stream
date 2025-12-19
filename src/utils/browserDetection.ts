export interface BrowserInfo {
  isInAppBrowser: boolean;
  browserName: string;
  isAndroid: boolean;
  isIOS: boolean;
  isMobile: boolean;
}

export const detectBrowser = (): BrowserInfo => {
  const ua = navigator.userAgent || navigator.vendor || (window as any).opera;
  const userAgent = ua.toLowerCase();

  const isAndroid = /android/i.test(ua);
  const isIOS = /iphone|ipad|ipod/i.test(ua);
  const isMobile = isAndroid || isIOS;

  const inAppBrowsers = [
    { name: 'Facebook', test: /\bfb[\w_]+\//i },
    { name: 'Instagram', test: /instagram/i },
    { name: 'Telegram', test: /telegram/i },
    { name: 'TikTok', test: /tiktok/i },
    { name: 'Twitter', test: /twitter/i },
    { name: 'LinkedIn', test: /linkedin/i },
    { name: 'WhatsApp', test: /whatsapp/i },
    { name: 'Messenger', test: /\bmessenger\//i },
    { name: 'Line', test: /line/i },
    { name: 'WeChat', test: /micromessenger/i },
  ];

  const mainBrowsers = [
    /chrome/i,
    /safari/i,
    /firefox/i,
    /opera/i,
    /edge/i,
    /brave/i,
    /samsung/i,
  ];

  const isMainBrowser = mainBrowsers.some(pattern => {
    return pattern.test(userAgent) && !inAppBrowsers.some(ib => ib.test.test(userAgent));
  });

  if (isMainBrowser) {
    return {
      isInAppBrowser: false,
      browserName: 'main',
      isAndroid,
      isIOS,
      isMobile,
    };
  }

  const detectedBrowser = inAppBrowsers.find(browser => browser.test.test(userAgent));

  return {
    isInAppBrowser: !!detectedBrowser,
    browserName: detectedBrowser?.name || 'unknown',
    isAndroid,
    isIOS,
    isMobile,
  };
};

export const openInExternalBrowser = (browserInfo: BrowserInfo): boolean => {
  const currentUrl = window.location.href;

  if (browserInfo.isAndroid) {
    const intent = `intent://${window.location.host}${window.location.pathname}${window.location.search}#Intent;scheme=https;package=com.android.chrome;end`;
    window.location.href = intent;
    return true;
  }

  if (browserInfo.isIOS) {
    const safariUrl = `x-safari-https://${window.location.host}${window.location.pathname}${window.location.search}`;
    window.location.href = safariUrl;

    setTimeout(() => {
      window.location.href = currentUrl;
    }, 2000);

    return true;
  }

  return false;
};

export const cleanSocialParameters = () => {
  const url = new URL(window.location.href);
  const paramsToRemove = [
    'fbclid',
    'gclid',
    'utm_source',
    'utm_medium',
    'utm_campaign',
    'utm_term',
    'utm_content',
    'ref',
    '_hsenc',
    '_hsmi',
    'mc_cid',
    'mc_eid',
  ];

  let hasChanges = false;
  paramsToRemove.forEach(param => {
    if (url.searchParams.has(param)) {
      url.searchParams.delete(param);
      hasChanges = true;
    }
  });

  if (hasChanges) {
    window.history.replaceState({}, '', url.toString());
  }
};
