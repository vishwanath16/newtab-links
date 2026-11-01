const DEFAULTS = { enabled: true, mode: "all", allowed: [], blocked: [] };

function updateBadge(enabled) {
  chrome.action.setBadgeText({ text: enabled ? "" : "OFF" });
  chrome.action.setBadgeBackgroundColor({ color: "#888888" });
}

// Fill in any missing settings; existing users keep their current behavior (mode "all")
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.get(DEFAULTS, (v) => {
    chrome.storage.sync.set(v);
    updateBadge(v.enabled);
  });
});

chrome.runtime.onStartup.addListener(() => {
  chrome.storage.sync.get({ enabled: true }, (v) => updateBadge(v.enabled));
});

chrome.storage.onChanged.addListener((changes) => {
  if (changes.enabled) updateBadge(changes.enabled.newValue);
});

chrome.runtime.onMessage.addListener((msg, sender) => {
  if (msg && msg.type === "open" && msg.url) {
    const props = { url: msg.url, active: true };
    if (sender.tab) {
      props.openerTabId = sender.tab.id;
      props.index = sender.tab.index + 1;
    }
    chrome.tabs.create(props);
  }
});
