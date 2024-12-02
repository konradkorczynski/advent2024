import * as fs from "fs";

const inputFilePath = "input.txt";

const isReportValid = (report: string[]) => {
  for (let i = 1; i < report.length; i++) {
    const diff = Math.abs(parseInt(report[i]) - parseInt(report[i - 1]));
    if (diff > 3 || diff < 1) {
      return false;
    }
  }

  const leftReport = [...report];
  const rightReport = [...report];

  if (
    leftReport.sort((a, b) => parseInt(a) - parseInt(b)).join("") ===
      rightReport.join("") ||
    leftReport.sort((a, b) => parseInt(b) - parseInt(a)).join("") ===
      rightReport.join("")
  ) {
    console.log("safe report", report);
    return true;
  }

  return false;
};

const revalidateReportWithDamping = (report: string[]) => {
  console.log("revalidating report", report);
  for (let i = 0; i < report.length; i++) {
    const copyReport = [...report];
    copyReport.splice(i, 1);
    if (isReportValid(copyReport)) {
      console.log("damped report valid", copyReport);
      return true;
    }
  }
  console.log("damped report invalid", report);
  return false;
};

const run = () => {
  let count = 0;
  const wholeData = fs.readFileSync(inputFilePath, "utf8").split("\n");
  const allReports = wholeData.map((line) => line.split(" "));
  allReports.forEach((report) => {
    let isValid = isReportValid(report);
    if (!isValid) {
      isValid = revalidateReportWithDamping(report);
    }
    if (!isValid) {
      return;
    } else {
      count++;
    }
  });

  console.log({ count });
};

run();
