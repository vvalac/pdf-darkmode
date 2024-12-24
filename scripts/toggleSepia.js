chrome.storage.local.get(["sepiaEnabled", "darkModeEnabled"], (result) => {
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

  let isSepiaEnabled = result.sepiaEnabled || false
  let isDarkModeEnabled = result.darkModeEnabled || false

  // Look for an existing dark mode style tag
  let darkModeStyle = document.getElementById("pdfDarkModeStyle")

  // Apply the appropriate style
  if (isDarkModeEnabled) {
    darkModeStyle.textContent = isSepiaEnabled
      ? STYLES["sepia"] // Apply sepia style if sepiaEnabled is true
      : STYLES["invert"] // Fallback to dark mode (invert) if sepia is disabled
  }
})
