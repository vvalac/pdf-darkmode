document.addEventListener("DOMContentLoaded", () => {
  const toggleButton = document.getElementById("toggle-darkmode")
  const sepiaButton = document.getElementById("sepia-toggle")

  // Function to send messages to the background script
  function sendMessageToBackground(action, extraData = {}) {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (!tabs.length) {
        console.error("[PDF-Darkmode] [ERROR] No active tab found");
        return
      }

      chrome.runtime.sendMessage({ action, tabId: tabs[0].id, ...extraData })
    })
  }

  // Function to update button text based on state
  function updateToggleButtonText(isDarkModeEnabled) {
    toggleButton.textContent = isDarkModeEnabled
      ? "Disable Dark Mode"
      : "Enable Dark Mode"
    toggleButton.dataset.state = isDarkModeEnabled ? "enabled" : "disabled"
  }

  // Load State on Startup
  chrome.storage.local.get(["darkModeEnabled", "sepiaEnabled"], (data) => {
    const isDarkModeEnabled = data.darkModeEnabled || false
    const isSepiaEnabled = data.sepiaEnabled || false

    sepiaButton.checked = isSepiaEnabled
    updateToggleButtonText(isDarkModeEnabled)

  })

  // Sepia Toggle Handler
  sepiaButton.addEventListener("change", (e) => {
    const isChecked = e.target.checked;
    chrome.storage.local.set({ sepiaEnabled: isChecked }, () => {})

    sendMessageToBackground("updateSepia", { sepia: isChecked })
  })

  // Dark Mode Toggle Handler
  toggleButton.addEventListener("click", () => {
    const isChecked = sepiaButton.checked

    sendMessageToBackground("manualToggle", { sepia: isChecked })

    // Update UI immediately for responsiveness
    chrome.storage.local.get(["darkModeEnabled"], (data) => {
      const isDarkModeEnabled = data.darkModeEnabled || false
      updateToggleButtonText(!isDarkModeEnabled)
    })
  })
})
