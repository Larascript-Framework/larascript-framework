import {
  LogicalOperators,
  TLogicalOperator,
  TWhereClause,
  TWhereClauseValue,
} from "../../../../eloquent/index.js";
import BindingsHelper from "../../BindingsHelper.js";
import SqlExpression, { SqlRaw } from "../SqlExpression.js";

type SqlWhereClause = {
  column: string;
  tableName?: string;
  operator: string;
  value?: TWhereClauseValue;
  logicalOperator?: TLogicalOperator;
  appendValue?: boolean;
  cast?: string;
};

type WhereBetweenValue = [TWhereClauseValue, TWhereClauseValue];

class Where {
  /**
   * Creates a new instance of the WhereClause class.
   * @param filters
   */
  constructor(
    protected filters: TWhereClause[] | null,

    protected rawWhere: SqlRaw | null,

    protected bindings: BindingsHelper = new BindingsHelper(),

    protected disableAddingNewBindings: boolean = false,
  ) {}

  /**
   * Converts an array of where clauses and a raw where clause into a SQL string
   * that can be used for a WHERE clause.
   *
   * @param {TWhereClause[]} filters - The array of where clauses to convert.
   * @param {RawWhere | undefined} rawWhere - The raw SQL and bindings to use for the where clause.
   * @param {BindingsHelper} [bindings] - An instance of the BindingsHelper class for managing bindings.
   * @param {string} [prefix] - An optional prefix to prepend to the SQL string.
   * @returns {string} The SQL string for the WHERE clause.
   */
  static toSql(
    filters: TWhereClause[] | null,
    rawWhere: SqlRaw | null,
    bindings: BindingsHelper = new BindingsHelper(),
    prefix: string = "",
  ): string {
    return new Where(filters, rawWhere, bindings).build(prefix);
  }

  /**
   * Builds a SQL string for a WHERE clause from the given filters and raw where clause.
   *
   * If a raw where clause is provided, it is used to generate the SQL string.
   * If filters are provided, they are used to generate the SQL string.
   * If no filters are provided, an exception is thrown.
   * If the filters array is empty, an empty string is returned.
   *
   * @param {string} [prefix] - An optional prefix to prepend to the SQL string.
   * @returns {string} The SQL string for the WHERE clause.
   */
  build(prefix: string = ""): string {
    if (this.rawWhere) {
      return `${prefix}${this.whereRaw(this.rawWhere)}`;
    }

    if (!this.filters || this.filters.length === 0) {
      return "";
    }

    return `${prefix}${this.where(this.filters)}`;
  }

  /**
   * Converts an array of where clauses to a SQL string for use in a WHERE clause.
   *
   * Each where clause is parsed into its SQL representation, with the column,
   * operator, and value (if required) being appended to the SQL string. Logical
   * operators (AND, OR) are used to concatenate multiple clauses. If no logical
   * operator is explicitly provided, AND is used by default.
   *
   * @param {TWhereClause[]} wheres - An array of where clauses to convert to a SQL string.
   * @returns {string} The generated SQL string for the WHERE clause.
   *
   * Example: WHERE column LIKE value AND column2 = value
   * Example: WHERE column = value OR column2 >= value
   */
  where(wheres: TWhereClause[]): string {
    let sql = `WHERE `;

    for (let i = 0; i < wheres.length; i++) {
      const currentWhereSql = this.convertToSqlWhereClause(wheres[i]);
      const isNotLastWhere = i !== wheres.length - 1;

      // Example: "table."
      if (currentWhereSql.tableName) {
        const tableName = SqlExpression.formatTableNameWithQuotes(
          currentWhereSql.tableName,
        );
        sql += tableName + ".";
      }

      // Example: "column"
      sql += SqlExpression.prepareColumnOptions({
        column: currentWhereSql.column,
      }).column;

      // Example: "::text"
      if (currentWhereSql.cast) {
        sql += `::${currentWhereSql.cast}`;
      }
      sql += " ";

      // Example: LIKE
      // Example: =
      // So far: column LIKE
      sql += currentWhereSql.operator + " ";

      // Example: value
      // So far: column LIKE value
      if (currentWhereSql.value) {
        sql += currentWhereSql.value;

        // Example: "::text"
        if (currentWhereSql.cast) {
          sql += `::${currentWhereSql.cast} `;
        }

        sql += " ";
      }

      // Example: AND
      // So far: column LIKE value AND
      if (isNotLastWhere) {
        sql += this.logicalOperatorForJoiningWheres(wheres, i);
      }
    }

    // Example: WHERE column LIKE value AND column2 = value
    return sql;
  }

