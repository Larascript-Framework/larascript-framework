import { TOffsetLimit } from "../../../../eloquent/index.js";

class OffsetLimit {
  /**
   * Converts the offset property from the query builder into its SQL representation.
   *
   * Example: LIMIT 10 OFFSET 10
   *
   * @param {TOffsetLimit} offset - The offset property from the query builder.
   * @returns {string} The SQL-safe LIMIT and OFFSET clause.
   */
  static toSql(
    { limit, offset }: TOffsetLimit = {},
    prefix: string = "",
  ): string {
    if (!offset && !limit) return "";

    let sql = `${prefix}`;

    if (limit) {
      sql += `LIMIT ${limit}`;
    }

    if (offset) {
      sql += sql.length ? " " : "";
      sql += `OFFSET ${offset}`;
    }

    return sql;
  }
}

export default OffsetLimit;
