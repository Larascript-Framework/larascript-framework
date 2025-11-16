export type TReturnOrThrow<T> = {
  shouldThrow: boolean;
  throwable: Error;
  returns?: T;
};

/**
 * @typedef {Object} ReturnOrThrow<T>
 * @property {boolean} shouldThrow - Whether to throw an error or not
 * @property {Error} throwable - The error to throw
 * @property {T} [returns] - The value to return
 */

/**
 * Returns a value or throws an error
 * @param {TReturnOrThrow<T>} param0 - The options to return or throw
 * @returns {T} The value to return
 */
export const returnOrThrow = <T>({
  shouldThrow,
  throwable,
  returns,
}: TReturnOrThrow<T>): T => {
  if (shouldThrow && throwable) {
    throw throwable;
  }
  if (returns !== undefined) {
    return returns;
  }
  throw new Error("Invalid properties");
};
