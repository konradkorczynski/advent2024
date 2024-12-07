import * as fs from "fs";
import { withMetrics } from "../../utils";
import util from "util";

const mapInput = "input.txt";

enum Operator {
  ADD = "+",
  MULTIPLY = "*",
}

type Row = {
  rowResult: number;
  numbers: number[];
  operatorCount: number;
  solved?: boolean;
};

const generateOperatorCombinations = (operatorCount: number): Operator[][] => {
  const operatorCombinations: Operator[][] = [];
  const operators = [Operator.ADD, Operator.MULTIPLY];
  const generate = (current: Operator[] = []) => {
    if (current.length === operatorCount) {
      operatorCombinations.push(current);
      return;
    }
    operators.forEach((operator) => {
      generate([...current, operator]);
    });
  };
  generate();
  return operatorCombinations;
};

const run = () => {
  const data: Row[] = fs
    .readFileSync(mapInput, "utf8")
    .split("\n")
    .map((row) => {
      const rowData = row.split(":");
      const numbers = rowData[1]
        .trim()
        .split(" ")
        .map((num) => parseInt(num, 10));
      const operatorCount = numbers.length - 1;
      return {
        rowResult: parseInt(rowData[0], 10),
        numbers,
        operatorCount,
      };
    });

  let result = 0;

  data.forEach((row) => {
    generateOperatorCombinations(row.operatorCount).forEach((operators) => {
      const rowResult = row.numbers.reduce((acc, num, index) => {
        // first number
        if (index === 0) return num;

        // grab operator
        const operator = operators[index - 1];

        // apply operator
        if (operator === Operator.ADD) return acc + num;
        if (operator === Operator.MULTIPLY) return acc * num;

        return acc;
      }, 0);
      if (rowResult === row.rowResult) {
        if (!row.solved) result += rowResult;
        row.solved = true;
        return;
      }
    });
  });
  // console.log(util.inspect({ data }, false, null, true));
  return result;
};

withMetrics(run);
