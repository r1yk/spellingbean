function getCurrentRankName() {
  const nytElement = document.querySelector(
    '.sb-progress-rank[data-testid="sb-progress-rank"]'
  );
  if (nytElement) {
    return nytElement.innerText;
  }
  return null;
}

function getSubmittedAnswers() {
  const alreadySubmittedElements = document.querySelectorAll(
    "ul.sb-wordlist-items-pag li"
  );
  return Array.from(alreadySubmittedElements).map((element) =>
    element.innerText.toLowerCase()
  );
}

setTimeout(() => {
  window.postMessage({
    type: "GAME_DATA",
    text: JSON.stringify({
      spellingBeanData: {
        answers: window.gameData.today.answers,
        submitted: getSubmittedAnswers(),
        puzzleDate: window.gameData.today.printDate,
        nytRankName: getCurrentRankName(),
      },
    }),
  });
}, 1000);
