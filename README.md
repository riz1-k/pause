# ⏸️ Pause - Intentional Browsing

**Pause** is a Chrome extension designed to help you reclaim your focus and build a healthier relationship with the web. It enforces **intentionality** by requiring you to explicitly decide *whether* you want to visit a site and *how long* you want to spend there.

![Pause Icon](icons/icon128.png)

## ✨ Features

- **Pre-Visit Intent Prompt:** Every time you visit a configured site, a minimalist overlay asks if you're sure and how much time you need.
- **Session Timers:** Once you commit, a live countdown widget keeps you aware of your remaining time.
- **Daily Time Caps:** Set a hard daily limit per site. Once reached, the site is blocked until midnight.
- **Subdomain Support:** Works across `music.youtube.com`, `m.youtube.com`, and `www.youtube.com` automatically.
- **Shadcn-inspired UI:** A clean, modern, and minimal aesthetic that stays out of your way.
- **Badge Indicators:** Real-time remaining time shown directly on the extension icon.

## 🚀 Getting Started

### Installation

1.  Clone this repository or download the source code.
2.  Open **Google Chrome** and go to `chrome://extensions/`.
3.  Turn on **Developer mode** in the top right corner.
4.  Click the **Load unpacked** button.
5.  Select the `pause` folder where you downloaded the source.

### Setup

1.  Click the extension icon in your toolbar.
2.  Navigate to **Settings** (⚙️ icon).
3.  Add the domains you want to manage (e.g., `youtube.com`, `reddit.com`).
4.  Set your daily limit (e.g., 30 minutes).

## 🛠️ Technology Stack

- **Manifest V3:** Built on the latest Chrome Extension architecture for performance and security.
- **Vanilla JS & CSS:** Zero dependencies for a lightweight and fast experience.
- **Shadcn/Zinc Design:** Minimalist UI components inspired by modern design systems.
- **Chrome Alarms & Storage:** Ensures timers and settings persist across browser restarts.

## 🧘 Behavioral Design

Unlike traditional site blockers, **Pause** doesn't just cut you off. It introduces **intentional friction**. By forcing an explicit choice before every session, it helps break the cycle of impulsive browsing and encourages conscious usage.

---

*Built with focus in mind.*
