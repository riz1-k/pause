/**
 * Pause - Background Service Worker
 * Handles navigation interception, timers, and storage persistence.
 */

// --- Constants & Defaults ---
const DEFAULT_SETTINGS = {
  sites: {},
  usage: {},
  activeSessions: {},
  settings: {
    pinEnabled: false,
    pinHash: null
  }
};

// --- Initialization ---
chrome.runtime.onInstalled.addListener(async () => {
  console.log('Pause extension installed.');
  const data = await chrome.storage.local.get();
  if (Object.keys(data).length === 0) {
    await chrome.storage.local.set(DEFAULT_SETTINGS);
  }
  setupMidnightReset();
});

// --- Storage Utils ---
async function getData() {
  return await chrome.storage.local.get();
}

async function setData(data) {
  return await chrome.storage.local.set(data);
}

// Returns the root domain for display, but site matching uses hostname check
function normalizeDomain(url) {
  try {
    const hostname = new URL(url).hostname;
    return hostname.replace(/^(www\.|m\.|mobile\.)/i, '');
  } catch (e) {
    return null;
  }
}

function findTargetSite(url, sites) {
  try {
    const hostname = new URL(url).hostname;
    const domain = Object.keys(sites).find(d =>
      hostname === d || hostname.endsWith('.' + d)
    );
    return domain;
  } catch (e) {
    return null;
  }
}

// --- Navigation Interception ---
chrome.webNavigation.onBeforeNavigate.addListener(async (details) => {
  if (details.frameId !== 0) return; // Only top-level navigation

  const data = await getData();
  const domain = findTargetSite(details.url, data.sites);
  if (!domain) return;

  const activeSession = data.activeSessions[domain];
  const now = Date.now();

  if (activeSession && activeSession.endsAt > now) {
    return; // Allow navigation
  }

  // Check if daily limit reached
  const today = new Date().toISOString().split('T')[0];
  const usageToday = (data.usage[today] && data.usage[today][domain]) || 0;
  const limit = data.sites[domain].dailyLimitMinutes;

  if (usageToday >= limit) {
    chrome.tabs.update(details.tabId, { url: chrome.runtime.getURL(`blocked.html?domain=${domain}&reason=daily`) });
    return;
  }
});

// --- Alarms & Timers ---
let usageUpdateInterval = null;

function startUsageTracker() {
  if (usageUpdateInterval) return;

  usageUpdateInterval = setInterval(async () => {
    const data = await getData();
    const now = Date.now();
    const today = new Date().toISOString().split('T')[0];
    let changed = false;

    if (!data.usage[today]) {
      data.usage[today] = {};
      changed = true;
    }

    for (const domain in data.activeSessions) {
      const session = data.activeSessions[domain];
      if (session.endsAt > now) {
        const elapsedMins = Math.floor((now - session.startedAt) / 60000);
        const previouslyRecorded = session.recordedElapsedMins || 0;
        const diff = elapsedMins - previouslyRecorded;

        if (diff > 0) {
          data.usage[today][domain] = (data.usage[today][domain] || 0) + diff;
          session.recordedElapsedMins = elapsedMins;
          changed = true;
          console.log(`Updated real-time usage for ${domain}: +${diff} min`);
        }
      }
    }

    if (changed) {
      await setData(data);
    }
  }, 10000); // Check every 10s for responsiveness
}

// Start tracker on load
startUsageTracker();

function setupMidnightReset() {
  chrome.alarms.create('midnight-reset', {
    when: getNextMidnight(),
    periodInMinutes: 1440 // 24 hours
  });
}

function getNextMidnight() {
  const now = new Date();
  const midnight = new Date(now);
  midnight.setHours(24, 0, 0, 0);
  return midnight.getTime();
}

chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name === 'midnight-reset') {
    const data = await getData();
    data.usage = {}; // Clear all usage
    await setData(data);
    console.log('Daily usage reset alarm fired.');
  } else if (alarm.name.startsWith('session-')) {
    const domain = alarm.name.replace('session-', '');
    console.log(`Session for ${domain} expired.`);

    const data = await getData();
    const session = data.activeSessions[domain];

    if (session) {
      const today = new Date().toISOString().split('T')[0];
      if (!data.usage[today]) data.usage[today] = {};

      // Calculate remaining minutes that weren't captured by the tracker
      const totalElapsedMins = Math.floor((Date.now() - session.startedAt) / 60000);
      const previouslyRecorded = session.recordedElapsedMins || 0;
      const remains = Math.max(0, session.durationMinutes - previouslyRecorded);

      data.usage[today][domain] = (data.usage[today][domain] || 0) + remains;
    }

    delete data.activeSessions[domain];
    await setData(data);

    // Clear badge
    chrome.action.setBadgeText({ text: '' });
    if (badgeIntervals[domain]) clearInterval(badgeIntervals[domain]);

    // Notify tabs
    const tabs = await chrome.tabs.query({});
    for (const tab of tabs) {
      if (findTargetSite(tab.url, data.sites) === domain) {
        chrome.tabs.update(tab.id, { url: chrome.runtime.getURL(`blocked.html?domain=${domain}&reason=session`) });
      }
    }
  }
});

// --- Message Handling ---
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'startSession') {
    startSession(request.domain, request.minutes);
    sendResponse({ success: true });
  }
  return true;
});

async function startSession(domain, minutes) {
  const now = Date.now();
  const endsAt = now + (minutes * 60 * 1000);

  const data = await getData();
  data.activeSessions[domain] = {
    startedAt: now,
    durationMinutes: minutes,
    endsAt: endsAt,
    recordedElapsedMins: 0
  };
  await setData(data);

  chrome.alarms.create(`session-${domain}`, { when: endsAt });
  startBadgeTimer(domain, endsAt);
}

// --- Badge Management ---
let badgeIntervals = {};

function startBadgeTimer(domain, endsAt) {
  if (badgeIntervals[domain]) clearInterval(badgeIntervals[domain]);

  const update = () => {
    const now = Date.now();
    const remainingMs = endsAt - now;

    if (remainingMs <= 0) {
      chrome.action.setBadgeText({ text: '' });
      clearInterval(badgeIntervals[domain]);
      return;
    }

    const mins = Math.ceil(remainingMs / 60000);
    chrome.action.setBadgeText({ text: `${mins}m` });
    chrome.action.setBadgeBackgroundColor({ color: mins <= 2 ? '#ef4444' : '#6366f1' });
  };

  update();
  badgeIntervals[domain] = setInterval(update, 30000);
}

// On startup, resume badge timers
chrome.runtime.onStartup.addListener(async () => {
  const data = await getData();
  const now = Date.now();
  for (const [domain, session] of Object.entries(data.activeSessions || {})) {
    if (session.endsAt > now) {
      console.log(`Resuming session for ${domain}.`);
      startBadgeTimer(domain, session.endsAt);
    } else {
      // Clean up expired sessions
      delete data.activeSessions[domain];
      await setData(data);
    }
  }
});
