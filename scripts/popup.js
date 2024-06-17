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
    const { spellingBeanRankNames } = await chrome.storage.local.get({
      spellingBeanRankNames: {},
    });
    const editableRows = document.querySelector("#editable-ranks");
    const ranks = [];
    rankNames.forEach((rankName) => {
      const tableRow = document.createElement("tr");
      const normalRankCell = document.createElement("td");
      normalRankCell.innerText = rankName;

      const customRankName =
        spellingBeanRankNames[rankName.toLowerCase()] || "";
      const customRankCell = document.createElement("td");
      const customRankInput = document.createElement("input");
      customRankInput.setAttribute("type", "text");
      customRankInput.setAttribute("value", customRankName);
      customRankCell.append(customRankInput);

      tableRow.replaceChildren(normalRankCell, customRankCell);
      ranks.push(tableRow);
    });
    editableRows.replaceChildren(...ranks);
  }
});
