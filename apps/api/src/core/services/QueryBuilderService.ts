import {
  IEloquent,
  IModel,
  ModelConstructor,
} from "@larascript-framework/larascript-database";
import { app } from "./App.js";

export const queryBuilder = <Model extends IModel>(
  modelCtor: ModelConstructor<Model>,
  connectionName?: string,
): IEloquent<Model> => {
  return app("query").builder<Model>(modelCtor, connectionName);
};
