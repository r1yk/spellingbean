let customRankNames = null;

function injectScript(file_path, tag) {
  // Inject the script that will be able to read window.gameData and post it back to the extension
  var node = document.getElementsByTagName(tag)[0];
  var script = document.createElement("script");
  script.setAttribute("type", "text/javascript");
  script.setAttribute("src", file_path);
  node.appendChild(script);
}

// Forward window events to the extension via `chrome.runtime.sendMessage`
window.addEventListener(
  "message",
  async (event) => {
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

function replaceRankNameElement() {
  const nytElement = document.querySelector(
    '.sb-progress-rank[data-testid="sb-progress-rank"]'
  );
  if (nytElement) {
    const container = nytElement.parentElement;
    // Hide the official NYT rank name, but don't delete it.
    nytElement.setAttribute("style", "display: none;");

    // Add a look-a-like element that only Spelling Bean will update
    const newElement = document.createElement("h4");
    newElement.classList.add("sb-progress-rank", "spellingbean-progress-rank");
    container.prepend(newElement);
  }
}

function updateRankName(rankName, allRankNames) {
  if (rankName) {
    document
      .querySelectorAll(".spellingbean-progress-rank")
      .forEach((rankElement) => (rankElement.innerText = rankName));
  }
  if (allRankNames) {
    customRankNames = allRankNames;
  }
}

chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
  if (request.updateRankName) {
    updateRankName(request.updateRankName, request.allRankNames);
  } else if (request.punishMistake) {
    // Replace a letter with a grinning cat, tough luck!
    const hiveLetters = Array.from(
      document.querySelectorAll(".hive-cell.outer text")
    ).filter((letter) => letter.textContent != "😸");

    if (hiveLetters.length) {
      const randomIndex = getRandomInt(hiveLetters.length);
      hiveLetters[randomIndex].textContent = "😸";
    }
  }
});

// Use this function as a listener that will update custom rank names when the NYT rank modal opens
function replaceAllRankNames(mutationRecords, mutationObserver) {
  mutationRecords.forEach((record) => {
    if (record.attributeName === "class") {
      const modalSystem = document.querySelector(".sb-modal-system");
      if (customRankNames && modalSystem.classList.contains("sb-modal-open")) {
        const titles = modalSystem.querySelectorAll(
          ".sb-modal-ranks__rank-title"
        );
        titles.forEach((title) => {
          const isCurrentRank = title.childElementCount > 0;
          const elementToModify = isCurrentRank
            ? title.querySelector("span.current-rank")
            : title;
          const titleKey = elementToModify.innerText
            .toLowerCase()
            .replace(" ", "-");
          const customRankName = customRankNames[titleKey];
          if (customRankName) {
            elementToModify.innerText = customRankName;
          }

          // Replace the reference to "Genius" in the current rank description
          if (isCurrentRank && customRankNames.genius) {
            const subtext = title.querySelector(".sub-text");
            subtext.innerText = subtext.innerText.replace(
              "Genius",
              customRankNames.genius
            );
          }
        });
      }
    }
  });
}

const nytModalSystem = document.querySelector(".sb-modal-system");
const modalObserver = new MutationObserver(replaceAllRankNames);

modalObserver.observe(nytModalSystem, {
  attributes: true,
});

// Listen to updates to the message box so things like bad entries can be detected
function captureNytMessage(mutationRecords, mutationObserver) {
  mutationRecords.forEach((record) => {
    if (record.attributeName === "class") {
      const messageBox = document.querySelector(".sb-message-box");
      if (messageBox.classList.contains("error-message")) {
        chrome.runtime.sendMessage({
          error: messageBox.innerText,
        });
      }
    }
  });
}

function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}

const nytMessageBox = document.querySelector(".sb-message-box");
const messageObserver = new MutationObserver(captureNytMessage);

messageObserver.observe(nytMessageBox, {
  attributes: true,
});

function getSubmittedAnswers() {
  const alreadySubmittedElements = document.querySelectorAll(
    "ul.sb-wordlist-items-pag li"
  );
  return Array.from(alreadySubmittedElements).map((element) =>
    element.innerText.toLowerCase()
  );
}

function getCurrentPointTotal() {
  const pointElement = document.querySelector("span.sb-progress-value");
  if (pointElement) {
    return Number(pointElement.innerText);
  }
  return 0;
}

function getCurrentRankName() {
  const nytElement = document.querySelector(
    '.sb-progress-rank[data-testid="sb-progress-rank"]'
  );
  if (nytElement) {
    return nytElement.innerText.toLowerCase().replace(" ", "-");
  }
  return null;
}

function sendSubmittedAnswers(mutationRecords, mutationObserver) {
  chrome.runtime.sendMessage({
    spellingBeanSubmitted: getSubmittedAnswers(),
    spellingBeanPoints: getCurrentPointTotal(),
    nytCurrentRankName: getCurrentRankName(),
  });
}

const nytSubmittedAnswers = document.querySelector("ul.sb-wordlist-items-pag");
const submittedAnswersObserver = new MutationObserver(sendSubmittedAnswers);

submittedAnswersObserver.observe(nytSubmittedAnswers, {
  childList: true,
});

// Add the clickable icon that will open the side panel
controls = document.querySelector(".sb-controls");

beanbagIcon = document.createElement("img");
beanbagIcon.setAttribute("src", chrome.runtime.getURL("public/bean.png"));
beanbagIcon.setAttribute("height", 100);
beanbagIcon.setAttribute("width", 100);
beanbagIcon.setAttribute("style", "cursor: pointer");

beanbagIcon.addEventListener("click", () => {
  window.postMessage({ type: "TOGGLE_BEAN" });
});

if (controls) {
  controls.prepend(beanbagIcon);
}

injectScript(chrome.runtime.getURL("scripts/on-page-load.js"), "body");
replaceRankNameElement();
