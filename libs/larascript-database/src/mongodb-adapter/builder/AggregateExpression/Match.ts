import { ObjectId } from "mongodb";
import { z } from "zod";
import ExpressionException from "../../../eloquent/exceptions/ExpressionException.js";
import {
  LogicalOperators,
  TLogicalOperator,
  TWhereClause,
  TWhereClauseValue,
} from "../../../eloquent/index.js";
import { normalizeColumn } from "../../utils/normalizeColumn.js";
import { MongoRaw } from "./index.js";

/**
 * Match class handles building MongoDB $match pipeline stages from SQL-style where clauses.
 * It converts SQL-like conditions into MongoDB query syntax for filtering documents.
 *
 * @example
 * ```typescript
 * // Basic equals match
 * Match.getPipeline([
 *     { column: 'name', operator: '=', value: 'John' }
 * ], null);
 * // Returns: { $match: { $and: [{ name: { $eq: 'John' } }] } }
 *
 * // Complex conditions with AND/OR
 * Match.getPipeline([
 *     { column: 'age', operator: '>', value: 21 },
 *     { column: 'status', operator: '=', value: 'active', logicalOperator: 'or' }
 * ], null);
 * // Returns: { $match: { $or: [{ age: { $gt: 21 } }, { status: { $eq: 'active' } }] } }
 *
 * // Using raw MongoDB query
 * Match.getPipeline(null, { age: { $gt: 21 } });
 * // Returns: { $match: { age: { $gt: 21 } } }
 * ```
 */

class Match {
  /**
   * Builds a MongoDB aggregation pipeline match stage from SQL-style where clauses.
   *
   * @param whereClauses - Array of where clause conditions with column, operator, and value
   * @param whereRaw - Optional raw MongoDB query object to use instead of building from where clauses
   * @returns A MongoDB $match pipeline stage object, or null if no conditions provided
   * @example
   *
   * // Basic usage with where clauses
   *     Match.getPipeline([
   *       { column: 'age', operator: '>', value: 21 }
   *     ], null);
   *     // Returns: { $match: { $and: [{ age: { $gt: 21 } }] } }
   *
   * // Using raw MongoDB query
   *     Match.getPipeline(null, { age: { $gt: 21 } });
   *     // Returns: { $match: { age: { $gt: 21 } } }
   */
  static getPipeline(
    whereClauses: TWhereClause[] | null,
    whereRaw: MongoRaw | null,
  ): object | null {
    if (!whereClauses && !whereRaw) return null;

    if (whereRaw) {
      return { $match: whereRaw };
    }

    return {
      $match: this.buildWhereConditionPipeline(whereClauses as TWhereClause[]),
    };
  }

  /**
   * Builds a MongoDB aggregation pipeline match stage from SQL-style where clauses.
   *
   * @param whereClauses - Array of where clause conditions with column, operator, and value
   * @returns A MongoDB $match pipeline stage object, or null if no conditions provided
   * @example
   * ```
   * // Basic equals condition
   *     Match.buildWhereConditionPipeline([
   *         { column: 'name', operator: '=', value: 'John' }
   *     ]);
   *
   *     // Returns: { $or: [{ $and: [{ name: { $eq: 'John' } }] }] }
   *
   * // Multiple conditions with AND/OR
   *     Match.buildWhereConditionPipeline([
   *         { column: 'age', operator: '>', value: 30 },
   *         { column: 'name', operator: 'like', value: 'J%', logicalOperator: 'or' }
   *     ]);
   *
   *     // Returns: { $or: [
   *     //   { $and: [{ age: { $gt: 30 } }] },
   *     //   { name: { $regex: '^J.*$' } }
   *     // ]}
   * ```
   */
  protected static buildWhereConditionPipeline(
    whereClauses: TWhereClause[],
  ): object {
    // Create the AND and OR conditions arrays
    const orConditions: object[] = [];
    const andConditions: object[] = [];

    // Loop through the where clauses
    for (const whereClause of whereClauses) {
      const currentWhereFilterObject = this.buildWhereFilterObject(whereClause);
      const currentLogicalOperator =
        whereClause.logicalOperator ?? LogicalOperators.AND;

      // Add where clause to the correct array
      if (currentLogicalOperator === LogicalOperators.AND) {
        andConditions.push(currentWhereFilterObject);
      } else {
        orConditions.push(currentWhereFilterObject);
      }
    }

    // If there are no where clauses, return an empty match
    if (whereClauses.length === 0) {
      return {};
    }

    // If there are zero OR conditions, and only AND conditions, return the AND conditions
    if (orConditions.length === 0 && andConditions.length > 0) {
      return { $and: andConditions };
    }

    // If there are zero AND conditions, and only OR conditions, return the OR conditions
    if (andConditions.length === 0 && orConditions.length > 0) {
      return { $or: orConditions };
    }

    // If there are AND conditions, add them to the OR conditions array
    if (andConditions.length > 0) {
      orConditions.push({ $and: andConditions });
    }

    return { $or: orConditions };
  }

