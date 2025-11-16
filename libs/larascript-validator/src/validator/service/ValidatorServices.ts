import { BaseSingleton } from "@larascript-framework/larascript-core";
import { IDatabaseService, IEloquent, IEloquentQueryBuilderService, IModel, ModelConstructor } from "@larascript-framework/larascript-database";

export type ValidatorServicesConfig = {
    queryBuilder: IEloquentQueryBuilderService;
    database: IDatabaseService;
}

/**
 * Services for the validator
 * - Query builder
 * - Database service
 */
export class ValidatorServices extends BaseSingleton<ValidatorServicesConfig> {

    public static init({
        queryBuilder,
        database,
    }: ValidatorServicesConfig): void {
        ValidatorServices.getInstance({
            queryBuilder,
            database,
        });
    }

    public getEloquentQueryBuilderService(): IEloquentQueryBuilderService {
        if(!this.getConfig()?.queryBuilder) {
            throw new Error("Query builder is not initialized");
        }
        return this.getConfig()!.queryBuilder;
    }

    public queryBuilder<Model extends IModel>(
        modelCtor: ModelConstructor<Model>,
        connectionName?: string,
      ): IEloquent<Model> {
        return this.getEloquentQueryBuilderService().builder(modelCtor, connectionName);
      }

    public getDatabaseService(): IDatabaseService {
        if(!this.getConfig()?.database) {
            throw new Error("Database service is not initialized");
        }
        return this.getConfig()!.database;
    }
}