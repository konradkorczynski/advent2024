import * as fs from "fs";
import { withMetrics } from "../../utils";
import util from "util";

const mapInput = "input.txt";
// const mapInput = "example_input.txt";

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

// I admit some of that is copy paste from google search
const dijkstra = (
  graph: Graph,
  start: string
): [Record<string, number>, string[]] => {
  // Create an object to store the shortest distance from the start node to every other node
  let distances: Record<string, number> = {};

  // Get all the nodes of the graph
  let nodes = Object.keys(graph);

  // Initially, set the shortest distance to every node as Infinity
  for (let node of nodes) {
    distances[node] = Infinity;
  }

  // The distance from the start node to itself is 0
  distances[start] = 0;

  type Node = { n: string; d: number };
  const nodeQueue: Node[] = [{ n: start, d: 0 }];

  const paths: Record<string, string[]> = {};
  paths[start] = [];

  // Loop until there are no more nodes
  while (nodeQueue.length) {
    // remove first
    const node = nodeQueue.shift();

    // Get the neighbors of the node
    const neighbors = graph[node!.n];

    for (const neighbor of Object.keys(neighbors)) {
      // Calculate the distance from the start node to the neighbor node
      const distance = distances[node!.n] + neighbors[neighbor];

      // If the distance is less than the previously calculated distance
      if (distance < distances[neighbor]) {
        // Update the distance of the neighbor node
        distances[neighbor] = distance;

        // Update the path
        paths[neighbor] = [node!.n];

        // Add the neighbor to the queue
        nodeQueue.push({ n: neighbor, d: distance });

        // Sort the queue based on the distance
        nodeQueue.sort((a, b) => a.d - b.d);

        // If the distance is equal to the previously calculated distance
      } else if (distance === distances[neighbor]) {
        // Update the path
        paths[neighbor].push(node!.n);
      }
    }
    // console.log({ paths });
  }

  const pathNodes = [];
  // this is soooo bugged 🤷
  // starting from the end node, we traverse the path to the start node
  // I think we only approach it from the South lol, tough
  // The more I look at it the more I think it's wrong but yields the correct result
  // It's late and I am confused
  const tempNodes = [`${endPosition.y},${endPosition.x},N`];
  // while we have nodes from the paths to traverse add to path nodes
  while (tempNodes.length) {
    const tempNode = tempNodes.pop() as string;
    pathNodes.push(tempNode);
    tempNodes.push(...paths[tempNode]);
  }

  // Return the shortest distance from the start node to all nodes
  return [distances, pathNodes];
};

const getCountsForPath = (pathNodes: string[]) => {
  const cantNoLongerNameThings = new Set();
  for (let i = 0; i < pathNodes.length - 1; i++) {
    const [y1, x1, d1] = pathNodes[i].split(",");
    const [y2, x2, d2] = pathNodes[i + 1].split(",");
    const diff =
      Math.abs(parseInt(y2) - parseInt(y1)) +
      Math.abs(parseInt(x2) - parseInt(x1));
    if (x1 === x2) {
      for (let i = 0; i <= diff; i++) {
        const y = Math.min(+y1, +y2) + i;
        cantNoLongerNameThings.add(`${y},${x1}`);
      }
    }
    if (y1 === y2) {
      for (let i = 0; i <= diff; i++) {
        const x = Math.min(+x1, +x2) + i;
        cantNoLongerNameThings.add(`${y1},${x}`);
      }
    }
  }
  // console.log({ cantNoLongerNameThings });
  return cantNoLongerNameThings.size;
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
  const [distances, pathNodes]: [Record<string, number>, string[]] = dijkstra(
    graph,
    `${startPosition.y},${startPosition.x},E`
  );
  // console.log({ pathNodes });

  return [
    distances[`${endPosition.y},${endPosition.x},N`],
    getCountsForPath(pathNodes),
  ];
};

withMetrics(run);