  /**
   * Builds a MongoDB where clause for a single condition.
   *
   * Takes a where clause object and converts it to MongoDB query syntax.
   * Maps SQL-style operators (=, !=, >, <, etc.) to their MongoDB equivalents ($eq, $ne, $gt, $lt, etc.).
   * Handles special cases like BETWEEN, NOT BETWEEN, LIKE, etc.
   *
   * @param whereClause - The where clause object containing column, operator and value
   * @returns A MongoDB query object representing the where condition
   * @protected
   * @throws {ExpressionException} When an invalid operator is provided
   * @example
   * ```typescript
   * const clause = Match.buildWhereClause({
   *   column: 'age',
   *   operator: '>',
   *   value: 21
   * });
   * // Returns: { age: { $gt: 21 } }
   * ```
   */
  protected static buildWhereFilterObject(whereClause: TWhereClause): object {
    const { operator, raw } = whereClause;
    let { column } = whereClause;
    let value: unknown = whereClause.value;

    if (raw) {
      return this.raw(raw);
    }

    value = this.normalizeValue(value);
    column = normalizeColumn(column);

    switch (operator) {
      case "=":
        return { [column]: { $eq: value } };
      case "!=":
        return { [column]: { $ne: value } };
      case "<>":
        return { [column]: { $ne: value } };
      case ">":
        return { [column]: { $gt: value } };
      case "<":
        return { [column]: { $lt: value } };
      case ">=":
        return { [column]: { $gte: value } };
      case "<=":
        return { [column]: { $lte: value } };
      case "like":
        return this.regex(column, value as TWhereClauseValue);
      case "not like":
        return this.notRegex(column, value as TWhereClauseValue);
      case "in":
        return { [column]: { $in: value } };
      case "not in":
        return { [column]: { $not: { $in: value } } };
      case "is null":
        return { [column]: { $eq: null } };
      case "is not null":
        return { [column]: { $ne: null } };
      case "between":
        return this.between(column, value as TWhereClauseValue);
      case "not between":
        return this.notBetween(column, value as TWhereClauseValue);
    }
  }

  /**
   * Normalizes a value to a valid MongoDB value.
   *
   * @param value - The value to normalize
   * @returns The normalized value
   */
  protected static normalizeValue(value: unknown): unknown {
    if (typeof value === "string" && ObjectId.isValid(value)) {
      return new ObjectId(value);
    }
    return value;
  }

  /**
   * Builds a MongoDB raw query object.
   *
   * @param raw - The raw query object
   * @returns A MongoDB raw query object
   */
  protected static raw(raw: unknown): object {
    const schema = z.object({});
    const result = schema.safeParse(raw);

    if (!result.success) {
      throw new ExpressionException("Raw value must be an object");
    }

    return { $match: raw };
  }

