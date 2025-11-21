import ejs from "ejs";
import path from "path";
import { IViewServiceConfig } from "../interfaces/config.js";
import { RenderData } from "../interfaces/data.js";
import { IViewRenderService } from "../interfaces/services.js";

export class EjsRenderService implements IViewRenderService {
  constructor(protected readonly config: IViewServiceConfig) {}

  async render({ view, data }: RenderData): Promise<string> {
    return new Promise((resolve, reject) => {
      if (!view.endsWith(".ejs")) {
        view = `${view}.ejs`;
      }

      const viewPath = path.join(this.config.resourcesDir, view);

      const cb = (err, str) => {
        if (err) {
          reject(err);
        }
        resolve(str);
      };

      ejs.renderFile(viewPath, { ...data }, cb);
    });
  }
}

export default EjsRenderService;
