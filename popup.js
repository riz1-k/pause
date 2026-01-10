/**
 * Pause - Popup Script
 */

document.addEventListener('DOMContentLoaded', async () => {
  render();

  document.getElementById('open-settings').addEventListener('click', () => {
    chrome.runtime.openOptionsPage();
  });
});

async function render() {
  const data = await chrome.storage.local.get();
  const sessionCard = document.getElementById('active-session');
  const noSession = document.getElementById('no-session');
  const usageSummary = document.getElementById('usage-summary');

  const today = new Date().toISOString().split('T')[0];
  const activeSessions = data.activeSessions || {};
  const usageToday = data.usage[today] || {};

  const activeDomain = Object.keys(activeSessions)[0];

  if (activeDomain) {
    const session = activeSessions[activeDomain];
    const now = Date.now();
    if (session.endsAt > now) {
      sessionCard.classList.remove('hidden');
      noSession.classList.add('hidden');

      document.getElementById('session-domain').innerText = activeDomain;

      const updateTimer = () => {
        const remainingMs = session.endsAt - Date.now();
        if (remainingMs <= 0) {
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
      setInterval(updateTimer, 1000);
    } else {
      sessionCard.classList.add('hidden');
      noSession.classList.remove('hidden');
    }
  } else {
    sessionCard.classList.add('hidden');
    noSession.classList.remove('hidden');
  }

  // Render Usage Summary
  usageSummary.innerHTML = '';
  const siteKeys = Object.keys(data.sites || {});

  if (siteKeys.length === 0) {
    usageSummary.innerHTML = '<div class="empty-state"><p>No sites configured</p></div>';
  } else {
    siteKeys.forEach(domain => {
      const used = usageToday[domain] || 0;
      const limit = data.sites[domain].dailyLimitMinutes;

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
