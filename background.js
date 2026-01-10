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

function normalizeDomain(url) {
  try {
    const hostname = new URL(url).hostname;
    return hostname.replace(/^(www\.|m\.|mobile\.)/i, '');
  } catch (e) {
    return null;
  }
}

// --- Navigation Interception ---
chrome.webNavigation.onBeforeNavigate.addListener(async (details) => {
  if (details.frameId !== 0) return; // Only top-level navigation

  const domain = normalizeDomain(details.url);
  if (!domain) return;

  const data = await getData();
  if (data.sites[domain]) {
    // Check if there's an active session
    const activeSession = data.activeSessions[domain];
    const now = Date.now();

    if (activeSession && activeSession.endsAt > now) {
      console.log(`Active session found for ${domain}. Remaining: ${Math.round((activeSession.endsAt - now) / 1000)}s`);
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

    // No active session and within limits -> Intercept and show intent modal
    // We'll handle this by letting the content script take over or redirecting to a modal page
    // For now, let's keep it simple: content script will handle the overlay if it sees a target site without session
  }
});

// --- Alarms & Timers ---
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
    const today = new Date().toISOString().split('T')[0];
    if (!data.usage[today]) {
      data.usage[today] = {};
    }
    await setData(data);
    console.log('Daily usage reset alarm fired.');
  } else if (alarm.name.startsWith('session-')) {
    const domain = alarm.name.replace('session-', '');
    console.log(`Session for ${domain} expired.`);
    // Handle session end
    const data = await getData();
    delete data.activeSessions[domain];
    await setData(data);

    // Notify tabs
    const tabs = await chrome.tabs.query({});
    for (const tab of tabs) {
      if (normalizeDomain(tab.url) === domain) {
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
    endsAt: endsAt
  };
  await setData(data);

  chrome.alarms.create(`session-${domain}`, { when: endsAt });
  updateBadge(domain);
}

function updateBadge(domain) {
  // Logic to update badge text every minute
}
