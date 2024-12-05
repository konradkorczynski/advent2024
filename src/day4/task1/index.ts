import * as fs from "fs";

const inputFilePath = "input.txt";

const run = () => {
  const initialData = fs.readFileSync(inputFilePath, "utf8").split("\n");
  const allRows = initialData.map((line) => line.split(""));
  console.log({ allRows, initialData });

  const word = "XMAS";
  let count = 0;

  for (let i = 0; i < allRows.length; i++) {
    for (let j = 0; j < allRows[i].length; j++) {
      const currentLetter = allRows[i][j];
      if (currentLetter === word[0]) {
        const wordsToCheck = [];
        // horizontal
        wordsToCheck.push(allRows[i].slice(j, j + word.length).join(""));
        wordsToCheck.push(
          allRows[i]
            .slice(j - word.length + 1 < 0 ? 0 : j - word.length + 1, j + 1)
            .reverse()
            .join("")
        );

        // vertical
        wordsToCheck.push(
          allRows
            .map((row) => row[j])
            .slice(i, i + word.length)
            .join("")
        );
        wordsToCheck.push(
          allRows
            .map((row) => row[j])
            .slice(i - word.length + 1 < 0 ? 0 : i - word.length + 1, i + 1)
            .reverse()
            .join("")
        );

        // diagonal
        wordsToCheck.push(
          allRows
            .map((row, index) => row[j + i - index])
            .slice(i, i + word.length)
            .join("")
        );
        wordsToCheck.push(
          allRows
            .map((row, index) => row[j + i - index])
            .slice(i - word.length + 1 < 0 ? 0 : i - word.length + 1, i + 1)
            .reverse()
            .join("")
        );

        wordsToCheck.push(
          allRows
            .map((row, index) => row[j - i + index])
            .slice(i, i + word.length)
            .join("")
        );
        wordsToCheck.push(
          allRows
            .map((row, index) => row[j - i + index])
            .slice(i - word.length + 1 < 0 ? 0 : i - word.length + 1, i + 1)
            .reverse()
            .join("")
        );

        console.log({ wordsToCheck });

        for (const wordToCheck of wordsToCheck) {
          if (wordToCheck === word) count++;
        }
      }
    }
  }

  console.log({ count });
};

run();
