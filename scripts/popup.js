document.addEventListener("DOMContentLoaded", () => {
  const toggleButton = document.getElementById("toggle-darkmode")
  const sepiaButton = document.getElementById("sepia-toggle")

  // Load Sepia State from Storage on Startup
  chrome.storage.local.get("sepiaEnabled", (data) => {
    const isEnabled = data.sepiaEnabled || false // Correct key here
    sepiaButton.checked = isEnabled // Set checkbox state
    document.body.classList.toggle("sepia-mode", isEnabled) // Toggle CSS class
    console.log(`Sepia enabled? ${isEnabled}`)
  })

  // Update Storage When Checkbox Changes
  sepiaButton.addEventListener("change", (e) => {
    const isChecked = e.target.checked
    chrome.storage.local.set({ sepiaEnabled: isChecked }, () => {
      console.log(`Sepia mode is now ${isChecked ? "enabled" : "disabled"}`)
    })
    document.body.classList.toggle("sepia-mode", isChecked) // Apply immediately
  })

  // Handle Dark Mode Toggle Button
  toggleButton.addEventListener("click", () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (chrome.runtime.lastError) {
        console.error(
          "[PDF-Darkmode] [ERROR] chrome.tabs.query failed:",
          chrome.runtime.lastError.message
        )
        return
      }

      const activeTab = tabs[0]

      if (!activeTab) {
        console.error("[PDF-Darkmode] [ERROR] No active tab found")
        return
      }

      // Get the current Sepia state to pass it in the message
      const isSepia = sepiaButton.checked

      chrome.runtime.sendMessage(
        { action: "manualToggle", tabId: activeTab.id, sepia: isSepia },
        (response) => {
          if (chrome.runtime.lastError) {
            console.error(
              "[PDF-Darkmode] [ERROR] Manual toggle failed:",
              chrome.runtime.lastError.message
            )
          } else {
            console.log("[DEBUG] Response from background:", response)
          }
        }
      )
    })
  })
})
