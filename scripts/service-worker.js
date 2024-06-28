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
      spellingBeanPoints: wordsToPoints(submitted),
      spellingBeanTotalPoints: wordsToPoints(answers),
    });
  } else if (request.error) {
    const { spellingBeanEvilMode } = await chrome.storage.local.get({
      spellingBeanEvilMode: false,
    });
    if (spellingBeanEvilMode) {
      chrome.tabs.sendMessage(sender.tab.id, {
        punishMistake: true,
      });
    }
  }
});

function wordsToPoints(words) {
  let points = 0;
  words.forEach((word) => {
    points += word.length > 4 ? word.length : 1;
    // Add 7 extra points if a word is a pangram, meaning it will have all 7 letters present
    const letterSet = new Set();
    Array.from(word).forEach((letter) => letterSet.add(letter));
    if (letterSet.size === 7) {
      points += 7;
    }
  });
  return points;
}

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

async function getCustomRankName(nytRankName) {
  const { spellingBeanRankNames } = await chrome.storage.local.get({
    spellingBeanRankNames: {},
  });
  return spellingBeanRankNames[nytRankName.toLowerCase().replace(" ", "-")];
}
