import { DB, DatabaseConfig, DatabaseService } from "@/database/index.js";
import { EloquentQueryBuilderService } from "@/eloquent/index.js";
import { IModel, ModelConstructor } from "@/model/index.js";
import {
  extractDefaultMongoCredentials
} from "@/mongodb-adapter/index.js";
import { extractDefaultPostgresCredentials } from "@/postgres-adapter/index.js";
import { CryptoService } from "@larascript-framework/crypto-js";
import { ConsoleService } from "@larascript-framework/larascript-console";
import {
  AppSingleton,
  BaseProvider,
  EnvironmentTesting,
  Kernel,
} from "@larascript-framework/larascript-core";
import { LoggerService } from "@larascript-framework/larascript-logger";
import { execSync } from "child_process";
import path from "path";

class TestDatabaseProvider extends BaseProvider {
  async register() {
    const databaseService = new DatabaseService({
      enableLogging: true,
      onBootConnect: true,
      defaultConnectionName: "postgres",
      keepAliveConnections: "mongodb",
      connections: [
        DatabaseConfig.postgres("postgres", {
          uri: extractDefaultPostgresCredentials(path.resolve( process.cwd(), "../../libs/larascript-database/docker/docker-compose.postgres.yml")) as string,
          options: {},
          dockerComposeFilePath: path.resolve(process.cwd(), "../../libs/larascript-database/docker/docker-compose.postgres.yml",),
        }),
        DatabaseConfig.mongodb("mongodb", {
          uri: extractDefaultMongoCredentials(path.resolve(process.cwd(), "../../libs/larascript-database/docker/docker-compose.mongodb.yml")) as string,
          options: {},
          dockerComposeFilePath: path.resolve(process.cwd(), "../../libs/larascript-database/docker/docker-compose.mongodb.yml"),
        }),
      ],
    });
    databaseService.register();

    const eloquentQueryBuilder = new EloquentQueryBuilderService();
    const cryptoService = new CryptoService({
      secretKey: "test",
    });
    const dispatcher = (event: any) => {
      console.log("dispatcher", event);
      return Promise.resolve();
    };

    const logger = new LoggerService({
      logPath: path.join(process.cwd(), "storage/logs"),
    });
    await logger.boot();

    DB.init({
      databaseService,
      eloquentQueryBuilder,
      cryptoService,
      dispatcher,
      logger,
      console: new ConsoleService(),
    });

    this.bind("dispatcher", dispatcher);
    this.bind("db", databaseService);
  }

  async boot() {
    await AppSingleton.container("db").boot();
  }
}

export const testHelper = {
  testBootApp: async () => {
    await Kernel.boot(
      {
        environment: EnvironmentTesting,
        providers: [new TestDatabaseProvider()],
      },
      {},
    );
  },

  getTestConnectionNames: () => ["mongodb", "postgres"],

  afterAll: async () => {
    await postgresDown();
    await mongodbDown();
  },
};

export const queryBuilder = <Model extends IModel>(
  model: ModelConstructor<Model>,
  connection?: string,
) => {
  return DB.getInstance().queryBuilder(model, connection);
};

function mongodbDown() {
  try {
    // Change directory to project root and run the command
    execSync("pnpm run db:mongodb:down", {
      stdio: "inherit",
      cwd: process.cwd(),
    });
  } catch (error) {
    console.error("Failed to start Postgres with pnpm db:mongodb:down");
    throw error;
  }
}

export const postgresDown = () => {
  try {
    // Change directory to project root and run the command
    execSync("pnpm run db:postgres:down", {
      stdio: "inherit",
      cwd: process.cwd(),
    });
  } catch (error) {
    console.error("Failed to start Postgres with pnpm db:postgres:up");
    throw error;
  }
};
