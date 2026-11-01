let state = { enabled: true, mode: "all", allowed: [], blocked: [] };

chrome.storage.sync.get(state, (v) => { state = v; });
chrome.storage.onChanged.addListener((changes) => {
  for (const k in changes) {
    if (changes[k].newValue !== undefined) state[k] = changes[k].newValue;
  }
});

function norm(h) {
  return String(h || "").toLowerCase().replace(/^www\./, "");
}

function matches(host, list) {
  return list.some((s) => host === s || host.endsWith("." + s));
}

// Host of the top-level page (so links inside embedded iframes follow the page's setting)
function topHost() {
  try {
    const o = location.ancestorOrigins;
    if (o && o.length) return norm(new URL(o[o.length - 1]).hostname);
  } catch {}
  return norm(location.hostname);
}

function isActive() {
  if (!state.enabled) return false;
  const host = topHost();
  return state.mode === "selected"
    ? matches(host, state.allowed)
    : !matches(host, state.blocked);
}

// Popup asks the top frame which site it is on
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg && msg.type === "getHost" && window === window.top) {
    sendResponse({ host: norm(location.hostname) });
  }
});

function stripHash(u) {
  const x = new URL(u);
  x.hash = "";
  return x.href;
}

window.addEventListener("click", (e) => {
  if (!isActive()) return;
  if (e.button !== 0) return;                                  // left click only
  if (e.ctrlKey || e.metaKey || e.shiftKey || e.altKey) return; // browser handles these

  const a = e.target.closest && e.target.closest("a[href]");
  if (!a) return;
  if (a.hasAttribute("download")) return;

  let url;
  try { url = new URL(a.href, location.href); } catch { return; }
  if (url.protocol !== "http:" && url.protocol !== "https:") return; // skip mailto:, tel:, javascript:
  if (stripHash(url.href) === stripHash(location.href) && url.hash) return; // in-page anchor

  // Already opens in a new tab/window: leave it alone
  if (a.target === "_blank") return;

  e.preventDefault();
  e.stopImmediatePropagation();
  try {
    chrome.runtime.sendMessage({ type: "open", url: url.href });
  } catch {
    // Extension was updated/reloaded while this page was open: fall back so the link still works
    window.open(url.href, "_blank", "noopener");
  }
}, true);
