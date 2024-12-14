import * as fs from "fs";
import { withMetrics } from "../../utils";
import util from "util";

const input = "input.txt";
// const input = "example_input.txt";

class Robot {
  constructor(
    public x: number,
    public y: number,
    public movement: [number, number]
  ) {}
}

const quarters = {
  NE: 0,
  NW: 0,
  SW: 0,
  SE: 0,
};

const run = (mapDimensions: { x: number; y: number }, limit: number) => {
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

  robots = robots.map((robot) => {
    let newX = robot.x + robot.movement[0] * limit;
    let newY = robot.y + robot.movement[1] * limit;
    // console.log({ robot, newX, newY });
    if (newX < 0) {
      newX =
        newX + mapDimensions.x * Math.abs(Math.floor(newX / mapDimensions.x));
    }
    if (newX >= mapDimensions.x) {
      newX = newX - mapDimensions.x * Math.floor(newX / mapDimensions.x);
    }
    if (newY < 0) {
      newY =
        newY + mapDimensions.y * Math.abs(Math.floor(newY / mapDimensions.y));
    }
    if (newY >= mapDimensions.y) {
      newY =
        newY - mapDimensions.y * Math.abs(Math.floor(newY / mapDimensions.y));
    }
    robot.x = newX;
    robot.y = newY;
    const rejected =
      robot.x === mapDimensions.x / 2 - 0.5 ||
      robot.y === mapDimensions.y / 2 - 0.5;
    // console.log("rejected", rejected, robot);
    if (!rejected)
      quarters[
        `${robot.y < mapDimensions.y / 2 ? "N" : "S"}${
          robot.x < mapDimensions.x / 2 ? "W" : "E"
        }`
      ] += 1;
    return robot;
  });
  // console.log("new robots", robots);
  // console.log("quarters", quarters);
  return Object.values(quarters).reduce((acc, curr) => acc * curr, 1);
};

withMetrics(() =>
  run(
    {
      x: 101,
      y: 103,
    },
    100
  )
);
