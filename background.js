// background.js — Pinchat

console.log('📌 Pinchat background service running');

// --- Context Menu Creation ---
chrome.runtime.onInstalled.addListener(() => {
  // Clean up old menu (if reloaded) to avoid duplicates
  chrome.contextMenus.removeAll(() => {
    chrome.contextMenus.create({
      id: 'pinchat-pin-element',
      title: '📌 Pin element with Pinchat',
      contexts: ['all']
    });
  });
});

// --- Context Menu Click Handler ---
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'pinchat-pin-element' && tab?.id) {
    console.log('Context menu click detected on tab:', tab.id);
    chrome.tabs.sendMessage(tab.id, { type: 'start-select', viaContextMenu: true });
  }
});

// --- Message Listener (Single Unified) ---
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  console.log('Background received message:', msg);

  // Ensure tabId is resolved safely
  const tabId = msg.tabId || sender.tab?.id;

  switch (msg.type) {
    case 'open-selector':
      if (tabId) {
        chrome.scripting.executeScript({
          target: { tabId },
          files: ['content_script.js']
        }, () => {
          if (chrome.runtime.lastError) {
            console.warn('Script injection failed:', chrome.runtime.lastError);
          } else {
            chrome.tabs.sendMessage(tabId, { type: 'start-select' });
          }
        });
        sendResponse({ ok: true });
      } else {
        console.warn('No tabId provided for open-selector');
        sendResponse({ ok: false });
      }
      break;

    default:
      // Handle future messages here
      console.log('Unhandled message type:', msg.type);
  }

  // Return true if you plan to use sendResponse asynchronously
  return true;
});
