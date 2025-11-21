import { BaseProvider } from "@larascript-framework/larascript-core";
import { IViewServiceConfig, ViewService } from "@larascript-framework/larascript-views";
import path from "path";

class ViewProvider extends BaseProvider {

    protected config: IViewServiceConfig = {
        resourcesDir: path.join(process.cwd(), 'src/app/resources')
    }

    async boot(): Promise<void> {
        const viewService = new ViewService(this.config);
        this.bind('view', viewService)
        this.bind('view:ejs', viewService.ejs())
    }

}

export default ViewProvider