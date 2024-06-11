/**
 * injectScript - Inject internal script to available access to the `window`
 *
 * @param  {type} file_path Local path of the internal script.
 * @param  {type} tag The tag as string, where the script will be append (default: 'body').
 * @see    {@link http://stackoverflow.com/questions/20499994/access-window-variable-from-content-script}
 */
function injectScript(file_path, tag) {
  // Add the
  header = document.getElementById("portal-game-header");

  beanbagContainer = document.createElement("div");
  beanbagContainer.setAttribute("id", "spelling-bean-container");
  beanbagContainer.setAttribute("class", "hive-action");
  beanbagContainer.setAttribute("style", "margin-left: auto");

  beanbagIcon = document.createElement("img");
  beanbagIcon.setAttribute("src", chrome.runtime.getURL("bean.png"));
  beanbagContainer.appendChild(beanbagIcon);

  if (header) {
    header.appendChild(beanbagContainer);
  }

  // Inject the script that will be able to read window.gameData, and post it back to the extension
  var node = document.getElementsByTagName(tag)[0];
  var script = document.createElement("script");
  script.setAttribute("type", "text/javascript");
  script.setAttribute("src", file_path);
  node.appendChild(script);
}

injectScript(chrome.runtime.getURL("scripts/on-page-load.js"), "body");
