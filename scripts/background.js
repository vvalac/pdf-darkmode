console.log("[DEBUG] background.js loaded")

// Listen for messages
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (!message) {
    console.error("[ERROR] No message sent to background.")
    return
  }

  if (message.action === "manualToggle" && message.tabId) {
    chrome.tabs.get(message.tabId, (tab) => {
      if (chrome.runtime.lastError) {
        console.error(
          "[ERROR] chrome.tabs.get failed:",
          chrome.runtime.lastError.message
        )
        return
      }

      console.log("[DEBUG] Manual toggle requested for tab ID:", message.tabId)

      chrome.scripting
        .executeScript({
          target: { tabId: message.tabId },
          files: ["scripts/toggle.js"],
        })
        .then(() => {
          console.log("[DEBUG] toggle.js injected successfully")
          sendResponse({ status: "Toggle script executed" })
        })
        .catch((err) => {
          console.error("[ERROR] Failed to inject toggle.js:", err.message)
        })
    })

    return true // Keep sendResponse valid for async call
  }

  console.warn("[WARN] Unknown action received:", message.action)
})
