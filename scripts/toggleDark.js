// toggleDark.js
chrome.storage.local.get(["sepiaEnabled", "currentTabId"], (result) => {
  if (!result.currentTabId) {
    console.error("[PDF-Darkmode] [ERROR] No currentTabId in storage")
    return
  }

  const STYLES = {
    sepia: `
      html, body {
        background-color: #222 !important;
      }

      embed[type*="pdf" i],
      object[type*="pdf" i],
      iframe[src*=".pdf" i],
      pdf-viewer,
      html:not(:has(embed[type*="pdf" i], object[type*="pdf" i], iframe[src*=".pdf" i], pdf-viewer)) {
        filter: invert(85%) sepia(10%) brightness(90%) contrast(85%) !important;
        background-color: #222 !important;
      }
    `,
    invert: `
      html, body {
        background-color: #222 !important;
      }

      embed[type*="pdf" i],
      object[type*="pdf" i],
      iframe[src*=".pdf" i],
      pdf-viewer,
      html:not(:has(embed[type*="pdf" i], object[type*="pdf" i], iframe[src*=".pdf" i], pdf-viewer)) {
        filter: invert(90%) hue-rotate(180deg) !important;
        background-color: #222 !important;
      }
    `,
  }

  const tabId = result.currentTabId
  const darkModeStyle = document.getElementById("pdfDarkModeStyle")
  const newState = !darkModeStyle

  try {
    if (darkModeStyle) {
      darkModeStyle.remove()
    } else {
      const newStyle = document.createElement("style")
      newStyle.id = "pdfDarkModeStyle"
      newStyle.textContent = result.sepiaEnabled ? STYLES.sepia : STYLES.invert
      document.head.appendChild(newStyle)
    }

    // Send state update to background
    chrome.runtime.sendMessage({
      action: "updateDarkMode",
      tabId,
      darkModeEnabled: newState,
    })
  } catch (err) {
    console.error("[PDF-Darkmode] [ERROR] Failed to toggle dark mode:", err)
  }
})
