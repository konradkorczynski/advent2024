import * as fs from "fs";
import { withMetrics } from "../../utils";
import util from "util";

const input = "input.txt";
// const input = "example_input.txt";

type Equation = {
  AX: number;
  BX: number;
  X: number;
  AY: number;
  BY: number;
  Y: number;
};

const getData = () => {
  const data: Equation[] = [];

  let equation: Partial<Equation> = {};
  fs.readFileSync(input, "utf8")
    .split("\n")
    .forEach((row) => {
      const rowSplit = row.split(": ");
      if (rowSplit.length === 1) {
        return;
      }
      const rowDataSplit = rowSplit[1].split(", ");
      // console.log({ rowSplit, rowDataSplit });
      if (rowSplit[0] === "Button A") {
        equation.AX = parseInt(rowDataSplit[0].substring(2));
        equation.AY = parseInt(rowDataSplit[1].substring(2));
      }
      if (rowSplit[0] === "Button B") {
        equation.BX = parseInt(rowDataSplit[0].substring(2));
        equation.BY = parseInt(rowDataSplit[1].substring(2));
      }
      if (rowSplit[0] === "Prize") {
        equation.X = parseInt(rowDataSplit[0].substring(2));
        equation.Y = parseInt(rowDataSplit[1].substring(2));
        // console.log({ equation });
        data.push(equation as Equation);
        equation = {};
      }
    });

  return data;
};

const solveEquation = (equation: Equation) => {
  const { AX, BX, X, AY, BY, Y } = equation;
  const a = (X - (BX * Y) / BY) / (AX - (BX * AY) / BY);
  const b = (Y - AY * a) / BY;
  const result = [a, b];
  // console.log({
  //   equation1: `${AX}x + ${BX}y = ${X}`,
  //   equation2: `${AY}x + ${BY}y = ${Y}`,
  //   result,
  // });

  // surely there is a better way to check if a number is an integer
  return result.some(
    (r) => !Number.isInteger(parseFloat(r.toFixed(4))) || r < 0
  )
    ? undefined
    : result;
};

const run = () => {
  const data = getData();
  const result = data.map((equation) => {
    const solution = solveEquation(equation);
    // console.log({ solution });
    return solution ? solution[0] * 3 + solution[1] : 0;
  });
  // console.log({ data, result, len: result.length });
  return result.reduce((acc, curr) => acc + curr, 0);
};

withMetrics(run);
