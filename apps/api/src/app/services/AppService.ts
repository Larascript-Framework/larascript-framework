import { IAppService } from "@/app/interfaces/IAppService.js";
import { BaseService } from "@larascript-framework/larascript-core";

class AppService extends BaseService implements IAppService {
  public async boot(): Promise<void> {
    console.log("[AppService] Booting...");
  }

  /**
   * @returns The app configuration.
   * Usage: app('app').getConfig()
   */
  public getConfig() {
    return this.config;
  }
}

export default AppService;
