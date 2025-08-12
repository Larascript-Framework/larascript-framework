import { BaseProvider } from "@ben-shepherd/larascript-core";
import { IDatabaseConfig } from "@src/core/domains/database/interfaces/IDatabaseConfig";
import Database from "@src/core/domains/database/services/Database";
import DatabaseConfig from "@src/core/domains/database/services/DatabaseConfig";
import MongoDbAdapter from "@src/core/domains/mongodb/adapters/MongoDbAdapter";
import PostgresAdapter from "@src/core/domains/postgres/adapters/PostgresAdapter";
import { app } from "@src/core/services/App";

/**
 * DatabaseRegisterOnlyProvider class
 * 
 * This provider is a subclass of DatabaseProvider that only registers the database service in the App container.
 */
export default class DatabaseSetupProvider extends BaseProvider {

    /**
     * The database configuration object
     * 
     * @type {IDatabaseConfig}
     */
    protected config: IDatabaseConfig = {
        onBootConnect: false, // prevent the database from connecting on boot
        defaultConnectionName: 'postgres',
        keepAliveConnections: '',
        enableLogging: true,
        connections: DatabaseConfig.createConnections([

            /**
             * Default Postgres connection
             */
            DatabaseConfig.createConfig({
                connectionName: 'postgres',
                adapter: PostgresAdapter,
                uri: '',
                options: {}, // Additional connection options can be specified here
            }),

            /**
             * Default MongoDB connection
             */
            DatabaseConfig.createConfig({
                connectionName: 'mongodb',
                adapter: MongoDbAdapter,
                uri: '',
                options: {} // Additional connection options can be specified here
            }),
        ])
    };

    public async register(): Promise<void> {
        this.log('Registering DatabaseProvider');

        // Register the database service in the App container
        this.bind('db', new Database(this.config))

        // Only register the adapters
        app('db').registerAdapters()
    }

}

