import { TColumnOption } from "../../../../eloquent/index.js";
import BindingsHelper from "../../BindingsHelper.js";
import SqlExpression, { SqlRaw } from "../SqlExpression.js";

class SelectColumns {
  /**
   * Converts an array of columns to a SQL string that can be used for a SELECT query.
   *
   * Example: SELECT *
   * Example: SELECT DISTINCT ON (column1, column2) *
   * @param {string[]} columnOptions - An array of columns to convert to a SQL string.
   * @param {string[] | null} distinctColumnsOptions - An array of columns to append for the DISTINCT ON clause.
   * @returns {string} The SQL string for the SELECT query.
   */
  public static toSql(
    bindings: BindingsHelper,
    columnOptions: TColumnOption[] | null,
    distinctColumnsOptions: TColumnOption[] | null = null,
    rawSelect: SqlRaw | null = null,
  ): string {
    let sql = "SELECT ";

    if (rawSelect) {
      this.addBindings(bindings, rawSelect.bindings);
      sql += rawSelect.sql;
      return sql;
    }

    const distinctColumnsArray = this.prepareDistinctColumns(
      distinctColumnsOptions,
    );
    const columnsArray = this.prepareColumns(columnOptions);

    sql = this.appendDistinctColumnsSql(sql, distinctColumnsArray);
    sql = this.appendColumnsSql(sql, columnsArray);

    return sql;
  }

  protected static addBindings(
    bindingsUtility: BindingsHelper,
    bindings?: unknown,
  ) {
    if (!bindings) {
      return;
    }
    if (Array.isArray(bindings)) {
      bindings.forEach((binding) => bindingsUtility.addBinding(null, binding));
    } else {
      bindingsUtility.addBinding(null, bindings);
    }
  }

  /**
   * Prepares an array of distinct columns for use in a SQL query.
   *
   * This method processes the provided distinct columns to ensure they are in the correct format
   * for a SQL DISTINCT ON clause. If no distinct columns are provided, an empty array is returned.
   *
   * @param {TColumnOption[] | null} distinctColumns - The array of distinct column options to prepare.
   * @returns {TColumnOption[]} The prepared array of distinct columns.
   */
  protected static prepareDistinctColumns(
    distinctColumns: TColumnOption[] | null,
  ): TColumnOption[] {
    return SqlExpression.prepareColumnOptions<TColumnOption[]>(
      distinctColumns ?? [],
    );
  }

  /**
   * Prepares an array of columns for use in a SQL SELECT query.
   *
   * This method formats the provided column options, ensuring that each column
   * is properly qualified with its table name and alias if specified. If no
   * columns are provided, a wildcard column ('*') is used by default.
   *
   * @param {TColumnOption[] | null} options - The array of column options to prepare, or null.
   * @returns {string[]} The array of formatted column strings for the SQL query.
   */
  protected static prepareColumns(options: TColumnOption[] | null): string[] {
    if (options === null || options.length === 0) {
      options = [{ column: "*" }];
    }

    const containsWildcard = options.some((option) => option.column === "*");

    // If the query does not contain a wildcard, add the id column
    if (!containsWildcard) {
      const containsId = options.some((option) => option.column === "id");

      if (!containsId) {
        options.push({ column: "id" });
      }
    }

    // Format the columns
    options = SqlExpression.prepareColumnOptions(options);

    // Prepare table
    options = options.map((option) => {
      option.tableName = option.tableName
        ? SqlExpression.formatTableNameWithQuotes(option.tableName)
        : option.tableName;
      return option;
    });

    // Add table name and alias
    return options
      .filter((option) => option.column !== null)
      .map((option) => {
        let columnString = option.column;

        // If the column has a table name, add it
        if (option.tableName) {
          columnString = `${option.tableName}.${option.column}`;
        }

        // If the column has an alias, add it
        if (option.as) {
          columnString += ` AS ${SqlExpression.formatColumnWithQuotes(option.as)}`;
        }

        return columnString;
      }) as string[];
  }

  /**
   * Appends DISTINCT ON clause to the SQL query.
   * @param {string} sql - The SQL query string to append the DISTINCT ON clause to.
   * @param {string[] | null} distinctColumns - An array of columns to append for the DISTINCT ON clause.
   * @returns {string} The updated SQL query string with the DISTINCT ON clause.
   */
  static appendDistinctColumnsSql(
    sql: string,
    distinctColumns: TColumnOption[] | null,
  ): string {
    const distinctColumnsArray = SqlExpression.prepareColumnOptions<
      TColumnOption[]
    >(distinctColumns ?? []);

    if (distinctColumnsArray.length > 0) {
      sql += `DISTINCT ON (${distinctColumnsArray.map((column) => column.column).join(", ")}) `;
    }

    return sql;
  }

  /**
   * Appends the columns to the SQL query string.
   * @param {string} sql - The SQL query string to append the columns to.
   * @param {string[]} columns - An array of columns to append.
   * @returns {string} The updated SQL query string with the columns appended.
   */
  static appendColumnsSql(sql: string, columns: string[]): string {
    const isEmptyColumns = columns.length === 0;
    const isFirstItemIsWildcard = columns.length === 1 && columns[0] === "*";
    const useAllColumns = isEmptyColumns || isFirstItemIsWildcard;

    if (useAllColumns) {
      sql += "*";
      return sql;
    }

    sql += `${columns.join(", ")}`;
    return sql;
  }
}

export default SelectColumns;
