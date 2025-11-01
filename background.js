
console.log('ChatMark background running');
console.log('ChatMark background running');

chrome.runtime.onInstalled.addListener(() => {
chrome.contextMenus.create({
id: 'chatmark-pin-element',
title: 'Pin element with ChatMark',
contexts: ['all']
});
});

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  console.log('Background received message:', msg);
  if (msg.type === 'open-selector') {
    const tabId = msg.tabId;
    if (tabId) {
      chrome.scripting.executeScript({
        target: { tabId },
        files: ['content_script.js']
      }, () => {
        chrome.tabs.sendMessage(tabId, { type: 'start-select' });
      });
    }
  }
});


console.log('ChatMark background running');



chrome.contextMenus.onClicked.addListener(async (info, tab) => {
if (info.menuItemId === 'chatmark-pin-element') {
// Tell content script to start element selection in the active tab
chrome.tabs.sendMessage(tab.id, { type: 'start-select', viaContextMenu: true });
}
});


// Allow popup to open the pin selector
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
if (msg?.type === 'open-selector') {
// message should contain tabId
chrome.tabs.sendMessage(msg.tabId, { type: 'start-select' });
sendResponse({ ok: true });
}
// keep other messages simple
});