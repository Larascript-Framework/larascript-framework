import { ILoggerService } from "@larascript-framework/larascript-logger";
import { IViewRenderService } from "@larascript-framework/larascript-views";
import { IMail } from "../interfaces/index.js";

abstract class BaseMailAdapter {

  protected view!: IViewRenderService;

  protected logger!: ILoggerService;

  setDependencies(deps: Record<string, unknown>): void {
    if(!deps["logger"]) {
      throw new Error("Dependency 'logger' not set")
    }
    this.logger = deps["logger"] as ILoggerService;

    if(!deps["view"]) {
      throw new Error("Dependency 'view' not set")
    }
    this.view = deps["view"] as IViewRenderService;
  }

  async generateBodyString(mail: IMail): Promise<string> {
    const body = mail.getBody();

    if (typeof body === "string") {
      return body;
    }

    const { view, data = {} } = body;

    return await this.view.render({
      view,
      data,
    });
  }
}

export default BaseMailAdapter;
