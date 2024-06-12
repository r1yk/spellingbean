const SPELLING_BEE = "https://www.nytimes.com/puzzles/spelling-bee";

// Only side panel when a tab turns out to be Spelling Bee:
chrome.tabs.onUpdated.addListener(async (tabId, info, tab) => {
  if (!tab.url) return;

  if (tab.url === SPELLING_BEE) {
    await chrome.sidePanel.setOptions({
      tabId,
      path: "pages/sidepanel.html",
      enabled: true,
    });
  }
});

// Disable side panel for all other tabs
chrome.tabs.onActivated.addListener(async ({ tabId }) => {
  tab = await chrome.tabs.get(tabId);
  if (tab?.url !== SPELLING_BEE) {
    await chrome.sidePanel.setOptions({
      tabId,
      path: "pages/sidepanel.html",
      enabled: false,
    });
  }
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request === "TOGGLE_BEAN") {
    chrome.sidePanel.open({ tabId: sender.tab.id });
  }
  if (request.gameData) {
    console.log("GAME DATA", request);
  }
});
