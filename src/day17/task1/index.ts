import * as fs from "fs";
import { withMetrics } from "../../utils";
import util from "util";

// const registersInput = "example_registers.txt";
// const programInput = "example_program.txt";
const registersInput = "registers.txt";
const programInput = "program.txt";

const registers: { A: number; B: number; C: number } = { A: 0, B: 0, C: 0 };
const getOperandComboValue = (operand: number) => {
  if (operand < 4) return operand;
  if (operand === 4) return registers.A;
  if (operand === 5) return registers.B;
  if (operand === 6) return registers.C;
  throw new Error(`Invalid operand: ${operand}`);
};

let pointer = 0;
let jump = false;
const output: number[] = [];

const programs = new Map<number, (v: number) => void>([
  [
    0,
    (operand: number) => {
      registers.A = Math.trunc(
        registers.A / 2 ** getOperandComboValue(operand)
      );
    },
  ],
  [
    1,
    (operand: number) => {
      registers.B = registers.B ^ operand;
    },
  ],
  [
    2,
    (operand: number) => {
      registers.B = getOperandComboValue(operand) % 8;
    },
  ],
  [
    3,
    (operand: number) => {
      if (registers.A === 0) return;
      pointer = operand;
      jump = true;
    },
  ],
  [
    4,
    (operand: number) => {
      registers.B = registers.B ^ registers.C;
    },
  ],
  [
    5,
    (operand: number) => {
      output.push(getOperandComboValue(operand) % 8);
    },
  ],
  [
    6,
    (operand: number) => {
      registers.B = Math.trunc(
        registers.A / 2 ** getOperandComboValue(operand)
      );
    },
  ],
  [
    7,
    (operand: number) => {
      registers.C = Math.trunc(
        registers.A / 2 ** getOperandComboValue(operand)
      );
    },
  ],
]);

const run = () => {
  // console.log("------------ start ------------");
  fs.readFileSync(registersInput, "utf8")
    .split("\n")
    .forEach((row) => {
      const [register, value] = row.split(": ");
      const reg = register.split(" ")[1] as keyof typeof registers;
      registers[reg] = parseInt(value);
    });

  const program = fs
    .readFileSync(programInput, "utf8")
    .split(": ")[1]
    .split(",")
    .map((v) => parseInt(v));

  console.log(
    util.inspect({ registers, program }, false, null, true /* enable colors */)
  );

  while (pointer < program.length) {
    const instruction = program[pointer];
    const operand = program[pointer + 1];
    programs.get(instruction)!(operand);
    // console.log("----------");
    // console.log({ registers, pointer, instruction, operand, jump, output });
    if (!jump) {
      pointer += 2;
    }
    jump = false;
  }

  return output.join(",");
};

withMetrics(run);
