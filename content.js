/**
 * Pause - Content Script
 * Manages the intent modal overlay.
 */

(async function() {
  const data = await chrome.storage.local.get();
  if (!data.sites) return;

  const hostname = window.location.hostname;
  const domain = Object.keys(data.sites).find(d =>
    hostname === d || hostname.endsWith('.' + d)
  );

  if (!domain) return;

  // Check if there's already an active session
  const activeSession = data.activeSessions[domain];
  const now = Date.now();
  if (activeSession && activeSession.endsAt > now) {
    // Session is active, show only the floating timer widget
    showTimerWidget(activeSession.endsAt);
    return;
  }

  // No active session -> Block content and show modal
  injectModal(domain);
})();

function normalizeDomain(url) {
  try {
    const hostname = new URL(url).hostname;
    return hostname.replace(/^(www\.|m\.|mobile\.)/i, '');
  } catch (e) {
    return null;
  }
}

function injectModal(domain) {
  // Prevent duplicate modals
  if (document.getElementById('pause-modal-overlay')) return;

  // Stop site content from loading/interfering
  const style = document.createElement('style');
  style.id = 'pause-hide-content';
  style.innerHTML = 'html, body { overflow: hidden !important; }';
  document.head.appendChild(style);

  const overlay = document.createElement('div');
  overlay.id = 'pause-modal-overlay';

  overlay.innerHTML = `
    <div id="pause-modal-content">
      <h1>Pause and Reflect</h1>
      <p>Do you really want to visit <strong>${domain}</strong> right now?</p>

      <div class="pause-options-grid">
        <button class="pause-btn-option" data-mins="5">5 Min</button>
        <button class="pause-btn-option" data-mins="10">10 Min</button>
        <button class="pause-btn-option" data-mins="15">15 Min</button>
        <button class="pause-btn-option" data-mins="30">30 Min</button>
      </div>

      <input type="number" class="pause-custom-input" placeholder="Custom minutes..." min="1" max="1440">

      <div class="pause-actions">
        <button class="pause-btn-secondary" id="pause-cancel">Cancel</button>
        <button class="pause-btn-primary" id="pause-proceed">Proceed</button>
      </div>

      <div class="pause-preview-text" id="pause-preview">Select a duration to start</div>
    </div>
  `;

  document.documentElement.appendChild(overlay);

  // Event Listeners
  let selectedMinutes = 0;

  const options = overlay.querySelectorAll('.pause-btn-option');
  const customInput = overlay.querySelector('.pause-custom-input');
  const preview = overlay.querySelector('#pause-preview');

  function updatePreview(mins) {
    if (!mins || mins <= 0) {
      preview.innerText = 'Select a duration to start';
      return;
    }
    const end = new Date(Date.now() + mins * 60000);
    const timeStr = end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    preview.innerText = `You will be blocked at ${timeStr}`;
  }

  options.forEach(btn => {
    btn.addEventListener('click', () => {
      options.forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      customInput.value = '';
      selectedMinutes = parseInt(btn.dataset.mins);
      updatePreview(selectedMinutes);
    });
  });

  customInput.addEventListener('input', () => {
    options.forEach(b => b.classList.remove('selected'));
    selectedMinutes = parseInt(customInput.value);
    updatePreview(selectedMinutes);
  });

  overlay.querySelector('#pause-cancel').addEventListener('click', () => {
    window.history.back();
    setTimeout(() => {
      // If back didn't work (e.g. new tab), close tab or go to google
      if (document.getElementById('pause-modal-overlay')) {
        window.location.href = 'https://www.google.com';
      }
    }, 500);
  });

  overlay.querySelector('#pause-proceed').addEventListener('click', async () => {
    if (!selectedMinutes || selectedMinutes <= 0) {
      alert('Please select or enter a duration.');
      return;
    }

    // Call background to start session
    chrome.runtime.sendMessage({
      action: 'startSession',
      domain: domain,
      minutes: selectedMinutes
    }, (response) => {
      if (response && response.success) {
        // Remove overlay and hide style
        overlay.style.opacity = '0';
        setTimeout(() => {
          overlay.remove();
          document.getElementById('pause-hide-content')?.remove();
        }, 300);
      }
    });
  });
}

function showTimerWidget(endsAt) {
  if (document.getElementById('pause-timer-widget')) return;

  const widget = document.createElement('div');
  widget.id = 'pause-timer-widget';
  widget.innerHTML = `<div class="dot"></div><span id="pause-timer-display">--:--</span>`;
  document.documentElement.appendChild(widget);

  const display = widget.querySelector('#pause-timer-display');

  const update = () => {
    const now = Date.now();
    const diif = endsAt - now;

    if (diif <= 0) {
      display.innerText = '00:00';
      clearInterval(interval);
      return;
    }

    const mins = Math.floor(diif / 60000);
    const secs = Math.floor((diif % 60000) / 1000);
    display.innerText = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;

    if (mins < 2) {
      widget.classList.add('warning');
    }
  };

  update();
  const interval = setInterval(update, 1000);

  // Basic Drag Functionality
  let isDragging = false;
  let offsetX, offsetY;

  widget.addEventListener('mousedown', (e) => {
    isDragging = true;
    offsetX = e.clientX - widget.getBoundingClientRect().left;
    offsetY = e.clientY - widget.getBoundingClientRect().top;
    widget.style.transition = 'none';
  });

  document.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    widget.style.left = `${e.clientX - offsetX}px`;
    widget.style.top = `${e.clientY - offsetY}px`;
    widget.style.bottom = 'auto';
    widget.style.right = 'auto';
  });

  document.addEventListener('mouseup', () => {
    isDragging = false;
    widget.style.transition = 'transform 0.2s, background 0.2s';
  });
}
