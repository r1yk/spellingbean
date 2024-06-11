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
      gameData: window.gameData,
      alreadySubmitted: alreadySubmittedWords,
    }),
  });
}, 1000);
