setTimeout(() => {
  alreadySubmittedElements = document.querySelectorAll(
    "ul.sb-wordlist-items-pag li"
  );
  alreadySubmittedWords = Array.from(alreadySubmittedElements).map((element) =>
    element.innerText.toLowerCase()
  );
  window.postMessage({
    type: "GAME_DATA",
    text: JSON.stringify({
      spellingBeanData: {
        answers: window.gameData.today.answers,
        submitted: alreadySubmittedWords,
      },
    }),
  });
}, 1000);
