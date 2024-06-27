function rankNameToId(rankName) {
  return `rank-${rankName.toLowerCase().replace(" ", "-")}`;
}

const rankNames = [
  "Beginner",
  "Good Start",
  "Moving Up",
  "Good",
  "Solid",
  "Nice",
  "Great",
  "Amazing",
  "Genius",
];
const gearIcon = document.getElementById("gear-icon");

gearIcon.addEventListener("click", async (event) => {
  const settingsContainer = document.getElementById("settings-container");
  settingsContainer.classList.toggle("hidden");

  if (!settingsContainer.classList.contains("hidden")) {
    const { spellingBeanRankNames, spellingBeanEvilMode } =
      await chrome.storage.local.get({
        spellingBeanRankNames: {},
        spellingBeanEvilMode: false,
      });
    const editableRows = document.querySelector("#editable-ranks");
    const ranks = [];

    rankNames.forEach((rankName) => {
      const tableRow = document.createElement("tr");
      const normalRankCell = document.createElement("td");
      normalRankCell.innerText = rankName;

      const customRankCell = document.createElement("td");
      const customRankInput = document.createElement("input");
      customRankInput.setAttribute("type", "text");

      const inputId = rankNameToId(rankName);
      customRankInput.setAttribute("id", inputId);
      customRankInput.setAttribute("name", inputId);

      customRankCell.append(customRankInput);

      tableRow.replaceChildren(normalRankCell, customRankCell);
      ranks.push(tableRow);
    });

    editableRows.replaceChildren(...ranks);

    // Now that the inputs are created, add their default values:
    rankNames.forEach((rankName) => {
      const rankNameId = rankNameToId(rankName);
      const rankNameInput = document.querySelector(`input#${rankNameId}`);
      const customRankName = spellingBeanRankNames[rankNameId] || "";

      if (customRankName) {
        rankNameInput.setAttribute("value", customRankName);
      }
    });

    const evilModeInput = document.querySelector("input#evil-mode");
    evilModeInput.checked = spellingBeanEvilMode;
  }
});

const settingsForm = document.getElementById("settings-form");

settingsForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const formData = new FormData(settingsForm);

  const rankNames = {};
  formData
    .entries()
    .filter((entry) => entry[0].startsWith("rank-"))
    .forEach((entry) => (rankNames[entry[0]] = entry[1]));

  await chrome.storage.local.set({
    spellingBeanRankNames: rankNames,
    spellingBeanEvilMode: formData.get("evil-mode") === "on",
  });

  await chrome.storage.session.set({
    spellingBeanCustomRank: null,
  });

  window.close();
});
