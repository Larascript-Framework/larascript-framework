import { BaseCommand } from "@larascript-framework/larascript-console";
import { IEnvService, IPackageJsonService } from "@larascript-framework/larascript-core";
import { ISetupCommand } from "../interfaces/ISetupCommand.js";
import { SetupService } from "../services/SetupService.js";

export abstract class BaseSetupCommand extends BaseCommand implements ISetupCommand {

    writeLine(line: string): void {
        this.input.writeLine(line);
    }

    get env(): IEnvService {
        return SetupService.getInstance().getEnvService();
    }

    get packageJson(): IPackageJsonService {
        return SetupService.getInstance().getPackageJsonService();
    }

    setEnvService(envService: IEnvService) {
        SetupService.getInstance().getEnvService();
    }

    getPackageJsonService(): IPackageJsonService {
        return SetupService.getInstance().getPackageJsonService();
    }

    setPackageJsonService(packageJsonService: IPackageJsonService) {
        SetupService.getInstance().setPackageJsonService(packageJsonService);
    }

    execute(...args: any[]): any {}
}