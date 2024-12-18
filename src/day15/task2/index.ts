import * as fs from "fs";
import { withMetrics } from "../../utils";
import util from "util";

const mapInput = "input.txt";
const movesInput = "moves.txt";
// const mapInput = "example_input.txt";
// const movesInput = "example_moves.txt";

type CellValue = "#" | "." | "[" | "]" | "@";

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

let movedBoxes: string[] = [];

class Box {
  public isMovable: boolean = false;
  private boxesAlongTheWay: Box[] = [];
  private moveDirectionValue: number;
  private move: Move;
  private map: Map;
  private leftCell: Cell;
  private rightCell: Cell;
  public hasMoved: boolean = false;
  constructor(leftCell: Cell, rightCell: Cell, map: Map, move: Move) {
    this.move = move;
    this.map = map;
    this.leftCell = leftCell;
    this.rightCell = rightCell;

    this.moveDirectionValue = move === "^" ? leftCell.y - 1 : leftCell.y + 1;
    this.boxesAlongTheWay = this.getNeighboringBoxes();
    this.isMovable = this.checkIfMovable();
  }

  private getNeighboringBoxes(): Box[] {
    const boxes = [];
    // one box above
    if (
      this.map[this.moveDirectionValue][this.leftCell.x].value === "[" &&
      this.map[this.moveDirectionValue][this.rightCell.x].value === "]"
    ) {
      boxes.push(
        new Box(
          this.map[this.moveDirectionValue][this.leftCell.x],
          this.map[this.moveDirectionValue][this.rightCell.x],
          this.map,
          this.move
        )
      );
    }
    // one box above left
    if (this.map[this.moveDirectionValue][this.leftCell.x].value === "]") {
      boxes.push(
        new Box(
          this.map[this.moveDirectionValue][this.leftCell.x - 1],
          this.map[this.moveDirectionValue][this.leftCell.x],
          this.map,
          this.move
        )
      );
    }
    // one box above right
    if (this.map[this.moveDirectionValue][this.rightCell.x].value === "[") {
      boxes.push(
        new Box(
          this.map[this.moveDirectionValue][this.rightCell.x],
          this.map[this.moveDirectionValue][this.rightCell.x + 1],
          this.map,
          this.move
        )
      );
    }
    return boxes;
  }

  private checkIfMovable(): boolean {
    // blocked by wall
    if (
      this.map[this.moveDirectionValue][this.leftCell.x].value === "#" ||
      this.map[this.moveDirectionValue][this.rightCell.x].value === "#"
    ) {
      return false;
    }
    // empty space
    if (
      this.map[this.moveDirectionValue][this.leftCell.x].value === "." &&
      this.map[this.moveDirectionValue][this.rightCell.x].value === "."
    ) {
      return true;
    }
    // box along the way
    return this.boxesAlongTheWay.every((box) => box.isMovable);
  }

  moveBox() {
    if (this.isMovable) {
      this.boxesAlongTheWay.forEach((box) => {
        box.moveBox();
      });
      // drawMap(this.map);
      const movedBoxeKey = `${this.leftCell.y},${this.leftCell.x}`;
      if (movedBoxes.includes(movedBoxeKey)) {
        return false;
      }
      movedBoxes.push(movedBoxeKey);
      this.leftCell.value = ".";
      this.rightCell.value = ".";
      this.map[this.moveDirectionValue][this.leftCell.x].value = "[";
      this.map[this.moveDirectionValue][this.rightCell.x].value = "]";
    }
    return this.isMovable;
  }

  // clean up if this makes any sense - might later, dunno
  clear() {
    this.boxesAlongTheWay.forEach((box) => {
      box.clear();
    });
    this.boxesAlongTheWay = [];
  }
}

const moveRobot = (
  map: Map,
  robotPosition: { y: number; x: number },
  move: Move
) => {
  const { y, x } = robotPosition;
  const line = getLine(map, y, x, move);
  // console.log("making move", { line, move });
  if (move === ">" || move === "<") {
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
  } else {
    //  don't move - wall
    if (line[1].value === "#") return;
    // move straight to the empty space
    if (line[1].value === ".") {
      robotPosition.y = line[1].y;
      robotPosition.x = line[1].x;
      line[0].value = ".";
      line[1].value = "@";
      return;
    }
    // create a box and move if you can
    const moveDirectionValue =
      move === "^" ? robotPosition.y - 1 : robotPosition.y + 1;
    let box: Box | null = null;
    if (line[1].value === "[") {
      box = new Box(
        map[moveDirectionValue][robotPosition.x],
        map[moveDirectionValue][robotPosition.x + 1],
        map,
        move
      );
    } else if (line[1].value === "]") {
      box = new Box(
        map[moveDirectionValue][robotPosition.x - 1],
        map[moveDirectionValue][robotPosition.x],
        map,
        move
      );
    }

    if (box?.moveBox()) {
      robotPosition.y = line[1].y;
      robotPosition.x = line[1].x;
      line[0].value = ".";
      line[1].value = "@";
    }
    box?.clear();
  }
  // console.log({ arr, line });
};

const drawMap = (map: Map, toFile?: boolean, move?: Move) => {
  if (toFile && move) {
    fs.appendFileSync("output.txt", "\n");
  }
  map.forEach((row) => {
    if (toFile) {
      fs.appendFileSync(
        "output.txt",
        row
          .map((cell) => (cell.value === "@" && move ? move : cell.value))
          .join("")
      );
      fs.appendFileSync("output.txt", "\n");
    } else {
      console.log(
        row
          .map((cell) => (cell.value === "@" && move ? move : cell.value))
          .join("")
      );
    }
  });
};

const run = () => {
  // console.log("------------ start ------------");
  const robotPosition = { y: 0, x: 0 };

  const map: Map = fs
    .readFileSync(mapInput, "utf8")
    .split("\n")
    .map((row, y) => {
      return row.split("").flatMap((cell, x) => {
        if (cell === "@") {
          robotPosition.y = y;
          robotPosition.x = x * 2;
          return [
            new Cell(y, x * 2, cell as CellValue),
            new Cell(y, x * 2 + 1, "." as CellValue),
          ];
        }
        if (cell === "O") {
          return [
            new Cell(y, x * 2, "[" as CellValue),
            new Cell(y, x * 2 + 1, "]" as CellValue),
          ];
        }
        return [
          new Cell(y, x * 2, cell as CellValue),
          new Cell(y, x * 2 + 1, cell as CellValue),
        ];
      });
    });

  const moves = fs.readFileSync(movesInput, "utf8").split("\n").join("");

  const toFile = false;

  drawMap(map, toFile);
  moves.split("").forEach((move, i) => {
    moveRobot(map, robotPosition, move as Move);
    movedBoxes = [];
    sleep(10); console.clear();
    drawMap(map, toFile, move as Move);
    console.log("move: ", i);
  });
  // console.log({ robotPosition, moves });

  return map
    .flat()
    .filter((cell) => cell.value === "[")
    .reduce((acc, curr) => acc + curr.x + 100 * curr.y, 0);
};

withMetrics(run);

function sleep(n: number) {
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, n);
}
