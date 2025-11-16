/**
 * Handles get, set, and has operations on a collection proxy.
 *
 * Provides a way to access items in a collection using numerical indexes.
 * It also enables accessing methods on the collection by returning a bound
 * function to ensure the correct 'this' context.
 */
export class ProxyCollectionHandler {
  /**
   * Retrieves a property from the target collection. If the property is a numeric
   * string, it attempts to access the corresponding index in the collection items.
   * If the property is a method, it returns a bound function to ensure the correct
   * 'this' context. Otherwise, it simply returns the property value.
   *
   * @param target - The target collection object.
   * @param property - The property name or index to retrieve.
   * @param receiver - The proxy or object that initiated the get request.
   * @returns The value of the property from the target collection, or a bound
   * function if the property is a method.
   */
  get(target, property, receiver) {
    if (typeof property === "string" && !isNaN(parseInt(property))) {
      return target.items[property] ?? null;
    }

    const value = Reflect.get(target, property, receiver);

    if (typeof value === "function") {
      return (...args) => {
        return value.apply(target, args);
      };
    }

    return value;
  }

  /**
   * Sets a new value for a specific property in the target collection.
   *
   * @param target - The target object whose property is to be set.
   * @param property - The property of the target to set the new value for.
   * @param newValue - The new value to assign to the property.
   * @param receiver - The proxy or the object that initiated the operation.
   * @returns A boolean indicating whether the set operation was successful.
   */

  set(target, property, newValue) {
    target.items[property] = newValue;
    return true;
  }
}

export default ProxyCollectionHandler;
