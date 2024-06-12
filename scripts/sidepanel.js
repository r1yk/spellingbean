console.log("SIDE PANEL JS");

async function renderHintsAndAnswers() {
  const { spellingBeanAnswers, spellingBeanSubmitted } =
    await chrome.storage.session.get([
      "spellingBeanAnswers",
      "spellingBeanSubmitted",
    ]);

  renderHints(spellingBeanAnswers, spellingBeanSubmitted);
  renderAnswers(spellingBeanAnswers, spellingBeanSubmitted);
}

function renderHints(answers, submitted) {
  const answersSummary = getWordsSummary(answers);
  const submittedSummary = getWordsSummary(submitted);
}

function renderAnswers(answers, submitted) {
  const answersTableMissing = document.getElementById("answers-table-missing");
  const answersTable = document.getElementById("answers-table");

  const rowsMissing = [];
  const rowsAll = [];

  answers.forEach((answer) => {
    row = document.createElement("tr");
    answerCell = document.createElement("td");
    answerCell.innerText = answer;

    definitionCell = document.createElement("td");
    definitionLink = document.createElement("a");
    definitionLink.innerText = "(definition)";
    definitionLink.setAttribute(
      "href",
      `https://www.oed.com/search/dictionary/?scope=Entries&q=${answer}`
    );
    definitionLink.setAttribute("target", "_blank");
    definitionLink.setAttribute("rel", "noopener noreferrer");
    definitionCell.append(definitionLink);

    row.append(answerCell);
    row.append(definitionCell);

    if (!submitted.includes(answer)) {
      rowsMissing.push(row);
    }
    rowsAll.push(row.cloneNode(true));
  });

  answersTableMissing.replaceChildren(...rowsMissing);
  answersTable.replaceChildren(...rowsAll);
}

renderHintsAndAnswers();

async function showAnswers() {
  data = await chrome.storage.session.get("spellingBeanRevealed");
  revealed = data.spellingBeanRevealed;

  if (revealed || confirm("Are you sure you want to reveal the answers?")) {
    const answers = document.getElementById("answers-container");
    const hints = document.getElementById("hints-container");
    const biggerHints = document.getElementById("bigger-hints-container");

    answers.setAttribute("class", "answers shown");
    hints.setAttribute("class", "hints hidden");
    biggerHints.setAttribute("class", "bigger-hints hidden");

    if (!revealed) {
      await chrome.storage.session.set({
        spellingBeanRevealed: true,
      });
    }
  }
}

function showHints() {
  const hints = document.getElementById("hints-container");
  const biggerHints = document.getElementById("bigger-hints-container");
  const answers = document.getElementById("answers-container");

  hints.setAttribute("class", "hints shown");
  biggerHints.setAttribute("class", "bigger-hints hidden");
  answers.setAttribute("class", "answers hidden");
}

function showBiggerHints() {
  const hints = document.getElementById("hints-container");
  const biggerHints = document.getElementById("bigger-hints-container");
  const answers = document.getElementById("answers-container");

  hints.setAttribute("class", "hints hidden");
  biggerHints.setAttribute("class", "bigger-hints shown");
  answers.setAttribute("class", "answers hidden");
}

hintsButton = document.getElementById("hints-button");
hintsButton.addEventListener("click", showHints);

biggerHintsButton = document.getElementById("bigger-hints-button");
biggerHintsButton.addEventListener("click", showBiggerHints);

answersButton = document.getElementById("reveal-answers-button");
answersButton.addEventListener("click", showAnswers);

// Listen to changes to the user's submitted answers so that the hints and answers can be re-rendered
chrome.storage.session.onChanged.addListener(async (changes, areaName) => {
  const { spellingBeanSubmitted } = changes;
  if (spellingBeanSubmitted) {
    await renderHintsAndAnswers();
  }
});

function getWordsSummary(words) {
  const wordLengths = new Set();
  const startingLetters = new Set();

  const firstLetterLengthCounts = {};
  const twoLetterCounts = {};

  for (const word of words) {
    const startingLetter = word.charAt(0);
    startingLetters.add(startingLetter);
    wordLengths.add(word.length);

    const firstAndLength = `${startingLetter}${word.length}`;
    firstLetterLengthCounts[firstAndLength] =
      (firstLetterLengthCounts[firstAndLength] || 0) + 1;

    startingTwo = word.slice(0, 2);
    twoLetterCounts[startingTwo] = (twoLetterCounts[startingTwo] || 0) + 1;
  }

  return {
    wordLengths,
    startingLetters,
    firstLetterLengthCounts,
    twoLetterCounts,
  };
}
