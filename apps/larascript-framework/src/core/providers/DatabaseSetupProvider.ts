import { BaseProvider } from "@larascript-framework/larascript-core";
import { DatabaseConfig, DatabaseService, IDatabaseConfig } from "@larascript-framework/larascript-database";
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
        onBootConnect: false,
        enableLogging: true,
        defaultConnectionName: 'postgres',
        keepAliveConnections: 'mongodb',
        connections: [
            DatabaseConfig.postgres('postgres', {
                uri: '',
                options: {}
            }),
            DatabaseConfig.mongodb('mongodb', {
                uri: '',
                options: {}
            })
        ]
    };

    public async register(): Promise<void> {
        this.log('Registering DatabaseProvider');

        const databaseService = new DatabaseService(this.config)
        databaseService.register()

        this.bind('db', databaseService)
    }

}

