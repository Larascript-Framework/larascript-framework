import { BaseService } from "@ben-shepherd/larascript-core";
import { IAppService } from "@src/app/interfaces/IAppService";

class AppService extends BaseService implements IAppService {

    public async boot(): Promise<void> {
        console.log('[AppService] Booting...');
    }

    /**
     * @returns The app configuration.
     * Usage: app('app').getConfig()
     */
    public getConfig() {
        return this.config;
    }

}

export default AppService