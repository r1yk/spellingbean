// This runs when the page load first happens.
let gameData = {};

function getAnswers() {
  if (gameData?.today) {
    return gameData.today.answers;
  }
}

function getSubmitted() {
  elements = document.querySelectorAll(".sb-wordlist-pag span");
  return Array.from(elements).map((element) => element.innerText.toLowerCase());
}

function getMissing() {
  submitted = getSubmitted();
  return getAnswers.filter((answer) => !submitted.includes(answer));
}

window.addEventListener(
  "message",
  (event) => {
    // We only accept messages from ourselves
    if (event.source !== window) {
      return;
    }

    messageType = event?.data?.type;
    if (messageType === "GAME_DATA") {
      gameData = JSON.parse(event.data.message);
    }
  },
  false
);

console.log("SIDE PANEL", chrome);
