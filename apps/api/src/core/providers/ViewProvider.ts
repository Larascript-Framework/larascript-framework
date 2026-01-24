import { AbstractProvider } from "@larascript-framework/bootstrap";
import {
  IViewServiceConfig,
  ViewService,
} from "@larascript-framework/larascript-views";
import path from "path";

class ViewProvider extends AbstractProvider {
  protected config: IViewServiceConfig = {
    resourcesDir: path.join(process.cwd(), "src/app/resources"),
  };

  async register(): Promise<void> {
    const viewService = new ViewService(this.config);
    this.bind("view", viewService);
    this.bind("view:ejs", viewService.ejs());
  }
}

export default ViewProvider;
