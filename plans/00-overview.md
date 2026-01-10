# Intentional Time-Limited Chrome Extension

## Overview

A Chrome extension that enforces intentional website usage by requiring users to explicitly decide *whether* to visit a site and *how long* to spend per session, with daily time caps.

## Project Structure

```
pause/
├── manifest.json          # Manifest V3 configuration
├── background.js          # Service worker
├── content.js             # Intent modal injection
├── content.css            # Modal styling
├── blocked.html           # Block page
├── blocked.js             # Block page logic
├── options.html           # Settings page
├── options.js             # Settings logic
├── options.css            # Settings styling
├── popup.html             # Quick status popup
├── popup.js               # Popup logic
├── popup.css              # Popup styling
└── icons/                 # Extension icons
```

## Phases

1. **Phase 1: Foundation** - Manifest, background worker, storage
2. **Phase 2: Intent Modal** - Content script and modal UI
3. **Phase 3: Session Management** - Timers, badge, floating widget
4. **Phase 4: Block Page** - Session/daily limit enforcement
5. **Phase 5: Settings Page** - Site configuration UI
6. **Phase 6: Popup** - Quick status view
7. **Phase 7: Edge Cases** - Subdomains, incognito, persistence

## Data Model

```javascript
{
  "sites": {
    "youtube.com": {
      "dailyLimitMinutes": 30,
      "strictMode": true
    }
  },
  "usage": {
    "2026-01-11": {
      "youtube.com": { "usedMinutes": 12, "sessions": 2 }
    }
  },
  "activeSessions": {
    "youtube.com": {
      "startedAt": 1736617953000,
      "durationMinutes": 15,
      "endsAt": 1736618853000
    }
  }
}
```
