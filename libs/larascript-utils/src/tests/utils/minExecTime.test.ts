import { describe, expect, jest, test } from "@jest/globals";
import { minExecTime, MinExecTimeFn, sleepMs } from "../../utils/minExecTime.js";

describe("minExecTime", () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe("execution time shorter than minimum", () => {
    test("should wait for minimum execution time", async () => {
      const fastFn: MinExecTimeFn<string> = jest
        .fn()
        .mockResolvedValue("result" as never) as MinExecTimeFn<string>;

      const promise = minExecTime(100, fastFn);

      // Fast execution completes immediately
      jest.advanceTimersByTime(50);
      await Promise.resolve(); // Allow microtasks to run

      // Should still be waiting for minimum time
      expect(fastFn).toHaveBeenCalled();

      // Advance to complete minimum time
      jest.advanceTimersByTime(50);
      await Promise.resolve();

      const result = await promise;
      expect(result).toBe("result");
    });
  });

  describe("execution time longer than minimum", () => {
    test("should not wait additional time", async () => {
      const slowFn: MinExecTimeFn<string> = jest
        .fn()
        .mockImplementation(async () => {
          jest.advanceTimersByTime(150);
          return "result";
        }) as MinExecTimeFn<string>;

      const promise = minExecTime(100, slowFn);

      // Function takes 150ms, which is longer than minimum 100ms
      jest.advanceTimersByTime(150);
      await Promise.resolve();

      const result = await promise;
      expect(result).toBe("result");
    });
  });

  describe("error handling", () => {
    test("should propagate errors from the function", async () => {
      const errorFn: MinExecTimeFn<never> = jest
        .fn()
        .mockRejectedValue(
          new Error("Test error") as never,
        ) as MinExecTimeFn<never>;

      const promise = minExecTime(100, errorFn);

      jest.advanceTimersByTime(100);

      await expect(promise).rejects.toThrow("Test error");
    });
  });
});

describe("sleepMs", () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test("should sleep for specified milliseconds", async () => {
    const promise = sleepMs(100);

    expect(promise).toBeInstanceOf(Promise);

    jest.advanceTimersByTime(100);
    await Promise.resolve();

    await expect(promise).resolves.toBeUndefined();
  });

  test("should handle zero milliseconds", async () => {
    const promise = sleepMs(0);

    jest.advanceTimersByTime(0);
    await Promise.resolve();

    await expect(promise).resolves.toBeUndefined();
  });
});
