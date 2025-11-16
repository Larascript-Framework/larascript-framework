import { isUuid } from "@larascript-framework/larascript-utils";
import { z } from "zod";
import BaseExpression, { buildTypes } from "../../../eloquent/base/BaseExpression.js";
import ExpressionException from "../../../eloquent/exceptions/ExpressionException.js";
import {
  TColumnOption,
  TJoin,
  TLogicalOperator,
  TOperator,
  TWhereClauseValue,
} from "../../../eloquent/index.js";
import BindingsHelper from "../BindingsHelper.js";
import DeleteFrom from "./Clauses/DeleteFrom.js";
import FromTable from "./Clauses/FromTable.js";
import GroupBy from "./Clauses/GroupBy.js";
import Insert from "./Clauses/Insert.js";
import Joins from "./Clauses/Joins.js";
import OffsetLimit from "./Clauses/OffsetLimit.js";
import OrderBy from "./Clauses/OrderBy.js";
import SelectColumns from "./Clauses/SelectColumns.js";
import Update from "./Clauses/Update.js";
import Where from "./Clauses/Where.js";

export type SqlRaw = { sql: string; bindings?: unknown };

export class SqlExpression extends BaseExpression<BindingsHelper> {
  bindingsUtility: BindingsHelper = new BindingsHelper();

  protected rawSelect: SqlRaw | null = null;

  protected rawWhere: SqlRaw | null = null;

  protected uuidCast: boolean = false;

  /**
   * Sets the UUID cast for the SQL expression.
   *
   * @param {boolean} uuidCast - The boolean value to set the UUID cast to.
   * @returns {this} The current SqlExpression instance.
   */
  setUuidCast(uuidCast: boolean): this {
    this.uuidCast = uuidCast;
    return this;
  }

  /**
   * Sets the default values for the expression properties.
   */
  protected setDefaults(): void {
    super.setDefaults({
      ...super.getDefaults(),
      bindings: new BindingsHelper(),
    });
  }

  // Static Utility Methods
  public static readonly formatColumnWithQuotes = (column: string): string => {
    if (column === "*") {
      return column;
    }
    if (!column.startsWith('"')) {
      column = `"${column}`;
    }
    if (!column.endsWith('"')) {
      column = `${column}"`;
    }
    return column;
  };

  public static readonly formatTableNameWithQuotes = (
    tableName: string,
  ): string => {
    if (!tableName.startsWith('"')) {
      tableName = `"${tableName}`;
    }
    if (!tableName.endsWith('"')) {
      tableName = `${tableName}"`;
    }
    return tableName;
  };

  /**
   * Prepares an array of column options for use in a SQL query.
   *
   * This method formats the provided column options, ensuring that each column
   * is properly qualified with quotes. If the option has a preFormattedColumn
   * set to true, the column will not be formatted.
   *
   * @param {TColumnOption[] | TColumnOption} options - The array of column options to prepare.
   * @returns {TColumnOption[] | TColumnOption} The prepared array of column options.
   */
  public static prepareColumnOptions<
    T extends TColumnOption | TColumnOption[] = TColumnOption,
  >(options: T): T {
    const format = (option: TColumnOption): TColumnOption => {
      if (option.preFormattedColumn) {
        return option;
      }

      option.column = this.formatColumnWithQuotes(option.column as string);
      option.column = option.cast
        ? `${option.column}::${option.cast}`
        : option.column;

      return option;
    };

    if (Array.isArray(options)) {
      return options
        .filter((option) => option.column !== null)
        .map(format) as T;
    }

    return format(options) as T;
  }

  // Core Building Methods
  build<T = string>(): T {
    if (this.table.length === 0) {
      throw new Error("Table name is required");
    }

    if (!buildTypes.includes(this.buildType)) {
      throw new ExpressionException(`Invalid build type: ${this.buildType}`);
    }

    return {
      select: () => this.buildSelect(),
      insert: () => this.buildInsert(),
      update: () => this.buildUpdate(),
      delete: () => this.buildDelete(),
    }[this.buildType]() as T;
  }

  /**
   * Builds a SELECT SQL query string using the specified query components.
   *
   * This method constructs a SQL SELECT query by combining various parts of
   * the query including columns, table, joins, where clauses, group by,
   * order by, and offset/limit clauses. Each component is converted to its
   * SQL string representation and combined into a complete SQL query.
   *
   * @returns {string} The fully constructed SQL SELECT query string.
   */
  buildSelect(): string {
    // Construct the components of the SQL query
    const oneSpacePrefix = " ";
    const selectColumns = SelectColumns.toSql(
      this.bindingsUtility,
      this.columns,
      this.distinctColumns,
      this.rawSelect,
    ).trimEnd();
    const fromTable = FromTable.toSql(
      this.table,
      this.tableAbbreviation,
    ).trimEnd();
    const join = Joins.toSql(this.joins, oneSpacePrefix).trimEnd();
    const where = Where.toSql(
      this.whereClauses,
      this.rawWhere,
      this.bindingsUtility,
      oneSpacePrefix,
    ).trimEnd();
    const groupBy = GroupBy.toSql(this.groupBy, oneSpacePrefix).trimEnd();
    const orderBy = OrderBy.toSql(
      this.orderByClauses,
      oneSpacePrefix,
    ).trimEnd();
    const offsetLimit = OffsetLimit.toSql(
      this.offsetLimit ?? {},
      oneSpacePrefix,
    ).trimEnd();

    // Construct the SQL query
    let sql = `${selectColumns} ${fromTable}`;
    sql += join;
    sql += where;
    sql += groupBy;
    sql += orderBy;
    sql += offsetLimit;

    return sql.trimEnd();
  }

