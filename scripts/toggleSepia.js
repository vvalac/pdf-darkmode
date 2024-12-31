chrome.storage.local.get(["sepiaEnabled", "currentTabId"], (result) => {
  const STYLES = {
    sepia: `
        embed[type='application/pdf'], iframe[src*='.pdf'] {
          filter: invert(85%) sepia(10%) brightness(90%) contrast(85%) !important;
          background-color: #222 !important;
        }
        embed[type='application/pdf'] img, iframe[src*='.pdf'] img {
          filter: invert(100%) !important;
        }
      `,
    invert: `
        embed[type='application/pdf'], iframe[src*='.pdf'] {
          filter: invert(90%) hue-rotate(180deg) !important;
          background-color: #222 !important;
        }
      `,
  }

  const darkModeStyle = document.getElementById("pdfDarkModeStyle")
  const isSepiaEnabled = result.sepiaEnabled || false
  const tabId = result.currentTabId

  if (darkModeStyle) {
    // Update style based on sepia preference
    darkModeStyle.textContent = isSepiaEnabled ? STYLES.sepia : STYLES.invert
  }

  // Update global sepiaEnabled state
  chrome.storage.local.set({ sepiaEnabled: isSepiaEnabled })
})
