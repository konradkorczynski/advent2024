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
    public sides: ("N" | "E" | "S" | "W")[]
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

/**
 * Ok, this is a bit weird, but works.
 * Firstly, I calculate the sides for each cell in the plot adding them to an array on the cell,
 * indicating which N,S,W,E side it is - that's an extension from task1.
 * Then for the square bounds of the plot, I first iterate over rows to find the N and S sides.
 * Later I iterate over columns to find the E and W sides.
 * For each type of a side when going through a row or column, for each cell in the array,
 * I check for continuity of the side, if it's not there, I reset the check.
 */
const getPerimeter = (plot: Plot) => {
  // console.log(`---- calculating sides for plot ${plot.cells[0].value}`);
  plot.cells.forEach((cell) => {
    if (!plot.cells.some((pc) => pc.x + 1 === cell.x && pc.y === cell.y))
      cell.sides.push("W");

    if (!plot.cells.some((pc) => pc.x - 1 === cell.x && pc.y === cell.y))
      cell.sides.push("E");

    if (!plot.cells.some((pc) => pc.y + 1 === cell.y && pc.x === cell.x))
      cell.sides.push("N");

    if (!plot.cells.some((pc) => pc.y - 1 === cell.y && pc.x === cell.x))
      cell.sides.push("S");
  });

  let Nsides = 0;
  let Ssides = 0;
  let Wsides = 0;
  let Esides = 0;

  const plotMinX = Math.min(...plot.cells.map((c) => c.x));
  const plotMaxX = Math.max(...plot.cells.map((c) => c.x));
  const plotMinY = Math.min(...plot.cells.map((c) => c.y));
  const plotMaxY = Math.max(...plot.cells.map((c) => c.y));

  // console.log({ plotMinX, plotMaxX, plotMinY, plotMaxY });

  for (let y = plotMinY; y <= plotMaxY; y++) {
    let rowCheckN = false;
    let rowCheckS = false;
    for (let x = plotMinX; x <= plotMaxX; x++) {
      const presentCell = plot.cells.find((c) => c.x === x && c.y === y);
      if (!rowCheckN && presentCell) {
        // console.log("adding side N", { presentCell });
        if (presentCell.sides.includes("N")) {
          Nsides++;
          rowCheckN = true;
        }
      }
      if (rowCheckN && presentCell && !presentCell.sides.includes("N")) {
        rowCheckN = false;
      }
      if (!rowCheckS && presentCell) {
        // console.log("adding side S", { presentCell });
        if (presentCell.sides.includes("S")) {
          Ssides++;
          rowCheckS = true;
        }
      }
      if (rowCheckS && presentCell && !presentCell.sides.includes("S")) {
        rowCheckS = false;
      }
      if (!presentCell) {
        rowCheckN = false;
        rowCheckS = false;
      }
    }
  }

  for (let x = plotMinX; x <= plotMaxX; x++) {
    let rowCheckE = false;
    let rowCheckW = false;
    for (let y = plotMinY; y <= plotMaxY; y++) {
      const presentCell = plot.cells.find((c) => c.x === x && c.y === y);
      if (!rowCheckE && presentCell) {
        // console.log("adding side E", { presentCell });
        if (presentCell.sides.includes("E")) {
          Esides++;
          rowCheckE = true;
        }
      }
      if (rowCheckE && presentCell && !presentCell.sides.includes("E")) {
        rowCheckE = false;
      }
      if (!rowCheckW && presentCell) {
        // console.log("adding side S", { presentCell });
        if (presentCell.sides.includes("W")) {
          Wsides++;
          rowCheckW = true;
        }
      }
      if (rowCheckW && presentCell && !presentCell.sides.includes("W")) {
        rowCheckW = false;
      }
      if (!presentCell) {
        rowCheckE = false;
        rowCheckW = false;
      }
    }
  }

  // console.log({ Nsides, Ssides, Esides, Wsides });

  return Nsides + Ssides + Wsides + Esides;
};

const getArea = (plot: Plot) => plot.cells.length;

const run = () => {
  const map = fs
    .readFileSync(input, "utf8")
    .split("\n")
    .flatMap((row, y) => {
      return row.split("").map((cellValue, x) => new Cell(y, x, cellValue, []));
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

  // console.log(util.inspect({ plotsCollection }, false, null, true));

  return result;
};

withMetrics(run);
