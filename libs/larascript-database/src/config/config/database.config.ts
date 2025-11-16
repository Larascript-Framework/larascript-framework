import { DatabaseConfig, IDatabaseConfig } from "@larascript-framework/larascript-database";

export const databaseConfig: IDatabaseConfig = {
    defaultConnectionName: "postgres",
    keepAliveConnections: "",
    connections: [
        DatabaseConfig.postgres("postgres", {
            uri: "postgres://root:example@localhost:5432/test_db",
            options: {},
        }),
        // TODO: Add MongoDB connection
    ],
}