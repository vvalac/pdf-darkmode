export async function updateTabState(tabId, updates) {
  if (!tabId || typeof tabId !== "number") {
    console.error("[PDF-Darkmode] [ERROR] Invalid tabId:", tabId)
    return
  }

  try {
    const currentState = await chrome.storage.local.get(`tab_${tabId}`)
    await chrome.storage.local.set({
      [`tab_${tabId}`]: {
        ...currentState[`tab_${tabId}`],
        ...updates,
      },
    })
  } catch (err) {
    console.error("[PDF-Darkmode] [ERROR] Failed to update tab state:", err)
  }
}

export async function getCurrentTabId() {
  return new Promise((resolve) => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      resolve(tabs[0]?.id)
    })
  })
}

export async function isDarkModeEnabled(tabId) {
  if (!tabId || typeof tabId !== "number") {
    console.error("[PDF-Darkmode] [ERROR] Invalid tabId:", tabId)
    return false
  }

  try {
    const result = await chrome.storage.local.get([`tab_${tabId}`])
    return result[`tab_${tabId}`]?.darkModeEnabled === true
  } catch (err) {
    console.error(
      "[PDF-Darkmode] [ERROR] Failed to check dark mode state:",
      err
    )
    return false
  }
}

export async function setDarkModeEnabled(tabId, enabled) {
  return updateTabState(tabId, { darkModeEnabled: enabled })
}

export async function isSepiaEnabled() {
  const result = await chrome.storage.local.get(["sepiaEnabled"])
  return result.sepiaEnabled === true
}

export function sendMessageToBackground(action, data = {}) {
  return new Promise((resolve) => {
    chrome.runtime.sendMessage({ action, ...data }, (response) => {
      resolve(response)
    })
  })
}

export function checkIfPdfLoaded(tabId) {
  return new Promise((resolve) => {
    // First check the tab URL
    chrome.tabs.get(tabId, (tab) => {
      if (chrome.runtime.lastError) {
        console.error(
          "[PDF-Darkmode] [ERROR] Failed to get tab:",
          chrome.runtime.lastError.message
        )
        resolve(false)
        return
      }

      // Check if URL indicates a PDF
      const url = tab.url || ""
      const isPdfUrl =
        url.toLowerCase().endsWith(".pdf") ||
        url.toLowerCase().includes(".pdf?") ||
        url.toLowerCase().includes(".pdf#") ||
        url.includes("pdfjs.action=download") ||
        (url.includes("chrome-extension://") && url.includes(".pdf"))

      // If URL clearly indicates PDF, return true immediately
      if (isPdfUrl) {
        resolve(true)
        return
      }

      // Otherwise, try to check the DOM (for embedded PDFs)
      chrome.scripting.executeScript(
        {
          target: { tabId },
          func: () => {
            // Check for common PDF elements in the DOM
            return !!(
              document.querySelector("embed[type='application/pdf']") ||
              document.querySelector("iframe[src*='.pdf']") ||
              document.querySelector("pdf-viewer")
            )
          },
        },
        (injectionResults) => {
          if (
            chrome.runtime.lastError ||
            !injectionResults ||
            !injectionResults.length
          ) {
            // Script injection failed, but that's okay - we already checked URL
            resolve(false)
            return
          }

          resolve(injectionResults[0].result)
        }
      )
    })
  })
}
