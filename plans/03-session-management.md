# Phase 3: Session Management

## Objective
Implement session timers, badge updates, and floating timer widget.

## Tasks

- [ ] Implement `startSession(domain, minutes)` in background.js
- [ ] Implement `endSession(domain)` cleanup
- [ ] Add chrome.alarms for session expiry
- [ ] Update badge text with remaining time
- [ ] Create floating timer widget in content script
- [ ] Track daily usage accumulation

## Timer Logic

```javascript
// Start session
startSession(domain, minutes) {
  const now = Date.now();
  const endsAt = now + (minutes * 60 * 1000);
  
  // Store session
  activeSessions[domain] = { startedAt: now, durationMinutes: minutes, endsAt };
  
  // Set alarm
  chrome.alarms.create(`session-${domain}`, { when: endsAt });
  
  // Update badge
  updateBadge(domain);
}

// On alarm
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name.startsWith('session-')) {
    const domain = alarm.name.replace('session-', '');
    endSession(domain);
    blockSite(domain, 'session');
  }
});
```

## Badge Display
- Show remaining minutes: "12m"
- Warning color when < 2 min
- Update every 30 seconds

## Floating Widget
- Small, draggable timer in corner
- Shows MM:SS countdown
- Click to expand/collapse
- Persists across page navigation

## Acceptance Criteria
- Timer countdown is accurate
- Badge updates in real-time
- Widget visible on all pages of domain
- Session continues across tab switches
