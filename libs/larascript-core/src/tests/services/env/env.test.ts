import { EnvService } from "@/services/EnvService.js";
import { beforeEach, describe, expect, test } from "@jest/globals";

describe("Env Service Test Suite", () => {
  let envService!: EnvService;

  beforeEach(() => {
    envService = new EnvService({
      envPath: "path/to/.env",
      envExamplePath: "path/to/.env.example",
    });
  });

  describe("Test config values", () => {
    test("config matches provided", () => {
      expect(envService.envPath).toEqual("path/to/.env");
      expect(envService.envExamplePath).toEqual("path/to/.env.example");
    });
  });
});
