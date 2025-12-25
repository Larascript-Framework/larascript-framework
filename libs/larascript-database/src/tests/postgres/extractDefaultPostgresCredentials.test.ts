import { extractDefaultPostgresCredentials } from "@/postgres-adapter/index.js";
import { describe, expect, test } from "@jest/globals";
import path from "path";

describe("extractDefaultPostgresCredentials", () => {
  describe("should return the default postgres credentials", () => {
    test("should return the default postgres credentials", () => {
      const dockerComposeFilePath = path.resolve(
        process.cwd(),
        "../../libs/larascript-database/docker/docker-compose.postgres.yml",
      );
      const credentials = extractDefaultPostgresCredentials(
        dockerComposeFilePath,
      );

      expect(credentials).toBe("postgres://root:example@localhost:5433/app");
    });
  });
});
