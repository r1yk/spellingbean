async function renderHintsAndAnswers() {
  const { spellingBeanAnswers, spellingBeanSubmitted, spellingBeanHintWord } =
    await chrome.storage.session.get([
      "spellingBeanAnswers",
      "spellingBeanSubmitted",
      "spellingBeanHintWord",
    ]);

  renderHints(spellingBeanAnswers, spellingBeanSubmitted);
  renderBiggerHints(spellingBeanHintWord, spellingBeanSubmitted);
  renderAnswers(spellingBeanAnswers, spellingBeanSubmitted);
}

function renderHints(answers, submitted) {
  const answersSummary = getWordsSummary(answers);
  const submittedSummary = getWordsSummary(submitted);

  const hintsTable = document.getElementById("hints-table");

  const wordLengths = Array.from(answersSummary.wordLengths.keys()).sort(
    (a, b) => a - b
  );
  const startingLetters = Array.from(
    answersSummary.startingLetters.keys()
  ).sort();
  const twoLetterStarts = Array.from(
    Object.keys(answersSummary.twoLetterCounts)
  ).sort();

  const hintsRows = [];

  const header = document.createElement("tr");
  header.append(document.createElement("th"));
  wordLengths.forEach((wordLength) => {
    const cell = document.createElement("th");
    cell.innerText = wordLength;
    header.append(cell);
  });
  hintsRows.push(header);

  startingLetters.forEach((startingLetter) => {
    const row = document.createElement("tr");
    const letterCell = document.createElement("th");
    letterCell.innerText = startingLetter.toUpperCase();
    row.append(letterCell);

    wordLengths.forEach((wordLength) => {
      const lengthCountForLetter =
        answersSummary.firstLetterLengthCounts[
          `${startingLetter}${wordLength}`
        ];

      const cell = document.createElement("td");

      if (lengthCountForLetter) {
        const lengthCountForLetterSubmitted =
          submittedSummary.firstLetterLengthCounts[
            `${startingLetter}${wordLength}`
          ] || 0;

        const remaining = lengthCountForLetter - lengthCountForLetterSubmitted;

        if (remaining === 0) {
          cell.setAttribute("class", "hints-complete");
        } else if (remaining < lengthCountForLetter) {
          cell.setAttribute("class", "hints-progress");
        } else {
          cell.setAttribute("class", "hints-missing");
        }

        cell.innerText = `${lengthCountForLetterSubmitted}/${lengthCountForLetter}`;
      }
      row.append(cell);
    });

    hintsRows.push(row);
  });
  hintsTable.replaceChildren(...hintsRows);

  const twoLetterContainer = document.getElementById("two-letter-container");
  const twoLetterBoxes = [];
  twoLetterStarts.forEach((twoLetters) => {
    const twoLetterBox = document.createElement("div");
    const letters = document.createElement("div");
    letters.setAttribute("class", "two-letter-text");
    letters.innerText = twoLetters;
    twoLetterBox.append(letters);

    const counts = document.createElement("span");
    const submittedCount = submittedSummary.twoLetterCounts[twoLetters] || 0;
    const totalCount = answersSummary.twoLetterCounts[twoLetters];
    const remaining = totalCount - submittedCount;

    counts.innerText = `${submittedCount}/${totalCount}`;
    twoLetterBox.append(counts);

    let progressClass;
    if (remaining === 0) {
      progressClass = "hints-complete";
    } else if (remaining < totalCount) {
      progressClass = "hints-progress";
    } else {
      progressClass = "hints-missing";
    }

    twoLetterBox.setAttribute("class", `two-letter-box ${progressClass}`);
    twoLetterBoxes.push(twoLetterBox);
  });
  twoLetterContainer.replaceChildren(...twoLetterBoxes);
}

