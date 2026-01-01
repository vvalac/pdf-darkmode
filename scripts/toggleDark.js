// toggleDark.js
chrome.storage.local.get(["sepiaEnabled", "currentTabId"], async (result) => {
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

  const tabId = result.currentTabId
  const darkModeStyle = document.getElementById("pdfDarkModeStyle")
  const newState = !darkModeStyle

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
})
