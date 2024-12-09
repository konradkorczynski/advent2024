import * as fs from "fs";
import { withMetrics } from "../../utils";
import util from "util";

const mapInput = "input.txt";

const run = () => {
  let dIndex = 0;
  const data: any[] = fs
    .readFileSync(mapInput, "utf8")
    .split("")
    .flatMap((d, i) => {
      if (i % 2 !== 0) {
        return Array(parseInt(d)).fill(".");
      }
      const result = Array(parseInt(d)).fill(dIndex);
      dIndex++;
      return result;
    });
  const dataReversedSquashed = data.filter((c) => c !== ".").reverse();

  let i = 0;
  const compressed = data
    .map((c) => {
      if (c === ".") {
        const result = dataReversedSquashed[i];
        i++;
        return result;
      }
      return c;
    })
    .slice(0, data.length - i);

  const result = compressed
    .map((c, i) => parseInt(c) * i)
    .reduce((acc: number, curr: number) => acc + curr, 0);
  console.log(
    util.inspect({ data, dataReversedSquashed, compressed }, false, null, true)
  );
  return result;
};

withMetrics(run);
