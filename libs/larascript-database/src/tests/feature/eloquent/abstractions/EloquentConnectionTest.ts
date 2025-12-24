import { IEloquent } from "@/eloquent/index.js";
import { queryBuilder, testHelper } from "@/tests/tests-helper/testHelper.js";
import { IModel, ModelConstructor } from "@larascript-framework/contracts/database/model";

export type IEloquentConnectionTestCallback = (eloquentTest: EloquentConnectionTest) => Promise<void>;

export class EloquentConnectionTest {

    protected constructor(
        protected connectionName: string
    ) {
    }
  
    public static create(connectionName: string): EloquentConnectionTest {
        return new EloquentConnectionTest(connectionName);
    }

    public static createForEveryConnection(): EloquentConnectionTest[] {
        return testHelper.getTestConnectionNames().map(connectionName => EloquentConnectionTest.create(connectionName));
    }

    public queryBuilder<Model extends IModel>(model: ModelConstructor<Model>): IEloquent<Model> {
        return queryBuilder(model, this.connectionName);
    }

}