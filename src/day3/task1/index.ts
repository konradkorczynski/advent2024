import * as fs from "fs";

const inputFilePath = "input.txt";

const run = () => {
  const data = fs.readFileSync(inputFilePath, "utf8");
  const firstPass = data.match(/mul\(\d{1,3},\d{1,3}\)/g);
  if (!firstPass) {
    console.log("no matches");
    return;
  }
  const secondPass = firstPass.map((mul) => {
    const [a, b] = mul
      .replace("mul(", "")
      .replace(")", "")
      .split(",")
      .map((n) => parseInt(n));
    return a * b;
  });
  const sum = secondPass.reduce((partialSum, a) => partialSum + a, 0);
  console.log({ sum });
};

run();
