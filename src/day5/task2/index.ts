import * as fs from "fs";

const rulesPath = "rules.txt";
const updatesPath = "updates.txt";

const run = () => {
  const rules = fs.readFileSync(rulesPath, "utf8").split("\n");
  const updates = fs.readFileSync(updatesPath, "utf8").split("\n");

  const pagesToAdd: number[] = [];

  updates.forEach((update) => {
    const pages = update.split(",");

    const potentialBrokenRules = pages
      .flatMap((v, i) =>
        pages.slice(i).map((w) => {
          if (v !== w) return w + "|" + v;
        })
      )
      .filter((v) => v !== undefined);

    const isIncorrect = potentialBrokenRules.some((potentialBrokenRule) =>
      rules.some((rule) => potentialBrokenRule === rule)
    );

    if (isIncorrect) {
      pages.sort((a, b) => {
        return rules.includes(`${a}|${b}`) ? -1 : 1;
      });
      pagesToAdd.push(parseInt(pages[(pages.length - 1) / 2]));
    }
    console.log({ isIncorrect, pages });
  });
  console.log({ sum: pagesToAdd.reduce((a, b) => a + b, 0) });
};

run();
