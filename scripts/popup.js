document.addEventListener("DOMContentLoaded", () => {
  const toggleButton = document.getElementById("toggle-darkmode")
  const sepiaButton = document.getElementById("sepia-toggle")

  // Function to send messages to the background script
  function sendMessageToBackground(action, extraData = {}) {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (!tabs.length) {
        console.error("[PDF-Darkmode] [ERROR] No active tab found")
        return
      }

      chrome.runtime.sendMessage({ action, tabId: tabs[0].id, ...extraData })
    })
  }

  // Load State on Startup
  chrome.storage.local.get(["darkModeEnabled", "sepiaEnabled"], (data) => {
    const isDarkModeEnabled = data.darkModeEnabled || false
    const isSepiaEnabled = data.sepiaEnabled || false

    sepiaButton.checked = isSepiaEnabled
    toggleButton.dataset.state = isDarkModeEnabled ? "enabled" : "disabled"

    console.log(
      `Dark Mode: ${isDarkModeEnabled}, Sepia Mode: ${isSepiaEnabled}`
    )
  })

  // Sepia Toggle Handler
  sepiaButton.addEventListener("change", (e) => {
    const isChecked = e.target.checked
    chrome.storage.local.set({ sepiaEnabled: isChecked }, () => {
      console.log(`Sepia mode is now ${isChecked ? "enabled" : "disabled"}`)
    })

    sendMessageToBackground("updateSepia", { sepia: isChecked })
  })

  // Dark Mode Toggle Handler
  toggleButton.addEventListener("click", () => {
    const isChecked = sepiaButton.checked
    sendMessageToBackground("manualToggle", { sepia: isChecked })
  })
})
