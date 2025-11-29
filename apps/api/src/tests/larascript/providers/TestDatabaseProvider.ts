import DatabaseProvider from "@/core/providers/DatabaseProvider.js";
import {
  DatabaseConfig,
  IDatabaseConfig,
  IMongoConfig,
  IPostgresConfig,
  MongoDbAdapter,
  ParseMongoDBConnectionString,
  ParsePostgresConnectionUrl,
  PostgresAdapter,
} from "@larascript-framework/larascript-database";
import path from "path";

export const testDbName = "test_db";

const mongoDbDockerComposeFilePath = path.resolve(
  process.cwd(),
  "../../libs/larascript-database/docker/docker-compose.mongodb.yml",
);
const postgresDockerComposeFilePath = path.resolve(
  process.cwd(),
  "../../libs/larascript-database/docker/docker-compose.postgres.yml",
);

const defaultMongoDbCredentials = new MongoDbAdapter("", {
  dockerComposeFilePath: mongoDbDockerComposeFilePath,
} as IMongoConfig).getDefaultCredentials();
const defaultPostgresCredentials = new PostgresAdapter("", {
  dockerComposeFilePath: postgresDockerComposeFilePath,
} as IPostgresConfig).getDefaultCredentials();

if (!defaultMongoDbCredentials || !defaultPostgresCredentials) {
  throw new Error("Invalid default credentials");
}

const postgresConnectionStringWithTestDb: string = (() => {
  const parsed = ParsePostgresConnectionUrl.parse(defaultPostgresCredentials);
  parsed.database = testDbName;
  return parsed.toString();
})();

const mongoDbConnectionStringWithTestDb: string = (() => {
  const parsed = ParseMongoDBConnectionString.parse(defaultMongoDbCredentials);
  parsed.database = testDbName;
  return parsed.toString();
})();

export default class TestDatabaseProvider extends DatabaseProvider {
  protected config: IDatabaseConfig = {
    enableLogging: true,
    defaultConnectionName: "postgres",
    keepAliveConnections: "mongodb",
    connections: [
      DatabaseConfig.postgres("postgres", {
        uri: postgresConnectionStringWithTestDb,
        options: {},
        dockerComposeFilePath: postgresDockerComposeFilePath,
      }),
      DatabaseConfig.mongodb("mongodb", {
        uri: mongoDbConnectionStringWithTestDb,
        options: {},
        dockerComposeFilePath: mongoDbDockerComposeFilePath,
      }),
    ],
  };
}
