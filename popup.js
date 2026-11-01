const $ = (id) => document.getElementById(id);

let state = { enabled: true, mode: "all", allowed: [], blocked: [] };
let host = null; // current site, or null if unavailable

const norm = (h) => String(h || "").toLowerCase().replace(/^www\./, "");
const matches = (h, list) => list.some((s) => h === s || h.endsWith("." + s));

function save(patch) {
  Object.assign(state, patch);
  chrome.storage.sync.set(patch);
  render();
}

function siteActive() {
  if (!host) return false;
  return state.mode === "selected" ? matches(host, state.allowed) : !matches(host, state.blocked);
}

function setSite(on) {
  if (!host) return;
  const key = state.mode === "selected" ? "allowed" : "blocked";
  // "allowed": on = add, off = remove.  "blocked": on = remove, off = add.
  const wantInList = key === "allowed" ? on : !on;
  const without = state[key].filter((s) => !(host === s || host.endsWith("." + s)));
  save({ [key]: wantInList ? [...without, host].sort() : without });
}

function render() {
  $("master").checked = state.enabled;
  $("body").classList.toggle("off", !state.enabled);

  $("mode-all").classList.toggle("active", state.mode === "all");
  $("mode-selected").classList.toggle("active", state.mode === "selected");

  if (host) {
    $("host").textContent = host;
    $("site-switch").style.display = "";
    $("site").checked = siteActive();
    $("site-hint").textContent = state.mode === "selected"
      ? "Links open in a new tab only on sites you enable."
      : "Turn off to stop it on this site.";
  } else {
    $("host").textContent = "Not available on this page";
    $("site-switch").style.display = "none";
    $("site-hint").textContent = "Reload the page if it's a normal website.";
  }

  const selected = state.mode === "selected";
  const list = selected ? state.allowed : state.blocked;
  $("list-label").textContent = selected ? "Enabled sites" : "Excluded sites";
  $("empty").textContent = list.length ? "" : (selected ? "None yet. Enable a site above." : "None. It works on every site.");

  const ul = $("list");
  ul.textContent = "";
  for (const s of list) {
    const li = document.createElement("li");
    const name = document.createElement("span");
    name.textContent = s;
    const rm = document.createElement("button");
    rm.textContent = "×";
    rm.title = "Remove " + s;
    rm.addEventListener("click", () => {
      const key = selected ? "allowed" : "blocked";
      save({ [key]: state[key].filter((x) => x !== s) });
    });
    li.append(name, rm);
    ul.append(li);
  }
}

$("master").addEventListener("change", (e) => save({ enabled: e.target.checked }));
$("mode-all").addEventListener("click", () => save({ mode: "all" }));
$("mode-selected").addEventListener("click", () => save({ mode: "selected" }));
$("site").addEventListener("change", (e) => setSite(e.target.checked));

// Load settings, then ask the active tab's content script which site it is on
chrome.storage.sync.get(state, (v) => {
  state = v;
  render();
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const tab = tabs && tabs[0];
    if (!tab) return;
    chrome.tabs.sendMessage(tab.id, { type: "getHost" }, { frameId: 0 }, (res) => {
      void chrome.runtime.lastError; // no content script on this page (e.g. chrome:// pages)
      if (res && res.host) { host = norm(res.host); render(); }
    });
  });
});
