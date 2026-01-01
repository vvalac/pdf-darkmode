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

// Handle keyboard shortcuts
chrome.commands.onCommand.addListener((command) => {
  if (command === "toggle-dark-mode") {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]?.id) {
        const tabId = tabs[0].id
        chrome.storage.local.set({ currentTabId: tabId }, () => {
          chrome.scripting
            .executeScript({
              target: { tabId },
              files: ["scripts/toggleDark.js"],
            })
            .catch((err) => {
              console.error(
                "[PDF-Darkmode] [ERROR] Hotkey toggle failed:",
                err.message
              )
            })
        })
      }
    })
  } else if (command === "toggle-sepia-mode") {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]?.id) {
        const tabId = tabs[0].id
        chrome.storage.local.get(["sepiaEnabled"], (result) => {
          const newSepia = !result.sepiaEnabled
          chrome.storage.local.set(
            { sepiaEnabled: newSepia, currentTabId: tabId },
            () => {
              chrome.scripting
                .executeScript({
                  target: { tabId },
                  files: ["scripts/toggleSepia.js"],
                })
                .catch((err) => {
                  console.error(
                    "[PDF-Darkmode] [ERROR] Sepia hotkey failed:",
                    err.message
                  )
                })
            }
          )
        })
      }
    })
  }
})

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (!message || !message.action) {
    console.error("[PDF-Darkmode] [ERROR] Invalid message received:", message)
    sendResponse({ status: "Failed", error: "Invalid message" })
    return false
  }

  if (message.action === "updateDarkMode") {
    if (!message.tabId) {
      console.error("[PDF-Darkmode] [ERROR] Missing tabId in updateDarkMode")
      sendResponse({ status: "Failed", error: "Missing tabId" })
      return false
    }

    chrome.storage.local.set(
      {
        [`tab_${message.tabId}`]: { darkModeEnabled: message.darkModeEnabled },
      },
      () => {
        if (chrome.runtime.lastError) {
          console.error(
            "[PDF-Darkmode] [ERROR] Storage failed:",
            chrome.runtime.lastError.message
          )
        }
      }
    )
    return false
  }

  if (message.action === "manualToggle") {
    if (!message.tabId) {
      console.error("[PDF-Darkmode] [ERROR] Missing tabId in manualToggle")
      sendResponse({ status: "Failed", error: "Missing tabId" })
      return false
    }

    chrome.storage.local.set({ currentTabId: message.tabId }, () => {
      if (chrome.runtime.lastError) {
        console.error(
          "[PDF-Darkmode] [ERROR] Storage failed:",
          chrome.runtime.lastError.message
        )
        sendResponse({
          status: "Failed",
          error: chrome.runtime.lastError.message,
        })
        return
      }

      chrome.scripting
        .executeScript({
          target: { tabId: message.tabId },
          files: ["scripts/toggleDark.js"],
        })
        .then(() => {
          sendResponse({ status: "Dark mode toggled." })
        })
        .catch((err) => {
          console.error(
            "[PDF-Darkmode] [ERROR] Failed to inject toggleDark.js:",
            err.message
          )
          sendResponse({ status: "Failed", error: err.message })
        })
    })
    return true
  }

  if (message.action === "updateSepia") {
    if (!message.tabId || typeof message.sepia !== "boolean") {
      console.error("[PDF-Darkmode] [ERROR] Invalid parameters in updateSepia")
      sendResponse({ status: "Failed", error: "Invalid parameters" })
      return false
    }

    chrome.storage.local.set(
      {
        sepiaEnabled: message.sepia,
        currentTabId: message.tabId,
      },
      () => {
        if (chrome.runtime.lastError) {
          console.error(
            "[PDF-Darkmode] [ERROR] Storage failed:",
            chrome.runtime.lastError.message
          )
          sendResponse({
            status: "Failed",
            error: chrome.runtime.lastError.message,
          })
          return
        }

        chrome.scripting
          .executeScript({
            target: { tabId: message.tabId },
            files: ["scripts/toggleSepia.js"],
          })
          .then(() => {
            sendResponse({ status: "Sepia mode toggled." })
          })
          .catch((err) => {
            console.error(
              "[PDF-Darkmode] [ERROR] Failed to inject toggleSepia.js:",
              err.message
            )
            sendResponse({ status: "Failed", error: err.message })
          })
      }
    )
    return true
  }

  console.warn("[PDF-Darkmode] [WARN] Unknown action received:", message.action)
  sendResponse({ status: "Failed", error: "Unknown action" })
  return false
})
