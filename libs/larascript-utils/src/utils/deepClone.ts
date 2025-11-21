import _ from "lodash";

/**
 * Deep clone an object
 * @param obj - The object to clone
 * @returns The cloned object
 */
export function deepClone<T>(obj: T): T {
  return _.cloneDeep(obj) as T;
}
