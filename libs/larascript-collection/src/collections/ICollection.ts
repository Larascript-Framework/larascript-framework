/* eslint-disable @typescript-eslint/no-explicit-any */

import { Collection as CollectJsCollection } from "collect.js";

/**
 * Type definition for callback functions used in collection operations
 */
export type TForeachCallback<T> = (item: T, index: number, array: T[]) => void;
export type TMapCallback<T, R> = (item: T, index: number, array: T[]) => R;
export type TFilterCallback<T> = (
  item: T,
  index: number,
  array: T[],
) => boolean;
export type TFindCallback<T> = (item: T, index: number, array: T[]) => boolean;
export type TCollectionOperator =
  | "==="
  | "=="
  | "!=="
  | "!="
  | "<>"
  | ">"
  | "<"
  | ">="
  | "<=";

/**
 * Interface defining the structure and behavior of a Collection class
 */
export interface ICollection<T = unknown> {
  /**
   * Index signature for array-like access
   */
  [index: number]: T;

  /**
   * Get the underlying CollectJs Collection
   */
  toCollectJs(): CollectJsCollection<T>;

  /**
   * Iterable methods
   */
  forEach(callback: TForeachCallback<T>): this;
  map(callback: TMapCallback<T, T>): this;
  filter(callback: TFilterCallback<T>): this;
  find(callback: TFindCallback<T>): T | undefined;

  /**
   * Getters and setters
   */
  all(): T[];
  toArray(): T[];
  get(index: number): T;
  set(index: number, value: T): void;
  add(item: T): this;
  remove(index: number): this;
  first(): T | null;
  last(): T | null;

  /**
   * Aggregations
   */
  count(): number;
  sum(column: string): number | string;
  average(column: string): number;
  max(column: string): number;
  min(column: string): number;

  /**
   * Comparison methods
   */
  where(column: string, operator: TCollectionOperator, value: any): this;

  /**
   * Utility methods
   */
  clone(): this;
}
