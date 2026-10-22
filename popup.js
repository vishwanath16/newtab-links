const toggle = document.getElementById("toggle");
const status = document.getElementById("status");

function render(on) {
  toggle.checked = on;
  status.textContent = on ? "Enabled" : "Disabled";
}

chrome.storage.sync.get({ enabled: true }, (v) => render(v.enabled));

toggle.addEventListener("change", () => {
  chrome.storage.sync.set({ enabled: toggle.checked });
  render(toggle.checked);
});
