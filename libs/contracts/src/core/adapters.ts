/**
 * @template T type of the adapter
 */
export type BaseAdapterTypes<T = unknown> = {
    [key: string]: T;
  };