  /**
   * Builds an INSERT query.
   *
   * @returns {string} The SQL string for the INSERT query.
   */
  buildInsert(): string {
    const insertsArray = Array.isArray(this.inserts)
      ? this.inserts
      : [this.inserts];

    if (insertsArray.length === 0) {
      throw new ExpressionException("Inserts must not be empty");
    }

    this.validateArrayObjects(insertsArray);

    return Insert.toSql(this.table, insertsArray, this.bindingsUtility);
  }

  /**
   * Builds an UPDATE query.
   *
   * @returns {string} The SQL string for the UPDATE query.
   */
  buildUpdate(): string {
    const updatesArray = Array.isArray(this.updates)
      ? this.updates
      : [this.updates];

    if (updatesArray.length === 0) {
      throw new ExpressionException("Updates must not be empty");
    }

    this.validateArrayObjects(updatesArray);

    return Update.toSql(
      this.table,
      updatesArray,
      this.whereClauses,
      this.bindingsUtility,
    );
  }

  /**
   * Builds a DELETE query.
   *
   * @returns {string} The SQL string for the DELETE query.
   */
  buildDelete(): string {
    // Construct the components of the SQL query
    const oneSpacePrefix = " ";
    const deleteFrom = DeleteFrom.toSql(this.table);
    const where = Where.toSql(
      this.whereClauses,
      this.rawWhere ?? null,
      this.bindingsUtility,
      oneSpacePrefix,
    ).trimEnd();

    // Construct the SQL query
    let sql = deleteFrom;
    sql += where;

    return sql.trimEnd();
  }

  /**
   * Converts the current SQL expression to a SQL query string.
   *
   * This method builds and returns the SQL query string based on the current state
   * of the SqlExpression instance, using the selected build type and configured
   * query components such as the columns, table, joins, where clauses, and more.
   *
   * @returns {string} The SQL query string representation of the current expression.
   */
  toSql(): string {
    return this.build();
  }

  // Binding Methods
  addBinding(column: string, binding: unknown): this {
    this.bindingsUtility.addBinding(column, binding);
    return this;
  }

  getBindingValues(): unknown[] {
    return this.bindingsUtility.getValues();
  }

  getBindingTypes(): (number | undefined)[] {
    return this.bindingsUtility.getTypes();
  }

  // Utility Methods
  protected validateArrayObjects(
    objects: object[],
    message = "Expected an array of objects",
  ) {
    const schema = z.array(z.object({}));

    if (!schema.safeParse(objects).success) {
      throw new ExpressionException(message);
    }
  }

  /**
   * Adds a WHERE clause to the SQL expression.
   *
   * This method extends the base where method to handle UUID values.
   * If the value is a string and is a valid UUID, it will be cast to 'uuid'.
   *
   * @param {string} column - The column to apply the WHERE clause to.
   * @param {TOperator} operator - The operator to use in the WHERE clause.
   * @param {TWhereClauseValue | TWhereClauseValue[]} value - The value to compare against.
   * @param {TLogicalOperator} [logicalOperator] - The logical operator to use in the WHERE clause.
   * @param {string} [cast] - The type to cast the value to.
   * @returns {this} The current SqlExpression instance.
   */
  where(
    column: string,
    operator: TOperator,
    value?: TWhereClauseValue | TWhereClauseValue[],
    logicalOperator?: TLogicalOperator,
    cast?: string,
  ): this {
    if (typeof value === "string" && isUuid(value)) {
      cast = "uuid";
    }

    super.where(column, operator, value, logicalOperator, cast);
    return this;
  }

  /**
   * Sets the joins for the SQL expression.
   *
   * This method extends the base setJoins method to handle UUID values.
   * If the localColumn or relatedColumn is 'id', the cast is set to 'uuid'.
   *
   * @param {TJoin[] | TJoin} joins - The joins to set for the SQL expression.
   * @returns {this} The current SqlExpression instance.
   */
  setJoins(joins: TJoin[] | TJoin): this {
    let joinOptions = Array.isArray(joins) ? joins : [joins];
    joinOptions = this.joinsWithUuidCast(joinOptions);
    super.setJoins(joinOptions);
    return this;
  }

  /**
   * Adds UUID cast to joins where the localColumn or relatedColumn is 'id'.
   *
   * This method iterates through the provided joins and checks if the localColumn
   * or relatedColumn is 'id'. If so, it sets the cast to 'uuid' for those joins.
   *
   * @param {TJoin[]} joins - The joins to add UUID cast to.
   * @returns {TJoin[]} The joins with UUID cast added.
   */
  joinsWithUuidCast(joins: TJoin[]): TJoin[] {
    if (!this.uuidCast) {
      return joins;
    }

    return joins.map((join) => {
      if (join.localColumn === "id" || join.relatedColumn === "id") {
        join.cast = "uuid";
      }
      return join;
    });
  }
}

export default SqlExpression;
