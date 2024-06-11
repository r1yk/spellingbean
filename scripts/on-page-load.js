console.log("GAME DATA", window.gameData);
window.postMessage({
  type: "GAME_DATA",
  text: JSON.stringify(window.gameData),
});
