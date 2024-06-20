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
  } else if (request.spellingBeanData) {
    // Clear out the current rank name to ensure that the onChanged listener will fire after
    await chrome.storage.session.set({
      spellingBeanCustomRank: null,
    });

    const { answers, submitted, puzzleDate, nytRankName } =
      request.spellingBeanData;

    await chrome.storage.session.set({
      spellingBeanAnswers: answers,
      spellingBeanSubmitted: submitted,
      spellingBeanPuzzleDate: puzzleDate,
      spellingBeanRevealed: false,
      spellingBeanCustomRank: await getCustomRankName(nytRankName),
    });
  }
});

chrome.storage.session.onChanged.addListener(async (changes, areaName) => {
  const { spellingBeanCustomRank } = changes;
  if (spellingBeanCustomRank?.newValue) {
    const { spellingBeanRankNames } = await chrome.storage.local.get({
      spellingBeanRankNames: {},
    });

    const [tab] = await chrome.tabs.query({
      active: true,
      lastFocusedWindow: true,
    });
    chrome.tabs.sendMessage(tab.id, {
      updateRankName: spellingBeanCustomRank.newValue,
      allRankNames: spellingBeanRankNames,
    });
  }
});

// Listen for state updates so that the list of submitted words can be kept current
chrome.webRequest.onBeforeRequest.addListener(
  async (details) => {
    const intarray = new Int8Array(details.requestBody.raw[0].bytes);
    const utf8decoder = new TextDecoder();
    puzzleJson = JSON.parse(utf8decoder.decode(intarray));

    // Use spellingBeanPuzzleDate to make sure we can ignore requests that are actually related to other puzzle dates(?) Why you do this NYT
    const { spellingBeanPuzzleDate } = await chrome.storage.session.get({
      spellingBeanPuzzleDate: "",
    });

    if (
      puzzleJson.game === "spelling_bee" &&
      puzzleJson.print_date === spellingBeanPuzzleDate
    ) {
      await chrome.storage.session.set({
        spellingBeanSubmitted: puzzleJson.game_data.answers,
        spellingBeanCustomRank: await getCustomRankName(
          puzzleJson.game_data.rank
        ),
      });
    }
  },
  {
    urls: ["https://www.nytimes.com/svc/games/state"],
  },
  ["requestBody"]
);

async function getCustomRankName(nytRankName) {
  const { spellingBeanRankNames } = await chrome.storage.local.get({
    spellingBeanRankNames: {},
  });
  return spellingBeanRankNames[nytRankName.toLowerCase().replace(" ", "-")];
}

function getCurrentRankName() {
  const nytElement = document.querySelector(".sb-progress-rank");
  if (nytElement?.innerText) {
    return nytElement.innerText.toLowerCase().replace(" ", "-");
  }
  return null;
}
