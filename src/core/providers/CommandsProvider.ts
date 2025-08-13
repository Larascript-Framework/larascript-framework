import { BaseProvider } from "@ben-shepherd/larascript-core";

import GenerateAppKey from "../commands/GenerateAppKey";
import { app } from "../services/App";

class CommandsProvider extends BaseProvider{

    async register(): Promise<void> {
        
        // Register commands
        app('console').registerService().registerAll([
            GenerateAppKey
        ])
    }

}

export default CommandsProvider
