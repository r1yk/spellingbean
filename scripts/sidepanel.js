console.log("SIDE PANEL JS");

async function displayAnswers() {
  data = await chrome.storage.session.get([
    "spellingBeanAnswers",
    "spellingBeanSubmitted",
  ]);
  const { spellingBeanAnswers, spellingBeanSubmitted } = data;

  const answersTableMissing = document.getElementById("answers-table-missing");
  const answersTable = document.getElementById("answers-table");

  rowsMissing = [];
  rowsAll = [];
  spellingBeanAnswers.forEach((answer) => {
    row = document.createElement("tr");
    answerCell = document.createElement("td");
    answerCell.innerText = answer;
    row.append(answerCell);

    if (!spellingBeanSubmitted.includes(answer)) {
      rowsMissing.push(row);
    }
    rowsAll.push(row.cloneNode(true));
  });

  answersTableMissing.replaceChildren(...rowsMissing);
  answersTable.replaceChildren(...rowsAll);
}

displayAnswers();
