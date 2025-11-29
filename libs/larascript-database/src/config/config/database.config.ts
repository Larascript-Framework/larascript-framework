import {
  DatabaseConfig,
  IDatabaseConfig,
} from "@larascript-framework/larascript-database";
import path from "path";

export const databaseConfig: IDatabaseConfig = {
  defaultConnectionName: "postgres",
  keepAliveConnections: "",
  connections: [
    DatabaseConfig.postgres("postgres", {
      uri: "postgres://root:example@localhost:5433/test_db",
      options: {},
      dockerComposeFilePath: path.resolve(
        process.cwd(),
        "../../docker/docker-compose.postgres.yml",
      ),
    }),
    // TODO: Add MongoDB connection
  ],
};
