import * as fs from "fs";
import { withMetrics } from "../../utils";
import util from "util";

// const mapInput = "example_input.txt";
const mapInput = "input.txt";

class Section {
  constructor(
    public value: (string | number)[],
    public order: number,
    public filled = false
  ) {}

  fill(section: Section, index: number) {
    // console.log("filling", { this: this, index, section });
    let i = 0;
    this.value = this.value.map((v) => {
      if (v === "." && i < section.value.length) {
        const replacement = section.value[i];
        i++;
        return replacement;
      }
      return v;
    });
    section.value = section.value.map((v) => ".");
    // console.log("filled", { this: this, section });
  }
}

const run = () => {
  let dIndex = 0;
  const data: Section[] = fs
    .readFileSync(mapInput, "utf8")
    .split("")
    .map((d, i) => {
      if (i % 2 !== 0) {
        return new Section(Array(parseInt(d)).fill("."), i);
      }
      const result = new Section(Array(parseInt(d)).fill(dIndex), i, true);
      dIndex++;
      return result;
    });
  const dataReversedSquashed = data.filter((c) => c.filled).reverse();

  // console.log(util.inspect({ data, dataReversedSquashed }, false, null, true));

  dataReversedSquashed.forEach((candidateSection) => {
    let done = false;
    data.forEach((emptySection, i) => {
      if (done) return;
      if (
        emptySection.value.filter((v) => v === ".").length >=
          candidateSection.value.length &&
        candidateSection.order > emptySection.order
      ) {
        emptySection.fill(candidateSection, i);
        done = true;
      }
    });
  });
  const compressed = data.flatMap((s) => s.value);

  const result = compressed
    .map((c, i) => {
      if (c !== ".") return parseInt(`${c}`) * i;
      return 0;
    })
    .reduce((acc: number, curr: number) => acc + curr, 0);

  // console.log(
  //   util.inspect({ data, dataReversedSquashed, compressed }, false, null, true)
  // );
  return result;
};

withMetrics(run);
