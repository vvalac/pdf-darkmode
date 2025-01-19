export async function updateTabState(tabId, updates) {
  const currentState = await chrome.storage.local.get(`tab_${tabId}`)
  await chrome.storage.local.set({
    [`tab_${tabId}`]: {
      ...currentState[`tab_${tabId}`],
      ...updates,
    },
  })
}

export async function getCurrentTabId() {
  return new Promise((resolve) => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      resolve(tabs[0]?.id)
    })
  })
}

export async function isDarkModeEnabled(tabId) {
  const result = await chrome.storage.local.get([`tab_${tabId}`])
  const storageState = result[`tab_${tabId}`]?.darkModeEnabled === true

  const overlayState = await new Promise((resolve) => {
    chrome.scripting.executeScript(
      {
        target: { tabId },
        func: () => {
          return !!document.getElementById("pdfDarkModeStyle")
        },
      },
      (injectionResults) => {
        if (
          chrome.runtime.lastError ||
          !injectionResults ||
          !injectionResults.length
        ) {
          console.error(
            "[PDF-Darkmode] [ERROR] Failed to check overlay status:",
            chrome.runtime.lastError?.message
          )
          resolve(false)
          return
        }
        resolve(injectionResults[0].result)
      }
    )
  })

  // If there's a mismatch, update storage to match reality
  if (storageState !== overlayState) {
    await updateTabState(tabId, { darkModeEnabled: overlayState })
    return overlayState
  }

  return storageState
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
          console.error(
            "[PDF-Darkmode] [ERROR] Failed to check PDF status:",
            chrome.runtime.lastError?.message
          )
          resolve(false)
          return
        }

        resolve(injectionResults[0].result)
      }
    )
  })
}
