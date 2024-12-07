export const withMetrics = async (cb: Function) => {
  const start = Date.now();
  const result = await cb();
  const end = Date.now();
  const used = process.memoryUsage();
  console.log({ result, time: `${end - start}ms`, memory: used });
};
