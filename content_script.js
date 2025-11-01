console.log("ChatMark content script active on", location.href);

let selecting = false;

chrome.runtime.onMessage.addListener((msg) => {
  if (msg.type === "start-select") {
    if (!selecting) {
      startSelectionMode();
    }
  } else if (msg.type === "jump-to") {
    jumpToPinnedElement(msg.pin);
  }
});

function startSelectionMode() {
  selecting = true;
  document.body.style.cursor = "crosshair";
  document.addEventListener("mouseover", highlightElement);
  document.addEventListener("mouseout", unhighlightElement);
  document.addEventListener("click", captureElement, { once: true });
  console.log("ChatMark: Selection mode started.");
}

let prevEl = null;
function highlightElement(e) {
  if (prevEl) prevEl.style.outline = "";
  prevEl = e.target;
  prevEl.style.outline = "2px solid orange";
}

function unhighlightElement(e) {
  e.target.style.outline = "";
}

// Function to capture an element and make it a pin
function captureElement(e) {
  e.preventDefault();
  e.stopPropagation();

  const el = e.target;
  el.style.outline = "";
  document.body.style.cursor = "default";
  document.removeEventListener("mouseover", highlightElement);
  document.removeEventListener("mouseout", unhighlightElement);
  selecting = false;

  const text = el.innerText || el.textContent || "";
  const selector = getUniqueSelector(el);
  const scrollY = window.scrollY;
  const pageTitle = document.title;
  const url = location.href;

  let name = prompt(
    "Give this pin name:",
    text.slice(0, 40) || "Pinned Element"
  );
  if (!name || !name.trim()) name = text.slice(0, 40) || "Pinned Element";

  const pin = { name, text, selector, scrollY, url, title: pageTitle };

  chrome.storage.local.get({ pins: [] }, (res) => {
    const pins = res.pins || [];
    pins.push(pin);
    chrome.storage.local.set({ pins }, () => {
      chrome.runtime.sendMessage({ type: "pins-updated" });
      alert(
        "✅ Pinned: " + (title ? title : text.slice(0, 40) || "element") + "..."
      );
    });
  });
}

function getUniqueSelector(el) {
  if (!(el instanceof Element)) return null;
  const path = [];
  while (el && el.nodeType === Node.ELEMENT_NODE) {
    let selector = el.nodeName.toLowerCase();
    if (el.id) {
      selector += `#${el.id}`;
      path.unshift(selector);
      break; // IDs are unique enough
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

function jumpToPinnedElement(pin) {
  if (pin.selector) {
    const el = document.querySelector(pin.selector);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      el.style.outline = "3px solid limegreen";
      setTimeout(() => (el.style.outline = ""), 2000);
    } else {
      window.scrollTo(0, pin.scrollY || 0);
    }
  } else {
    window.scrollTo(0, pin.scrollY || 0);
  }
}