  /**
   * Converts the logical operator from a parsed where clause into its SQL representation.
   *
   * If the next parsed where clause has a logical operator, it is appended to the SQL string.
   * If there is no next parsed where clause, the default logical operator (AND) is used.
   *
   * @param {TWhereClause[]} wheres - The array of where clauses being converted to a SQL string.
   * @param {SqlWhereClause} currentWhereSql - The current parsed where clause being converted.
   * @param {number} currentIndex - The index of the current parsed where clause in the array.
   * @returns {string} The SQL-safe logical operator (AND, OR).
   */
  logicalOperatorForJoiningWheres(
    wheres: TWhereClause[],
    currentIndex: number,
  ): string {
    const currentWhere = wheres[currentIndex];

    if (!currentWhere.logicalOperator) {
      return "";
    }

    // Temporarily disable adding new bindings in order to fetch the next parsed where clause
    // Otherwise the bindings will be added twice
    this.disableAddingNewBindings = true;
    const nextWhereSql =
      this.convertToSqlWhereClause(wheres[currentIndex + 1]) ?? null;
    this.disableAddingNewBindings = false;

    // If there is a next parsed, append the logical operator (AND, OR)
    if (nextWhereSql) {
      const logicalOperator =
        nextWhereSql.logicalOperator ?? LogicalOperators.AND;
      return logicalOperator.toUpperCase() + " ";
    }

    // Otherwise, use the default logical operator (AND)
    return LogicalOperators.AND + " ";
  }

  /**
   * Converts a raw where clause into a SQL string that can be used for a WHERE clause.
   *
   * @param {RawWhere} rawWhere - The raw where clause containing the SQL string and bindings to use.
   * @returns {string} The SQL string for the WHERE clause.
   */
  whereRaw({ sql, bindings }: SqlRaw): string {
    if (Array.isArray(bindings)) {
      bindings.forEach((binding) => this.bindings.addBinding(null, binding));
    } else {
      this.bindings.addBinding(null, bindings);
    }

    return `WHERE ${sql}`;
  }

