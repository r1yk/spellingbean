function injectScript(file_path, tag) {
  // Add the clickable icon that will open the side panel
  controls = document.querySelector(".sb-controls");

  beanbagIcon = document.createElement("img");
  beanbagIcon.setAttribute("src", chrome.runtime.getURL("bean.png"));
  beanbagIcon.setAttribute("height", 100);
  beanbagIcon.setAttribute("width", 100);
  beanbagIcon.setAttribute("style", "cursor: pointer");

  beanbagIcon.addEventListener("click", () => {
    window.postMessage({ type: "TOGGLE_BEAN" });
  });

  if (controls) {
    controls.prepend(beanbagIcon);
  }

  // Inject the script that will be able to read window.gameData and post it back to the extension
  var node = document.getElementsByTagName(tag)[0];
  var script = document.createElement("script");
  script.setAttribute("type", "text/javascript");
  script.setAttribute("src", file_path);
  node.appendChild(script);
}

injectScript(chrome.runtime.getURL("scripts/on-page-load.js"), "body");

// Forward window events to the extension via `chrome.runtime.sendMessage`
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
      chrome.runtime.sendMessage(JSON.parse(event.data.text));
    }
  },
  false
);
