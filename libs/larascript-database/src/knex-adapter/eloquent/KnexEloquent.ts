import {
  PrefixedPropertyGrouper,
  generateUuidV4
} from "@larascript-framework/larascript-utils";
import pg from "pg";
import Eloquent from "../../eloquent/Eloquent.js";
import {
  IdGeneratorFn
} from "../../eloquent/index.js";
import { IModel } from "../../model/index.js";
import { KnexExpressionBuilder } from "../expressions/KnexExpressionBuilder.js";

class KnexEloquent<Model extends IModel> extends Eloquent<Model, KnexExpressionBuilder> {
  /**
   * The default ID generator function for the query builder.
   */
  protected defaultIdGeneratorFn: IdGeneratorFn | null = generateUuidV4 as IdGeneratorFn;

  /**
   * The query builder expression object
   */
  protected expression: KnexExpressionBuilder = new KnexExpressionBuilder();

  /**
   * The query builder client
   */
  protected pool!: pg.PoolClient | pg.Pool;

  /**
   * The formatter to use when formatting the result rows to objects
   */
  protected formatter: PrefixedPropertyGrouper = new PrefixedPropertyGrouper();

  constructor() {
    super();
  }

  raw<T>(...args: unknown[]): Promise<T> {
    throw new Error("Method not implemented.");
  }

  fetchRows<T = unknown>(expression: KnexExpressionBuilder, ...args: any[]): Promise<T> {
    throw new Error("Method not implemented.");
  }

}

export default KnexEloquent;
