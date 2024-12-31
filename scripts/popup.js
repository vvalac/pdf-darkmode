import {
  sendMessageToBackground,
  isDarkModeEnabled,
  isSepiaEnabled,
  checkIfPdfLoaded,
} from "./utils.js";

document.addEventListener("DOMContentLoaded", () => {
  const toggleButton = document.getElementById("toggle-darkmode");
  const sepiaButton = document.getElementById("sepia-toggle");

  // Initialize UI State
  updateUI();

  async function updateUI() {
    const isPdf = await checkIfPdfLoaded();
    const darkMode = await isDarkModeEnabled();
    const sepiaMode = await isSepiaEnabled();

    if (!isPdf) {
      toggleButton.disabled = true;
      toggleButton.textContent = "No PDF Found";
      sepiaButton.disabled = true;
      return;
    }

    toggleButton.disabled = false;
    sepiaButton.disabled = false;

    toggleButton.textContent = darkMode
      ? "Disable Dark Mode"
      : "Enable Dark Mode";
    sepiaButton.checked = sepiaMode;
  }

  // Toggle Dark Mode Handler
  toggleButton.addEventListener("click", async () => {
    const darkMode = await isDarkModeEnabled();
    await chrome.storage.local.set({ darkModeEnabled: !darkMode });
    await sendMessageToBackground("manualToggle", { darkMode: !darkMode });
    updateUI();
  });

  // Toggle Sepia Handler
  sepiaButton.addEventListener("change", async (e) => {
    const isChecked = e.target.checked;
    await chrome.storage.local.set({ sepiaEnabled: isChecked });
    await sendMessageToBackground("updateSepia", { sepia: isChecked });
    updateUI();
  });
});
