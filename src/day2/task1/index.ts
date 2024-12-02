import * as fs from "fs";

const inputFilePath = "input.txt";

const run = () => {
  let count = 0;
  const wholeData = fs.readFileSync(inputFilePath, "utf8").split("\n");
  const allReports = wholeData.map((line) => line.split(" "));
  allReports.forEach((report) => {
    for (let i = 1; i < report.length; i++) {
      const diff = Math.abs(parseInt(report[i]) - parseInt(report[i - 1]));
      if (diff > 3 || diff < 1) {
        return;
      }
    }

    const copyReport = [...report];

    if (
      report.sort((a, b) => parseInt(a) - parseInt(b)).join("") ===
        copyReport.join("") ||
      report.sort((a, b) => parseInt(b) - parseInt(a)).join("") ===
        copyReport.join("")
    ) {
      count++;
      console.log("safe report", report);
    }
  });

  console.log({ count });
};

run();
