import * as fs from "fs";
import { withMetrics } from "../../utils";
import util from "util";

const mapInput = "input.txt";

class Cell {
  constructor(public y: number, public x: number, public value: string) {}
}
type Map = Cell[][];

const drawMap = (map: Map) => {
  console.log(
    map.map((row) => row.map((cell) => cell.value).join("")).join("\n")
  );
  console.log("--------------------");
};

const findAntennas = (map: Cell[][]) => {
  const antennas: Record<string, Cell[]> = {};
  map.forEach((row) => {
    row.forEach((cell) => {
      if (cell.value !== ".") {
        if (!antennas[cell.value]) antennas[cell.value] = [];
        antennas[cell.value].push(cell);
      }
    });
  });
  return antennas;
};

const run = () => {
  const map: Map = fs
    .readFileSync(mapInput, "utf8")
    .split("\n")
    .map((row, y) =>
      row.split("").map((cellValue, x) => new Cell(y, x, cellValue))
    );

  const mapWidth = map[0].length;
  const mapHeight = map.length;

  let result = 0;
  const antennas = findAntennas(map);

  Object.values(antennas).forEach((positions) => {
    positions.map((cell, i) => {
      positions.map((cell2, j) => {
        if (i !== j) {
          const dy = cell2.y - cell.y;
          const dx = cell2.x - cell.x;
          const ny = cell.y - dy;
          const nx = cell.x - dx;
          // console.log({ cell, cell2, dy, dx, ny, nx });
          if (ny >= 0 && ny < mapHeight && nx >= 0 && nx < mapWidth) {
            const antinodeCell = map[ny][nx];
            if (antinodeCell.value !== "#") {
              result++;
              antinodeCell.value = "#";
            }
          }
        }
      });
    });
  });
  drawMap(map);

  // console.log(
  //   util.inspect({ mapWidth, mapHeight, antennas }, false, null, true)
  // );

  return result;
};

withMetrics(run);
