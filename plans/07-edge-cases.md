# Phase 7: Edge Cases & Polish

## Objective
Handle edge cases and ensure robust behavior across all scenarios.

## Tasks

- [ ] Handle subdomains (www., m., etc.)
- [ ] Handle multiple tabs of same site
- [ ] Handle browser restart with active session
- [ ] Handle incognito mode
- [ ] Add extension install/update handlers
- [ ] Final polish and testing

## Edge Cases

### Subdomains
```javascript
function normalizeDomain(url) {
  const hostname = new URL(url).hostname;
  // Remove www., m., mobile., etc.
  return hostname.replace(/^(www\.|m\.|mobile\.)/i, '');
}
```

### Multiple Tabs
- Single session timer shared across all tabs of same domain
- Track tab IDs with active sessions
- When session ends, block ALL tabs of that domain

### Browser Restart
- On startup, check for active sessions
- Recalculate remaining time from `endsAt` timestamp
- If session already expired, don't show modal
- If session still valid, continue countdown

### Incognito Mode
- By default, extensions disabled in incognito
- If user enables extension in incognito:
  - Show warning that data isn't shared with normal mode
  - OR: Block target sites entirely in incognito (strict policy)

### Tab Focus Tracking
- Timer runs regardless of tab focus
- Badge shows time for most recently focused target tab
- Multiple target sites = show active session domain

## Testing Checklist

- [ ] youtube.com, www.youtube.com, m.youtube.com all treated same
- [ ] Open 3 tabs of youtube, timer shared correctly
- [ ] Close browser mid-session, reopen, timer continues
- [ ] Try incognito - appropriate behavior
- [ ] Set 1 min session, verify block works
- [ ] Set 30 min daily, use 30 min in sessions, verify daily block

## Acceptance Criteria
- All edge cases handled gracefully
- No crashes or console errors
- Smooth user experience
