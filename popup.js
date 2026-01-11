/**
 * Pause - Popup Script
 */

let timerInterval = null;

document.addEventListener('DOMContentLoaded', async () => {
  render();

  document.getElementById('open-settings').addEventListener('click', () => {
    chrome.runtime.openOptionsPage();
  });

  // Listen for background usage updates
  chrome.storage.onChanged.addListener((changes, area) => {
    if (area === 'local') {
      render();
    }
  });
});

async function render() {
  const data = await chrome.storage.local.get();
  const today = new Date().toISOString().split('T')[0];
  const usageToday = data.usage[today] || {};
  const activeSessions = data.activeSessions || {};

  renderSession(activeSessions);
  renderUsage(data.sites, usageToday);
}

function renderSession(activeSessions) {
  const sessionCard = document.getElementById('active-session');
  const noSession = document.getElementById('no-session');
  const activeDomain = Object.keys(activeSessions)[0];

  if (activeDomain) {
    const session = activeSessions[activeDomain];
    const now = Date.now();
    if (session.endsAt > now) {
      sessionCard.classList.remove('hidden');
      noSession.classList.add('hidden');
      document.getElementById('session-domain').innerText = activeDomain;

      // Start/reset timer interval
      if (timerInterval) clearInterval(timerInterval);

      const updateTimer = () => {
        const remainingMs = session.endsAt - Date.now();
        if (remainingMs <= 0) {
          clearInterval(timerInterval);
          render();
          return;
        }

        const mins = Math.floor(remainingMs / 60000);
        const secs = Math.floor((remainingMs % 60000) / 1000);
        document.getElementById('session-timer').innerText =
          `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;

        const totalMs = session.durationMinutes * 60000;
        const progress = Math.max(0, Math.min(100, (1 - remainingMs / totalMs) * 100));
        document.getElementById('session-progress').style.width = `${progress}%`;
      };

      updateTimer();
      timerInterval = setInterval(updateTimer, 1000);
    } else {
      showNoSession();
    }
  } else {
    showNoSession();
  }
}

function showNoSession() {
  document.getElementById('active-session').classList.add('hidden');
  document.getElementById('no-session').classList.remove('hidden');
  if (timerInterval) clearInterval(timerInterval);
}

function renderUsage(sites, usageToday) {
  const usageSummary = document.getElementById('usage-summary');
  usageSummary.innerHTML = '';
  const siteKeys = Object.keys(sites || {});

  if (siteKeys.length === 0) {
    usageSummary.innerHTML = '<div class="empty-state"><p>No sites configured</p></div>';
  } else {
    siteKeys.forEach(domain => {
      const used = usageToday[domain] || 0;
      const limit = sites[domain].dailyLimitMinutes;

      const item = document.createElement('div');
      item.className = 'usage-mini-item';
      item.innerHTML = `
        <span class="usage-mini-domain">${domain}</span>
        <span class="usage-mini-time">${used} / ${limit} min</span>
      `;
      usageSummary.appendChild(item);
    });
  }
}
