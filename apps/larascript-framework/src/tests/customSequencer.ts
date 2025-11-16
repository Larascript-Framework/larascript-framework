const Sequencer = require('@jest/test-sequencer').default;

const firstTest = 'larascript/runApp.test.ts';
const secondTest = 'larascript/migration.test.ts';
const thirdTest = 'larascript/seeder.test.ts';

/**
 * Custom sequencer to ensure tests run in a specific order:
 * 1. runApp.test.ts
 * 2. migration.test.ts
 * 3. seeder.test.ts
 * 4. endTests.test.ts
 * 5. All other tests
 */
class CustomSequencer extends Sequencer {

    sort(tests) {
        return tests.sort((testA, testB) => {
            // Get the index of each test in our preferred order
            const indexA = this.getTestPriority(testA.path);
            const indexB = this.getTestPriority(testB.path);
            
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
    }
    
    /**
     * Returns the priority of a test based on its path
     * Returns -1 if the test isn't in our priority list
     */
    getTestPriority(testPath) {
        const priorityTests = [firstTest, secondTest, thirdTest];
        return priorityTests.findIndex(test => testPath.includes(test));
    }

}

module.exports = CustomSequencer;