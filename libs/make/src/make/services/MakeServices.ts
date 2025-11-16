import { IMigrationCreateFileNameService } from "@larascript-framework/contracts/migrations";
import { BaseSingleton } from "@larascript-framework/larascript-core";
import { ILoggerService } from "@larascript-framework/larascript-logger";

export type MakeServicesConfig = {
    logger?: ILoggerService;
    migrationCreateFileService: IMigrationCreateFileNameService;
    pathToApp: string;
    pathToTemplates: string;
    processExit?: boolean;
}

export class MakeServices extends BaseSingleton<MakeServicesConfig> {

    static init({
        logger,
        migrationCreateFileService,
        pathToApp,
        pathToTemplates,
        processExit,
    }: MakeServicesConfig): void {
        MakeServices.getInstance({
            logger,
            migrationCreateFileService,
            pathToApp,
            pathToTemplates,
            processExit,
        });
    }

    public getLoggerService(): ILoggerService | undefined {
        return this.getConfig()?.logger;
    }

    public getMigrationCreateFileService(): IMigrationCreateFileNameService {
        if(!this.getConfig()?.migrationCreateFileService) {
            throw new Error('Migration file service not found');
        }
        return this.getConfig()?.migrationCreateFileService!;
    }

    public getPathToApp(): string {
        if(!this.getConfig()?.pathToApp) {
            throw new Error('Path to app not found');
        }
        return this.getConfig()?.pathToApp!;
    }

    public getPathToTemplates(): string {
        if(!this.getConfig()?.pathToTemplates) {
            throw new Error('Path to templates not found');
        }
        return this.getConfig()?.pathToTemplates!;
    }

    public getProcessExit(): boolean {
        return this.getConfig()?.processExit ?? false;
    }
}

export default MakeServices;