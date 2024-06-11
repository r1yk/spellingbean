function onPageLoadComplete(details) {
  console.log("LOADED", details.url);
}

chrome.webNavigation.onCompleted.addListener(onPageLoadComplete, {
  url: [{ urlEquals: "https://www.nytimes.com/puzzles/spelling-bee" }],
});
