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
  return (
    result[`tab_${tabId}`]?.darkModeEnabled === true ||
    !!document.getElementById("pdfDarkModeStyle")
  )
}

export async function setDarkModeEnabled(tabId, enabled) {
  return updateTabState(tabId, { darkModeEnabled: enabled })
}

export async function isSepiaEnabled() {
  const result = await chrome.storage.local.get(["sepiaEnabled"])
  return result.sepiaEnabled === true
}

export function sendMessageToBackground(action, tabId, extraData = {}) {
  return new Promise((resolve) => {
    chrome.runtime.sendMessage({ action, tabId, ...extraData }, resolve)
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
