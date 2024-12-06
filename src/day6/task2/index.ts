import * as fs from "fs";
import { withMetrics } from "../../utils/withMetrics";

const mapInput = "input.txt";

enum Direction {
  UP = "UP",
  DOWN = "DOWN",
  LEFT = "LEFT",
  RIGHT = "RIGHT",
}

type Map = Cell[][];

const startDirections = {
  "^": Direction.UP,
  v: Direction.DOWN,
  "<": Direction.LEFT,
  ">": Direction.RIGHT,
};

const directions = {
  [Direction.UP]: "^",
  [Direction.DOWN]: "v",
  [Direction.LEFT]: "<",
  [Direction.RIGHT]: ">",
};

type CellValue = "#" | "O" | "X" | "." | keyof typeof startDirections;

const directionChange = {
  [Direction.UP]: Direction.RIGHT,
  [Direction.RIGHT]: Direction.DOWN,
  [Direction.DOWN]: Direction.LEFT,
  [Direction.LEFT]: Direction.UP,
};

class Guard {
  constructor(
    public cell: Cell,
    public direction: Direction,
    public present: boolean = true,
    public stuck: boolean = false,
    public visitedTurns: { y: number; x: number; direction: Direction }[] = []
  ) {}
}

class Cell {
  constructor(public y: number, public x: number, public value: CellValue) {}
}

const findGuard = (map: Map): Guard => {
  let direction: Direction | undefined;
  let guardCell: Cell | undefined;
  let present = false;

  map.forEach((row) => {
    row.forEach((cell) => {
      if (Object.keys(startDirections).includes(cell.value)) {
        direction = startDirections[cell.value as keyof typeof startDirections];
        present = true;
        guardCell = cell;
      }
    });
  });
  if (present) return new Guard(guardCell!, direction!, present);
  throw new Error("Guard not found");
};

const walkGuardOnPath = (guard: Guard, path: Cell[]) => {
  const startIndex = path.findIndex((cell) =>
    Object.keys(startDirections).includes(cell.value)
  );
  const firstPathSlice = path.slice(startIndex, path.length);
  const endIndex = firstPathSlice.findIndex(
    (cell) => cell.value === "#" || cell.value === "O"
  );
  const pathSlice = firstPathSlice.slice(
    0,
    endIndex === -1 ? path.length : endIndex
  );
  guard.cell = pathSlice.pop()!;
  pathSlice.forEach((cell) => (cell.value = "X"));
  guard.present = endIndex !== -1;
};

const moveGuard = (guard: Guard, map: Map): Guard => {
  switch (guard.direction) {
    case Direction.UP:
      walkGuardOnPath(
        guard,
        [...map.map((row) => row[guard.cell.x])].reverse()
      );
      break;
    case Direction.DOWN:
      walkGuardOnPath(
        guard,
        map.map((row) => row[guard.cell.x])
      );
      break;
    case Direction.LEFT:
      walkGuardOnPath(guard, [...map[guard.cell.y]].reverse());
      break;
    case Direction.RIGHT:
      walkGuardOnPath(guard, map[guard.cell.y]);
      break;
  }

  if (
    guard.visitedTurns.some(
      (turn) =>
        turn.y === guard.cell.y &&
        turn.x === guard.cell.x &&
        turn.direction === guard.direction
    )
  ) {
    guard.stuck = true;
    return guard;
  }
  guard.visitedTurns.push({
    y: guard.cell.y,
    x: guard.cell.x,
    direction: guard.direction,
  });
  guard.direction = directionChange[guard.direction];
  guard.cell.value = directions[guard.direction] as CellValue;

  // if (guard.stuck) console.log("Guard is stuck!!!!");
  if (!guard.present) {
    guard.cell.value = "X";
    // console.log("Guard has left the building!!!!");
  }

  // drawMap(map);
  return guard;
};

const drawMap = (map: Map) => {
  console.log(
    map.map((row) => row.map((cell) => cell.value).join("")).join("\n")
  );
  console.log("--------------------");
};

const getStartMap = () => {
  // deep copy would be better but meh
  return fs
    .readFileSync(mapInput, "utf8")
    .split("\n")
    .map((row, y) =>
      row
        .split("")
        .map((cellValue, x) => new Cell(y, x, cellValue as CellValue))
    );
};

const run = () => {
  const unobstructedMap = getStartMap();

  // console.log("start map");
  // drawMap(unobstructedMap);
  const guard = findGuard(unobstructedMap);
  const guardStart = { y: guard.cell.y, x: guard.cell.x };

  // grab all the cells the guard will walk on
  while (guard.present && !guard.stuck) moveGuard(guard, unobstructedMap);

  const walkedCells = unobstructedMap
    .flat()
    .filter((cell) => cell.value === "X")
    .filter((cell) => cell.y !== guardStart.y || cell.x !== guardStart.x);

  let validObstructions = 0;

  walkedCells.forEach((walkedCell) => {
    const map = getStartMap();
    // obstruct the cell
    map[walkedCell.y][walkedCell.x].value = "O";
    // console.log("start obstructed map", walkedCell);
    const guard = findGuard(map);
    while (guard.present && !guard.stuck) moveGuard(guard, map);
    // drawMap(map);
    if (guard.stuck) validObstructions++;
  });
  console.log({ count: validObstructions });
};

withMetrics(run);
