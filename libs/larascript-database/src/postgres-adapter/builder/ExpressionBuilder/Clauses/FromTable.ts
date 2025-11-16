import SqlExpression from "../SqlExpression.js";

class FromTable {
  /**
   * Converts a table name to a SQL string that can be used for a FROM clause.
   *
   * @param table - The table name to convert to a SQL string.
   * @param abbreviation - The abbreviation for the table name.
   * @returns The SQL string for the FROM clause.
   */
  static toSql(table: string, abbreviation?: string | null): string {
    table = SqlExpression.formatTableNameWithQuotes(table);

    let sql = `FROM ${table}`;

    if (abbreviation) {
      sql += ` ${abbreviation}`;
    }

    return sql;
  }
}

export default FromTable;
