import * as fs from "fs";

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

type CellValue = "#" | "X" | "." | keyof typeof startDirections;

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
    public present: boolean
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
  const endIndex = firstPathSlice.findIndex((cell) => cell.value === "#");
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
  guard.direction = directionChange[guard.direction];
  guard.cell.value = directions[guard.direction] as CellValue;

  drawMap(map);

  return guard;
};

const drawMap = (map: Map) => {
  console.log(
    map.map((row) => row.map((cell) => cell.value).join("")).join("\n")
  );
  console.log("--------------------");
};

const run = () => {
  const map: Map = fs
    .readFileSync(mapInput, "utf8")
    .split("\n")
    .map((row, y) =>
      row
        .split("")
        .map((cellValue, x) => new Cell(y, x, cellValue as CellValue))
    );

  console.log("start map");
  drawMap(map);
  const guard = findGuard(map);

  while (guard.present) moveGuard(guard, map);

  console.log({
    numberOfCells: map.flat().filter((cell) => cell.value === "X").length + 1, // +1 for the guard at the end move
  });
};

run();
