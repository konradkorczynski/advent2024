import * as fs from "fs";

const inputFilePath = "input.txt";

const run = () => {
  const data = fs.readFileSync(inputFilePath, "utf8");
  const firstPass = data.match(/mul\(\d{1,3},\d{1,3}\)|don't\(\)|do\(\)/g);
  if (!firstPass) {
    console.log("no matches");
    return;
  }
  const secondPass: string[] = [];

  let enabled = true;
  firstPass.forEach((element) => {
    if (element === "don't()") {
      enabled = false;
    } else if (element === "do()") {
      enabled = true;
    } else if (enabled) {
      secondPass.push(element);
    }
  });

  const thirdPass = secondPass.map((mul) => {
    const [a, b] = mul
      .replace("mul(", "")
      .replace(")", "")
      .split(",")
      .map((n) => parseInt(n));
    return a * b;
  });
  const sum = thirdPass.reduce((partialSum, a) => partialSum + a, 0);
  console.log({ sum });
};

run();
