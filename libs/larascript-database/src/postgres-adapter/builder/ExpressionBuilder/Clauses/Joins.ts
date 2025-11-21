import ExpressionException from "../../../../eloquent/exceptions/ExpressionException.js";
import { TJoin } from "../../../../eloquent/index.js";
import SqlExpression from "../SqlExpression.js";

class Joins {
  /**
   * Converts an array of joins to a SQL string that can be used for a query.
   *
   * @param joins - An array of joins to convert to a SQL string.
   * @returns The SQL string for the joins.
   */
  static toSql(joins: TJoin[] | null, prefix: string = ""): string {
    if (!joins) {
      return "";
    }

    let sql = `${prefix}`;

    for (const join of joins) {
      if (join.type === "cross") {
        sql += this.crossJoin(join.relatedTable as string);
      } else {
        sql += this.genericJoin(join);
      }
    }

    return sql;
  }

  /**
   * Formats a table name with an optional abbreviation.
   * @param table - The table name to format.
   * @param abbreviation - The abbreviation for the table name.
   * @returns The formatted table name as a SQL string.
   */
  static formatTableWithAbbreviation(
    table: string,
    abbreviation?: string | null,
  ) {
    return `${table}${abbreviation ? abbreviation + " " : ""}`;
  }

  /**
   * Constructs a SQL string for a generic join clause using the provided join object.
   *
   * @param join - The join object containing the necessary details for constructing the join clause.
   * @returns The SQL string representation of the generic join clause.
   */
  static genericJoin(join: TJoin) {
    if (!join.relatedTable) {
      throw new ExpressionException("Related table name is required");
    }

    const type = this.getJoinType(join);

    const localTable = this.formatTableWithAbbreviation(
      join.localTable as string,
      join.localTableAbbreviation,
    );
    const localColumn = SqlExpression.prepareColumnOptions({
      column: join.localColumn as string,
      cast: join.cast,
    }).column;

    const relatedTable = this.formatTableWithAbbreviation(
      join.relatedTable,
      join.relatedTableAbbreviation,
    );
    const relatedColumn = SqlExpression.prepareColumnOptions({
      column: join.relatedColumn as string,
      cast: join.cast,
    }).column;

    return `${type} ${relatedTable} ON ${localTable}.${localColumn} = ${relatedTable}.${relatedColumn}`;
  }

  /**
   * Constructs a SQL string for a cross join clause using the provided table name.
   * @param table - The table name to join.
   * @returns The SQL string representation of the cross join clause.
   */
  static crossJoin(table: string) {
    return `CROSS JOIN ${this.formatTableWithAbbreviation(table)}`;
  }

  /**
   * Maps the join type from a TJoin object to its corresponding SQL join string.
   *
   * @param join - The join object containing the type of join.
   * @returns The SQL string representation of the join type.
   */
  static getJoinType(join: TJoin): string {
    switch (join.type) {
      case "inner":
        return "JOIN";
      case "left":
        return "LEFT JOIN";
      case "right":
        return "RIGHT JOIN";
      case "full":
        return "FULL JOIN";
      default:
        throw new ExpressionException(`Invalid join type: ${join.type}`);
    }
  }
}

export default Joins;
