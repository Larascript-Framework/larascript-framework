import { BaseProvider } from "@ben-shepherd/larascript-core";
import appConfig, { IAppConfig } from "@src/config/app.config";
import GenerateAppKey from "@src/core/domains/crypto/commands/GenerateAppKey";
import CryptoService from "@src/core/domains/crypto/service/CryptoService";
import { app } from "@src/core/services/App";

class CryptoProvider extends BaseProvider {

    config: IAppConfig = appConfig;

    async register(): Promise<void> {

        const config = {
            appKey: this.config.appKey
        }
        const cryptoService = new CryptoService(config)

        // Bind the crypto service
        this.bind('crypto', cryptoService)

        // Register commands
        app('console').registerService().registerAll([
            GenerateAppKey
        ])
    }
       
}

export default CryptoProvider