import { extractDefaultMongoCredentials } from "@/mongodb-adapter/index.js";
import { describe, expect, test } from "@jest/globals";
import path from "path";

describe("extractDefaultMongoCredentials", () => {
  describe("should return the default mongodb credentials", () => {
    test("should return the default mongodb credentials", () => {
      const credentials = extractDefaultMongoCredentials(path.resolve(process.cwd(), "../../libs/larascript-database/docker/docker-compose.mongodb.yml"));

      expect(credentials).toBe("mongodb://root:example@localhost:27018/app?authSource=admin");
    });
  });
});