  /**
   * Builds a MongoDB regex query object for a LIKE condition.
   *
   * @param column - The column to build the regex query for
   * @param value - The value to build the regex query for
   * @returns A MongoDB regex query object
   */
  protected static regex(column: string, value: TWhereClause["value"]): object {
    this.validateRegexValue(value);
    return {
      [column]: {
        $regex: this.normalizeRegexValue(value as string),
        $options: "i",
      },
    };
  }

  /**
   * Builds a MongoDB regex query object for a LIKE condition.
   *
   * @param column - The column to build the regex query for
   * @param value - The value to build the regex query for
   * @returns A MongoDB regex query object
   */
  protected static notRegex(
    column: string,
    value: TWhereClause["value"],
  ): object {
    this.validateRegexValue(value);
    return {
      [column]: {
        $not: {
          $regex: this.normalizeRegexValue(value as string),
          $options: "i",
        },
      },
    };
  }

  /**
   * Validates that a regex value is a string.
   *
   * @param value - The value to validate
   * @throws {ExpressionException} When value is not a string
   */
  protected static validateRegexValue(value: unknown): void {
    if (typeof value !== "string") {
      throw new ExpressionException("Regex value must be a string");
    }
  }

  /**
   * Normalizes a regex value to a valid MongoDB regex pattern.
   *
   * @param value - The regex value to normalize
   * @returns The normalized regex pattern
   */
  protected static normalizeRegexValue(value: string): string {
    if (value.startsWith("%")) {
      value = `.+${value.slice(1)}`;
    }
    if (value.endsWith("%")) {
      value = `${value.slice(0, -1)}.+`;
    }
    return value;
  }

  /**
   * Builds a MongoDB BETWEEN clause for a column and value range.
   *
   * @param column - The column/field name to apply the BETWEEN condition to
   * @param value - Array containing the lower and upper bounds [min, max]
   * @returns MongoDB query object for BETWEEN condition
   * @protected
   * @throws {ExpressionException} When value is not an array of two numbers/dates
   */
  protected static between(column: string, value: TWhereClause["value"]) {
    this.validateBetweenValue(value);
    const betweenValue = value as [number, number];
    return { [column]: { $gte: betweenValue[0], $lte: betweenValue[1] } };
  }

  /**
   * Builds a MongoDB NOT BETWEEN clause for a column and value range.
   *
   * @param column - The column/field name to apply the NOT BETWEEN condition to
   * @param value - Array containing the lower and upper bounds [min, max]
   * @returns MongoDB query object for NOT BETWEEN condition
   * @protected
   * @throws {ExpressionException} When value is not an array of two numbers/dates
   */
  protected static notBetween(column: string, value: TWhereClause["value"]) {
    this.validateBetweenValue(value);
    const betweenValue = value as [number, number];
    return {
      [column]: { $not: { $gte: betweenValue[0], $lte: betweenValue[1] } },
    };
  }

  /**
   * Normalizes the logical operator to the MongoDB format.
   *
   * @param operator - The logical operator to normalize
   * @returns The normalized logical operator
   * @protected
   */
  protected static normalizeLogicalOperator(
    operator: TLogicalOperator,
  ): string {
    return operator === LogicalOperators.OR ? "$or" : "$and";
  }

  /**
   * Validates that a BETWEEN/NOT BETWEEN value is an array of two numbers or dates.
   *
   * @param value - The value to validate
   * @returns false if validation passes
   * @protected
   * @throws {ExpressionException} When validation fails
   */
  protected static validateBetweenValue(value: TWhereClause["value"]) {
    const schema = z.array(z.union([z.date(), z.number()]));
    const result = schema.safeParse(value);

    if (!result.success) {
      throw new ExpressionException("Between value must be a date or number");
    }

    if ((value as any[]).length !== 2) {
      throw new ExpressionException("Between value expected 2 values");
    }

    return false;
  }
}

export default Match;
