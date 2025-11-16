import { DatabaseConfig, IDatabaseConfig } from "@larascript-framework/larascript-database";
import { parseBooleanFromString } from "@larascript-framework/larascript-utils";


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
    connections: [

        /**
         * Default Postgres connection
         */
        DatabaseConfig.postgres(
            process.env.DATABASE_POSTGRES_CONNECTION as string,
            {
                uri: process.env.DATABASE_POSTGRES_URI as string,
                options: {}, // Additional connection options can be specified here
            }
        ),

        /**
         * Default MongoDB connection
         */ 
        DatabaseConfig.mongodb(
            process.env.DATABASE_MONGODB_CONNECTION as string,
            {
                uri: process.env.DATABASE_MONGODB_URI as string,
                options: {} // Additional connection options can be specified here
            }
        ),
    ]
};

export default config;