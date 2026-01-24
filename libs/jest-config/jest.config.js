export const jestConfig = {
  preset: "ts-jest",
  testEnvironment: "node",
  setupFilesAfterEnv: ['reflect-metadata'], // Add this line
  extensionsToTreatAsEsm: ['.ts'],
  transform: {
    "^.+\\.ts$": ["ts-jest", {
      useESM: true,
      tsconfig: {
        module: "ESNext",
        target: "ES2022",
      },
    }],
    "^.+\\.js$": ["ts-jest", {
      useESM: true,
      tsconfig: {
        module: "ESNext",
        target: "ES2022",
      },
    }],
  },
  transformIgnorePatterns: [
    "node_modules/(?!(@larascript-framework)/)"
  ],
  moduleNameMapper: {
    "^@/(.*)\\.js$": "<rootDir>/src/$1",
    "^@/(.*)$": "<rootDir>/src/$1",
    "^(\\.{1,2}/.*)\\.js$": "$1",
  },
  testMatch: ["<rootDir>/src/tests/**/*.test.ts"],
  collectCoverageFrom: [
    "src/**/*.{ts,js}",
    "!src/**/*.test.{ts,js}",
    "!src/**/*.d.ts",
    "!src/tests/**",
  ],
  coverageDirectory: "coverage",
  coverageReporters: ["text", "lcov", "html"],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
};

export default jestConfig;