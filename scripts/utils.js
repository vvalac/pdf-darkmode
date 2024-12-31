// utils.js

export function isDarkModeEnabled() {
  return new Promise((resolve) => {
    chrome.storage.local.get(["darkModeEnabled"], (result) => {
      resolve(result.darkModeEnabled || false)
    })
  })
}

export function isSepiaEnabled() {
  return new Promise((resolve) => {
    chrome.storage.local.get(["sepiaEnabled"], (result) => {
      resolve(result.sepiaEnabled || false)
    })
  })
}

export function sendMessageToBackground(action, extraData = {}) {
  return new Promise((resolve) => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (!tabs.length) {
        console.error("[PDF-Darkmode] [ERROR] No active tab found")
        resolve()
        return
      }

      chrome.runtime.sendMessage({ action, tabId: tabs[0].id, ...extraData }, resolve)
    })
  })
}

export function checkIfPdfLoaded() {
  return new Promise((resolve) => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (!tabs.length) {
        console.error("[PDF-Darkmode] [ERROR] No active tab found.");
        resolve(false);
        return;
      }

      const tab = tabs[0];

      // Check if the URL starts with 'chrome://'
      if (tab.url?.startsWith("chrome://")) {
        resolve(false);
        return;
      }

      chrome.scripting.executeScript(
        {
          target: { tabId: tab.id },
          func: () => {
            // Check for common PDF elements in the DOM
            return !!(
              document.querySelector("embed[type='application/pdf']") ||
              document.querySelector("iframe[src*='.pdf']") ||
              document.querySelector("pdf-viewer")
            );
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
            );
            resolve(false);
            return;
          }

          resolve(injectionResults[0].result);
        }
      );
    });
  });
}