  /**
   * Converts a parsed where clause into its SQL representation.
   *
   * This method will parse the operator and value from the parsed where clause and
   * return a new object with the parsed column, operator and value.
   *
   * The value will be converted into a SQL-safe string using the BindingsHelper
   * class to generate a placeholder for the value.
   *
   * @param {TWhereClause} filter - The parsed where clause to convert.
   * @returns {SqlWhereClause} The parsed where clause in its SQL representation.
   */
  convertToSqlWhereClause({ column, ...filter }: TWhereClause): SqlWhereClause {
    const convertedWhere = { column, ...filter } as SqlWhereClause;

    if (filter.operator === "in") {
      convertedWhere.operator = "IN";
      convertedWhere.value =
        this.getValueWhereInStringAndAddBindings(convertedWhere);
    } else if (filter.operator === "not in") {
      convertedWhere.operator = "NOT IN";
      convertedWhere.value =
        this.getValueWhereInStringAndAddBindings(convertedWhere);
    } else if (filter.operator === "between") {
      convertedWhere.operator = "BETWEEN";
      convertedWhere.value = this.getValueWhereBetweenStringAndAddBinding(
        column,
        convertedWhere.value as unknown as WhereBetweenValue,
      );
      // "AND" or "OR" logical operator is not required
      convertedWhere.logicalOperator = undefined;
    } else if (filter.operator === "not between") {
      convertedWhere.operator = "NOT BETWEEN";
      convertedWhere.value = this.getValueWhereBetweenStringAndAddBinding(
        column,
        convertedWhere.value as unknown as WhereBetweenValue,
      );
      // "AND" or "OR" logical operator is not required
      convertedWhere.logicalOperator = undefined;
    } else if (filter.operator === "like") {
      convertedWhere.operator = "ILIKE";
      convertedWhere.value = this.getValueStringAndAddBinding(
        convertedWhere.value as TWhereClauseValue,
      );
    } else if (filter.operator === "not like") {
      convertedWhere.operator = "NOT ILIKE";
      convertedWhere.value = this.getValueStringAndAddBinding(
        convertedWhere.value as TWhereClauseValue,
      );
    } else if (filter.operator === "is null") {
      convertedWhere.operator = "IS NULL";
      // Value is not required
      convertedWhere.value = undefined;
    } else if (filter.operator === "is not null") {
      convertedWhere.operator = "IS NOT NULL";
      // Value is not required
      convertedWhere.value = undefined;
    } else {
      convertedWhere.value = this.getValueStringAndAddBinding(
        convertedWhere.value as TWhereClauseValue,
      );
    }

    return convertedWhere;
  }

  /**
   * Converts a given value into its SQL placeholder representation and adds it as a binding.
   *
   * @param {TWhereClauseValue} value - The value to convert and bind.
   * @returns {string} The SQL placeholder for the bound value.
   */
  getValueStringAndAddBinding(value: TWhereClauseValue): string {
    return this.addBinding(null, value).getLastBinding()?.sql as string;
  }

  /**
   * Converts an array of values into their SQL placeholder representation
   * suitable for an IN clause.
   *
   * @param {SqlWhereClause} whereClause - The parsed where clause to convert.
   * @returns {string} A string containing the SQL placeholder values for the
   * given array of values in the format `(?, ?, ?)`.
   *
   * Example: `($1, $2, $3)`
   */
  getValueWhereInStringAndAddBindings({
    column,
    value,
  }: SqlWhereClause): string {
    const valueArray: Iterable<unknown> = Array.isArray(value)
      ? value
      : [value];
    const placeholders: string[] = [];
    for (const value of valueArray) {
      placeholders.push(
        this.addBinding(column, value).getLastBinding()?.sql as string,
      );
    }

    return `(${placeholders.join(", ")})`;
  }

  /**
   * Converts an array of values into their SQL placeholder representation
   * suitable for a BETWEEN clause.
   *
   * @param {WhereBetweenValue} value - The value to convert, an array of two
   * elements: the 'from' and 'to' values of the BETWEEN clause.
   * @returns {string} A string containing the SQL placeholder values for the
   * given array of values in the format `FROM ? AND TO ?`.
   *
   * Example: `$1 AND $2`
   */
  getValueWhereBetweenStringAndAddBinding(
    column: string,
    value: WhereBetweenValue,
  ): string {
    const [from, to] = value;
    const placeholders: string[] = [];

    for (const value of [from, to]) {
      placeholders.push(
        this.addBinding(column, value).getLastBinding()?.sql as string,
      );
    }

    const [placeholderFrom, placeholderTo] = placeholders;

    return `${placeholderFrom} AND ${placeholderTo}`;
  }

  /**
   * Adds a binding to the WHERE clause builder. If the internal flag
   * `disableAddingNewBindings` is set to true, this method will not add the
   * binding to the builder and will return the current bindings instance.
   *
   * @param {string | null} column The column to bind the value to.
   * @param {unknown} binding The value to bind.
   * @returns {BindingsHelper} The current bindings instance.
   */
  addBinding(column: string | null, binding: unknown): BindingsHelper {
    if (this.disableAddingNewBindings) {
      return this.bindings;
    }

    this.bindings.addBinding(column, binding);
    return this.bindings;
  }
}

export default Where;
