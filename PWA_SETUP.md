# PWA Setup Instructions

This document contains instructions for completing the PWA setup.

## Required Icons

To complete the PWA setup, you need to add the following icon files to the `/public` directory:

### Required Icon Files:
1. `icon-192.png` - 192x192 pixels PNG icon
2. `icon-512.png` - 512x512 pixels PNG icon
3. `screenshot.png` - 1170x2532 pixels PNG screenshot (optional but recommended)

### Icon Requirements:
- **Format**: PNG with transparency
- **Style**: Should match your brand colors (teal/cyan primary color)
- **Content**: Should be a simple, recognizable icon representing your movie app
- **Background**: Can be transparent or use the app's background color (#0f1419)

### How to Generate Icons:
You can use online tools like:
- https://realfavicongenerator.net/
- https://www.pwabuilder.com/imageGenerator
- Or design custom icons using tools like Figma, Canva, or Photoshop

## Features Implemented

### 1. Browser Detection & Redirect
- Automatically detects in-app browsers (Facebook, Instagram, TikTok, Telegram, etc.)
- Detects OS (Android/iOS)
- Attempts automatic redirect to Chrome (Android) or Safari (iOS) using deep links
- Shows a beautiful fallback popup if automatic redirect fails
- Only activates for in-app browsers, not main browsers

### 2. URL Cleaning
- Automatically removes social media tracking parameters from URLs:
  - fbclid
  - gclid
  - utm_* parameters
  - And other tracking parameters
- Happens silently in the background on page load

### 3. PWA Install Prompt
- Beautiful, modern installation prompt
- Appears 15 seconds after the user visits the site
- Persists across page refreshes until user installs or dismisses
- Tracks installation state to avoid showing again after installation
- Special instructions for iOS users with step-by-step guide
- Includes benefits showcase (Lightning Fast, Home Screen Access)
- Gradient design with animations

### 4. Service Worker
- Caches essential assets for offline functionality
- Provides fast loading on repeat visits
- Automatically updates when new versions are deployed

## Testing the Features

### Test Browser Detection:
1. Open the site in Facebook's in-app browser on mobile
2. Should see automatic redirect attempt or popup

### Test PWA Installation:
1. Open the site in Chrome (Android) or Safari (iOS)
2. Wait 15 seconds
3. PWA install prompt should appear
4. After installation, prompt should not appear again

### Test URL Cleaning:
1. Visit the site with URL like: `https://yoursite.com/?fbclid=123&utm_source=facebook`
2. URL should automatically clean to: `https://yoursite.com/`

## Browser Support

The PWA features are supported on:
- Chrome/Edge (Android & Desktop) - Full support
- Safari (iOS 11.3+) - Manual installation with instructions
- Firefox (Android) - Full support
- Samsung Internet - Full support
- Opera - Full support

## Manifest Configuration

The PWA manifest is configured in `/public/manifest.json` with:
- App name: Muvietz
- Theme color: #16b8ac (teal)
- Background color: #0f1419 (dark)
- Display mode: standalone
- Orientation: portrait
- Shortcuts for quick actions

## Future Enhancements

Consider adding:
- Push notifications for new movie releases
- Offline movie watching (with proper licensing)
- Background sync for purchases
- Share target for sharing movies
