import { BaseProvider } from "@ben-shepherd/larascript-core";
import databaseConfig from "@src/config/database.config";
import { IDatabaseConfig } from "@src/core/domains/database/interfaces/IDatabaseConfig";
import Database from "@src/core/domains/database/services/Database";
import { app } from "@src/core/services/App";


/**
 * DatabaseProvider class
 * 
 * This provider is responsible for setting up the database configuration and
 * booting the database service. It registers the database service in the App
 * container and ensures that the service is booted when the provider is booted.
 */
export default class DatabaseProvider extends BaseProvider {

    /**
     * The database configuration object
     * 
     * @type {IDatabaseConfig}
     */
    protected config: IDatabaseConfig = databaseConfig;

    /**
     * Register method
     * 
     * Called when the provider is being registered
     * Use this method to set up any initial configurations or services
     * 
     * @returns {Promise<void>}
     */
    public async register(): Promise<void> {
        this.log('Registering DatabaseProvider');

        // Register the database service in the App container
        this.bind('db', new Database(this.config))

        // Register the adapters
        app('db').registerAdapters()

        // Register the connections
        app('db').registerConnections()
    }

    /**
     * Boot method
     * 
     * Called after all providers have been registered
     * Use this method to perform any actions that require other services to be available
     * 
     * @returns {Promise<void>}
     */
    public async boot(): Promise<void> {
        this.log('Booting DatabaseProvider');

        // Boot the database service
        await app('db').boot();
    }

}

