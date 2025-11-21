import { TOrderBy } from "../../../eloquent/index.js";
import { normalizeColumn } from "../../utils/normalizeColumn.js";

class Order {
  /**
   * Builds the $sort stage of the aggregation pipeline
   * @returns {object|null} The $sort pipeline stage or null if no sorting is specified
   */
  static getPipeline(order: TOrderBy[] | null): { $sort: object } | null {
    if (!order) {
      return null;
    }

    const orderByArray = Array.isArray(order) ? order : [order];
    const result: object = {};

    for (const order of orderByArray) {
      order.column = normalizeColumn(order.column);
      result[order.column] = this.normalizeOrderDirection(order);
    }

    return { $sort: result };
  }

  /**
   * Normalizes the order direction to a MongoDB sort direction
   * @param {TOrderBy} order - The order object containing column and direction
   * @returns {number} The normalized sort direction (1 for ascending, -1 for descending)
   */
  static normalizeOrderDirection(order: TOrderBy): number {
    return order.direction === "asc" ? 1 : -1;
  }
}

export default Order;
