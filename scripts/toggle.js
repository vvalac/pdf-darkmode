console.log("[DEBUG] toggle.js loaded on tab")

// Check dark mode state
chrome.storage.local.get(["darkModeEnabled"], (result) => {
  let isDarkModeEnabled = result.darkModeEnabled || false
  console.log(`[DEBUG] Current dark mode state: ${isDarkModeEnabled}`)

  // Detect if PDF is loaded in an embed or iframe
  let pdfEmbed = document.querySelector(
    "embed[type='application/pdf'], iframe[src*='.pdf']"
  )

  if (pdfEmbed) {
    console.log("[DEBUG] PDF embed or iframe detected")

    if (isDarkModeEnabled) {
      // Remove dark mode CSS
      let darkStyle = document.getElementById("pdfDarkModeStyle")
      if (darkStyle) {
        darkStyle.remove()
        console.log("[DEBUG] Dark mode CSS removed from PDF")
      }
      chrome.storage.local.set({ darkModeEnabled: false }, () => {
        console.log("[DEBUG] Dark mode state set to false")
      })
    } else {
      // Apply dark mode CSS specifically to PDF content
      let darkStyle = document.createElement("style")
      darkStyle.id = "pdfDarkModeStyle"
      darkStyle.textContent = `
                embed[type='application/pdf'], iframe[src*='.pdf'] {
                    filter: invert(90%) hue-rotate(180deg);
                }

                /* Fix colors on images and other elements */
                embed[type='application/pdf'] img,
                iframe[src*='.pdf'] img {
                    filter: invert(90%) hue-rotate(180deg);
                }
            `
      document.head.appendChild(darkStyle)
      console.log("[DEBUG] Dark mode CSS applied to PDF")
      chrome.storage.local.set({ darkModeEnabled: true }, () => {
        console.log("[DEBUG] Dark mode state set to true")
      })
    }
  } else if (document.body) {
    console.log(
      "[DEBUG] No PDF embed/iframe detected, applying fallback overlay"
    )

    let darkOverlay = document.getElementById("darkModeOverlay")

    if (isDarkModeEnabled) {
      if (darkOverlay) {
        darkOverlay.remove()
        console.log("[DEBUG] Dark mode overlay removed")
      }
      chrome.storage.local.set({ darkModeEnabled: false }, () => {
        console.log("[DEBUG] Dark mode state set to false")
      })
    } else {
      if (!darkOverlay) {
        darkOverlay = document.createElement("div")
        darkOverlay.id = "darkModeOverlay"
        darkOverlay.style.cssText = `
                    position: fixed;
                    pointer-events: none;
                    top: 0;
                    left: 0;
                    width: 100vw;
                    height: 100vh;
                    background-color: #222;
                    mix-blend-mode: difference;
                    z-index: 999999;
                `
        document.body.appendChild(darkOverlay)
        console.log("[DEBUG] Dark mode overlay added to body")
      }
      chrome.storage.local.set({ darkModeEnabled: true }, () => {
        console.log("[DEBUG] Dark mode state set to true")
      })
    }
  } else {
    console.warn("[WARN] No PDF-compatible elements detected.")
  }
})
