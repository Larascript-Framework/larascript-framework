import { parseBooleanFromString } from "@ben-shepherd/larascript-utils-bundle";
import { IDatabaseConfig } from "@src/core/domains/database/interfaces/IDatabaseConfig";
import DatabaseConfig from "@src/core/domains/database/services/DatabaseConfig";
import MongoDbAdapter from "@src/core/domains/mongodb/adapters/MongoDbAdapter";
import PostgresAdapter from "@src/core/domains/postgres/adapters/PostgresAdapter";

const DATABASE_DEFAULT_CONNECTION = (process.env.DATABASE_DEFAULT_CONNECTION as string) ?? 'default';

const config: IDatabaseConfig = {

    /**
     * Default database connection name
     */
    defaultConnectionName:  DATABASE_DEFAULT_CONNECTION,

    /**
     * Additional database connections to be kept alive
     * Comma-separated list of connection names
     */
    keepAliveConnections: (process.env.DATABASE_CONNECTIONS_KEEP_ALIVE as string) ?? '',

    /**
     * Enable logging for the database operations
     */
    enableLogging: parseBooleanFromString(process.env.DATABASE_ENABLE_LOGGING, 'true'),

    /**
     * Database connections configuration.
     * Define multiple connections here if needed.
     */
    connections: DatabaseConfig.createConnections([

        /**
         * Default Postgres connection
         */
        DatabaseConfig.createConfig({
            connectionName: process.env.DATABASE_POSTGRES_CONNECTION as string,
            adapter: PostgresAdapter,
            uri: process.env.DATABASE_POSTGRES_URI as string,
            options: {}, // Additional connection options can be specified here
        }),

        /**
         * Default MongoDB connection
         */
        DatabaseConfig.createConfig({
            connectionName: process.env.DATABASE_MONGODB_CONNECTION as string,
            adapter: MongoDbAdapter,
            uri: process.env.DATABASE_MONGODB_URI as string,
            options: {} // Additional connection options can be specified here
        }),

    ])
};

export default config;