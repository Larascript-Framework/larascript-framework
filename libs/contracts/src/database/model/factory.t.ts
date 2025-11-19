import { IFactory } from "../../core/base.js";
import { IModel, ModelConstructor } from "./model.t.js";

export type IModelFactory<Model extends IModel> = IFactory<Model>;

export type IModelFactoryConstructor<Model extends IModel> = {
  new (modelConstructor: ModelConstructor<Model>): IModelFactory<Model>;
};
