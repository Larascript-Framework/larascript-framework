import { RenderData } from "./data.js";

export interface IViewService extends IViewRenderService {
  ejs(): IViewRenderService;
}

export interface IViewRenderService {
  render(data: RenderData): Promise<string>;
}
