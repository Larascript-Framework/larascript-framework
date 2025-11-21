import DB from "../../database/services/DB.js";
import { IModel, ModelConstructor } from "../../model/index.js";
import { IEloquent, IEloquentQueryBuilderService } from "../index.js";

/**
 * Eloquent query service
 */
class EloquentQueryBuilderService implements IEloquentQueryBuilderService {
  /**
   * Creates a new query builder instance for the model.
   * @param modelCtor The constructor of the model to query.
   * @returns A query builder instance associated with the model.
   */
  builder<Model extends IModel>(
    modelCtor: ModelConstructor<Model>,
    connectionName?: string,
  ): IEloquent<Model> {
    const model = new modelCtor(null);
    const tableName = modelCtor.getTable();
    const connection = connectionName ?? modelCtor.getConnectionName();

    const eloquentConstructor = DB.getInstance()
      .databaseService()
      .getAdapter(connection)
      .getEloquentConstructor<Model>();

    return new eloquentConstructor()
      .setConnectionName(connection)
      .setModelCtor(modelCtor)
      .setModelColumns(modelCtor)
      .setTable(tableName)
      .setIdGenerator(model.getIdGeneratorFn());
  }
}

export default EloquentQueryBuilderService;
