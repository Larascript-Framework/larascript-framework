import { app } from "@/core/services/App.js";
import { BaseProvider } from "@larascript-framework/larascript-core";
import { DatabaseAdapter } from "@larascript-framework/larascript-database";
import { AvailableSetupCommands, SetupService } from "@larascript-framework/setup";

class SetupProvider extends BaseProvider {

    async register(): Promise<void> {
        /**
         * Initialize the setup service with the env service and package json service
         * - These services are required for the setup commands
         * - The package json service is required for the setup commands to update the package.json file
         * - The env service is required for setting values in the .env file
         * - The database service is required for the setup commands to use the database
         * - The composer short file names are required for the setup commands to use the database
         */
        SetupService.init({
            envService: app('envService'),
            packageJsonService: app('packageJsonService'),
            cryptoService: app('crypto'),
            databaseService: app('db'),
            composerShortFileNames: DatabaseAdapter.getComposerShortFileNames(app('db'))
        });

        // Register the setup commands
        app('console').registerService().registerAll(
            AvailableSetupCommands.getCommands()
        )
    }
}

export default SetupProvider