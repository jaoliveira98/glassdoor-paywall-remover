(() => {
  "use strict";

  let observer;

  function removeSignIn() {
    // Remove body inline styles if they block scroll
    if (document.body?.hasAttribute("style")) {
      document.body.removeAttribute("style");
    }

    // Find and remove sign in overlays
    const signInWalls = document.querySelectorAll(
      "#HardsellOverlay, .hardsellOverlay, .hardsellContainer, .hardsell"
    );
    signInWalls.forEach((el) => el.remove());

    // Restore scroll if needed
    if (
      document.body.style.overflow &&
      document.body.style.overflow !== "auto"
    ) {
      document.body.style.overflow = "auto";
    }

    if (signInWalls.length > 0) {
      stopObserver();
    }
  }

  function startObserver() {
    if (observer) return;

    observer = new MutationObserver((mutations) => {
      for (const m of mutations) {
        // Check added nodes for sign-in classes/ids
        for (const node of m.addedNodes) {
          if (node.nodeType === 1) {
            const el = node;
            if (
              el.id?.includes("Hardsell") ||
              el.className?.toString().includes("hardsell")
            ) {
              removeSignIn();
              return; // stop after first detection
            }
          }
        }
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
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
      removeSignIn(); // catch if already present
      startObserver();
    }
  });

  // Listen for toggle
  chrome.runtime.onMessage.addListener((message) => {
    if (message.action === "toggleCleanView") {
      if (message.enabled) {
        removeSignIn();
        startObserver();
      } else {
        stopObserver();
      }
    }
  });
})();
