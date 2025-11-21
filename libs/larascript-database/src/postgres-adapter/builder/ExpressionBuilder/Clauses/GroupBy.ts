import { TGroupBy } from "../../../../eloquent/index.js";
import SqlExpression from "../SqlExpression.js";

class GroupBy {
  /**
   * Converts an array of group by columns into a SQL string suitable for a GROUP BY clause.
   *
   * @param {TGroupBy[] | null} groupBy - The array of columns to group by, or null if no grouping is needed.
   * @param {string} [prefix=''] - An optional prefix to prepend to the SQL string.
   * @returns {string} The SQL string for the GROUP BY clause, or an empty string if no columns are specified.
   */
  static toSql(groupBy: TGroupBy[] | null, prefix: string = ""): string {
    if (!groupBy || groupBy.length === 0) return "";

    let sql = `${prefix}GROUP BY `;

    const columnsArray = groupBy.map((item) => {
      let result = "";

      if (!item.column) {
        item.column = "*";
      }

      if (item.column !== "*") {
        item.column = SqlExpression.formatColumnWithQuotes(item.column);
      }

      if (item.tableName) {
        result += item.tableName + ".";
      }

      return result + SqlExpression.formatColumnWithQuotes(item.column);
    });

    sql += columnsArray.join(", ");

    return sql;
  }
}

export default GroupBy;
