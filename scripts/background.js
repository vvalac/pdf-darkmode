chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (!message) {
    console.error("[PDF-Darkmode] [ERROR] No message sent to background.");
    return;
  }

  console.log(`[DEBUG] Action received: ${message.action}`);

  const injectScript = (tabId, scriptFile, successMessage) => {
    chrome.tabs.get(tabId, () => {
      if (chrome.runtime.lastError) {
        console.error(
          "[PDF-Darkmode] [ERROR] chrome.tabs.get failed:",
          chrome.runtime.lastError.message
        );
        return;
      }

      chrome.scripting
        .executeScript({
          target: { tabId },
          files: [scriptFile],
        })
        .then(() => {
          console.log(`[DEBUG] ${successMessage}`);
          sendResponse({ status: successMessage });
        })
        .catch((err) => {
          console.error(
            `[PDF-Darkmode] [ERROR] Failed to inject ${scriptFile}:`,
            err.message
          );
          sendResponse({
            status: `Failed to inject ${scriptFile}`,
            error: err.message,
          });
        });
    });
  };

  if (message.action === "manualToggle" && message.tabId) {
    injectScript(message.tabId, "scripts/toggleDark.js", "Dark mode toggled.");
    return true;
  }

  if (message.action === "updateSepia" && message.tabId) {
    injectScript(message.tabId, "scripts/toggleSepia.js", "Sepia mode toggled.");
    return true;
  }

  console.warn("[PDF-Darkmode] [WARN] Unknown action received:", message.action);
});
