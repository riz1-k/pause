# Phase 5: Settings Page

## Objective
Create the options page for managing target sites and configuration.

## Tasks

- [ ] Create `options.html` page layout
- [ ] Create `options.js` for logic
- [ ] Create `options.css` for styling
- [ ] Implement add/remove sites functionality
- [ ] Implement daily limit configuration
- [ ] Add strict mode toggle per site
- [ ] Optional: PIN protection for settings

## Settings UI Design

```
┌─────────────────────────────────────────────────┐
│  Pause Settings                    🔒 Set PIN   │
├─────────────────────────────────────────────────┤
│                                                 │
│  Managed Sites                                  │
│  ┌─────────────────────────────────────────┐   │
│  │ youtube.com    30 min/day  [Strict] ✗   │   │
│  │ reddit.com     20 min/day  [    ]   ✗   │   │
│  │ twitter.com    15 min/day  [Strict] ✗   │   │
│  └─────────────────────────────────────────┘   │
│                                                 │
│  Add New Site                                   │
│  ┌────────────────┐ ┌──────┐ ┌──────┐         │
│  │ example.com    │ │ 30   │ │ Add  │         │
│  └────────────────┘ └──────┘ └──────┘         │
│                      min/day                    │
│                                                 │
│  Today's Usage                                  │
│  ┌─────────────────────────────────────────┐   │
│  │ youtube.com   ████████░░  18/30 min     │   │
│  │ reddit.com    ██░░░░░░░░   4/20 min     │   │
│  └─────────────────────────────────────────┘   │
│                                                 │
└─────────────────────────────────────────────────┘
```

## PIN Protection (Optional)
- Requires PIN to access settings
- Stored as hash in storage
- Prevents impulsive limit changes

## Acceptance Criteria
- Can add new sites with limits
- Can remove existing sites
- Can toggle strict mode
- Usage stats display correctly
- Changes persist after browser restart
