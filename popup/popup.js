document.addEventListener("DOMContentLoaded", () => {
  const toggle = document.getElementById("toggleSwitch");
  const status = document.getElementById("status");

  chrome.storage.sync.get(["cleanViewEnabled"], (result) => {
    const enabled = result.cleanViewEnabled !== false;
    toggle.checked = enabled;
    status.textContent = enabled ? "On" : "Off";
  });

  toggle.addEventListener("change", () => {
    const enabled = toggle.checked;
    chrome.storage.sync.set({ cleanViewEnabled: enabled });
    status.textContent = enabled ? "On" : "Off";
    chrome.runtime.sendMessage({ action: "toggleCleanView", enabled });
    chrome.runtime.sendMessage({ action: "reloadCurrentTab" });
  });
});
