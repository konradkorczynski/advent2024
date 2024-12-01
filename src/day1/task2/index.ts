import * as fs from "fs";

const inputFilePath = "input.txt";

const run = () => {
  const firstArray: number[] = [];
  const secondArray: number[] = [];
  const wholeData = fs.readFileSync(inputFilePath, "utf8").split("\n");
  wholeData.forEach((line) => {
    const data = line.split("   ");
    firstArray.push(parseInt(data[0]));
    secondArray.push(parseInt(data[1]));
  });

  const secondArrayCounts: Record<string, number> = {};
  secondArray.forEach((num) => {
    secondArrayCounts[num] = (secondArrayCounts[num] || 0) + 1;
  });

  let score = 0;

  firstArray.forEach((element) => {
    const toAdd = secondArrayCounts[element] ? secondArrayCounts[element] : 0;
    console.log({ element, toAdd });
    score += element * toAdd;
  });

  console.log({ wholeData, firstArray, secondArray, secondArrayCounts, score });
};

run();
