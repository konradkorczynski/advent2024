import * as fs from "fs";
import { withMetrics } from "../../utils";
import util from "util";

// const mapInput = "input.txt";
const mapInput = "example_input.txt";

type Direction = "N" | "E" | "S" | "W";
type CellValue = "#" | "." | "S" | "E";

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
type Map = Cell[][];
type Graph = Record<string, Record<string, number>>;

const graph: Graph = {};

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

const allDirections: Direction[] = ["N", "E", "S", "W"];

const addLastToGraph = (map: Map, cell: Cell, direction: Direction) => {
  allDirections.forEach((dir) => {
    const line = getLine(map, cell, direction);
    const last = line.pop();
    const cellKey = `${cell.y},${cell.x},${dir}`;
    if (last && isNode(last)) {
      // console.log({ direction, last, line });
      if (!graph[cellKey]) {
        graph[cellKey] = {};
      }
      const lastKey = `${last.y},${last.x},${direction}`;
      graph[cellKey][lastKey] = line.length + (dir === direction ? 0 : 1000);
    }
  });
};

const isNode = (cell: Cell) =>
  cell.directions.length > 2 ||
  cell.value === "S" ||
  cell.value === "E" ||
  (cell.directions.length === 2 &&
    !inLineDirections.includes(cell.directions.join("")));

const inLineDirections = ["NS", "SN", "EW", "WE"];

const dijkstra = (graph: Graph, start: string) => {
  // Create an object to store the shortest distance from the start node to every other node
  type DistanceData = { d: number; s: string[] };
  let distances: Record<string, DistanceData[]> = {};

  // Get all the nodes of the graph
  let nodes = Object.keys(graph);

  // Initially, set the shortest distance to every node as Infinity
  for (let node of nodes) {
    distances[node] = [{ d: Infinity, s: [] }];
  }

  // The distance from the start node to itself is 0
  distances[start] = [{ d: 0, s: [start] }];

  // Loop until all nodes are visited
  while (nodes.length) {
    // Sort nodes by distance and pick the closest unvisited node
    nodes.sort((a, b) => distances[a][0].d - distances[b][0].d);

    let closestNode = nodes.shift();

    const dst = distances[closestNode!];
    dst.forEach((distanceData) => {
      // If the shortest distance to the closest node is still Infinity, then remaining nodes are unreachable and we can break
      if (distanceData.d === Infinity) return;

      // For each neighboring node of the current node
      for (let neighbor in graph[closestNode!]) {
        // Calculate tentative distance to the neighboring node
        let newDistance = distanceData.d + graph[closestNode!][neighbor];

        // If the newly calculated distance is shorter than the previously known distance to this neighbor
        if (newDistance < distanceData.d) {
          // Update the shortest distance to this neighbor
          distances[neighbor].push({
            d: newDistance,
            s: [...distanceData.s, neighbor],
          });
        }
      }
    });
  }

  // Return the shortest distance from the start node to all nodes
  return distances;
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
        return new Cell(y, x, cell as CellValue, []);
      });
    });

  // put directions on cells
  map
    .flat(1)
    .filter(
      (cell) => cell.value === "." || cell.value === "S" || cell.value === "E"
    )
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

  // sort out graph
  map
    .flat(1)
    .filter((cell) => {
      const notWall = cell.value === ".";
      return (
        (notWall && isNode(cell)) || cell.value === "S" || cell.value === "E"
      );
    })
    .forEach((cell) => {
      //   console.log({ cell });
      cell.directions.forEach((direction) => {
        addLastToGraph(map, cell, direction);
      });
    });

  //   console.log(util.inspect(graph, false, null, true /* enable colors */));
  const distances = dijkstra(graph, `${startPosition.y},${startPosition.x},E`);
  console.log(
    util.inspect({ distances }, false, null, true /* enable colors */)
  );
  console.log(distances[`${endPosition.y},${endPosition.x},N`]);

  return 0;
};

withMetrics(run);
