function injectScript(file_path, tag) {
  // Add the clickable icon that will open the side panel
  header = document.getElementById("portal-game-header");

  beanbagContainer = document.createElement("div");
  beanbagContainer.setAttribute("id", "spelling-bean-container");
  beanbagContainer.setAttribute("class", "hive-action");
  beanbagContainer.setAttribute("style", "margin-left: auto");

  beanbagIcon = document.createElement("img");
  beanbagIcon.setAttribute("src", chrome.runtime.getURL("bean.png"));
  beanbagContainer.appendChild(beanbagIcon);
  beanbagContainer.addEventListener("click", () => {
    window.postMessage({ type: "TOGGLE_BEAN" });
  });

  if (header) {
    header.appendChild(beanbagContainer);
  }

  // Inject the script that will be able to read window.gameData and post it back to the extension
  var node = document.getElementsByTagName(tag)[0];
  var script = document.createElement("script");
  script.setAttribute("type", "text/javascript");
  script.setAttribute("src", file_path);
  node.appendChild(script);
}

injectScript(chrome.runtime.getURL("scripts/on-page-load.js"), "body");

// var port = chrome.runtime.connect();

window.addEventListener(
  "message",
  (event) => {
    // We only accept messages from ourselves
    if (event.source !== window) {
      return;
    }

    if (event.data.type && event.data.type === "TOGGLE_BEAN") {
      chrome.runtime.sendMessage("TOGGLE_BEAN");
    } else if (event.data.type && event.data.type === "GAME_DATA") {
      chrome.runtime.sendMessage({ gameData: JSON.parse(event.data.text) });
    }
  },
  false
);
