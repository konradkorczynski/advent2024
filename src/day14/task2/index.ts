import * as fs from "fs";
import { withMetrics } from "../../utils";

const input = "input.txt";
// const input = "example_input.txt";

class Robot {
  constructor(
    public x: number,
    public y: number,
    public movement: [number, number]
  ) {}
}

type MapDimensions = {
  x: number;
  y: number;
};

const printStupidMapSoICanSeeWhatTheShitIsGoingOn = (
  iteration: number,
  mapDimensions: MapDimensions,
  robots: Robot[]
) => {
  const stupidMap = Array.from({ length: mapDimensions.y }, () =>
    Array.from({ length: mapDimensions.x }, () => ".")
  );

  robots.forEach((robot) => {
    stupidMap[robot.y][robot.x] = "#";
  });

  fs.appendFileSync("map.txt", `-------> Iteration: ${iteration}\n`);
  fs.appendFileSync(
    "map.txt",
    stupidMap.map((row) => row.join("")).join("\n") + "\n\n"
  );
};

const areNumbersConsecutive = (numbers: number[], size: number): boolean => {
  const sorted = numbers.sort((a, b) => a - b);
  let count = 0;
  for (let i = 0; i < sorted.length - 1; i++) {
    if (sorted[i] + 1 === sorted[i + 1]) {
      count++;
    }
  }
  return count >= size;
};

const getXPositions = (
  robots: Robot[],
  y: number,
  bottomCount: number
): number[] => {
  const row = robots.filter((robot) => robot.y === y);
  if (row.length < bottomCount) {
    return [];
  }
  return row.map((robot) => robot.x);
};

// this is still bugged (e.g. when the branches don't align), but screw this, don't want to spend more time on this
const areRobotsArrangedAsTheBloodyThingIAmSomehowExpectedToKnowHowItLooks = (
  mapDimensions: MapDimensions,
  robots: Robot[],
  bottomCount: number
): boolean => {
  for (let i = 0; i < mapDimensions.y; i++) {
    const xPositions = getXPositions(robots, i, bottomCount);
    if (areNumbersConsecutive(xPositions, bottomCount)) {
      if (
        areNumbersConsecutive(
          getXPositions(robots, i - 1, bottomCount - 2),
          bottomCount - 2
        ) &&
        areNumbersConsecutive(
          getXPositions(robots, i - 2, bottomCount - 4),
          bottomCount - 4
        )
      ) {
        return true;
      }
    }
  }
  return false;
};

const run = (mapDimensions: MapDimensions, bottomCount: number) => {
  let robots = fs
    .readFileSync(input, "utf8")
    .split("\n")
    .map((row) => {
      const split1 = row.split(" ");
      const position = split1[0]
        .slice(2, split1[0].length)
        .split(",")
        .map(Number);
      const movement = split1[1]
        .slice(2, split1[1].length)
        .split(",")
        .map(Number);
      return new Robot(position[0], position[1], movement as [number, number]);
    });

  // console.log(robots);

  let finished = false;

  let i = 0;
  while (!finished) {
    robots = robots.map((robot) => {
      let newX = robot.x + robot.movement[0];
      if (newX < 0) {
        newX = newX + mapDimensions.x;
      }
      if (newX >= mapDimensions.x) {
        newX = newX - mapDimensions.x;
      }
      let newY = robot.y + robot.movement[1];
      if (newY < 0) {
        newY = newY + mapDimensions.y;
      }
      if (newY >= mapDimensions.y) {
        newY = newY - mapDimensions.y;
      }
      robot.x = newX;
      robot.y = newY;

      return robot;
    });
    i++;
    finished =
      areRobotsArrangedAsTheBloodyThingIAmSomehowExpectedToKnowHowItLooks(
        mapDimensions,
        robots,
        bottomCount
      );

    if (i === 100000) {
      throw new Error("You went too far, this is shit, go outside.");
    }
    // printStupidMapSoICanSeeWhatTheShitIsGoingOn(i, mapDimensions, robots);
  }

  // console.log("new robots", robots);
  // console.log("quarters", quarters);
  return i;
};

withMetrics(() =>
  run(
    {
      x: 101,
      y: 103,
    },
    20
  )
);
