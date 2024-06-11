chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request === "TOGGLE_BEAN") {
    console.log("TOGGLE");
  }
  if (request.gameData) {
    console.log("GAME DATA", request);
  }
});
