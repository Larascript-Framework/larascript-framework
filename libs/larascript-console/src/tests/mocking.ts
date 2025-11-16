// Mock for node:readline

// This mock is intended for use in tests to replace the actual readline interface with a mock implementation.

export const createInterface = jest.fn(() => {
  return {
    question: jest.fn((query, callback) => {
      // Optionally, you can call the callback with a default value for tests
      callback && callback("");
    }),
    close: jest.fn(),
    on: jest.fn(),
    pause: jest.fn(),
    resume: jest.fn(),
    setPrompt: jest.fn(),
    prompt: jest.fn(),
    removeListener: jest.fn(),
    removeAllListeners: jest.fn(),
    write: jest.fn(),
  };
});

/**
 * Mock the entire module in Jest tests
 */
export const jestMockReadline = jest.mock("node:readline", () => ({
  createInterface,
}));
