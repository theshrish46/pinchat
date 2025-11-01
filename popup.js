// popup.js — Pinchat
console.log("📌 Pinchat popup loaded");

// --- Render all saved pins ---
function renderPins(pins = []) {
  const container = document.getElementById("pins-list");
  container.innerHTML = "";

  if (pins.length === 0) {
    container.innerText = "No pins yet.";
    return;
  }

  pins.forEach((pin, idx) => {
    const el = document.createElement("div");
    el.className = "pin";

    // Meta info (pin name + site)
    const meta = document.createElement("div");
    meta.className = "meta";
    meta.innerText = `${pin.name || "(unnamed pin)"} — ${
      new URL(pin.url).hostname
    }`;

    // Controls (Go, Delete)
    const controls = document.createElement("div");
    const go = document.createElement("button");
    go.innerText = "Go";
    go.onclick = () => jumpToPin(pin);

    const del = document.createElement("button");
    del.innerText = "Delete";
    del.onclick = () => deletePin(idx);

    controls.append(go, del);
    el.append(meta, controls);
    container.appendChild(el);
  });
}

// --- Load pins from storage ---
function loadPins() {
  chrome.storage.local.get({ pins: [] }, (res) => renderPins(res.pins));
}

// --- Delete pin by index ---
function deletePin(idx) {
  chrome.storage.local.get({ pins: [] }, (res) => {
    const pins = res.pins || [];
    pins.splice(idx, 1);
    chrome.storage.local.set({ pins }, loadPins);
  });
}

// --- Jump to a pinned element ---
function jumpToPin(pin) {
  chrome.tabs.query({ url: pin.url }, (tabs) => {
    if (tabs && tabs.length > 0) {
      const tab = tabs[0];
      chrome.tabs.update(tab.id, { active: true });
      sendJumpMessage(tab.id, pin);
    } else {
      // If tab isn't open, open it first
      chrome.tabs.create({ url: pin.url }, (tab) => {
        const listener = (tabId, info) => {
          if (tabId === tab.id && info.status === "complete") {
            sendJumpMessage(tabId, pin);
            chrome.tabs.onUpdated.removeListener(listener);
          }
        };
        chrome.tabs.onUpdated.addListener(listener);
      });
    }
  });
}

// --- Utility to safely send "jump-to" message ---
function sendJumpMessage(tabId, pin) {
  chrome.tabs.sendMessage(tabId, { type: "jump-to", pin }, () => {
    if (chrome.runtime.lastError) {
      // Inject content script if not active
      chrome.scripting.executeScript(
        { target: { tabId }, files: ["content_script.js"] },
        () => chrome.tabs.sendMessage(tabId, { type: "jump-to", pin })
      );
    }
  });
}

// --- Start element selection ---
document.getElementById("start-select").addEventListener("click", () => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const tab = tabs[0];
    if (tab?.id) {
      chrome.runtime.sendMessage({ type: "open-selector", tabId: tab.id });
    }
  });
});

// --- Listen for pin updates (sync changes across popups) ---
chrome.runtime.onMessage.addListener((msg) => {
  if (msg?.type === "pins-updated") loadPins();
});

// --- Initial load ---
loadPins();
