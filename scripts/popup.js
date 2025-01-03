import {
  sendMessageToBackground,
  isDarkModeEnabled,
  setDarkModeEnabled,
  isSepiaEnabled,
  checkIfPdfLoaded,
} from "./utils.js"

document.addEventListener("DOMContentLoaded", () => {
  const toggleButton = document.getElementById("toggle-darkmode")
  const sepiaButton = document.getElementById("sepia-toggle")

  updateUI()

  async function updateUI() {
    const isPdf = await checkIfPdfLoaded()
    if (!isPdf) {
      toggleButton.disabled = true
      toggleButton.textContent = "No PDF Found"
      sepiaButton.disabled = true
      return
    }

    chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
      const tabId = tabs[0]?.id
      const darkMode = await isDarkModeEnabled(tabId)
      const sepiaMode = await isSepiaEnabled()

      toggleButton.disabled = false
      sepiaButton.disabled = false

      toggleButton.textContent = darkMode
        ? "Disable Dark Mode"
        : "Enable Dark Mode"
      sepiaButton.checked = sepiaMode
    })
  }

  toggleButton.addEventListener("click", async () => {
    chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
      const tabId = tabs[0]?.id
      const darkMode = await isDarkModeEnabled(tabId)

      await setDarkModeEnabled(tabId, !darkMode)
      await sendMessageToBackground("manualToggle", {
        darkMode: !darkMode,
      })

      updateUI()
    })
  })

  sepiaButton.addEventListener("change", async (e) => {
    const isChecked = e.target.checked

    await chrome.storage.local.set({ sepiaEnabled: isChecked })
    await sendMessageToBackground("updateSepia", { sepia: isChecked })

    updateUI()
  })
})
