import "dotenv/config";

import providers from "@/config/providers.config.js";
import { app } from "@/core/services/App.js";
import { describe, expect, test } from "@jest/globals";
import { Kernel } from "@larascript-framework/larascript-core";

describe("attempt to run app with normal appConfig", () => {
  beforeAll(async () => {
    await Kernel.boot(
      {
        environment: "testing",
        providers: providers,
      },
      {},
    );
  });

  /**
   * Boot kernel normally
   * Check containers have been set
   */
  test("kernel boot", async () => {
    // Core providers
    expect(app("logger")).toBeDefined();
    expect(app("asyncSession")).toBeDefined();
    expect(app("envService")).toBeDefined();
    expect(app("packageJsonService")).toBeDefined();
    expect(app("console")).toBeDefined();
    expect(app("crypto")).toBeDefined();
    expect(app("db")).toBeDefined();
    expect(app("events")).toBeDefined();
    expect(app("acl")).toBeDefined();
    expect(app("acl.config")).toBeDefined();
    expect(app("auth")).toBeDefined();
    expect(app("validatorFn")).toBeDefined();
    expect(app("storage")).toBeDefined();
    expect(app("view")).toBeDefined();
    expect(app("mail")).toBeDefined();

    // Additional core services
    expect(app("query")).toBeDefined();
    expect(app("events.worker")).toBeDefined();
    expect(app("http")).toBeDefined();

    // App specific providers
    expect(app("app")).toBeDefined();
    expect(app("app.config")).toBeDefined();
    /**
     * TODO: List all expected services here
     */
    expect(Kernel.getInstance().booted()).toBe(true);
  }, 10000);
});
