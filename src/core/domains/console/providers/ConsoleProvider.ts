import { BaseProvider } from "@ben-shepherd/larascript-core";
import commandsConfig from "@src/config/commands.config";
import HelpCommand from "@src/core/domains/console/commands/HelpCommand";
import RouteListCommand from "@src/core/domains/console/commands/RouteListCommand";
import ConsoleService from "@src/core/domains/console/service/ConsoleService";
import { app } from "@src/core/services/App";
import readline from 'readline';

export default class ConsoleProvider extends BaseProvider {

    /**
     * Register method
     * Called when the provider is being registered
     * Use this method to set up any initial configurations or services
     */
    async register(): Promise<void> {
        
        this.log('Registering ConsoleProvider');

        /**
         * Add readline to the container
         * Prevents issue: 
         *  MaxListenersExceededWarning: Possible EventEmitter memory leak detected. 11 end listeners added to [Socket]
         */
        this.bind('readline', readline.createInterface({
            input: process.stdin,
            output: process.stdout,
        }));
        
        /**
         * Add the console service to the container
         */
        this.bind('console', new ConsoleService())

        /**
         * Register internal commands
         */
        app('console').registerService().registerAll([
            HelpCommand,
            RouteListCommand
        ]);
        
        /**
         * Register commands from @src/config/app
         */
        app('console').registerService().registerAll(commandsConfig)
    }

}
