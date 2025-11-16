import { Collection } from "@larascript-framework/larascript-collection";
import { TClassConstructor } from "@larascript-framework/larascript-utils";
import {
  IModel,
  IModelAttributes,
  ModelConstructor,
  ModelWithAttributes,
} from "../model/model.t.js";
import IEloquentExpression from "./expressions.t.js";

export type TColumnOption = {
  column: string | null;
  tableName?: string;
  preFormattedColumn?: boolean;
  as?: string;
  cast?: string;
};

export type TOperator =
  | "="
  | "!="
  | "<>"
  | ">"
  | "<"
  | ">="
  | "<="
  | "like"
  | "not like"
  | "in"
  | "not in"
  | "is null"
  | "is not null"
  | "between"
  | "not between";

export const OperatorArray = [
  "=",
  "!=",
  "<>",
  ">",
  "<",
  ">=",
  "<=",
  "like",
  "not like",
  "in",
  "not in",
  "is null",
  "is not null",
  "between",
  "not between",
] as const;

export type TWhereClauseValue = string | number | boolean | null | Date;

export const LogicalOperators = {
  AND: "and",
  OR: "or",
} as const;

export type TLogicalOperator =
  (typeof LogicalOperators)[keyof typeof LogicalOperators];

export type TWhereClause = {
  column: string;
  tableName?: string;
  operator: TOperator;
  value: TWhereClauseValue | TWhereClauseValue[];
  logicalOperator?: TLogicalOperator;
  raw?: unknown;
  cast?: string;
};
export type TWhereClauseRaw = {
  raw: unknown;
};

export type TJoin = {
  type: (typeof JoinTypes)[keyof typeof JoinTypes];
  localTable?: string;
  localTableAbbreviation?: string;
  relatedTable?: string;
  relatedTableAbbreviation?: string;
  localColumn?: string;
  relatedColumn?: string;
  cast?: string;
};

export const JoinTypes = {
  INNER: "inner",
  LEFT: "left",
  RIGHT: "right",
  FULL: "full",
  CROSS: "cross",
} as const;

export type TWith = {
  modelCtor: TClassConstructor<IModel>;
  relationship: string;
};

export type TDirection = "asc" | "desc";

export type TOrderBy = {
  column: string;
  direction: TDirection;
};

export type TOffsetLimit = {
  limit?: number;
  offset?: number;
};

export type TGroupBy = {
  column: string;
  tableName?: string;
};

export interface IRelationship {
  _relationshipInterface: boolean;
  getLocalModelCtor(): ModelConstructor<IModel>;
  getForeignModelCtor(): ModelConstructor<IModel>;
  getForeignTableName(): string;
  getOptions<T extends object = object>(): T;
  getLocalKey(): string;
  getForeignKey(): string;
}

export interface IBelongsToOptions {
  localKey: keyof IModelAttributes;
  foreignKey?: keyof IModelAttributes;
  foreignTable: string;
  filters?: object;
}

export interface IHasManyOptions {
  localKey: keyof IModelAttributes;
  foreignKey?: keyof IModelAttributes;
  foreignTable: string;
  filters?: object;
}

export type TFormatterFn = (row: unknown) => unknown;

export type QueryOptions = {
  connectionName: string;
  tableName?: string;
};

export type SetModelColumnsOptions = {
  columnPrefix?: string;
  targetProperty?: string;
  [key: string]: unknown;
};

export type IdGeneratorFn<T = unknown> = <ReturnType = T>(
  ...args: any[]
) => ReturnType;

export type TransactionFn<Model extends IModel = IModel> = (
  query: IEloquent<ModelWithAttributes<Model>>,
) => Promise<void>;

export interface IEloquent<
  Model extends IModel = IModel,
  Expression extends IEloquentExpression = IEloquentExpression,
