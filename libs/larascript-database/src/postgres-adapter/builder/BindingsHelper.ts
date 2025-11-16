import { types } from "pg";
import ExpressionException from "../../eloquent/exceptions/ExpressionException.js";

export type TBinding = {
  sql: string;
  value: unknown;
  type?: number;
};

/**
 * Helper class to manage bindings for a query builder.
 */
class BindingsHelper {
  protected bindings: TBinding[] = [];

  protected columnTypes: Record<string, number> = {};

  /**
   * Resets the bindings array to an empty array.
   */
  reset() {
    this.bindings = [];
  }

  /**
   * Sets the type of the given column for future bindings.
   * @param {string} column The column name to set the type for.
   * @param {number} type The type number to set for the column.
   * @returns {this} The bindings helper instance.
   */
  setColumnType(column: string, type: number): this {
    this.columnTypes[column] = type;
    return this;
  }

  /**
   * Adds a binding to the builder.
   * The binding is an object with two properties: `sql` and `value`.
   * The `sql` property is the SQL placeholder string, and the `value` property
   * is the value that will be bound to the placeholder.
   * @param {unknown} value The value to bind.
   */
  addBinding(column: string | null, value: unknown): this {
    if (typeof value === "undefined") {
      return this;
    }

    // If the column has a type, add it to the binding
    // This might look like $1::uuid
    let suffix = "";
    if (column && this.columnTypes[column]) {
      suffix = "::" + BindingsHelper.getPgEnumValue(this.columnTypes[column]);
    }

    const type = column ? this.columnTypes[column] : undefined;

    this.bindings.push({
      sql: "$" + this.getNextBindingSql() + suffix,
      value,
      type: type ?? undefined,
    });
    return this;
  }

  /**
   * Converts the given PostgreSQL type number to its corresponding enum value as a string.
   * Returns undefined if no matching enum value is found.
   * Example: type: 16 -> enum: 'bool'
   * @param {number} type The PostgreSQL type number to convert.
   * @returns {string | undefined} The enum value as a string, or undefined.
   */
  static getPgEnumValue(type: number): string | undefined {
    const typesMap = Array.from(Object.entries(types.builtins)).map(
      ([key, value]) => ({ key, value }),
    );
    return typesMap.find(({ value }) => value === type)?.key.toLowerCase();
  }

  /**
   * Adds the given values as bindings to the builder and returns an array of
   * the corresponding SQL placeholder strings.
   * @param {unknown[]} values The values to add as bindings.
   * @returns {string[]} e.g ['$1', '$2', '$3']
   */
  valuesToPlaceholderSqlArray(column, value: unknown): string[] {
    this.addBinding(column, value);
    const lastBindings = this.bindings.slice(-1);
    return lastBindings.map(({ sql }) => sql);
  }

  valuesArrayToPlaceholderSqlArray(column, values: unknown[]): string[] {
    if (!Array.isArray(values)) {
      throw new ExpressionException("Values must be an array");
    }

    for (const value of values) {
      this.addBinding(column, value);
    }

    const lastBindings = this.bindings.slice(-values.length);
    return lastBindings.map(({ sql }) => sql);
  }

  /**
   * Retrieves the list of values that have been added to the builder as bindings.
   * This can be useful for debugging or logging purposes.
   * @returns {unknown[]} The list of values
   */
  getValues(): unknown[] {
    return this.bindings.map(({ value }) => value);
  }

  /**
   * Retrieves the list of PostgreSQL types that have been added to the builder as bindings.
   * @returns {number[]} The list of PostgreSQL types
   */
  getTypes(): (number | undefined)[] {
    return this.bindings.map(({ type }) => type);
  }

  /**
   * Retrieves the list of bindings that have been added to the builder.
   * Each binding is an object with two properties: `sql` and `value`.
   * The `sql` property is the SQL placeholder string, and the `value` property
   * is the value that will be bound to the placeholder.
   *
   * @returns {TBinding[]} The list of bindings.
   */
  getBindings(): TBinding[] {
    return this.bindings;
  }

  /**
   * Retrieves the last binding added to the builder, or null if no bindings have been added.
   * @returns {TBinding | null} The last binding, or null if no bindings have been added.
   */
  getLastBinding(): TBinding | null {
    return this.bindings[this.bindings.length - 1] ?? null;
  }

  /**
   * Retrieves the last `number` bindings added to the builder.
   * The bindings are returned in the order they were added, with the most recent binding
   * first.
   * @param {number} number - The number of bindings to retrieve.
   * @returns {TBinding[]} The last `number` bindings, or an empty array if less than `number` bindings have been added.
   */
  getNthLastBindings(number: number): TBinding[] {
    return this.bindings.slice(-number);
  }

  /**
   * Calculates the SQL placeholder index for the next binding.
   *
   * @returns {string} The SQL placeholder index starting from 1.
   */
  protected getNextBindingSql() {
    return `${this.bindings.length + 1}`;
  }
}

export default BindingsHelper;
