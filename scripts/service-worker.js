// function hostOnPageLoadComplete() {
//   header = document.getElementById("portal-game-header");

//   beanbag = document.createElement("div");
//   beanbag.setAttribute("class", "pz-byline sb-touch-button");
//   beanbag.innerText = "Spelling Bean";

//   header.appendChild(beanbag);

//   // script = document.createElement("script");
//   // script.setAttribute("type", "text/javascript");
//   // script.innerText = "console.log(window.gameData)";
//   // header.appendChild(script);
// }

// function onPageLoadComplete(details) {
//   console.log("LOADED", details.url);
//   chrome.scripting.executeScript({
//     target: {
//       tabId: details.tabId,
//     },
//     func: hostOnPageLoadComplete,
//   });
// }

// chrome.webNavigation.onCompleted.addListener(onPageLoadComplete, {
//   url: [{ urlEquals: "https://www.nytimes.com/puzzles/spelling-bee" }],
// });