> {
  // Normalization
  normalizeIdProperty(property: string): string;
  normalizeDocuments<T extends object = object>(documents: T | T[]): T[];
  denormalizeDocuments<T extends object = object>(documents: T | T[]): T[];

  // eloquent methods
  setConnectionName(connectionName: string): IEloquent<Model>;
  getExpression(): IEloquentExpression;
  setExpressionCtor(
    builderCtor: TClassConstructor<IEloquentExpression>,
  ): IEloquent<Model>;
  setExpression(expression: IEloquentExpression): IEloquent<Model>;
  cloneExpression(): IEloquentExpression;
  resetExpression(): IEloquent<Model>;
  setModelCtor(modelCtor?: TClassConstructor<IModel>): IEloquent<Model>;
  getModelCtor(): ModelConstructor<IModel> | undefined;
  setModelColumns(
    modelCtor?: TClassConstructor<IModel>,
    options?: SetModelColumnsOptions,
  ): IEloquent<Model>;

  // id generator
  setIdGenerator(idGeneratorFn?: IdGeneratorFn): IEloquent<Model>;
  getIdGenerator(): IdGeneratorFn | undefined;
  generateId<T = unknown>(): T | null;

  // results
  fetchRows<T = unknown>(expression?: Expression, ...args: any[]): Promise<T>;

  // execution
  execute<T = Model["attributes"]>(builder: Expression): Promise<T>;
  raw<T = unknown>(...args: unknown[]): Promise<T>;

  // db methods
  createDatabase(name: string): Promise<void>;
  databaseExists(name: string): Promise<boolean>;
  dropDatabase(name: string): Promise<void>;

  // table methods
  createTable(name: string, ...args: any[]): Promise<void>;
  dropTable(name: string, ...args: any[]): Promise<void>;
  tableExists(name: string): Promise<boolean>;
  alterTable(name: string, ...args: any[]): Promise<void>;
  dropAllTables(): Promise<void>;

  // table methods
  setTable(table: string): IEloquent<ModelWithAttributes<Model>>;
  useTable(): string;

  // Creating and saving
  insert(
    documents: object | object[],
  ): Promise<Collection<ModelWithAttributes<Model>>>;
  update(
    documents: object | object[],
  ): Promise<Collection<ModelWithAttributes<Model>>>;
  updateAll(documents: object): Promise<Collection<ModelWithAttributes<Model>>>;
  delete(): Promise<IEloquent<ModelWithAttributes<Model>>>;

  // selection
  select(columns?: string | string[]): IEloquent<ModelWithAttributes<Model>>;
  column(column: TColumnOption): IEloquent<ModelWithAttributes<Model>>;

  // find methods
  find(id: string | number): Promise<Model | null>;
  findOrFail(id: string | number): Promise<Model>;

  // get methods
  all(): Promise<Collection<ModelWithAttributes<Model>>>;
  get(): Promise<Collection<ModelWithAttributes<Model>>>;
  first(): Promise<Model | null>;
  firstOrFail(): Promise<Model>;
  last(): Promise<Model | null>;
  lastOrFail(): Promise<Model>;

  // Select methods
  select(columns?: string | string[]): IEloquent<ModelWithAttributes<Model>>;
  selectRaw<T = unknown>(value: T): IEloquent<ModelWithAttributes<Model>>;
  distinct(columns: string | string[]): IEloquent<ModelWithAttributes<Model>>;

  // Where methods
  where(
    filters: object,
    operator?: TOperator,
  ): IEloquent<ModelWithAttributes<Model>>;
  where(
    column: string,
    value?: TWhereClauseValue,
  ): IEloquent<ModelWithAttributes<Model>>;
  where(
    column: string,
    operator?: TOperator,
    value?: TWhereClauseValue,
    logicalOperator?: TLogicalOperator,
  ): IEloquent<ModelWithAttributes<Model>>;
  whereRaw<T = unknown>(
    value: T,
    ...args: unknown[]
  ): IEloquent<ModelWithAttributes<Model>>;

  orWhere(
    column: string,
    value?: TWhereClauseValue,
  ): IEloquent<ModelWithAttributes<Model>>;
  orWhere(
    column: string,
    operator?: TOperator,
    value?: TWhereClauseValue,
  ): IEloquent<ModelWithAttributes<Model>>;

  whereIn(
    column: string,
    values: TWhereClauseValue[],
  ): IEloquent<ModelWithAttributes<Model>>;
  whereNotIn(
    column: string,
    values: TWhereClauseValue[],
  ): IEloquent<ModelWithAttributes<Model>>;

  whereLike(
    column: string,
    value: TWhereClauseValue,
  ): IEloquent<ModelWithAttributes<Model>>;
  whereNotLike(
    column: string,
    value: TWhereClauseValue,
  ): IEloquent<ModelWithAttributes<Model>>;

  whereNull(column: string): IEloquent<ModelWithAttributes<Model>>;
  whereNotNull(column: string): IEloquent<ModelWithAttributes<Model>>;

  whereBetween(
    column: string,
    range: [TWhereClauseValue, TWhereClauseValue],
  ): IEloquent<ModelWithAttributes<Model>>;
  whereNotBetween(
    column: string,
    range: [TWhereClauseValue, TWhereClauseValue],
  ): IEloquent<ModelWithAttributes<Model>>;

  // Joins
  join(
    related: ModelConstructor<IModel>,
    localColumn: string,
    relatedColumn: string,
    targetProperty: string,
  ): IEloquent<ModelWithAttributes<Model>>;
  fullJoin(
    related: ModelConstructor<IModel>,
    localColumn: string,
    relatedColumn: string,
    targetProperty: string,
  ): IEloquent<ModelWithAttributes<Model>>;
  leftJoin(
    related: ModelConstructor<IModel>,
    localColumn: string,
    relatedColumn: string,
    targetProperty: string,
  ): IEloquent<ModelWithAttributes<Model>>;
  rightJoin(
    related: ModelConstructor<IModel>,
    localColumn: string,
    relatedColumn: string,
    targetProperty: string,
  ): IEloquent<ModelWithAttributes<Model>>;
  crossJoin(
    related: ModelConstructor<IModel>,
  ): IEloquent<ModelWithAttributes<Model>>;
  with(relationship: string): IEloquent<ModelWithAttributes<Model>>;

  // Ordering
  orderBy(
    column: string,
    direction?: TDirection,
  ): IEloquent<ModelWithAttributes<Model>>;
  latest(column?: string): IEloquent<ModelWithAttributes<Model>>;
  newest(column?: string): IEloquent<ModelWithAttributes<Model>>;
  oldest(column?: string): IEloquent<ModelWithAttributes<Model>>;

  // Distinct
  distinct(
    columns: string[] | string | null,
  ): IEloquent<ModelWithAttributes<Model>>;

  // Limiting
  limit(limit: number): IEloquent<ModelWithAttributes<Model>>;
  offset(offset: number): IEloquent<ModelWithAttributes<Model>>;
  skip(skip: number): IEloquent<ModelWithAttributes<Model>>;
  take(take: number): IEloquent<ModelWithAttributes<Model>>;

  // Aggregates
  count(column?: string): Promise<number>;
  max(column: string): Promise<number>;
  min(column: string): Promise<number>;
  avg(column: string): Promise<number>;
  sum(column: string): Promise<number>;

  // Transaction
  transaction(callbackFn: TransactionFn<Model>): Promise<void>;

  // Cloning
  clone(): IEloquent<ModelWithAttributes<Model>>;
}
