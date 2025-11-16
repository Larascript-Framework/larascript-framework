import { IViewServiceConfig } from "../interfaces/config.js";
import { RenderData } from "../interfaces/data.js";
import { IViewRenderService, IViewService } from "../interfaces/services.js";
import EjsRenderService from "./EjsRenderService.js";

export class ViewService implements IViewService {
  constructor(protected readonly config: IViewServiceConfig) {}

  render(data: RenderData): Promise<string> {
    return this.ejs().render(data);
  }

  ejs(): IViewRenderService {
    return new EjsRenderService(this.config);
  }
}

export default ViewService;
