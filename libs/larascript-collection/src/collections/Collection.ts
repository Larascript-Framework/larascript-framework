/* eslint-disable @typescript-eslint/no-explicit-any */
import { Collection as CollectJsCollection } from "collect.js";
import {
  ICollection,
  TCollectionOperator,
  TFilterCallback,
  TFindCallback,
  TForeachCallback,
  TMapCallback,
} from "./ICollection.js";
import ProxyCollectionHandler from "./ProxyCollectionHandler.js";

/**
 * Abstract class representing a collection of items
 *
 * @template T - Type of items in the collection
 */
export abstract class Collection<T = unknown> implements ICollection<T> {
  /**
   * Array of items stored in the collection
   */
  protected items: T[];

  /**
   * Type definition for an item in the collection
   */
  [index: number]: T;

  /**
   * Creates a new Collection instance
   * @param items - Initial array of items to store in the collection
   */
  constructor(items: T[] = []) {
    this.items = items;
  }

  /**
   * Creates a new proxy collection from the given items. The proxy collection
   * supports accessing the underlying items using numerical indexes.
   *
   * @template T The type of the items in the collection.
   * @param items The items to create a collection from.
   * @returns A new proxy collection with the given items.
   */
  public static collect<T = unknown>(items: T[]): Collection<T> {
    return new Proxy(
      new (class extends Collection<T> {})(items),
      new ProxyCollectionHandler(),
    ) as Collection<T>;
  }

  /**
   * Get the underlying CollectJs Collection
   * @return CollectJsCollection<T> - A CollectJs Collection instance containing the items
   */
  toCollectJs(): CollectJsCollection<T> {
    return new CollectJsCollection(this.items);
  }

  /**
   * Executes a callback for each item in the collection
   * @param callback - Function to execute on each item
   * @returns The collection instance for method chaining
   */
  forEach(callback: TForeachCallback<T>): this {
    this.items.forEach(callback);
    return this;
  }

  /**
   * Creates a new array with the results of calling a function for every array element
   * @param callback - Function that produces an element of the new array
   * @returns The collection instance with mapped items
   */
  map(callback: TMapCallback<T, T>): this {
    this.items = this.items.map(callback);
    return this;
  }

  /**
   * Finds and returns the first item in the collection that satisfies the provided testing function.
   * @param callback - Function to execute on each value in the array, taking a single argument.
   * @returns The first element in the collection that passes the test, or undefined if no elements pass the test.
   */
  find(callback: TFindCallback<T>): T | undefined {
    return this.items.find(callback);
  }

  /**
   * Filters the items in the collection based on the provided callback function
   * @param callback - Function that determines whether an item should be included
   * @returns The collection instance with filtered items
   */
  filter(callback: TFilterCallback<T>): this {
    this.items = this.items.filter(callback);
    return this;
  }

  /**
   * Returns all items in the collection as an array
   * @returns Array containing all items
   */
  all(): T[] {
    return this.items;
  }

  /**
   * Converts the collection to an array
   * @returns Array containing all items
   */
  toArray(): T[] {
    return this.items;
  }

  /**
   * Retrieves an item at the specified index
   * @param index - Zero-based index of the item to retrieve
   * @returns The item at the specified index
   */
  get(index: number): T {
    return this.items[index];
  }

  /**
   * Sets an item at the specified index
   * @param index - Zero-based index where to set the item
   * @param value - Value to set at the specified index
   */
  set(index: number, value: T): void {
    this.items[index] = value;
  }

  /**
   * Adds an item to the end of the collection
   * @param item - Item to add to the collection
   * @returns The collection instance for method chaining
   */
  add(item: T): this {
    this.items.push(item);
    return this;
  }

  /**
   * Removes an item at the specified index
   * @param index - Zero-based index of the item to remove
   * @returns The collection instance for method chaining
   */
  remove(index: number): this {
    this.items.splice(index, 1);
    return this;
  }

  /**
   * Returns the first item in the collection or null if empty
   * @returns The first item or null if collection is empty
   */
  first(): T | null {
    return this.items?.[0] ?? null;
  }

  /**
   * Returns the last item in the collection or null if empty
   * @returns The last item or null if collection is empty
   */
  last(): T | null {
    return this.items?.[this.items.length - 1] ?? null;
  }

  /**
   * Returns the number of items in the collection
   * @returns The count of items
   */
  count(): number {
    return this.items.length;
  }

  /**
   * Calculates the sum of values in the specified column
   * @param column - Name of the column to sum
   * @returns The sum of the column values
   */
  sum(column: string): number | string {
    return this.toCollectJs().sum(column);
  }

  /**
   * Calculates the average of values in the specified column
   * @param column - Name of the column to average
   * @returns The average of the column values
   */
  average(column: string): number {
    return this.toCollectJs().avg(column);
  }

  /**
   * Finds the maximum value in the specified column
   * @param column - Name of the column to find maximum value
   * @returns The maximum value in the column
   */
  max(column: string): number {
    return this.toCollectJs().max(column);
  }

  /**
   * Finds the minimum value in the specified column
   * @param column - Name of the column to find minimum value
   * @returns The minimum value in the column
   */
  min(column: string): number {
    return this.toCollectJs().min(column);
  }

  /**
   * Filters items based on a column value comparison
   * @param column - Name of the column to compare
   * @param operator - Comparison operator to use
   * @param value - Value to compare against
   * @returns The collection instance with filtered items
   */
  where(column: string, operator: TCollectionOperator, value: any): this {
    this.items = this.toCollectJs().where(column, operator, value).all();
    return this;
  }

  /**
   * Checks if the collection is empty
   * @returns True if the collection is empty, false otherwise
   */
  isEmpty(): boolean {
    return this.items.length === 0;
  }

  /**
   * Creates a deep clone of the collection
   * @returns A new collection instance with cloned items
   */
  clone(): this {
    return new (this.constructor as any)([...this.items]);
  }
}

export default Collection;
