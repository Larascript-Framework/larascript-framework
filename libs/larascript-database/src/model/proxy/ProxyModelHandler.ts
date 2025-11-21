import { IModel } from "../../model/index.js";

/**
 * A proxy handler for model objects that intercepts property access and method calls.
 *
 * This handler provides a way to access model attributes and methods while maintaining
 * proper 'this' context. It implements the ProxyHandler interface to customize the
 * behavior of JavaScript Proxy objects when used with models.
 *
 * Key features:
 * - Provides access to model attributes through proxy get operations
 * - Maintains proper method binding to preserve 'this' context
 * - Supports prototype chain lookups
 *
 * @implements {ProxyHandler<any>}
 */
export class ProxyModelHandler implements ProxyHandler<any> {
  /**
   * Retrieves a property from the target model. If the property is a numeric
   * string, it attempts to access the corresponding index in the model's items.
   * If the property is a method, it returns a bound function to ensure the correct
   * 'this' context. Otherwise, it simply returns the property value.
   *
   * @param target - The target model object.
   * @param prop - The property name or index to retrieve.
   * @param receiver - The proxy or object that initiated the get request.
   * @returns The value of the property from the target model, or a bound function if the property is a method.
   */

  public get(target: IModel, prop: string | symbol, receiver: any): any {
    const value = target[prop as keyof IModel];

    // Handle method calls
    if (typeof value === "function" && this._invokableMethod(target, prop)) {
      return value.bind(target);
    }

    if (prop === "attributes") {
      return target.attributes;
    }

    return target?.getAttributeSync(prop as keyof IModel) ?? null;
  }

  /**
   * Determines if a method is invokable on the target model by checking if the property
   * is not listed in the model's relationships. This ensures that relationship properties
   * are not treated as methods.
   *
   * @param target - The target model object.
   * @param prop - The property name or symbol to check.
   * @param value - The value associated with the property, typically a function.
   * @returns A boolean indicating whether the method is invokable.
   */
  protected _invokableMethod(target: IModel, prop: string | symbol): boolean {
    return !target.relationships.includes(prop as string);
  }

  /**
   * Retrieves the prototype of the target object. This method is used to access
   * the prototype of the model, allowing access to methods and properties defined
   * on the model's prototype chain.
   *
   * @param target - The target model object whose prototype is to be retrieved.
   * @returns The prototype of the target object, or null if not available.
   */
  public getPrototypeOf(target: any): object | null {
    return target.constructor.prototype;
  }
}

export default ProxyModelHandler;
