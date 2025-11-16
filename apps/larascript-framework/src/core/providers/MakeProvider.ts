import { app } from "@/core/services/App.js";
import { BaseProvider } from "@larascript-framework/larascript-core";
import { MigrationCreateFileNameService } from "@larascript-framework/larascript-database";
import { AvailableMakeCommands, MakeServices } from "@larascript-framework/make";
import path from "path";

export default class MakeProvider extends BaseProvider {

    async register(): Promise<void> {
        
        const pathToTemplates = path.join(process.cwd(), '../../libs/make/src/make/templates')
        const pathToApp = path.join(process.cwd(),  'src/app')

        // Initialize the make services
        MakeServices.init({
            pathToApp,
            pathToTemplates,
            logger: app('logger'),
            migrationCreateFileService: new MigrationCreateFileNameService(),
        })

        // Register the make commands
        app('console').registerService().registerAll(
            AvailableMakeCommands.getCommands()
        )
    }

}
