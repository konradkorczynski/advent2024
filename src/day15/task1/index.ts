import * as fs from "fs";
import { withMetrics } from "../../utils";
import util from "util";

const mapInput = "input.txt";
const movesInput = "moves.txt";
// const mapInput = "example_input.txt";
// const movesInput = "example_moves.txt";

type CellValue = "#" | "." | "O" | "@";

class Cell {
  constructor(public y: number, public x: number, public value: CellValue) {}
}

type Map = Cell[][];
type Move = ">" | "<" | "^" | "v";

const getLine = (map: Map, y: number, x: number, move: Move) => {
  const line = [];
  if (move === ">") {
    for (let i = x; i < map[y].length; i++) {
      line.push(map[y][i]);
    }
  } else if (move === "<") {
    for (let i = x; i >= 0; i--) {
      line.push(map[y][i]);
    }
  } else if (move === "^") {
    for (let i = y; i >= 0; i--) {
      line.push(map[i][x]);
    }
  } else if (move === "v") {
    for (let i = y; i < map.length; i++) {
      line.push(map[i][x]);
    }
  }
  return line;
};

const moveRobot = (
  map: Map,
  robotPosition: { y: number; x: number },
  move: Move
) => {
  const { y, x } = robotPosition;
  const line = getLine(map, y, x, move);
  // console.log("making move", { line, move });
  const wallIndex = line.findIndex((cell) => cell.value === "#");
  const firstEmptyCellIndex = line.findIndex((cell) => cell.value === ".");
  // console.log({ wallIndex, firstEmptyCellIndex });
  if (firstEmptyCellIndex === -1 || wallIndex < firstEmptyCellIndex) return;

  const subLine = line.slice(0, firstEmptyCellIndex + 1);
  const arr = subLine.map((cell) => cell.value);
  arr.unshift(...arr.splice(-1));
  subLine.forEach((cell, index) => {
    const newValue = arr[index];
    if (newValue === "@") {
      robotPosition.y = cell.y;
      robotPosition.x = cell.x;
    }
    cell.value = arr[index];
  });

  // console.log({ arr, line });
};

const drawMap = (map: Map) => {
  map.forEach((row) => {
    console.log(row.map((cell) => cell.value).join(""));
  });
};

const run = () => {
  console.log("------------ start ------------");
  const robotPosition = { y: 0, x: 0 };

  const map: Map = fs
    .readFileSync(mapInput, "utf8")
    .split("\n")
    .map((row, y) => {
      return row.split("").map((cell, x) => {
        if (cell === "@") {
          robotPosition.y = y;
          robotPosition.x = x;
        }
        return new Cell(y, x, cell as CellValue);
      });
    });

  const moves = fs.readFileSync(movesInput, "utf8").split("\n").join("");

  moves.split("").forEach((move) => {
    moveRobot(map, robotPosition, move as Move);
  });
  drawMap(map);
  // console.log({ moves });

  return map
    .flat()
    .filter((cell) => cell.value === "O")
    .reduce((acc, curr) => acc + curr.x + 100 * curr.y, 0);
};

withMetrics(run);
