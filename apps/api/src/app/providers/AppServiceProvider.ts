import AppService from "@/app/services/AppService.js";
import { app } from "@/core/services/App.js";
import { BaseProvider } from "@larascript-framework/larascript-core";

class AppServiceProvider extends BaseProvider {

    public async register(): Promise<void> {

        const appService = new AppService(this.config);

        this.bind('app', appService);
        this.bind('app.config', () => appService.getConfig());
    }

    async boot(): Promise<void> {
        await app('app').boot();
    }

}

export default AppServiceProvider;