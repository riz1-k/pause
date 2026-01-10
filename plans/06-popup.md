# Phase 6: Popup

## Objective
Create the extension popup for quick status view.

## Tasks

- [ ] Create `popup.html` page
- [ ] Create `popup.js` for logic
- [ ] Create `popup.css` for styling
- [ ] Show current session timer (if active)
- [ ] Show today's usage summary
- [ ] Add quick link to settings

## Popup Design

```
┌───────────────────────────┐
│  Pause                ⚙️  │
├───────────────────────────┤
│                           │
│  Current Session          │
│  youtube.com              │
│  ⏱️ 08:42 remaining       │
│  ████████░░░░ 12/15 min   │
│                           │
├───────────────────────────┤
│  Today's Usage            │
│                           │
│  youtube.com  18/30 min   │
│  reddit.com    4/20 min   │
│                           │
└───────────────────────────┘
```

## Popup Behavior
- Opens on extension icon click
- Shows "No active session" if none running
- Compact, scannable design
- Settings icon opens options page

## Acceptance Criteria
- Displays active session countdown
- Shows all configured sites with usage
- Settings link works
- Popup is responsive and fast
