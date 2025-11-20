import { TClassConstructor } from "@/core/constructor.js";
import { IModel } from "../model/model.t.js";
import { IEloquent } from "./eloquent.t.js";

export interface IEloquentQueryBuilderService {
  builder<Model extends IModel>(
    modelCtor: TClassConstructor<Model>,
    connectionName?: string,
  ): IEloquent<Model>;
}
