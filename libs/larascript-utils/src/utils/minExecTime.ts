/* eslint-disable @typescript-eslint/no-explicit-any */
export type MinExecTimeFn<T> = (...args: any[]) => Promise<T>;

export const minExecTime = async <T>(
  minMs: number,
  fn: MinExecTimeFn<T>,
): Promise<T> => {
  const start = Date.now();
  const result = await fn();
  const end = Date.now();
  const duration = end - start;

  if (duration < minMs) {
    await sleepMs(minMs - duration);
  }

  return result;
};

export const sleepMs = (ms: number) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};
