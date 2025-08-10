import { BaseProvider } from "@ben-shepherd/larascript-core-bundle";
import { LoggerService } from "@ben-shepherd/larascript-logger-bundle";
import path from "path";

class LoggerProvider extends BaseProvider {

    async register(): Promise<void> {
        
        const loggerService = new LoggerService({
            logPath: path.resolve('@src/../', 'storage/logs/larascript.log')
        });

        // We will boot the logger here to provide it early for other providers
        loggerService.boot();

        // Bind the logger service to the container
        this.bind('logger', loggerService);
    
    }

}

export default LoggerProvider