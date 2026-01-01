import {
  sendMessageToBackground,
  isDarkModeEnabled,
  setDarkModeEnabled,
  isSepiaEnabled,
  checkIfPdfLoaded,
  getCurrentTabId,
} from "./utils.js"

document.addEventListener("DOMContentLoaded", async () => {
  const toggleButton = document.getElementById("toggle-darkmode")
  const sepiaButton = document.getElementById("sepia-toggle")
  const currentTab = await getCurrentTabId()

  await updateUI(currentTab)

  chrome.storage.onChanged.addListener(async (changes) => {
    await updateUI(currentTab)
  })

  toggleButton.addEventListener("click", async () => {
    try {
      const darkMode = await isDarkModeEnabled(currentTab)

      await setDarkModeEnabled(currentTab, !darkMode)
      const response = await sendMessageToBackground("manualToggle", {
        tabId: currentTab,
      })

      if (response && response.status === "Dark mode toggled.") {
        await new Promise((resolve) => setTimeout(resolve, 100))
        await updateUI(currentTab)
      } else {
        console.error(
          "[PDF-Darkmode] [ERROR] Failed to toggle:",
          response?.error
        )
        toggleButton.textContent = "Error - Try Again"
        setTimeout(() => updateUI(currentTab), 2000)
      }
    } catch (err) {
      console.error("[PDF-Darkmode] [ERROR] Toggle failed:", err)
      toggleButton.textContent = "Error - Try Again"
      setTimeout(() => updateUI(currentTab), 2000)
    }
  })

  sepiaButton.addEventListener("change", async (e) => {
    try {
      const isChecked = e.target.checked

      await chrome.storage.local.set({ sepiaEnabled: isChecked })
      const response = await sendMessageToBackground("updateSepia", {
        tabId: currentTab,
        sepia: isChecked,
      })

      if (response && response.status === "Sepia mode toggled.") {
        await new Promise((resolve) => setTimeout(resolve, 100))
        await updateUI(currentTab)
      } else {
        console.error(
          "[PDF-Darkmode] [ERROR] Failed to toggle sepia:",
          response?.error
        )
      }
    } catch (err) {
      console.error("[PDF-Darkmode] [ERROR] Sepia toggle failed:", err)
    }
  })
})

async function updateUI(currentTab) {
  const isPdf = await checkIfPdfLoaded(currentTab)
  const isDark = await isDarkModeEnabled(currentTab)
  const isSepia = await isSepiaEnabled()

  const toggleButton = document.getElementById("toggle-darkmode")
  const sepiaButton = document.getElementById("sepia-toggle")

  if (!isPdf) {
    toggleButton.disabled = true
    toggleButton.textContent = "No PDF Found"
    sepiaButton.disabled = true
    sepiaButton.checked = await isSepiaEnabled()
    return
  }

  toggleButton.disabled = false
  toggleButton.textContent = isDark ? "Disable Dark Mode" : "Enable Dark Mode"
  sepiaButton.disabled = false
  sepiaButton.checked = isSepia
}
