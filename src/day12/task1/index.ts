import * as fs from "fs";
import { withMetrics } from "../../utils";
import util from "util";

const input = "input.txt";
// const input = "example_input.txt";

class Cell {
  constructor(
    public y: number,
    public x: number,
    public value: string,
    public sides?: number
  ) {}
}

class Plot {
  constructor(
    public cells: Cell[],
    public perimeter?: number,
    public area?: number
  ) {}
}

const plotsCollection: Record<string, Plot[]> = {};

const cellBelongsToPlot = (cell: Cell, plots: Plot[]) => {
  return plots.some((plot) =>
    plot.cells.some(
      (plotCell) =>
        plotCell.x === cell.x &&
        plotCell.y === cell.y &&
        plotCell.value === cell.value
    )
  );
};

const getPerimeter = (plot: Plot) => {
  return plot.cells.reduce((acc, cell) => {
    let sides = 4;
    // console.log(`---- calculating sides for cell ${cell.x}, ${cell.y}`);
    if (plot.cells.some((pc) => pc.x + 1 === cell.x && pc.y === cell.y))
      sides--;

    if (plot.cells.some((pc) => pc.x - 1 === cell.x && pc.y === cell.y))
      sides--;

    if (plot.cells.some((pc) => pc.y + 1 === cell.y && pc.x === cell.x))
      sides--;

    if (plot.cells.some((pc) => pc.y - 1 === cell.y && pc.x === cell.x))
      sides--;

    cell.sides = sides;
    return acc + sides;
  }, 0);
};

const getArea = (plot: Plot) => plot.cells.length;

const run = () => {
  const map = fs
    .readFileSync(input, "utf8")
    .split("\n")
    .flatMap((row, y) => {
      return row.split("").map((cellValue, x) => new Cell(y, x, cellValue));
    });

  map.forEach((cell) => {
    // console.log(`---- processing cell ${cell.value},${cell.x},${cell.y}`);
    const plots = plotsCollection[cell.value] || [];
    if (!cellBelongsToPlot(cell, plots)) {
      const plot = new Plot([cell]);
      plots.push(plot);
      plotsCollection[cell.value] = plots;

      let i = 0;
      while (i < plot.cells.length) {
        const currentCell = plot.cells[i];
        const neighbors = [
          map.find((c) => c.x === currentCell.x + 1 && c.y === currentCell.y),
          map.find((c) => c.x === currentCell.x - 1 && c.y === currentCell.y),
          map.find((c) => c.y === currentCell.y + 1 && c.x === currentCell.x),
          map.find((c) => c.y === currentCell.y - 1 && c.x === currentCell.x),
        ].filter((c) => c && c.value === cell.value);

        neighbors.forEach((neighbor) => {
          if (!cellBelongsToPlot(neighbor!, [plot])) {
            plot.cells.push(neighbor!);
          }
        });

        i++;
      }
    }
  });

  let result = 0;

  Object.values(plotsCollection).forEach((plots) => {
    plots.forEach((plot) => {
      plot.perimeter = getPerimeter(plot);
      plot.area = getArea(plot);
      result += plot.perimeter * plot.area;
    });
  });

  // console.log(
  //   util.inspect(
  //     { plotsCollection },
  //     false,
  //     null,
  //     true
  //   )
  // );

  return result;
};

withMetrics(run);
