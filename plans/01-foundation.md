# Phase 1: Foundation

## Objective
Set up the Chrome extension skeleton with Manifest V3, background service worker, and storage utilities.

## Tasks

- [ ] Create `manifest.json` with required permissions
- [ ] Create `background.js` service worker skeleton
- [ ] Implement storage utilities (get/set sites, usage, sessions)
- [ ] Implement domain normalization (www., m., subdomains)
- [ ] Set up midnight reset alarm
- [ ] Create placeholder icon files

## Files to Create

### manifest.json
```json
{
  "manifest_version": 3,
  "name": "Pause - Intentional Browsing",
  "version": "1.0.0",
  "permissions": ["storage", "alarms", "tabs", "webNavigation", "scripting"],
  "background": { "service_worker": "background.js" },
  "action": { "default_popup": "popup.html" },
  "options_page": "options.html"
}
```

### background.js
Key functions:
- `normalizeDomain(url)` - Extract root domain
- `isTargetSite(url)` - Check if URL is configured
- `getStorageData()` / `setStorageData()` - Storage helpers
- `setupMidnightReset()` - Daily usage reset alarm

## Acceptance Criteria
- Extension loads without errors in `chrome://extensions`
- Storage operations work correctly
- Midnight reset alarm fires correctly
