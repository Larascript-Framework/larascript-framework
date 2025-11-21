import { IModel, ModelConstructor } from "../../model/index.js";
import { IBelongsToOptions, IRelationship } from "../interfaces/index.js";

export class GenericRelationship implements IRelationship {
  _relationshipInterface = true;

  constructor(
    protected localModel: ModelConstructor<IModel>,

    protected foreignModel: ModelConstructor<IModel>,

    protected options: Omit<IBelongsToOptions, "foreignTable">,
  ) {}

  /**
   * Retrieves the constructor of the local model in the "belongs to" relationship.
   * @returns {TClassConstructor<IModel>} The constructor of the local model.
   */
  getLocalModelCtor(): ModelConstructor<IModel> {
    return this.localModel;
  }

  /**
   * Retrieves the constructor of the related model in the "belongs to" relationship.
   * @returns {TClassConstructor<IModel>} The constructor of the related model.
   */
  getForeignModelCtor(): ModelConstructor<IModel> {
    return this.foreignModel;
  }

  /**
   * Retrieves the table name of the related model in the "belongs to" relationship.
   * @returns {string} The table name of the related model.
   */
  getForeignTableName(): string {
    return new this.foreignModel().useTableName();
  }

  /**
   * Retrieves the options for the "belongs to" relationship,
   * including the foreign table name derived from the related model.
   *
   * @returns {IBelongsToOptions} The complete set of options
   * for the relationship, with the foreign table name.
   */
  getOptions<T extends object = object>(): T {
    return {
      ...this.options,
      foreignTable: new this.foreignModel().useTableName(),
    } as T;
  }

  /**
   * Retrieves the name of the local key in the "belongs to" relationship.
   * This is the key that refers to the foreign key in the related model.
   * @returns {string} The name of the local key.
   */
  getLocalKey(): string {
    return this.options.localKey as string;
  }

  /**
   * Retrieves the name of the foreign key in the "belongs to" relationship.
   * This is the key in the related model that the local key refers to.
   * @returns {string} The name of the foreign key.
   */
  getForeignKey(): string {
    return (this.options.foreignKey ?? "id") as string;
  }
}

export default GenericRelationship;
