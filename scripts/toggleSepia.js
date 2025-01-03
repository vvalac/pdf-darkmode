chrome.storage.local.get(["sepiaEnabled", "currentTabId"], async (result) => {
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
  if (!darkModeStyle) {
    return // Exit if dark mode isn't enabled
  }

  try {
    // Update style first
    darkModeStyle.textContent = result.sepiaEnabled
      ? STYLES.sepia
      : STYLES.invert
  } catch (err) {
    console.error("[PDF-Darkmode] Failed to update sepia mode:", err)
  }
})
