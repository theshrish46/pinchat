# ChatMark


ChatMark is a Chrome extension that helps you pin and jump to chat threads or any DOM element across pages. Useful to avoid scrolling fatigue.


## Features
- Select any element on the page to pin (via popup or context menu)
- Stores pins (selector, title, URL) in local extension storage
- Popup lists your pins and lets you jump (open the page and scroll to the element)


## Installation (developer / testing)
1. Create a folder `chatmark/` and place the files shown in this repo inside.
2. Optionally add icons in `icons/` (use any PNGs named icon16.png, icon48.png, icon128.png).
3. Open Chrome -> Extensions -> Developer Mode -> Load unpacked -> select the `chatmark/` folder.
4. Click the ChatMark toolbar icon, press "Pin an element" and click an element on the page to pin it.


## Notes & Improvements
- The selector heuristic may occasionally fail if pages change; you can improve selection by storing XPath or element offsets.
- Add sync to chrome.storage.sync for cross-device pins.
- Add editing and naming UI for pins, groups/folders, and import/export.


## License
MIT