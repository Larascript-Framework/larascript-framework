import { PackageJsonService } from "@/services/index.js";
import { beforeEach, describe, expect, test } from "@jest/globals";

describe("Package Json Test Suite", () => {
  let envService!: PackageJsonService;

  beforeEach(() => {
    envService = new PackageJsonService({
      packageJsonPath: "path/to/package.json",
    });
  });

  describe("Test config values", () => {
    test("config matches provided", () => {
      expect(envService.packageJsonPath).toEqual("path/to/package.json");
    });
  });
});