function renderBiggerHints(hintWord, submitted) {
  if (hintWord && submitted && submitted.includes(hintWord)) {
    // Update the hint word display to show success!
    replaceHintContent(Array.from(hintWord));
    const hintRow = document.getElementById("bigger-hint-row");
    hintRow.classList.toggle("bigger-hint-solved");
    setTimeout(() => {
      hintRow.classList.toggle("bigger-hint-solved");
      replaceHintContent([]);
    }, 2500);
  }
}

function renderAnswers(answers, submitted) {
  const answersListMissing = document.getElementById("answers-list-missing");
  const answersList = document.getElementById("answers-list-found");

  const rowsMissing = [];
  const rowsAll = [];

  answers.forEach((answer) => {
    const answerLink = document.createElement("a");
    answerLink.setAttribute(
      "href",
      `https://www.oed.com/search/dictionary/?scope=Entries&q=${answer}`
    );
    answerLink.setAttribute("target", "_blank");
    answerLink.setAttribute("rel", "noopener noreferer");

    const answerDiv = document.createElement("div");
    answerDiv.classList.add("answer");
    answerDiv.innerText = answer;
    answerLink.append(answerDiv);

    if (!submitted.includes(answer)) {
      rowsMissing.push(answerLink);
    } else {
      rowsAll.push(answerLink);
    }
  });

  answersListMissing.replaceChildren(...rowsMissing);
  answersList.replaceChildren(...rowsAll);
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

const hintsButton = document.getElementById("hints-button");
hintsButton.addEventListener("click", showHints);

const biggerHintsButton = document.getElementById("bigger-hints-button");
biggerHintsButton.addEventListener("click", showBiggerHints);

const answersButton = document.getElementById("reveal-answers-button");
answersButton.addEventListener("click", showAnswers);

function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}

async function createBigHint(letterCount, hintType) {
  const { spellingBeanAnswers, spellingBeanSubmitted } =
    await chrome.storage.session.get({
      spellingBeanAnswers: [],
      spellingBeanSubmitted: [],
    });

  const hintableWords = spellingBeanAnswers.filter(
    (answer) =>
      !spellingBeanSubmitted.includes(answer) && answer.length > letterCount
  );
  if (hintableWords.length === 0) {
    return;
  }
  const hintWord = hintableWords[getRandomInt(hintableWords.length)];
  await chrome.storage.session.set({ spellingBeanHintWord: hintWord });

  if (hintType === "first-letters") {
    return [
      ...Array.from(hintWord).slice(0, letterCount),
      ...Array(hintWord.length - letterCount).fill("_"),
    ];
  } else if (hintType === "first-last-letters") {
    firstGroupSize = Math.round(letterCount / 2);
    lastGroupSize = letterCount - firstGroupSize;
    return [
      ...Array.from(hintWord).slice(0, firstGroupSize),
      ...Array(hintWord.length - letterCount).fill("_"),
      ...Array.from(hintWord).slice(hintWord.length - lastGroupSize),
    ];
  } else if (hintType === "random-letters") {
    const indices = new Set();
    while (indices.size < letterCount) {
      indices.add(getRandomInt(hintWord.length));
    }
    const hint = [];
    for (let i = 0; i < hintWord.length; i++) {
      hint.push(indices.has(i) ? hintWord.charAt(i) : "_");
    }
    return hint;
  }
}

function replaceHintContent(hint) {
  if (hint) {
    const hintRow = document.getElementById("bigger-hint-row");
    const hintBoxes = hint.map((hintChar) => {
      hintCharElement = document.createElement("span");
      hintCharElement.innerText = hintChar;
      return hintCharElement;
    });
    hintRow.replaceChildren(...hintBoxes);
  }
}

const biggerHintsForm = document.getElementById("bigger-hints-form");
biggerHintsForm.addEventListener("submit", async (submitEvent) => {
  submitEvent.preventDefault();
  const formData = new FormData(biggerHintsForm);
  const letterCount = formData.get("letter-count");
  const hintType = formData.get("hint-type");

  const hint = await createBigHint(letterCount, hintType);
  replaceHintContent(hint);
});

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
