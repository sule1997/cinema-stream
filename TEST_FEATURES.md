# Testing the New Features

## How to Test Browser Detection

Since you need actual in-app browsers to test this feature, here are several methods:

### Method 1: Using DevTools User Agent Switcher
1. Open Chrome DevTools (F12)
2. Click the three dots menu → More tools → Network conditions
3. Uncheck "Use browser default" under User agent
4. Enter one of these user agents:

**Facebook Android:**
```
Mozilla/5.0 (Linux; Android 11; SM-G991B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.120 Mobile Safari/537.36 [FBAN/FB4A;FBAV/325.0.0.38.120;]
```

**Instagram Android:**
```
Mozilla/5.0 (Linux; Android 11; SM-G991B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.120 Mobile Safari/537.36 Instagram 195.0.0.31.123
```

**TikTok Android:**
```
Mozilla/5.0 (Linux; Android 11; SM-G991B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.120 Mobile Safari/537.36 musical_ly_2021304040
```

### Method 2: Real Device Testing
1. Post a link to your site on Facebook/Instagram
2. Click the link from within the app (don't open in external browser)
3. The redirect popup should appear

### Method 3: Using ngrok or Similar Tools
1. Use ngrok to expose your local dev server
2. Share the ngrok URL on social media
3. Click the link from a mobile device

## How to Test PWA Installation

### On Android (Chrome/Edge):
1. Open the site in Chrome
2. Wait 15 seconds
3. The PWA install prompt should appear
4. Click "Install Now"
5. App should install and appear in app drawer
6. Re-open the site - prompt should NOT appear again

### On iOS (Safari):
1. Open the site in Safari
2. Wait 15 seconds
3. Instructions popup should appear
4. Follow the instructions to add to home screen
5. Once installed, the prompt should not appear again

### Testing PWA Features:
1. Install the app
2. Go to Settings → Apps (Android) or Home Screen (iOS)
3. You should see "Muvietz" icon
4. Open the app - should open like a native app (no browser UI)
5. Try going offline - app should still load cached pages

## How to Test URL Cleaning

### Test with Social Parameters:
1. Open: `http://localhost:8080/?fbclid=test123&utm_source=facebook&utm_campaign=test`
2. Check the address bar - parameters should be removed automatically
3. Final URL should be: `http://localhost:8080/`

### Parameters that get removed:
- `fbclid` (Facebook click ID)
- `gclid` (Google click ID)
- `utm_source`, `utm_medium`, `utm_campaign`, `utm_term`, `utm_content`
- `ref`, `_hsenc`, `_hsmi`, `mc_cid`, `mc_eid`

## Expected Behavior

### Browser Detection:
✅ Detects in-app browsers (Facebook, Instagram, TikTok, etc.)
✅ Shows popup with "Open in Chrome/Safari" button
✅ Attempts automatic redirect using intent links
✅ Does NOT show for regular browsers (Chrome, Firefox, Safari)

### PWA Installation:
✅ Shows after 15 seconds
✅ Beautiful gradient design with animations
✅ Lists benefits (Fast, Home Screen Access)
✅ Persists across page navigation
✅ Disappears after installation
✅ Special iOS instructions with step-by-step guide

### URL Cleaning:
✅ Automatically removes tracking parameters
✅ Happens silently on page load
✅ Updates browser history (doesn't add new entry)
✅ Works with query strings and hash fragments

## Troubleshooting

### PWA Prompt Not Showing?
- Check if you're in private/incognito mode (won't work)
- Check localStorage - clear `pwa-prompt-seen` if needed
- Check if already installed (display-mode: standalone)
- Wait the full 15 seconds

### Browser Redirect Not Working?
- Check user agent string in DevTools
- Verify you're using a mobile device viewport
- Check if you're on localhost (intent links may not work)
- Try on a real device with ngrok

### URL Parameters Not Cleaning?
- Check browser console for errors
- Verify URLCleaner component is mounted
- Test with actual tracking parameters
- Check if navigation is working

## Developer Tools

### Check if PWA is Installable:
1. Open DevTools → Application tab
2. Look at "Manifest" section
3. Should show no errors
4. Check "Service Workers" - should be registered

### Check Browser Detection:
Open DevTools console and run:
```javascript
console.log(navigator.userAgent);
```

### Check PWA Installation State:
Open DevTools console and run:
```javascript
console.log('Display mode:', window.matchMedia('(display-mode: standalone)').matches);
console.log('iOS standalone:', window.navigator.standalone);
```

### Check Local Storage:
Open DevTools → Application → Local Storage:
- `pwa-prompt-seen` - set to 'true' after user dismisses
- `pwa-installed` - set to 'true' after installation

## Production Testing

Before deploying to production:
1. ✅ Test on real Android device (Facebook, Instagram apps)
2. ✅ Test on real iOS device (Safari, in-app browsers)
3. ✅ Verify PWA installs correctly
4. ✅ Test with actual social media links
5. ✅ Test offline functionality
6. ✅ Check lighthouse PWA score (should be 90+)
