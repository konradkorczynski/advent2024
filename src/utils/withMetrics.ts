export const withMetrics = (cb: Function) => {
  const start = Date.now();
  cb();
  const end = Date.now();
  const used = process.memoryUsage();
  console.log({ time: `${end - start}ms`, memory: used });
};
