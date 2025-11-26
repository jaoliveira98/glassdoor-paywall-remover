chrome.runtime.onInstalled.addListener(() => {
  // Initialize badge state
  chrome.storage.sync.get(["cleanViewEnabled"], (result) => {
    const enabled = result.cleanViewEnabled !== false;
    updateBadge(enabled);
  });
});

// Listen for toggle messages from popup
chrome.runtime.onMessage.addListener((message) => {
  if (message.action === "toggleCleanView") {
    updateBadge(message.enabled);
  }
  if (message.action === "reloadCurrentTab") {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const tab = tabs[0];
      if (!tab || !tab.url) return;

      // Only reload if it's a Glassdoor domain
      const isGlassdoor =
        tab.url.includes("glassdoor.com") ||
        tab.url.includes("glassdoor.co.uk");

      if (isGlassdoor) {
        chrome.tabs.reload(tab.id);
      }
    });
  }
});

function updateBadge(enabled) {
  chrome.action.setBadgeText({ text: enabled ? "ON" : "OFF" });
  chrome.action.setBadgeBackgroundColor({
    color: enabled ? "#00a264" : "#999999",
  });
}
