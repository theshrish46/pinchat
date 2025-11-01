// 📌 Pinchat — Content Script
console.log("📍 Pinchat content script active on:", location.href);

let selecting = false;
let prevEl = null;

// Listen for messages from background or popup
chrome.runtime.onMessage.addListener((msg) => {
  switch (msg.type) {
    case "start-select":
      if (!selecting) startSelectionMode();
      break;
    case "jump-to":
      jumpToPinnedElement(msg.pin);
      break;
  }
});

// --- Selection Mode ---
function startSelectionMode() {
  selecting = true;
  document.body.style.cursor = "crosshair";
  document.addEventListener("mouseover", highlightElement);
  document.addEventListener("mouseout", unhighlightElement);
  document.addEventListener("click", captureElement, { once: true });
  console.log("📍 Pinchat: Selection mode started.");
}

function highlightElement(e) {
  if (prevEl) prevEl.style.outline = "";
  prevEl = e.target;
  prevEl.style.outline = "2px solid #ff9800"; // warm orange
  e.stopPropagation();
}

function unhighlightElement(e) {
  e.target.style.outline = "";
  e.stopPropagation();
}

// --- Capture Selected Element ---
function captureElement(e) {
  e.preventDefault();
  e.stopPropagation();

  const el = e.target;
  cleanupSelectionMode();

  const text = el.innerText?.trim() || el.textContent?.trim() || "";
  const selector = getUniqueSelector(el);
  const scrollY = window.scrollY;
  const pageTitle = document.title;
  const url = location.href;

  // Ask for pin name
  const defaultName = text.slice(0, 40) || "Pinned Element";
  let name = prompt("📌 Give this pin a name:", defaultName);
  if (!name || !name.trim()) name = defaultName;

  const pin = { name, text, selector, scrollY, url, title: pageTitle };

  chrome.storage.local.get({ pins: [] }, (res) => {
    const pins = res.pins || [];
    pins.push(pin);
    chrome.storage.local.set({ pins }, () => {
      chrome.runtime.sendMessage({ type: "pins-updated" });
      alert(`✅ Pinned: “${name}” saved successfully!`);
    });
  });
}

// --- Cleanup ---
function cleanupSelectionMode() {
  selecting = false;
  document.body.style.cursor = "default";
  document.removeEventListener("mouseover", highlightElement);
  document.removeEventListener("mouseout", unhighlightElement);
  document.removeEventListener("click", captureElement);
  if (prevEl) prevEl.style.outline = "";
  prevEl = null;
}

// --- Unique Selector Builder ---
function getUniqueSelector(el) {
  if (!(el instanceof Element)) return null;
  const path = [];
  while (el && el.nodeType === Node.ELEMENT_NODE) {
    let selector = el.nodeName.toLowerCase();
    if (el.id) {
      selector += `#${CSS.escape(el.id)}`;
      path.unshift(selector);
      break;
    } else {
      let sib = el;
      let nth = 1;
      while ((sib = sib.previousElementSibling)) {
        if (sib.nodeName.toLowerCase() === selector) nth++;
      }
      selector += `:nth-of-type(${nth})`;
    }
    path.unshift(selector);
    el = el.parentElement;
  }
  return path.join(" > ");
}

// --- Jump to a Pinned Element ---
function jumpToPinnedElement(pin) {
  if (pin.selector) {
    const el = document.querySelector(pin.selector);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      el.style.outline = "3px solid #4caf50"; // subtle green
      setTimeout(() => (el.style.outline = ""), 2000);
    } else {
      window.scrollTo({ top: pin.scrollY || 0, behavior: "smooth" });
    }
  } else {
    window.scrollTo({ top: pin.scrollY || 0, behavior: "smooth" });
  }
}