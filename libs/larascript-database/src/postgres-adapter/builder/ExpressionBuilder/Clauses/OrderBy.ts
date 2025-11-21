import { TOrderBy } from "../../../../eloquent/index.js";
import SqlExpression from "../SqlExpression.js";

class OrderBy {
  /**
   * Converts an array of order by clauses to a SQL string that can be used for an ORDER BY clause.
   *
   * @param {TOrderBy[]} orders - The array of order by clauses to convert to a SQL string.
   * @param {string} [prefix] - An optional prefix to prepend to the SQL string.
   * @returns {string} The SQL string for the ORDER BY clause.
   *
   * Example: ORDER BY column ASC, column DESC
   */
  static toSql(orders: TOrderBy[] | null = null, prefix: string = ""): string {
    if (!orders) return "";

    if (orders.length === 0) return "";

    let sql = `${prefix}ORDER BY `;

    sql += orders
      .map(
        (order) => `${this.columnToSql(order)} ${this.directionToSql(order)}`,
      )
      .join(", ");

    return sql;
  }

  /**
   * Converts a column from an order by clause into a SQL-safe string.
   *
   * @param {TOrderBy} order - The order by clause to convert.
   * @returns {string} The SQL-safe column string.
   */
  static columnToSql({ column }: TOrderBy): string {
    return SqlExpression.prepareColumnOptions({ column }).column;
  }

  /**
   * Converts a direction from an order by clause into a SQL-safe string.
   *
   * @param {TOrderBy} order - The order by clause to convert.
   * @returns {string} The SQL-safe direction string.
   *
   * Example: ASC, DESC
   */
  static directionToSql({ direction }: TOrderBy): string {
    return direction.toUpperCase();
  }
}

export default OrderBy;
