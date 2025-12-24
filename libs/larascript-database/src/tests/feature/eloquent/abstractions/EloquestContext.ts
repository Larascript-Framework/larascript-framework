import { IEloquent } from "@/eloquent/index.js";
import { queryBuilder, testHelper } from "@/tests/tests-helper/testHelper.js";
import { IModel, ModelConstructor } from "@larascript-framework/contracts/database/model";

export type IEloquentContextExecCallback = (eloquentTest: EloquentContext) => Promise<void>;

/**
 * EloquentConnectionTest
 * 
 * A test helper class that provides connection-scoped access to query builders and schemas
 * for testing Eloquent functionality across different database connections (e.g., PostgreSQL, MongoDB).
 * 
 * This class encapsulates a specific database connection and provides methods to:
 * - Create query builders tied to that connection
 * - Execute test callbacks within the context of that connection
 * - Generate test instances for all configured test connections
 * 
 * @example
 *
 * // Create a test context for a specific connection
 * const postgresTest = EloquentConnectionTest.create("postgres");
 * 
 * // Use it to get a connection-scoped query builder
 * const query = postgresTest.queryBuilder(TestModel);
 * 
 * // Or execute a test callback
 * await postgresTest.execTest(async (eloquentTest) => {
 *   const results = await eloquentTest.queryBuilder(TestModel).where("id", 1).get();
 * });
 * 
 * // Create test instances for all connections
 * const allTests = EloquentConnectionTest.createForEveryConnection();
 **/
export class EloquentContext {

    protected constructor(
        protected readonly _connectionName: string
    ) {
    }
  
    public static create(connectionName: string): EloquentContext {
        return new EloquentContext(connectionName);
    }

    public static createForEveryConnection(): EloquentContext[] {
        return testHelper.getTestConnectionNames().map(connectionName => EloquentContext.create(connectionName));
    }

    public connectionName(): string {
        return this._connectionName;
    }

    public queryBuilder<Model extends IModel>(model: ModelConstructor<Model>): IEloquent<Model> {
        return queryBuilder(model, this._connectionName);
    }

    public async execTest(callback: IEloquentContextExecCallback): Promise<void> {
        console.log(`Executing test for connection: ${this._connectionName}`);
        return await callback(this);
    }

}