import BindingsHelper from "../../BindingsHelper.js";
import SqlExpression from "../SqlExpression.js";

class Insert {
  /**
   * Converts an array of objects to a SQL string that can be used for an INSERT query.
   * @param {object | object[]} documents - An object or an array of objects to convert to a SQL string.
   * @param {BindingsHelper} bindings - An instance of the BindingsHelper class.
   * @returns {string} The SQL string for the INSERT query.
   */
  public static toSql(
    table: string,
    documents: object | object[],
    bindings: BindingsHelper,
  ): string {
    const documentsArray = Array.isArray(documents) ? documents : [documents];
    let sql = "";

    for (const document of documentsArray) {
      sql += `${this.createInsertStatement(table, document, bindings)}`;
    }

    return sql;
  }

  /**
   * Converts an object to a SQL string that can be used for an INSERT query.
   * The object is first converted to an array of columns and an array of values.
   * The columns are then converted to a SQL string using the columns() static method.
   * The values are then converted to a SQL string using the values() static method.
   * The resulting strings are then combined to form the SQL query string.
   * @param {object} document - The object to convert to a SQL string.
   * @param {BindingsHelper} bindings - An instance of the BindingsHelper class.
   * @returns {string} The SQL string for the INSERT query.
   */
  public static createInsertStatement(
    table: string,
    document: object,
    bindings: BindingsHelper,
  ): string {
    table = SqlExpression.formatTableNameWithQuotes(table);
    const columns = Object.keys(document);
    const values = Object.values(document);
    return `INSERT INTO ${table} ${this.columns(columns)}${this.values(columns, values, bindings)}${this.returning(columns)};`;
  }

  /**
   * Converts an array of columns to a SQL string that can be used for an INSERT query.
   * The columns are first joined together with commas.
   * The resulting string is wrapped in parentheses.
   * @param {string[]} columns - An array of columns to convert to a SQL string.
   * @returns {string} The SQL string for the INSERT query.
   */
  public static columns(columns: string[]) {
    return `(${columns.map((column) => '"' + column + '"').join(", ")})`;
  }

  /**
   * Converts an array of values to a SQL string that can be used for an INSERT query.
   * The values are first converted to their SQL placeholder strings using the BindingsHelper class.
   * The placeholder strings are then joined together with commas.
   * The resulting string is wrapped in parentheses.
   * @param {unknown[]} values - An array of values to convert to a SQL string.
   * @param {BindingsHelper} bindings - An instance of the BindingsHelper class.
   * @returns {string} The SQL string for the INSERT query.
   */
  public static values(
    columns: string[],
    values: unknown[],
    bindings: BindingsHelper,
    prefix = " VALUES ",
  ) {
    bindings.reset();

    const bindingPlaceholders = columns.map((column, i) =>
      bindings.valuesToPlaceholderSqlArray(column, values[i]),
    );

    return `${prefix} (${bindingPlaceholders.join(", ")})`;
  }

  /**
   * Converts an array of values to a SQL string that can be used for a RETURNING statement.
   * The values are first converted to their SQL placeholder strings using the BindingsHelper class.
   * The placeholder strings are then joined together with commas.
   * The resulting string is wrapped in parentheses.
   * @param {unknown[]} values - An array of values to convert to a SQL string.
   * @param {string} prefix - The prefix to use for the RETURNING statement.
   * @returns {string} The SQL string for the RETURNING statement.
   */
  public static returning(columns: string[], prefix = " RETURNING ") {
    const keys = ["id", ...columns].map((column) => `"${column}"`);
    return `${prefix}${keys.join(", ")}`;
  }
}

export default Insert;
