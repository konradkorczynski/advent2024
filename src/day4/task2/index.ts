import * as fs from "fs";

const inputFilePath = "input.txt";

const run = () => {
  const initialData = fs.readFileSync(inputFilePath, "utf8").split("\n");
  const allRows = initialData.map((line) => line.split(""));
  console.log({ allRows, initialData });

  const word = "MAS";
  let count = 0;

  for (let i = 0; i < allRows.length; i++) {
    for (let j = 0; j < allRows[i].length; j++) {
      const currentLetter = allRows[i][j];
      if (currentLetter === "A") {
        const wordsToCheck = [];

        // diagonal
        wordsToCheck.push(
          allRows
            .map((row, index) => row[j + i - index])
            .slice(i - 1, i + 2)
            .join("")
        );
        wordsToCheck.push(
          allRows
            .map((row, index) => row[j - i + index])
            .slice(i - 1, i + 2)
            .join("")
        );

        console.log({ wordsToCheck, i, j });

        if (
          (wordsToCheck[0] === word ||
            wordsToCheck[0] === word.split("").reverse().join("")) &&
          (wordsToCheck[1] === word ||
            wordsToCheck[1] === word.split("").reverse().join(""))
        )
          count++;
      }
    }
  }

  console.log({ count });
};

run();
