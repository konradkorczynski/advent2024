import * as fs from "fs";
import { withMetrics } from "../../utils";
import util from "util";

const mapInput = "input.txt";
// const mapInput = "example_input.txt";

class Cell {
  constructor(
    public y: number,
    public x: number,
    public value: number,
    public trailhead?: string
  ) {}
}
type Map = Cell[];

const removeDuplicates = (cells: Cell[]): Cell[] => {
  const result: Cell[] = [];
  const map = new Map<string, boolean>();
  cells.forEach((cell) => {
    const key = `${cell.y}${cell.x}${cell.trailhead!}`;
    if (!map.has(key)) {
      map.set(key, true);
      result.push(cell);
    }
  });

  return result;
};

const run = () => {
  let result = 0;

  const startingCells: Cell[] = [];
  const map: Map = fs
    .readFileSync(mapInput, "utf8")
    .split("\n")
    .flatMap((row, y) =>
      row.split("").map((cellValue, x) => {
        const cell = new Cell(y, x, parseInt(cellValue));
        if (cell.value === 0) {
          cell.trailhead = `${y}${x}`;
          startingCells.push(cell);
        }

        return cell;
      })
    );

  startingCells.forEach((cell) => {
    // this didn't work for all cells at the same time for some reason and I don't have time to look into it
    let paths = [cell];
    // console.log(util.inspect({ paths }, false, null, true));

    for (let index = 1; index < 10; index++) {
      // console.log(`Step ${index} -------------------`);

      paths = paths.flatMap((startCell) => {
        const cells = map.filter((mapCell) => {
          return (
            mapCell.value === startCell.value + 1 &&
            ((mapCell.x === startCell.x + 1 && mapCell.y === startCell.y) ||
              (mapCell.x === startCell.x - 1 && mapCell.y === startCell.y) ||
              (mapCell.x === startCell.x && mapCell.y === startCell.y + 1) ||
              (mapCell.x === startCell.x && mapCell.y === startCell.y - 1))
          );
        });
        cells.forEach((c) => {
          c.trailhead = startCell.trailhead;
        });
        // console.log(util.inspect({ startCell }, false, null, true));
        return cells;
      });

      // console.log(util.inspect({ paths }, false, null, true));
    }
    paths = removeDuplicates(paths);
    // console.log(
    //   util.inspect(
    //     { trailhead: cell.trailhead, count: paths.length },
    //     false,
    //     null,
    //     true
    //   )
    // );
    result += paths.length;
  });

  return result;
};

withMetrics(run);
