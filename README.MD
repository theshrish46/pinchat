# 📌 Pinchat

**Pinchat** is a lightweight Chrome extension that lets you **pin, revisit, and jump** to chat threads or any DOM element on any webpage — perfect for avoiding endless scrolling and keeping track of key sections during research or conversations.

---

## ✨ Features
- 🖱️ **Select and pin any element** on a page using the popup or context menu  
- 💾 **Saves** element selector, page title, and URL in local extension storage  
- 🔁 **Instant jump-back** to pinned elements (auto-scrolls and highlights)  
- 🧩 **Works across pages and sessions** — all pins persist in your browser  
- 🧹 **Simple, intuitive popup UI** to manage, open, or delete pins  

---

## 🚀 Installation (Developer / Testing)

1. Create a folder named `Pinchat/` and place the files from this repo inside.  
2. (Optional) Add icons in `/icons` —  
   - `icon16.png`, `icon48.png`, `icon128.png`
3. Open **Chrome → Extensions → Developer Mode → Load Unpacked**  
4. Select the `Pinchat/` folder.  
5. Click the 📍 **Pinchat toolbar icon**, press **“Pin an element”**, then click any element on a webpage.

---

## 🧠 Architecture Overview

| File | Purpose |
|------|----------|
| **manifest.json** | Defines extension permissions, scripts, and icons |
| **popup.html / popup.js / popup.css** | Popup UI and pin management logic |
| **content_script.js** | Handles in-page element selection and highlight |
| **background.js** | Message routing between popup and content script |
| **icons/** | Extension icons for different resolutions |

---

## 💡 Notes & Future Improvements
- Improve selector robustness (use XPath or relative offset fallback)
- Add `chrome.storage.sync` support for cross-device pin syncing
- Implement rename/edit/grouping for pins
- Optional **export/import** feature for sharing pin sets
- Dark/light theme toggle for popup UI

---

## 🧪 Demo (Preview)
> Coming soon — short GIF showing element selection and jump-back in action.

---

## ⚙️ Tech Stack
- JavaScript (Vanilla)
- Chrome Extensions API (Manifest V3)
- HTML + CSS (minimal, lightweight)
- Local Storage via `chrome.storage.local`

---

## 🪪 License
This project is licensed under the **MIT License** — free to use, modify, and distribute.

---

### 💬 Author
Built with ❤️ for productivity and simplicity.  
Contributions and feature ideas welcome — just open an issue or PR!