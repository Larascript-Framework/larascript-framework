import { deepClone } from "@larascript-framework/larascript-utils";
import {
  IEloquentExpression,
  TColumnOption,
  TGroupBy,
  TJoin,
  TLogicalOperator,
  TOffsetLimit,
  TOperator,
  TOrderBy,
  TWhereClause,
  TWhereClauseValue,
  TWith,
} from "../interfaces/index.js";

export type BuildType = "select" | "insert" | "update" | "delete";
export type NullableObjectOrArray = object | object[] | null;
type ExpressionDefaults<BindingsUtility = unknown> = {
  buildType: BuildType;
  table: string;
  tableAbbreviation: string | null;
  bindings: BindingsUtility | null;
  columns: TColumnOption[] | null;
  rawSelect: unknown;
  distinctColumns: TColumnOption[] | null;
  whereClauses: TWhereClause[] | null;
  whereColumnTypes: Record<string, string> | null;
  whereRaw: unknown;
  joins: TJoin[] | null;
  withs: TWith[] | null;
  orderByClauses: TOrderBy[] | null;
  offset: TOffsetLimit | null;
  inserts: NullableObjectOrArray | null;
  updates: NullableObjectOrArray | null;
  groupBy: TGroupBy[] | null;
};
export const buildTypes = ["select", "insert", "update", "delete"] as const;

