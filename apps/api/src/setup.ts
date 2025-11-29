import appConfig from "@/config/app.config.js";
import ConsoleProvider from "@/core/providers/ConsoleProvider.js";
import CryptoProvider from "@/core/providers/CryptoProvider.js";
import LoggerProvider from "@/core/providers/LoggerProvider.js";
import SetupProvider from "@/core/providers/SetupProvider.js";
import { app } from "@/core/services/App.js";
import { Kernel } from "@larascript-framework/larascript-core";

import dotenv from "dotenv";
import DatabaseSetupProvider from "./core/providers/DatabaseSetupProvider.js";
import EnvServiceProvider from "./core/providers/EnvServiceProvider.js";
import PackageJsonProvider from "./core/providers/PackageJsonProvider.js";
import { logger } from "./core/services/Logger.js";

(() => {
  dotenv.config();

  Kernel.boot(
    {
      ...appConfig,
      environment: "testing",
      providers: [
        new EnvServiceProvider(),
        new PackageJsonProvider(),
        new LoggerProvider(),
        new ConsoleProvider(),
        new DatabaseSetupProvider(),
        new CryptoProvider(),
        new SetupProvider(),
      ],
    },
    {},
  )
    .then(() => {
      app("console").readerService(["app:setup"]).handle();
    })
    .catch((err) => {
      logger().error("[Setup]: Failed to start", err);
      throw err;
    });
})();
