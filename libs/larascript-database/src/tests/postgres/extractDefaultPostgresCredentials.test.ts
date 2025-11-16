import { extractDefaultPostgresCredentials } from "@/postgres-adapter/index.js";
import { describe, expect, test } from "@jest/globals";

describe("extractDefaultPostgresCredentials", () => {
  describe("should return the default postgres credentials", () => {
    test("should return the default postgres credentials", () => {
      const credentials = extractDefaultPostgresCredentials();

      expect(credentials).toBe("postgres://root:example@localhost:5433/app");
    });
  });
});
