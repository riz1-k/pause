# Phase 4: Block Page

## Objective
Create the block page shown when session expires or daily limit is reached.

## Tasks

- [ ] Create `blocked.html` page
- [ ] Create `blocked.js` for dynamic content
- [ ] Create `blocked.css` for styling
- [ ] Implement redirect logic in background.js
- [ ] Show appropriate message based on block reason
- [ ] Display remaining daily quota (if session block)

## Block Page Design

### Session Expired
```
┌─────────────────────────────────────────────────┐
│                                                 │
│              ⏰ Session Time Over               │
│                                                 │
│     Your 15-minute session on youtube.com       │
│              has ended.                         │
│                                                 │
│     Daily remaining: 15 minutes                 │
│                                                 │
│          ┌────────────────────┐                 │
│          │   Go Back Home     │                 │
│          └────────────────────┘                 │
│                                                 │
└─────────────────────────────────────────────────┘
```

### Daily Limit Reached
```
┌─────────────────────────────────────────────────┐
│                                                 │
│           🚫 Daily Limit Reached                │
│                                                 │
│     You've used all 30 minutes allocated        │
│         for youtube.com today.                  │
│                                                 │
│     Come back tomorrow!                         │
│                                                 │
│          ┌────────────────────┐                 │
│          │   Go Back Home     │                 │
│          └────────────────────┘                 │
│                                                 │
└─────────────────────────────────────────────────┘
```

## URL Parameters
Pass context via URL: `blocked.html?domain=youtube.com&reason=session`

## Acceptance Criteria
- Correct message shown for each block type
- User can navigate away from block page
- No bypass options on block page
