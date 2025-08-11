import { BaseProvider } from "@ben-shepherd/larascript-core-bundle";
import { IViewServiceConfig, ViewService } from "@ben-shepherd/larascript-views-bundle";
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