abstract class BaseExpression<BindingsUtility = unknown>
  implements IEloquentExpression<BindingsUtility>
{
  bindingsUtility: BindingsUtility | null = this.getDefaults().bindings;

  protected buildType: BuildType = this.getDefaults().buildType;

  protected table: string = this.getDefaults().table;

  protected tableAbbreviation?: string | null =
    this.getDefaults().tableAbbreviation;

  protected columns: TColumnOption[] | null = this.getDefaults().columns;

  protected rawSelect: unknown = this.getDefaults().rawSelect;

  protected distinctColumns: TColumnOption[] | null =
    this.getDefaults().distinctColumns;

  protected whereClauses: TWhereClause[] | null =
    this.getDefaults().whereClauses;

  protected rawWhere: unknown = this.getDefaults().whereRaw;

  protected joins: TJoin[] | null = this.getDefaults().joins;

  protected withs: TWith[] | null = this.getDefaults().withs;

  protected orderByClauses: TOrderBy[] | null =
    this.getDefaults().orderByClauses;

  protected offsetLimit: TOffsetLimit | null = this.getDefaults().offset;

  protected inserts: NullableObjectOrArray = this.getDefaults().inserts;

  protected updates: NullableObjectOrArray = this.getDefaults().updates;

  protected groupBy: TGroupBy[] | null = this.getDefaults().groupBy;

  /**
   * Sets the default values for the expression properties.
   *
   * This method allows setting custom default values by merging them with the existing defaults.
   * If no defaults are provided, the current defaults are used.
   *
   * @param {ExpressionDefaults<BindingsUtility>} [defaults] - The custom default values to be merged
   * with the existing defaults, represented as an ExpressionDefaults object. Default is an empty object.
   */
  protected setDefaults(
    defaults: ExpressionDefaults<BindingsUtility> = {} as ExpressionDefaults<BindingsUtility>,
  ) {
    const values = {
      ...this.getDefaults(),
      ...defaults,
    } as ExpressionDefaults<BindingsUtility>;

    this.buildType = values.buildType;
    this.bindingsUtility = values.bindings;
    this.table = values.table;
    this.tableAbbreviation = values.tableAbbreviation;
    this.columns = values.columns;
    this.rawSelect = values.rawSelect;
    this.distinctColumns = values.distinctColumns;
    this.whereClauses = values.whereClauses;
    this.rawWhere = values.whereRaw;
    this.joins = values.joins;
    this.withs = values.withs;
    this.orderByClauses = values.orderByClauses;
    this.offsetLimit = values.offset;
    this.inserts = values.inserts;
    this.updates = values.updates;
    this.groupBy = values.groupBy;
  }

  // Set Build Types
  setBuildTypeSelect(): this {
    this.buildType = "select";
    return this;
  }

  setBuildTypeDelete(): this {
    this.buildType = "delete";
    return this;
  }

  setBuildTypeInsert(documents: object | object[]): this {
    documents = Array.isArray(documents) ? documents : [documents];
    this.inserts = documents;
    this.buildType = "insert";
    return this;
  }

  setBuildTypeUpdate(documents: object | object[]): this {
    documents = Array.isArray(documents) ? documents : [documents];
    this.updates = documents;
    this.buildType = "update";
    return this;
  }

  /**
   * Builds and returns the final expression result.
   *
   * @template T - The type of the built expression result
   * @returns {T} The constructed expression result
   */
  abstract build<T = unknown>(): T;

  /**
   * Returns the default values for the expression properties as an ExpressionDefaults object.
   *
   * The defaults include settings for build type, table details, column selections,
   * query conditions, joins, ordering, and more. These defaults are used to
   * initialize the properties of an SQL expression.
   *
   * @returns {ExpressionDefaults<BindingsUtility>} The default values for
   * expression properties.
   */
  protected getDefaults(): ExpressionDefaults<BindingsUtility> {
    return {
      buildType: "select",
      table: "",
      bindings: null,
      tableAbbreviation: null,
      columns: null,
      rawSelect: null,
      distinctColumns: null,
      whereClauses: null,
      whereColumnTypes: null,
      whereRaw: null,
      joins: null,
      withs: null,
      orderByClauses: null,
      offset: null,
      inserts: null,
      updates: null,
      groupBy: null,
    };
  }

  // Table Methods
  setTable(table: string, abbreviation?: string): this {
    this.table = table;
    this.tableAbbreviation = abbreviation ?? null;
    return this;
  }

  getTable(): string {
    return this.table;
  }

  // Column Methods
  setColumns(columns: TColumnOption[]): this {
    this.columns = columns;
    return this;
  }

  addColumn(column: TColumnOption): this {
    if (!this.columns) this.columns = [];
    this.columns.push(column);
    return this;
  }

  getColumns(): TColumnOption[] {
    return this.columns ?? [];
  }

  setDistinctColumns(columns: TColumnOption[]): this {
    this.distinctColumns = columns;
    return this;
  }

  getDistinctColumns(): TColumnOption[] {
    return this.distinctColumns || [];
  }

  // Select Raw Methods
  setSelectRaw<T>(value: T): this {
    this.buildType = "select";
    this.rawSelect = value;
    return this;
  }

  getRawSelect<T>(): T | null {
    return this.rawSelect as T | null;
  }

  // Insert/Update Methods
  getInsert(): NullableObjectOrArray {
    return this.inserts ?? [];
  }

  setInserts(inserts: NullableObjectOrArray) {
    this.inserts = inserts;
    return this;
  }

  setUpdates(updates: NullableObjectOrArray) {
    this.updates = updates;
    return this;
  }

  getUpdates(): NullableObjectOrArray {
    return this.updates ?? [];
  }

  getUpdate(): NullableObjectOrArray {
    return this.updates ?? [];
  }

  // Where Clause Methods
  setWhere(where: TWhereClause[] | null): this {
    if (!this.whereClauses) this.whereClauses = [];
    this.whereClauses = where;
    return this;
  }

  getWhere(): TWhereClause[] {
    return this.whereClauses ?? [];
  }

  addWhere(where: TWhereClause): this {
    if (!this.whereClauses) this.whereClauses = [];
    this.whereClauses.push(where);
    return this;
  }

  addWhereRaw(raw: unknown): this {
    if (!this.whereClauses) this.whereClauses = [];
    this.whereClauses.push({ raw } as unknown as TWhereClause);
    return this;
  }

  where(
    column: string,
    operator: TOperator,
    value: TWhereClauseValue | TWhereClauseValue[] = null,
    logicalOperator: TLogicalOperator = "and",
    cast?: string,
  ): this {
    if (!this.whereClauses) this.whereClauses = [];
    this.whereClauses.push({
      column,
      operator,
      value,
      logicalOperator,
      tableName: this.table,
      cast,
    });
    return this;
  }

  whereRaw<T = unknown>(value: T, bindings?: unknown): this {
    this.rawWhere = value;
    return this;
  }

  getRawWhere<T>(): T | null {
    return this.rawWhere as T | null;
  }

  setRawWhere<T>(where: T | null): this {
    this.rawWhere = where;
    return this;
  }

  // Join Methods
  setJoins(joins: TJoin[] | TJoin): this {
    this.joins = Array.isArray(joins) ? joins : [joins];
    return this;
  }

  join(options: TJoin): this {
    if (!this.joins) this.joins = [];
    this.joins.push(options);
    return this;
  }

  getJoins(): TJoin[] {
    return this.joins ?? [];
  }

  // With Methods
  setWiths(withs: TWith[] | TWith): this {
    this.withs = Array.isArray(withs) ? withs : [withs];
    return this;
  }

  with(options: TWith): this {
    if (!this.withs) this.withs = [];
    this.withs.push(options);
    return this;
  }

  getWiths(): TWith[] {
    return this.withs ?? [];
  }

  // Order By Methods
  setOrderBy(orderBy: TOrderBy[] | null): this {
    this.orderByClauses = orderBy;
    return this;
  }

  orderBy(orderBy: TOrderBy): this {
    if (!this.orderByClauses) this.orderByClauses = [];
    this.orderByClauses.push(orderBy);
    return this;
  }

  getOrderBy(): TOrderBy[] | null {
    return this.orderByClauses ?? [];
  }

  setOrderByClauses(orderByClauses: TOrderBy[]) {
    this.orderByClauses = orderByClauses;
    return this;
  }

  // Group By Methods
  getGroupBy(): TGroupBy[] | null {
    return this.groupBy;
  }

  setGroupBy(columns: TGroupBy[]): this {
    this.groupBy = columns;
    return this;
  }

  // Offset/Limit Methods
  setOffsetLimit(offsetLimit: TOffsetLimit | null): this {
    this.offsetLimit = offsetLimit;
    return this;
  }

  setOffsetAndLimit(offset: TOffsetLimit | null = null): this {
    this.offsetLimit = offset;
    return this;
  }

  setLimit(limit: number | null = null): this {
    this.offsetLimit = {
      limit: limit ?? undefined,
      offset: this.offsetLimit?.offset,
    };
    return this;
  }

  setOffset(offset: number | null = null): this {
    this.offsetLimit = {
      limit: this.offsetLimit?.limit,
      offset: offset ?? undefined,
    };
    return this;
  }

  getOffsetLimit(): TOffsetLimit | null {
    return this.offsetLimit;
  }

  // Binding Methods
  setBindings(bindings: BindingsUtility): this {
    this.bindingsUtility = bindings;
    return this;
  }

  getBindings(): BindingsUtility | null {
    return this.bindingsUtility;
  }

  /**
   * Clones the query builder expression.
   *
   * @returns {IEloquentExpression<BindingsUtility>} A new cloned query builder expression.
   */
  clone(): IEloquentExpression<BindingsUtility> {
    return deepClone(this);
  }
}

export default BaseExpression;
