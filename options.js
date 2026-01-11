/**
 * Pause - Options Script
 * Handles site management and usage display.
 */

document.addEventListener('DOMContentLoaded', async () => {
  render();

  document.getElementById('add-site-btn').addEventListener('click', addSite);

  // Listen for background usage updates
  chrome.storage.onChanged.addListener((changes, area) => {
    if (area === 'local') {
      render();
    }
  });
});

async function getData() {
  return await chrome.storage.local.get();
}

async function setData(data) {
  return await chrome.storage.local.set(data);
}

function normalizeDomain(url) {
  try {
    // If it doesn't look like a URL, add protocol
    if (!url.includes('://')) url = 'https://' + url;
    const hostname = new URL(url).hostname;
    return hostname.replace(/^(www\.|m\.|mobile\.)/i, '');
  } catch (e) {
    return url.replace(/^(www\.|m\.|mobile\.)/i, '').toLowerCase();
  }
}

async function addSite() {
  const urlInput = document.getElementById('new-site-url');
  const limitInput = document.getElementById('new-site-limit');

  const domain = normalizeDomain(urlInput.value.trim());
  const limit = parseInt(limitInput.value);

  if (!domain || isNaN(limit) || limit <= 0) {
    alert('Please enter a valid domain and daily limit.');
    return;
  }

  const data = await getData();
  data.sites[domain] = {
    dailyLimitMinutes: limit,
    strictMode: true
  };
  await setData(data);

  urlInput.value = '';
  limitInput.value = '';
  render();
}

async function removeSite(domain) {
  const data = await getData();
  delete data.sites[domain];
  await setData(data);
  render();
}

async function render() {
  const data = await getData();
  const sitesList = document.getElementById('sites-list');
  const usageList = document.getElementById('usage-list');
  const today = new Date().toISOString().split('T')[0];

  // Render Managed Sites
  sitesList.innerHTML = '';
  const siteKeys = Object.keys(data.sites || {});

  if (siteKeys.length === 0) {
    sitesList.innerHTML = '<div class="empty-state">No sites configured yet.</div>';
  } else {
    siteKeys.forEach(domain => {
      const site = data.sites[domain];
      const item = document.createElement('div');
      item.className = 'site-item';
      item.innerHTML = `
        <div class="site-info">
          <span class="site-domain">${domain}</span>
          <span class="site-limit">${site.dailyLimitMinutes} min/day</span>
        </div>
        <div class="site-actions">
          <button class="btn-delete" data-domain="${domain}">✕</button>
        </div>
      `;
      sitesList.appendChild(item);
    });

    // Add delete listeners
    document.querySelectorAll('.btn-delete').forEach(btn => {
      btn.addEventListener('click', () => removeSite(btn.dataset.domain));
    });
  }

  // Render Usage
  usageList.innerHTML = '';
  const usageToday = data.usage[today] || {};

  if (siteKeys.length === 0) {
    usageList.innerHTML = '<div class="empty-state">Add sites to track usage.</div>';
  } else {
    siteKeys.forEach(domain => {
      const used = usageToday[domain] || 0;
      const limit = data.sites[domain].dailyLimitMinutes;
      const percent = Math.min(100, (used / limit) * 100);

      const item = document.createElement('div');
      item.className = 'usage-item';
      item.innerHTML = `
        <div class="usage-header">
          <span>${domain}</span>
          <span>${used} / ${limit} min</span>
        </div>
        <div class="progress-bar">
          <div class="progress-fill ${percent >= 90 ? 'danger' : ''}" style="width: ${percent}%"></div>
        </div>
      `;
      usageList.appendChild(item);
    });
  }
}
