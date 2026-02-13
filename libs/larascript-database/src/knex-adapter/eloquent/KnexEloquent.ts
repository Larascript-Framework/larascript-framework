import DB from "@/database/services/DB.js";
import { collect, Collection } from "@larascript-framework/larascript-collection";
import {
  captureError,
  generateUuidV4,
  PrefixedPropertyGrouper
} from "@larascript-framework/larascript-utils";
import { Knex } from "knex";
import Eloquent from "../../eloquent/Eloquent.js";
import {
  IdGeneratorFn,
  IEloquent
} from "../../eloquent/index.js";
import { IModel, ModelConstructor } from "../../model/index.js";
import { IKnexPostgresAdapterConfig } from "../contracts/config.js";
import BindingsHelper from "../expressions/BindingsHelper.js";
import { KnexExpression } from "../expressions/KnexExpression.js";

class KnexEloquent<Model extends IModel> extends Eloquent<Model, KnexExpression> {
  bindingsUtility: BindingsHelper = new BindingsHelper();
  
  /**
   * The default ID generator function for the query builder.
   */
  protected defaultIdGeneratorFn: IdGeneratorFn | null = generateUuidV4 as IdGeneratorFn;

  protected idGeneratorFn?: IdGeneratorFn = generateUuidV4 as IdGeneratorFn;

  /**
   * The query builder expression object
   */
  declare expression: KnexExpression;

  /**
   * The query builder client
   */
  protected knex!: Knex;

  /**
   * The configuration for the query builder
   */
  protected config!: IKnexPostgresAdapterConfig;

  /**
   * The formatter to use when formatting the result rows to objects
   */
  protected formatter: PrefixedPropertyGrouper = new PrefixedPropertyGrouper();

  constructor(knex: Knex, config: IKnexPostgresAdapterConfig) {
    super();
    this.knex = knex;
    this.config = config;
    this.expression = this.createKnexExpression();
  }

  static create<Model extends IModel>(knex: Knex, config: IKnexPostgresAdapterConfig): KnexEloquent<Model> {
    return new KnexEloquent<Model>(knex, config);
  }

  private createKnexExpression(): KnexExpression {
    return KnexExpression.create(this.knex);
  }

  private modeltor(): ModelConstructor<Model> {
    if(typeof this.modelCtor === "undefined") { 
      throw new Error("Model constructor has not been set");
    }
    return this.modelCtor as ModelConstructor<Model>;
  }

  private onError(...args: any[]): void {
    DB.getInstance().logger()?.error(...args);
  }

  private logQuery(knexQuery: Knex.QueryBuilder): void {
    console.log('[KnexEloquent] Query:', knexQuery.toSQL().sql, 'bindings:', knexQuery.toSQL().bindings);
  }

  private prepareDocumentsForInsert(documents: object | object[]): object[] {
    const casts = this.modeltor().getCasts();
    const jsonProperties = Object.keys(casts).filter((key) => casts[key] === "object" || casts[key] === "array");
    const documentsArray = Array.isArray(documents) ? documents : [documents];

    return documentsArray.map((document) => {
      let typedDocument = document as { id?: unknown } & Record<string, unknown>;

      // Add ID if not present
      if (!typedDocument.id) {
        typedDocument = this.documentWithGeneratedId(typedDocument);
      }

      for(const [key, value] of Object.entries(typedDocument)) {
        if (jsonProperties.includes(key) && typeof value === "object" && value !== null) {
          typedDocument[key] = JSON.stringify(value);
        }
      }

      return this.normalizeDocuments(typedDocument)[0] as object;
    }) as object[];
  }

  setIdGenerator(idGeneratorFn: IdGeneratorFn = this.defaultIdGeneratorFn as IdGeneratorFn): IEloquent<Model> {
    this.idGeneratorFn = idGeneratorFn;
    return this as unknown as IEloquent<Model>;
  }


  async raw<T>(...args: unknown[]): Promise<T> {
    return await captureError(async () => {
      return [] as T;
    }, this.onError)
  }

  async insert(documents: object | object[]): Promise<Collection<Model>> {
    return await captureError(async () => {
      
      const previousExpression = this.expression.clone();

      const preparedDocuments: object[] = this.prepareDocumentsForInsert(documents);

      if(DB.getInstance().databaseService().getConfig().enableLogging) {
        this.logQuery(this.expression.buildInsert(preparedDocuments));
      }

      const results = await this.expression.buildInsert(preparedDocuments) as unknown as object[];

      this.setExpression(previousExpression);

      return collect(this.formatResultsAsModels(results)) as unknown as Collection<Model>;
    }, this.onError)
  }
  
  async get(): Promise<Collection<Model>> {
    return await captureError(async () => {
      const previousExpression = this.expression.clone();

      if(DB.getInstance().databaseService().getConfig().enableLogging) {
        this.logQuery(this.expression.buildSelect());
      }
      
      const results = await this.expression.buildSelect() as unknown as object[];

      this.setExpression(previousExpression);

      return collect(this.formatResultsAsModels(results)) as unknown as Collection<Model>;
    }, this.onError)
  }

  fetchRows<T = unknown>(expression: KnexExpression, ...args: any[]): Promise<T> {
    throw new Error("Method not implemented.");
  }

}

export default KnexEloquent;
