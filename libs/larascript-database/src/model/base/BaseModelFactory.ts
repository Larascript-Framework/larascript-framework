import { BaseFactory } from "@larascript-framework/larascript-core";
import { IModel, ModelConstructor } from "../index.js";

export abstract class BaseModelFactory<T extends IModel> extends BaseFactory<
  T["attributes"]
> {
  protected modelConstructor!: ModelConstructor<T>;

  constructor(modelConstructor: ModelConstructor<T>) {
    super();
    this.modelConstructor = modelConstructor;
  }

  create(data?: T["attributes"]): T {
    const attributes = super.create(data);
    return this.modelConstructor.create(attributes);
  }
}

export default BaseModelFactory;
