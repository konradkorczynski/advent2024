import { withMetrics } from "../../utils/withMetrics";

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const run = async () => {
  const fn = (n: number): Promise<number> => {
    return new Promise(async (resolve) => {
      const timeout = Math.random() * 1000;
      await sleep(timeout);
      console.log({ n, timeout });
      resolve(timeout);
    });
  };

  console.log("start", Date.now());
  const a: number[] = await Promise.all([
    fn(1),
    fn(2),
    fn(3),
    fn(4),
    fn(5),
    fn(6),
    fn(7),
    fn(8),
    fn(9),
    fn(10),
    fn(11),
    fn(12),
    fn(13),
    fn(14),
    fn(15),
    fn(16),
    fn(17),
    fn(18),
    fn(19),
    fn(20),
  ]);

  const sum = a.reduce((acc, curr: number) => acc + curr, 0);
  return sum;
};

withMetrics(run);
