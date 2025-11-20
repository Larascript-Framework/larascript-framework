/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Represents a constructor type for classes that can be instantiated.
 *
 * @description
 * TClassConstructor is a generic type that describes the shape of a class constructor.
 * It can be used to pass references to classes that can be initialized with the 'new' keyword.
 *
 * @typeparam T - The type of the instance that will be created by the constructor.
 *                Defaults to 'any' if not specified.
 *
 * @example
 * class MyClass {}
 *
 * function createInstance<T>(ctor: TClassConstructor<T>): T {
 *   return new ctor();
 * }
 *
 * const instance = createInstance(MyClass);
 */

export type TClassConstructor<T = any> = new (...args: any[]) => T;
