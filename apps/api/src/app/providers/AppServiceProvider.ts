import AppService from "@/app/services/AppService.js";
import appConfig from "@/config/app.config.js";
import { app } from "@/core/services/App.js";
import { AbstractProvider } from "@larascript-framework/bootstrap";

class AppServiceProvider extends AbstractProvider {
  private config = appConfig;
  
  public async register(): Promise<void> {
    const appService = new AppService(this.config);

    this.bind("app", appService);
    this.bind("app.config", () => appService.getConfig());
  }

  async boot(): Promise<void> {
    await app("app").boot();
  }
}

export default AppServiceProvider;
