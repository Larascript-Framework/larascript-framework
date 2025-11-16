const Sequencer = require("@jest/test-sequencer").default;

export class CustomSequencer extends Sequencer {
  sort(tests, priorities, lastTest) {
    if (lastTest) {
      tests = [...tests, lastTest];
    }

    const sortedTests = tests.sort((testA, testB) => {
      // Get the index of each test in our preferred order
      const indexA = this.getTestPriority(testA.path, priorities);
      const indexB = this.getTestPriority(testB.path, priorities);

      // If both tests have priorities, compare them
      if (indexA !== -1 && indexB !== -1) {
        return indexA - indexB;
      }

      // If only testA has a priority, it should come first
      if (indexA !== -1) return -1;

      // If only testB has a priority, it should come first
      if (indexB !== -1) return 1;

      // If neither test has a priority but one is the last test
      // if (testA.path.includes(lastTest)) return 1;
      // if (testB.path.includes(lastTest)) return -1;

      // For all other tests, maintain their relative order
      return 0;
    });

    return sortedTests;
  }

  /**
   * Returns the priority of a test based on its path
   * Returns -1 if the test isn't in our priority list
   */
  getTestPriority(testPath, priorities) {
    const priorityTests = priorities;
    return priorityTests.findIndex((test) => testPath.includes(test));
  }
}

export default CustomSequencer;
