import { TWhereClause } from "../../../../eloquent/index.js";
import BindingsHelper from "../../BindingsHelper.js";
import SqlExpression from "../SqlExpression.js";

class Update {
  /**
   * Converts a table name to a SQL string that can be used for a FROM clause.
   *
   * @param table - The table name to convert to a SQL string.
   * @param abbreviation - The abbreviation for the table name.
   * @returns The SQL string for the FROM clause.
   */
  static toSql(
    table: string,
    update: object | object[],
    wheres: TWhereClause[] | null,
    bindings: BindingsHelper,
  ): string {
    let sql = "";
    const updatesArray = Array.isArray(update) ? update : [update];

    updatesArray.forEach((update) => {
      sql += this.createUpdateSql(table, update, wheres, bindings);
    });

    return sql;
  }

  /**
   * Converts a table name and an object to a SQL string that can be used for an UPDATE query.
   *
   * @param table - The table name to convert to a SQL string.
   * @param update - The object to convert to a SQL string.
   * @param wheres - An array of where clauses to append to the UPDATE query.
   * @param bindings - An instance of the BindingsHelper class.
   * @returns The SQL string for the UPDATE query.
   */
  static createUpdateSql(
    table: string,
    update: object,
    wheres: TWhereClause[] | null,
    bindings: BindingsHelper,
  ): string {
    table = SqlExpression.formatTableNameWithQuotes(table);
    return (
      `UPDATE ${table} ${this.set(update, bindings)} ${this.where(wheres, bindings)}`.trimEnd() +
      ";"
    );
  }

  /**
     * Converts an object to a SQL string that can be used for a SET clause.

     * @param {object} update - The object to convert to a SQL string.
     * @param {BindingsHelper} bindings - An instance of the BindingsHelper class.
     * @returns {string} The SQL string for the SET clause.
     */
  static set(update: object, bindings: BindingsHelper): string {
    let sql = "SET ";

    const columns = Object.keys(update).map(
      (column) => SqlExpression.prepareColumnOptions({ column }).column,
    );
    const values = Object.values(update);

    for (let i = 0; i < columns.length; i++) {
      const column = columns[i];
      const value = values[i];

      sql += `${column} = ${bindings.addBinding(column, value).getLastBinding()?.sql}`;

      if (i !== columns.length - 1) {
        sql += ", ";
      }
    }

    return sql;
  }

  /**
   * Converts an array of where clauses to a SQL string that can be used for a WHERE clause.
   *
   * @param {TWhereClause[]} wheres - The array of where clauses to convert to a SQL string.
   * @param {BindingsHelper} bindings - An instance of the BindingsHelper class.
   * @returns {string} The SQL string for the WHERE clause.
   */
  static where(
    wheres: TWhereClause[] | null,
    bindings: BindingsHelper,
  ): string {
    if (!wheres || wheres.length === 0) return "";

    let sql = "WHERE ";

    for (const where of wheres) {
      const column = SqlExpression.prepareColumnOptions({
        column: where.column,
      }).column;
      const value = bindings
        .addBinding(column, where.value)
        .getLastBinding()?.sql;

      sql += `${column} ${where.operator} ${value}`;
    }

    return sql;
  }
}

export default Update;
