chrome.storage.local.get(["darkModeEnabled", "sepiaEnabled"], (result) => {
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

  let isDarkModeEnabled = result.darkModeEnabled || false
  let isSepiaEnabled = result.sepiaEnabled || false

  let darkModeStyle = document.getElementById("pdfDarkModeStyle")

  if (isDarkModeEnabled) {
    // Remove dark mode
    if (darkModeStyle) {
      darkModeStyle.remove()
    }
    chrome.storage.local.set({ darkModeEnabled: false })
  } else {
    // Apply dark mode
    if (!darkModeStyle) {
      darkModeStyle = document.createElement("style")
      darkModeStyle.id = "pdfDarkModeStyle"
      darkModeStyle.textContent = isSepiaEnabled
        ? STYLES["sepia"]
        : STYLES["invert"]
      document.head.appendChild(darkModeStyle)
    }
    chrome.storage.local.set({ darkModeEnabled: true })
  }
})