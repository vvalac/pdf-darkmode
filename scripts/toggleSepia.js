chrome.storage.local.get(["sepiaEnabled", "currentTabId"], (result) => {
  if (!result.currentTabId) {
    console.error("[PDF-Darkmode] [ERROR] No currentTabId in storage")
    return
  }

  const STYLES = {
    sepia: `
      html {
        filter: invert(85%) sepia(10%) brightness(90%) contrast(85%) !important;
        background-color: #222 !important;
      }
    `,
    invert: `
      html {
        filter: invert(90%) hue-rotate(180deg) !important;
        background-color: #222 !important;
      }
    `,
  }

  const darkModeStyle = document.getElementById("pdfDarkModeStyle")
  const tabId = result.currentTabId

  if (!darkModeStyle) {
    // Dark mode is not enabled, nothing to update
    return
  }

  try {
    darkModeStyle.textContent = result.sepiaEnabled
      ? STYLES.sepia
      : STYLES.invert

    chrome.runtime.sendMessage({
      action: "updateSepia",
      tabId,
      sepia: result.sepiaEnabled,
    })
  } catch (err) {
    console.error("[PDF-Darkmode] [ERROR] Failed to update sepia mode:", err)
  }
})
