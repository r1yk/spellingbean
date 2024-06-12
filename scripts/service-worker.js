chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request === "TOGGLE_BEAN") {
    chrome.sidePanel.open({ tabId: sender.tab.id });
    chrome.sidePanel.setOptions({
      tabId: sender.tab.id,
      path: "pages/sidepanel.html",
      enabled: true,
    });
  }
  if (request.gameData) {
    console.log("GAME DATA", request);
  }
});
