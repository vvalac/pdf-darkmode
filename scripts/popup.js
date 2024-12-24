console.log("[DEBUG] popup.js is loaded!")

document.addEventListener("DOMContentLoaded", () => {
  console.log("[DEBUG] DOMContentLoaded event fired in popup.js")

  const toggleButton = document.getElementById("toggle-manual")

  if (toggleButton) {
    console.log("[DEBUG] Found toggle-manual button:", toggleButton)

    // Manual Toggle Button
    toggleButton.addEventListener("click", () => {
      console.log("[DEBUG] Toggle button clicked")

      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (chrome.runtime.lastError) {
          console.error(
            "[ERROR] chrome.tabs.query failed:",
            chrome.runtime.lastError.message
          )
          return
        }

        const activeTab = tabs[0]
        if (activeTab) {
          console.log("[DEBUG] Active tab:", activeTab)

          chrome.runtime.sendMessage(
            { action: "manualToggle", tabId: activeTab.id },
            (response) => {
              if (chrome.runtime.lastError) {
                console.error(
                  "[ERROR] Manual toggle failed:",
                  chrome.runtime.lastError.message
                )
              } else {
                console.log("[DEBUG] Response from background:", response)
              }
            }
          )
        } else {
          console.error("[ERROR] No active tab found")
        }
      })
    })
  } else {
    console.error("[ERROR] toggle-manual button not found")
  }
})
