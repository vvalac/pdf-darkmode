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
  const currentTab = await getCurrentTabId() // Await the tab ID

  await updateUI(currentTab) // Pass currentTab to updateUI

  toggleButton.addEventListener("click", async () => {
    const darkMode = await isDarkModeEnabled(currentTab)

    await setDarkModeEnabled(currentTab, !darkMode)
    await sendMessageToBackground("manualToggle", currentTab, {
      darkMode: !darkMode,
    })

    await updateUI(currentTab)
  })

  sepiaButton.addEventListener("change", async (e) => {
    const isChecked = e.target.checked

    await chrome.storage.local.set({ sepiaEnabled: isChecked })
    await sendMessageToBackground("updateSepia", currentTab, {
      sepia: isChecked,
    })

    await updateUI(currentTab)
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
  sepiaButton.disabled = false

  toggleButton.textContent = isDark ? "Disable Dark Mode" : "Enable Dark Mode"
  sepiaButton.checked = isSepia
}
