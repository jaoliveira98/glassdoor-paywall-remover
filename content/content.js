(() => {
  "use strict";

  let observer;

  function removePaywall() {
    // Remove body inline styles if they block scroll
    if (document.body?.hasAttribute("style")) {
      document.body.removeAttribute("style");
    }

    // Find and remove paywall overlays
    const paywalls = document.querySelectorAll(
      "#HardsellOverlay, .hardsellOverlay, .hardsellContainer, .hardsell"
    );
    paywalls.forEach((el) => el.remove());

    // Restore scroll if needed
    if (
      document.body.style.overflow &&
      document.body.style.overflow !== "auto"
    ) {
      document.body.style.overflow = "auto";
    }

    if (paywalls.length > 0) {
      stopObserver();
    }
  }

  function startObserver() {
    if (observer) return;

    observer = new MutationObserver((mutations) => {
      for (const m of mutations) {
        // Check added nodes for paywall classes/ids
        for (const node of m.addedNodes) {
          if (node.nodeType === 1) {
            const el = node;
            if (
              el.id?.includes("Hardsell") ||
              el.className?.toString().includes("hardsell")
            ) {
              removePaywall();
              return; // stop after first detection
            }
          }
        }
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      // no attributes → less noise
    });
  }

  function stopObserver() {
    if (observer) {
      observer.disconnect();
      observer = null;
    }
  }

  // Load state and start
  chrome.storage.sync.get(["cleanViewEnabled"], (result) => {
    const enabled = result.cleanViewEnabled !== false;

    if (enabled) {
      removePaywall(); // catch if already present
      startObserver();
    }
  });

  // Listen for toggle
  chrome.runtime.onMessage.addListener((message) => {
    if (message.action === "toggleCleanView") {
      if (message.enabled) {
        removePaywall();
        startObserver();
      } else {
        stopObserver();
      }
    }
  });
})();
