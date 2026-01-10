# Phase 2: Intent Modal

## Objective
Create the pre-visit intent prompt that intercepts navigation and asks users to commit to a session duration.

## Tasks

- [ ] Create `content.js` for modal injection
- [ ] Create `content.css` for modal styling
- [ ] Implement navigation interception in background.js
- [ ] Add message passing between background and content scripts
- [ ] Implement modal UI with duration options

## Modal Design

```
┌─────────────────────────────────────────────────┐
│                                                 │
│         Do you really want to visit             │
│              youtube.com?                       │
│                                                 │
│    How many minutes do you want to spend?       │
│                                                 │
│    ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐             │
│    │  5  │ │ 10  │ │ 15  │ │ 30  │             │
│    └─────┘ └─────┘ └─────┘ └─────┘             │
│                                                 │
│    Custom: [____] minutes                       │
│                                                 │
│    You will be blocked at: 10:25 PM             │
│                                                 │
│    ┌──────────┐        ┌──────────┐            │
│    │  Cancel  │        │ Proceed  │            │
│    └──────────┘        └──────────┘            │
│                                                 │
└─────────────────────────────────────────────────┘
```

## Content Script Flow

1. Background intercepts navigation to target site
2. Background injects content script
3. Content script shows full-page modal overlay
4. User selects duration and clicks Proceed/Cancel
5. Content script sends choice to background
6. Background starts session or navigates away

## Acceptance Criteria
- Modal appears before site content loads
- All duration options work (preset + custom)
- Cancel navigates back
- Proceed starts session and shows site
