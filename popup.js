function renderPins(pins) {
  const container = document.getElementById('pins-list');
  container.innerHTML = '';
  if (!pins || pins.length === 0) {
    container.innerText = 'No pins yet.';
    return;
  }
  pins.forEach((p, idx) => {
    const el = document.createElement('div');
    el.className = 'pin';
    const meta = document.createElement('div');
    meta.className = 'meta';
    meta.innerText = `${p.name || '(unnamed pin)'} — ${new URL(p.url).hostname}`;
    const controls = document.createElement('div');
    const go = document.createElement('button');
    go.innerText = 'Go';
    go.onclick = () => jumpToPin(p);
    const del = document.createElement('button');
    del.innerText = 'Delete';
    del.onclick = () => deletePin(idx);
    controls.appendChild(go);
    controls.appendChild(del);
    el.appendChild(meta);
    el.appendChild(controls);
    container.appendChild(el);
  });
}

function loadPins() {
  chrome.storage.local.get({ pins: [] }, (res) => {
    renderPins(res.pins);
  });
}

function jumpToPin(pin) {
  // Find a matching tab for the pin.url (open tab) or open a new tab
  chrome.tabs.query({ url: pin.url }, (tabs) => {
    if (tabs && tabs.length > 0) {
      const tab = tabs[0];
      chrome.tabs.update(tab.id, { active: true });
      // send message to content script in that tab
      chrome.tabs.sendMessage(tab.id, { type: 'jump-to', pin }, (resp) => {
        if (chrome.runtime.lastError) {
          // maybe content script not injected; try to inject
          chrome.scripting.executeScript({
            target: { tabId: tab.id },
            files: ['content_script.js']
          }, () => {
            chrome.tabs.sendMessage(tab.id, { type: 'jump-to', pin });
          });
        }
      });
    } else {
      // open the URL in new tab
      chrome.tabs.create({ url: pin.url }, (tab) => {
        // inject content script after tab loads
        chrome.tabs.onUpdated.addListener(function listener(tabId, changeInfo) {
          if (tabId === tab.id && changeInfo.status === 'complete') {
            chrome.scripting.executeScript({ target: { tabId: tab.id }, files: ['content_script.js'] }, () => {
              chrome.tabs.sendMessage(tab.id, { type: 'jump-to', pin });
            });
            chrome.tabs.onUpdated.removeListener(listener);
          }
        });
      });
    }
  });
}

function deletePin(idx) {
  chrome.storage.local.get({ pins: [] }, (res) => {
    const pins = res.pins || [];
    pins.splice(idx, 1);
    chrome.storage.local.set({ pins }, loadPins);
  });
}

document.getElementById('start-select').addEventListener('click', () => {
  // request the active tab to start selection
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const tab = tabs[0];
    chrome.runtime.sendMessage({ type: 'open-selector', tabId: tab.id }, (res) => {
      // no action needed
    });
  });
});

// Listen for updates
chrome.runtime.onMessage.addListener((msg) => {
  if (msg?.type === 'pins-updated') loadPins();
});

loadPins();


chrome.tabs.sendMessage(tab.id, { type: 'start-select' }, (res) => {
  if (chrome.runtime.lastError) {
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ['content_script.js']
    }, () => {
      chrome.tabs.sendMessage(tab.id, { type: 'start-select' });
    });
  }
});
