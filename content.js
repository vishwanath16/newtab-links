let enabled = true;

chrome.storage.sync.get({ enabled: true }, (v) => { enabled = v.enabled; });
chrome.storage.onChanged.addListener((changes) => {
  if (changes.enabled) enabled = changes.enabled.newValue;
});

function stripHash(u) {
  const x = new URL(u);
  x.hash = "";
  return x.href;
}

window.addEventListener("click", (e) => {
  if (!enabled) return;
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
  chrome.runtime.sendMessage({ type: "open", url: url.href });
}, true);
