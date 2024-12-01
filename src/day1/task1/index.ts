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
  firstArray.sort((a, b) => a - b);
  secondArray.sort((a, b) => a - b);

  let sum = 0;

  for (let i = 0; i < wholeData.length; i++) {
    sum += Math.abs(firstArray[i] - secondArray[i]);
  }
  console.log({ wholeData, firstArray, secondArray, sum });
};

run();
