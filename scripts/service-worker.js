const SPELLING_BEE = "https://www.nytimes.com/puzzles/spelling-bee";

// Only enable side panel when a tab turns out to be Spelling Bee:
chrome.tabs.onUpdated.addListener(async (tabId, info, tab) => {
  if (!tab.url) return;

  if (tab.url.startsWith(SPELLING_BEE)) {
    await chrome.sidePanel.setOptions({
      tabId,
      path: "pages/sidepanel.html",
      enabled: true,
    });
  } else {
    await chrome.sidePanel.setOptions({
      tabId,
      path: "pages/sidepanel.html",
      enabled: false,
    });
  }
});

// Disable side panel for all other tabs
chrome.tabs.onActivated.addListener(async ({ tabId }) => {
  tab = await chrome.tabs.get(tabId);
  if (tab.url && !tab.url.startsWith(SPELLING_BEE)) {
    await chrome.sidePanel.setOptions({
      tabId,
      path: "pages/sidepanel.html",
      enabled: false,
    });
  }
});

// Handle messages coming from the host page, including:
//   - Clicks on the beanbag to open the side panel
//   - Receiving the game data upon page load
chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
  if (request === "TOGGLE_BEAN") {
    await chrome.sidePanel.open({ tabId: sender.tab.id });
  }
  if (request.spellingBeanData) {
    await chrome.storage.session.set({
      spellingBeanAnswers: request.spellingBeanData.answers,
      spellingBeanSubmitted: request.spellingBeanData.submitted,
    });
  }
});

// Listen for state updates so that the list of submitted words can be kept current
chrome.webRequest.onBeforeRequest.addListener(
  (details) => {
    const intarray = new Int8Array(details.requestBody.raw[0].bytes);
    const utf8decoder = new TextDecoder();
    console.log(JSON.parse(utf8decoder.decode(intarray)));
  },
  {
    urls: ["https://www.nytimes.com/svc/games/state"],
  },
  ["requestBody"]
);
