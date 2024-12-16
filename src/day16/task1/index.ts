import * as fs from "fs";
import { withMetrics } from "../../utils";
import util from "util";

// Note: This is a shit algorithm for such a big maze, but I wanted to see how it will perform
// hint, it is super slow lol

// TODO: Implement Dijkstra 


const mapInput = "input.txt";
// const mapInput = "example_input.txt";

type Direction = "N" | "E" | "S" | "W";
type CellValue = "#" | ".";
let score: number | undefined;

class Cell {
  constructor(
    public y: number,
    public x: number,
    public value: CellValue,
    public directions: Direction[]
  ) {}
}

const startPosition = { y: 0, x: 0 };
const endPosition = { y: 0, x: 0 };
const paths: Path[] = [];

class Path {
  constructor(
    public currentCell: Cell,
    public cost: number,
    public moveDirection: Direction,
    public visitedJunctions: string[] = []
  ) {}
}

const getLine = (map: Map, cell: Cell, direction: Direction) => {
  const line = [];
  if (direction === "E") {
    for (let i = cell.x; i < map[cell.y].length; i++) {
      line.push(map[cell.y][i]);
    }
  } else if (direction === "W") {
    for (let i = cell.x; i >= 0; i--) {
      line.push(map[cell.y][i]);
    }
  } else if (direction === "N") {
    for (let i = cell.y; i >= 0; i--) {
      line.push(map[i][cell.x]);
    }
  } else if (direction === "S") {
    for (let i = cell.y; i < map.length; i++) {
      line.push(map[i][cell.x]);
    }
  }

  const wallIndex = line.findIndex((cell) => cell.value === "#");
  const firstJunction = line
    .slice(1, line.length)
    .findIndex(
      (cell) =>
        cell.directions.length > 2 ||
        (!cell.directions.includes(direction) && cell.directions.length === 2)
    );
  // console.log({ wallIndex, firstJunction });
  if (firstJunction === -1 || firstJunction + 1 > wallIndex)
    return line.slice(0, wallIndex);

  return line.slice(0, firstJunction + 2);
};

type MoveResult = "deadend" | "junction" | "success" | "continue";

const move = (map: Map, path: Path): MoveResult => {
  if (score && path.cost > score) {
    return "deadend";
  }
  // move to next available cell - junction or dead end
  const line = getLine(map, path.currentCell, path.moveDirection);
  // console.log(util.inspect({ line }, false, null, true));
  path.cost = path.cost + line.length - 1;
  path.currentCell = line[line.length - 1];

  if (
    path.currentCell.x === endPosition.x &&
    path.currentCell.y === endPosition.y
  ) {
    // console.log("found FINISH");
    return "success";
  }

  const availableDirections = path.currentCell.directions.filter(
    (direction) => direction !== getOppositeDirection(path.moveDirection)
  );

  // console.log({ availableDirections });

  if (availableDirections.length === 0) {
    return "deadend";
  }

  // bend in line
  if (availableDirections.length === 1) {
    path.cost = path.cost + 1000;
    path.moveDirection = availableDirections[0];
    return "continue";
  }

  if (
    path.visitedJunctions.includes(
      path.currentCell.y + "-" + path.currentCell.x
    )
  ) {
    return "deadend";
  }
  path.visitedJunctions.push(path.currentCell.y + "-" + path.currentCell.x);

  availableDirections.forEach((direction) => {
    const cost = path.moveDirection === direction ? 0 : 1000;
    // console.log(`adding path`, {
    //   direction,
    //   cost,
    //   visited: path.visitedJunctions,
    // });
    paths.push(
      new Path(path.currentCell, path.cost + cost, direction, [
        ...path.visitedJunctions,
      ])
    );
  });
  return "junction";
};

type Map = Cell[][];

const drawMap = (map: Map) => {
  map.forEach((row) => {
    console.log(row.map((cell) => cell.value).join(""));
  });
};

const inLineMoves = ["NS", "SN", "EW", "WE"];
const isInLineMove = (direction1: Direction, direction2: Direction) => {
  return inLineMoves.includes(direction1 + direction2);
};

const getOppositeDirection = (direction: Direction): Direction => {
  if (direction === "N") return "S";
  if (direction === "S") return "N";
  if (direction === "E") return "W";
  return "E";
};

const run = () => {
  // console.log("------------ start ------------");

  const map: Map = fs
    .readFileSync(mapInput, "utf8")
    .split("\n")
    .map((row, y) => {
      return row.split("").map((cell, x) => {
        if (cell === "S") {
          startPosition.y = y;
          startPosition.x = x;
        }
        if (cell === "E") {
          endPosition.y = y;
          endPosition.x = x;
        }
        return new Cell(
          y,
          x,
          cell === "S" || cell === "E" ? "." : (cell as CellValue),
          []
        );
      });
    });
  // no idea if this will work, but the assuption is that all paths are done
  // when all cells are visited

  // put directions on cells
  map
    .flat(1)
    .filter((cell) => cell.value === ".")
    .forEach((cell) => {
      const directions: Direction[] = [];
      if (map[cell.y - 1][cell.x]?.value === ".") {
        directions.push("N");
      }
      if (map[cell.y + 1][cell.x]?.value === ".") {
        directions.push("S");
      }
      if (map[cell.y][cell.x - 1]?.value === ".") {
        directions.push("W");
      }
      if (map[cell.y][cell.x + 1]?.value === ".") {
        directions.push("E");
      }
      cell.directions = directions;
    });

  // console.log({ cellstToVisit, startPosition, endPosition });
  let position = { ...startPosition };
  const currentCell = map[position.y][position.x];

  let debugIteration = 0;
  map[startPosition.y][startPosition.x].directions.forEach((direction) => {
    const cost = isInLineMove("W", direction) ? 0 : 1000;
    paths.push(
      new Path(currentCell, cost, direction, [
        currentCell.y + "-" + currentCell.x,
      ])
    );
  });
  //

  console.log(`starting with ${paths.length} paths`);

  // while (debugIteration < 5) {
  while (paths.length > 0) {
    const path = paths[0];
    // console.log(`\n--------> making move`, {
    //   from: path.currentCell.y + "-" + path.currentCell.x,
    //   direction: path.moveDirection,
    //   visitedJunctions: path.visitedJunctions,
    // });
    const moveResult = move(map, path);
    // console.log(util.inspect({ path }, false, null, true));
    if (
      moveResult === "deadend" ||
      moveResult === "success" ||
      moveResult === "junction"
    ) {
      // console.log(`XXXXXXXXXXXXX removing path`);
      paths.shift();
    }
    if (moveResult === "success") {
      score = path.cost;
    }
    // console.log(
    //   util.inspect({ moveResult, pathsLength: paths.length }, false, null, true)
    // );

    debugIteration++;
    if (debugIteration % 10000 === 0) {
      console.log(`iteration ${debugIteration} score: ${score}`);
    }
  }

  drawMap(map);
  // console.log({ scores });

  return score;
};

withMetrics(run);
