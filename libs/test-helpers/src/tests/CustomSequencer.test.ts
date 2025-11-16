import { beforeEach, describe, expect, test } from "@jest/globals";
import { CustomSequencer } from "../test-helpers/CustomSequencer.js";

describe("CustomSequencer", () => {
  let sequencer: CustomSequencer;
  let mockTests: any[];
  let priorities: string[];

  beforeEach(() => {
    sequencer = new CustomSequencer();
    priorities = ["priority1", "priority2", "priority3"];

    mockTests = [
      { path: "/path/to/test1.spec.ts" },
      { path: "/path/to/priority1/test.spec.ts" },
      { path: "/path/to/test2.spec.ts" },
      { path: "/path/to/priority2/test.spec.ts" },
      { path: "/path/to/test3.spec.ts" },
      { path: "/path/to/priority3/test.spec.ts" },
    ];
  });

  describe("getTestPriority", () => {
    test("should return correct priority index for test in priority list", () => {
      const testPath = "/path/to/priority1/test.spec.ts";
      const priority = sequencer.getTestPriority(testPath, priorities);
      expect(priority).toBe(0);
    });

    test("should return correct priority index for second priority", () => {
      const testPath = "/path/to/priority2/test.spec.ts";
      const priority = sequencer.getTestPriority(testPath, priorities);
      expect(priority).toBe(1);
    });

    test("should return correct priority index for third priority", () => {
      const testPath = "/path/to/priority3/test.spec.ts";
      const priority = sequencer.getTestPriority(testPath, priorities);
      expect(priority).toBe(2);
    });

    test("should return -1 for test not in priority list", () => {
      const testPath = "/path/to/regular/test.spec.ts";
      const priority = sequencer.getTestPriority(testPath, priorities);
      expect(priority).toBe(-1);
    });

    test("should return -1 for empty priority list", () => {
      const testPath = "/path/to/priority1/test.spec.ts";
      const priority = sequencer.getTestPriority(testPath, []);
      expect(priority).toBe(-1);
    });

    test("should handle partial matches correctly", () => {
      const testPath = "/path/to/priority1/another/test.spec.ts";
      const priority = sequencer.getTestPriority(testPath, priorities);
      expect(priority).toBe(0);
    });
  });

  describe("sort", () => {
    test("should sort tests by priority when all tests have priorities", () => {
      const testsWithPriorities = [
        { path: "/path/to/priority3/test.spec.ts" },
        { path: "/path/to/priority1/test.spec.ts" },
        { path: "/path/to/priority2/test.spec.ts" },
      ];

      const sortedTests = sequencer.sort(
        testsWithPriorities,
        priorities,
        undefined,
      );

      expect(sortedTests[0].path).toContain("priority1");
      expect(sortedTests[1].path).toContain("priority2");
      expect(sortedTests[2].path).toContain("priority3");
    });

    test("should put prioritized tests before non-prioritized tests", () => {
      const mixedTests = [
        { path: "/path/to/regular/test1.spec.ts" },
        { path: "/path/to/priority1/test.spec.ts" },
        { path: "/path/to/regular/test2.spec.ts" },
        { path: "/path/to/priority2/test.spec.ts" },
      ];

      const sortedTests = sequencer.sort(mixedTests, priorities, undefined);

      expect(sortedTests[0].path).toContain("priority1");
      expect(sortedTests[1].path).toContain("priority2");
      expect(sortedTests[2].path).toContain("regular");
      expect(sortedTests[3].path).toContain("regular");
    });

    test("should maintain relative order of non-prioritized tests", () => {
      const nonPrioritizedTests = [
        { path: "/path/to/regular/test1.spec.ts" },
        { path: "/path/to/regular/test2.spec.ts" },
        { path: "/path/to/regular/test3.spec.ts" },
      ];

      const sortedTests = sequencer.sort(
        nonPrioritizedTests,
        priorities,
        undefined,
      );

      expect(sortedTests[0].path).toContain("test1");
      expect(sortedTests[1].path).toContain("test2");
      expect(sortedTests[2].path).toContain("test3");
    });

    test("should handle empty test array", () => {
      const sortedTests = sequencer.sort([], priorities, undefined);
      expect(sortedTests).toEqual([]);
    });

    test("should handle empty priority array", () => {
      const sortedTests = sequencer.sort(mockTests, [], undefined);
      expect(sortedTests).toEqual(mockTests);
    });

    test("should add lastTest to the end when provided", () => {
      const lastTest = { path: "/path/to/last/test.spec.ts" };
      const sortedTests = sequencer.sort(mockTests, priorities, lastTest);

      expect(sortedTests).toHaveLength(mockTests.length + 1);
      expect(sortedTests[sortedTests.length - 1]).toBe(lastTest);
    });

    test("should add lastTest and sort it according to priority", () => {
      const lastTest = { path: "/path/to/priority1/last/test.spec.ts" };
      const sortedTests = sequencer.sort(mockTests, priorities, lastTest);

      expect(sortedTests).toHaveLength(mockTests.length + 1);
      expect(sortedTests).toContain(lastTest);

      // Since lastTest has priority1, it should be sorted to the beginning
      // along with other priority1 tests
      const priority1Tests = sortedTests.filter((test) =>
        test.path.includes("priority1"),
      );
      expect(priority1Tests).toContain(lastTest);
    });

    test("should handle single test with priority", () => {
      const singleTest = [{ path: "/path/to/priority2/test.spec.ts" }];
      const sortedTests = sequencer.sort(singleTest, priorities, undefined);

      expect(sortedTests).toHaveLength(1);
      expect(sortedTests[0].path).toContain("priority2");
    });

    test("should handle single test without priority", () => {
      const singleTest = [{ path: "/path/to/regular/test.spec.ts" }];
      const sortedTests = sequencer.sort(singleTest, priorities, undefined);

      expect(sortedTests).toHaveLength(1);
      expect(sortedTests[0].path).toContain("regular");
    });

    test("should handle case where only some tests have priorities", () => {
      const mixedTests = [
        { path: "/path/to/regular/test1.spec.ts" },
        { path: "/path/to/priority1/test.spec.ts" },
        { path: "/path/to/regular/test2.spec.ts" },
      ];

      const sortedTests = sequencer.sort(mixedTests, priorities, undefined);

      expect(sortedTests[0].path).toContain("priority1");
      expect(sortedTests[1].path).toContain("regular");
      expect(sortedTests[2].path).toContain("regular");
    });

    test("should handle duplicate priority tests", () => {
      const duplicateTests = [
        { path: "/path/to/priority1/test1.spec.ts" },
        { path: "/path/to/priority1/test2.spec.ts" },
        { path: "/path/to/priority2/test.spec.ts" },
      ];

      const sortedTests = sequencer.sort(duplicateTests, priorities, undefined);

      expect(sortedTests[0].path).toContain("priority1");
      expect(sortedTests[1].path).toContain("priority1");
      expect(sortedTests[2].path).toContain("priority2");
    });
  });

  describe("integration scenarios", () => {
    test("should handle complex sorting scenario with mixed priorities and lastTest", () => {
      const complexTests = [
        { path: "/path/to/regular/test1.spec.ts" },
        { path: "/path/to/priority3/test.spec.ts" },
        { path: "/path/to/priority1/test.spec.ts" },
        { path: "/path/to/regular/test2.spec.ts" },
        { path: "/path/to/priority2/test.spec.ts" },
      ];

      const lastTest = { path: "/path/to/final/test.spec.ts" };
      const sortedTests = sequencer.sort(complexTests, priorities, lastTest);

      // Check that prioritized tests come first in order
      expect(sortedTests[0].path).toContain("priority1");
      expect(sortedTests[1].path).toContain("priority2");
      expect(sortedTests[2].path).toContain("priority3");

      // Check that non-prioritized tests maintain relative order
      const regularTestIndices = sortedTests
        .map((test, index) => ({ test, index }))
        .filter(({ test }) => test.path.includes("regular"))
        .map(({ index }) => index);

      expect(regularTestIndices).toEqual([3, 4]);

      // Check that lastTest is at the end
      expect(sortedTests[sortedTests.length - 1]).toBe(lastTest);
    });

    test("should handle edge case with no priorities and lastTest", () => {
      const regularTests = [
        { path: "/path/to/regular/test1.spec.ts" },
        { path: "/path/to/regular/test2.spec.ts" },
      ];

      const lastTest = { path: "/path/to/last/test.spec.ts" };
      const sortedTests = sequencer.sort(regularTests, [], lastTest);

      expect(sortedTests).toHaveLength(3);
      expect(sortedTests[0].path).toContain("regular");
      expect(sortedTests[1].path).toContain("regular");
      expect(sortedTests[2]).toBe(lastTest);
    });
  });
});
