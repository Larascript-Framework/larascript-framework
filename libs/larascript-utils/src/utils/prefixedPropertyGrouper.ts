/* eslint-disable @typescript-eslint/no-explicit-any */
import { BaseFormatter } from "../baseFormatter/index.js";

export type PrefixToTargetPropertyOptions = {
  columnPrefix: string;
  targetProperty: string;
  setTargetPropertyNullWhenObjectAllNullish?: boolean;
}[];

/**
 * A utility class that processes objects by moving properties with specific prefixes
 * into nested objects. This is useful when working with flattened database results
 * that need to be transformed into structured objects.
 *
 * Example usage:
 * ```typescript
 * const flattenedData = [
 *   { user_id: 1, user_name: 'John', address_street: '123 Main St', address_city: 'Boston' },
 *   { user_id: 2, user_name: 'Jane', address_street: '456 Park Ave', address_city: 'New York' }
 * ];
 *
 * const options = [
 *   { columnPrefix: 'user_', targetProperty: 'user' },
 *   { columnPrefix: 'address_', targetProperty: 'address' }
 * ];
 *
 * const result = PrefixToTargetProperty.handleArray(flattenedData, options);
 *
 * // Result:
 * // [
 * //   {
 * //     user: { id: 1, name: 'John' },
 * //     address: { street: '123 Main St', city: 'Boston' }
 * //   },
 * //   {
 * //     user: { id: 2, name: 'Jane' },
 * //     address: { street: '456 Park Ave', city: 'New York' }
 * //   }
 * // ]
 * ```
 */
export class PrefixedPropertyGrouper extends BaseFormatter<PrefixToTargetPropertyOptions> {
  formatterOptions: PrefixToTargetPropertyOptions = [];

  /**
   * Formats an array of objects by moving prefixed properties to nested objects.
   * @param {object[]} arr The array of objects to format.
   * @param {PrefixToTargetPropertyOptions} options The options for the formatting.
   * @returns {T} The formatted array of objects.
   */
  format<T>(
    arr: object[],
    options: PrefixToTargetPropertyOptions = this.formatterOptions,
  ): T {
    return arr.map((current) =>
      this.handleItem(current as object, options ?? this.formatterOptions),
    ) as T;
  }

  /**
   * Adds an option to the formatter.
   * @param {string} column The column to add.
   * @param {string} targetProperty The target property to add.
   */
  addOption(column: string, targetProperty: string): void {
    this.formatterOptions.push({
      columnPrefix: `${column}_`,
      targetProperty,
      setTargetPropertyNullWhenObjectAllNullish: true,
    });
  }

  /**
   * Processes an array of objects by moving prefixed properties to nested objects.
   * @param {T[]} rows The array of objects to process.
   * @returns {T[]} The processed array of objects.
   */
  handleArray<T extends object = object>(
    arr: T[],
    options: PrefixToTargetPropertyOptions,
  ): T[] {
    return arr.map((current) => this.handleItem(current, options));
  }

  /**
   * Processes a single object by moving prefixed properties to nested objects.
   * @param {T} item The object to process.
   * @param {PrefixToTargetPropertyOptions} options Configuration options.
   * @returns {T} The processed object.
   */
  handleItem<T extends object = object>(
    item: T,
    options: PrefixToTargetPropertyOptions,
  ): T {
    const result = { ...item };

    options.forEach((option) => {
      this.processOption(result, item, option);
    });

    return result;
  }

  /**
   * Processes a single option configuration for an object.
   * @private
   */
  private processOption<T extends object>(
    result: T,
    item: T,
    option: PrefixToTargetPropertyOptions[0],
  ): void {
    const { columnPrefix, targetProperty } = option;

    const prefixedProperties = this.extractPrefixedProperties(
      item,
      columnPrefix,
    );

    if (Object.keys(prefixedProperties).length > 0) {
      result[targetProperty] = prefixedProperties;
      this.deletePrefixedProperties(
        result,
        Object.keys(prefixedProperties),
        columnPrefix,
      );
    }

    if (
      option.setTargetPropertyNullWhenObjectAllNullish &&
      result[targetProperty]
    ) {
      this.handleNullChecking(result, targetProperty);
    }
  }

  /**
   * Extracts properties that match the given prefix and returns them without the prefix.
   * @private
   */
  private extractPrefixedProperties<T extends object>(
    item: T,
    columnPrefix: string,
  ): Record<string, any> {
    const prefixedProperties = {};

    for (const currentProperty in item) {
      if (currentProperty.startsWith(columnPrefix)) {
        const propertyWithoutPrefix = currentProperty.replace(columnPrefix, "");
        prefixedProperties[propertyWithoutPrefix] = item[currentProperty];
      }
    }

    return prefixedProperties;
  }

  /**
   * Deletes the original prefixed properties from the result object.
   * @private
   */
  private deletePrefixedProperties<T extends object>(
    result: T,
    properties: string[],
    columnPrefix: string,
  ): void {
    properties.forEach((prop) => {
      delete result[`${columnPrefix}${prop}`];
    });
  }

  /**
   * Checks if all properties in the target object are null and sets the entire object to null if specified.
   * @private
   */
  private handleNullChecking<T extends object>(
    result: T,
    targetProperty: string,
  ): void {
    const allNull = Object.values(result[targetProperty]).every(
      (value) => value === null,
    );
    if (allNull) {
      result[targetProperty] = null;
    }
  }
}
