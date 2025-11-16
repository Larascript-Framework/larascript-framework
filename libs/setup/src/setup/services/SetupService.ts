import { IDatabaseService } from "@larascript-framework/contracts/database/database";
import { ICryptoService } from "@larascript-framework/crypto-js";
import { BaseSingleton, IEnvService, IPackageJsonService } from "@larascript-framework/larascript-core";

type SetupServiceConfig = {
    envService: IEnvService;
    packageJsonService: IPackageJsonService;
    cryptoService: ICryptoService;
    databaseService: IDatabaseService;
    composerShortFileNames: string[];
}

/**
 * Service dependencies for the setup process
 * - EnvService: Service for the environment variables
 * - PackageJsonService: Service for the package.json file
 * - CryptoService: Service for the crypto operations
 */
export class SetupService extends BaseSingleton<SetupServiceConfig> {

    static init(config: SetupServiceConfig) {
        this.getInstance(config);
    }

    setEnvService(envService: IEnvService) {
        this.config!.envService = envService;
    }

    setPackageJsonService(packageJsonService: IPackageJsonService) {
        this.config!.packageJsonService = packageJsonService;
    }

    setCryptoService(cryptoService: ICryptoService) {
        this.config!.cryptoService = cryptoService;
    }

    getEnvService(): IEnvService {
        if(!this.config?.envService) {
            throw new Error('EnvService has not been initialized');
        }
        return this.config?.envService;
    }

    getPackageJsonService(): IPackageJsonService {
        if(!this.config?.packageJsonService) {
            throw new Error('PackageJsonService has not been initialized');
        }
        return this.config?.packageJsonService;
    }

    getCryptoService(): ICryptoService {
        if(!this.config?.cryptoService) {
            throw new Error('CryptoService has not been initialized');
        }
        return this.config?.cryptoService;
    }

    getDatabaseService(): IDatabaseService {
        if(!this.config?.databaseService) {
            throw new Error('DatabaseService has not been initialized');
        }
        return this.config?.databaseService;
    }

    getComposerShortFileNames(): string[] {
        if(!this.config?.composerShortFileNames) {
            throw new Error('ComposerShortFileNames has not been initialized');
        }
        return this.config?.composerShortFileNames;
    }
}
