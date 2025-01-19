chrome.tabs.onUpdated.addListener((tabId, changeInfo) => {
  if (changeInfo.status === "loading") {
    chrome.storage.local.remove(`tab_${tabId}`, () => {
      if (chrome.runtime.lastError) {
        console.error(
          "[PDF-Darkmode] [ERROR] Failed to clear tab state:",
          chrome.runtime.lastError.message
        )
      }
    })
  }
})

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (!message) {
    console.error("[PDF-Darkmode] [ERROR] No message sent to background.")
    return
  }

  const injectScript = (tabId, scriptFile, successMessage) => {
    chrome.tabs.get(tabId, () => {
      if (chrome.runtime.lastError) {
        console.error(
          "[PDF-Darkmode] [ERROR] chrome.tabs.get failed:",
          chrome.runtime.lastError.message
        )
        return
      }

      chrome.scripting
        .executeScript({
          target: { tabId },
          files: [scriptFile],
        })
        .then(() => {
          sendResponse({ status: successMessage })
        })
        .catch((err) => {
          console.error(
            `[PDF-Darkmode] [ERROR] Failed to inject ${scriptFile}:`,
            err.message
          )
          sendResponse({
            status: `Failed to inject ${scriptFile}`,
            error: err.message,
          })
        })
    })
  }

  if (message.action === "updateDarkMode" && message.tabId) {
    chrome.storage.local.set({
      [`tab_${message.tabId}`]: { darkModeEnabled: message.darkModeEnabled },
    })
    return true
  }

  if (message.action === "manualToggle" && message.tabId) {
    injectScript(message.tabId, "scripts/toggleDark.js", "Dark mode toggled.")
    return true
  }

  if (message.action === "updateSepia" && message.tabId) {
    injectScript(message.tabId, "scripts/toggleSepia.js", "Sepia mode toggled.")
    chrome.storage.local.set({
      sepiaEnabled: message.sepia,
    })
    return true
  }

  console.warn("[PDF-Darkmode] [WARN] Unknown action received:", message.action)
})
