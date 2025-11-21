import { extractDefaultMongoCredentials } from "@/mongodb-adapter/index.js";
import { describe, expect, test } from "@jest/globals";

describe("extractDefaultMongoCredentials", () => {
  describe("should return the default mongodb credentials", () => {
    test("should return the default mongodb credentials", () => {
      const credentials = extractDefaultMongoCredentials();

      expect(credentials).toBe("mongodb://root:example@localhost:27017/app");
    });
  });
});
