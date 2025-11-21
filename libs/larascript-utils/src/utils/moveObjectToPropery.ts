import { BaseFormatter } from "../baseFormatter/index.js";

export type MoveObjectToPropertyOptions = {
  column: string;
  targetProperty: string;
};
export type MoveObjectToPropertyOptionsArray = MoveObjectToPropertyOptions[];

/**
 * Utility class for moving object properties to a target property.
 * Useful for restructuring data by moving properties into nested objects.
 *
 * @example
 * ```typescript
 * const formatter = new MoveObjectToProperty();
 *
 * // Add formatting options
 * formatter.addOption('department_name', 'department');
 * formatter.addOption('department_id', 'department');
 *
 * // Format data
 * const data = [
 *   {
 *     id: 1,
 *     name: 'John',
 *     department_name: 'Engineering',
 *     department_id: 100
 *   }
 * ];
 *
 * const formatted = formatter.format(data);
 * // Result:
 * // [{
 * //   id: 1,
 * //   name: 'John',
 * //   department: {
 * //     name: 'Engineering',
 * //     id: 100
 * //   }
 * // }]
 * ```
 */

export class MoveObjectToProperty extends BaseFormatter<MoveObjectToPropertyOptionsArray> {
  /**
   * The formatter options.
   */
  formatterOptions: MoveObjectToPropertyOptionsArray = [];

  /**
   * Formats the data.
   * @param dataArray The array of objects to format.
   * @param options The options for the formatting.
   * @returns The formatted data.
   */
  format<T>(
    dataArray: object[],
    options: MoveObjectToPropertyOptionsArray = this.formatterOptions,
  ): T {
    return this.handleArray(dataArray, options) as T;
  }

  /**
   * Adds an option to the formatter.
   * @param column The column to move to the target property.
   * @param targetProperty The target property to move the column to.
   */
  addOption(column: string, targetProperty: string) {
    this.formatterOptions.push({ column, targetProperty });
  }

  /**
   * Maps the object to the target property.
   * @param dataArray The array of objects to map.
   * @param options The options for the mapping.
   * @returns The array of objects with the mapped properties.
   */
  handleArray(
    dataArray: object[],
    options: MoveObjectToPropertyOptionsArray,
  ): object[] {
    return dataArray.map((current) => {
      for (const option of options) {
        current = this.handleItem(current, option);
      }
      return current;
    });
  }

  /**
   * Maps the object to the target property.
   * @param item The object to map.
   * @param options The options for the mapping.
   * @returns The object with the mapped property.
   */
  handleItem(
    item: object,
    { targetProperty, column }: MoveObjectToPropertyOptions,
  ): object {
    if (item[column] && typeof item[column] === "object") {
      if (!item[targetProperty]) {
        item[targetProperty] = {};
      }

      item[targetProperty] = {
        ...item[targetProperty],
        ...item[column],
      };

      delete item[column];
      return item;
    }

    return item;
  }
}
