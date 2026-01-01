// Content script that runs on all pages including PDF viewer
const CSS_SEPIA = `
  html, body {
    filter: invert(85%) sepia(10%) brightness(90%) contrast(85%) !important;
    background-color: #222 !important;
  }
`

const CSS_INVERT = `
  html, body {
    filter: invert(90%) hue-rotate(180deg) !important;
    background-color: #222 !important;
  }
`

const STYLE_ID = "pdfDarkModeStyle"

// Listen for messages from background script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "toggleDarkMode") {
    const { enabled, useSepia } = message
    const existingStyle = document.getElementById(STYLE_ID)

    if (enabled) {
      // Enable dark mode
      if (!existingStyle) {
        const style = document.createElement("style")
        style.id = STYLE_ID
        style.textContent = useSepia ? CSS_SEPIA : CSS_INVERT
        document.head.appendChild(style)
      }
    } else {
      // Disable dark mode
      if (existingStyle) {
        existingStyle.remove()
      }
    }

    sendResponse({ success: true })
  } else if (message.action === "updateSepia") {
    const { useSepia } = message
    const existingStyle = document.getElementById(STYLE_ID)

    if (existingStyle) {
      existingStyle.textContent = useSepia ? CSS_SEPIA : CSS_INVERT
    }

    sendResponse({ success: true })
  }

  return true
})
