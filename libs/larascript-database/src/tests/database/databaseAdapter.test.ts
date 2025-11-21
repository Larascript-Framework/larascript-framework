import { describe, expect, test } from "@jest/globals";
import { IDatabaseService } from "../../database/index.js";
import DatabaseAdapter from "../../database/services/DatabaseAdapter.js";
import { MockSQLAdapter } from "./mocks/MockSQLAdapter.js";

describe("Database Adapter", () => {
  test("getName", () => {
    expect(DatabaseAdapter.getName(MockSQLAdapter)).toBe("MockSQLAdapter");
  });

  test("getComposerFileNames", () => {
    const databaseService = jest.fn().mockImplementation((...args: any[]) => {
      return {
        getAllAdapterConstructors: jest
          .fn()
          .mockImplementation((...args: any[]) => {
            return [MockSQLAdapter];
          }),
      } as unknown as IDatabaseService;
    }) as unknown as () => IDatabaseService;

    expect(DatabaseAdapter.getComposerFileNames(databaseService())).toEqual([
      {
        fullName: "docker-compose.sql.yml",
        shortName: "sql",
      },
    ]);
  });
});
