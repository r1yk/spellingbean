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

      const customRankCell = document.createElement("td");
      const customRankInput = document.createElement("input");
      customRankInput.setAttribute("type", "text");

      const inputId = rankName.toLowerCase();
      customRankInput.setAttribute("id", inputId);
      customRankInput.setAttribute("name", inputId);

      customRankCell.append(customRankInput);

      tableRow.replaceChildren(normalRankCell, customRankCell);
      ranks.push(tableRow);
    });

    editableRows.replaceChildren(...ranks);

    // Now that the inputs are created, add their default values:
    rankNames.forEach((rankName) => {
      const rankNameInput = document.querySelector(
        `input#${rankName.toLowerCase()}`
      );
      const customRankName =
        spellingBeanRankNames[rankName.toLowerCase()] || "";

      if (customRankName) {
        rankNameInput.setAttribute("value", customRankName);
      }
    });
  }
});

const ranksForm = document.getElementById("rank-names-form");

ranksForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const formData = new FormData(ranksForm);
  const rankFormData = {};
  formData.entries().forEach((entry) => (rankFormData[entry[0]] = entry[1]));

  await chrome.storage.local.set({
    spellingBeanRankNames: rankFormData,
  });
});
