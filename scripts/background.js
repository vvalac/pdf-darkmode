chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (!message) {
    console.error("[PDF-Darkmode] [ERROR] No message sent to background.")
    return
  }

  if (message.action === "manualToggle" && message.tabId) {
    chrome.tabs.get(message.tabId, (tab) => {
      if (chrome.runtime.lastError) {
        console.error(
          "[PDF-Darkmode] [ERROR] chrome.tabs.get failed:",
          chrome.runtime.lastError.message
        )
        return
      }

      chrome.scripting
        .executeScript({
          target: { tabId: message.tabId },
          files: ["scripts/toggle.js"],
        })
        .then(() => {
          sendResponse({ status: "Toggle script executed" })
        })
        .catch((err) => {
          console.error(
            "[PDF-Darkmode] [ERROR] Failed to inject toggle.js:",
            err.message
          )
        })
    })

    return true // Keep sendResponse valid for async call
  }

  console.warn("[PDF-Darkmode] [WARN] Unknown action received:", message.action)
})
