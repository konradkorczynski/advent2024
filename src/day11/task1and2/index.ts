import * as fs from "fs";
import { withMetrics } from "../../utils";
import util from "util";

const input = "input.txt";
// const input = "example_input.txt";

const iterateOnStones = (stones: Map<number, number>) => {
  // console.log({ stones });
  const iteration = new Map<number, number>();
  stones.forEach((value, key) => {
    // console.log({ key, value });
    const len = `${key}`.length;
    if (key === 0) {
      iteration.set(1, (iteration.get(1) || 0) + value);
    } else if (len % 2 === 0) {
      const k1 = parseInt(`${key}`.slice(0, len / 2), 10);
      const k2 = parseInt(`${key}`.slice(len / 2, len), 10);
      iteration.set(k1, (iteration.get(k1) || 0) + value);
      iteration.set(k2, (iteration.get(k2) || 0) + value);
    } else {
      iteration.set(key * 2024, (iteration.get(key * 2024) || 0) + value);
    }
  });

  return iteration;
};

const run = () => {
  const stones: number[] = fs
    .readFileSync(input, "utf8")
    .split(" ")
    .map((n) => parseInt(n, 10));

  let stonesMap = new Map<number, number>();
  stones.forEach((s) => stonesMap.set(s, (stonesMap.get(s) || 0) + 1));

  for (let index = 0; index < 75; index++) {
    stonesMap = iterateOnStones(stonesMap);
  }
  // console.log({ stonesMap });

  return Array.from(stonesMap.values()).reduce((acc, val) => acc + val, 0);
};
withMetrics(run);
