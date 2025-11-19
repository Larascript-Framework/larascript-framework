import { BaseAdapterTypes } from "@larascript-framework/contracts/larascript-core";
import { AdapterException } from "../exceptions/index.js";

/**
 * BaseAdapter is a generic abstract class that provides a foundation for implementing adapter patterns.
 * It manages a collection of typed adapters and provides methods for safely adding and retrieving them.
 *
 * The class uses a generic type parameter AdapterTypes that extends BaseAdapterTypes, allowing for
 * type-safe adapter management where each adapter must conform to the specified interface.
 *
 * Key features:
 * - Type-safe adapter storage and retrieval
 * - Prevention of duplicate adapter registration
 * - Centralized adapter management
 * - Error handling for missing or duplicate adapters
 *
 * This class is typically extended by service classes that need to manage multiple implementations
 * of a particular interface, such as authentication adapters, storage adapters, or payment providers.
 *
 * @example
 * class AuthService extends BaseAdapter<AuthAdapters> {
 *   // Implements specific auth service functionality while inheriting adapter management
 * }
 */
export abstract class BaseAdapter<AdapterTypes extends BaseAdapterTypes> {
  /**
   * @type {AdapterTypes}
   */
  protected adapters: AdapterTypes = {} as AdapterTypes;

  /**
   * @param {string} name
   * @param {TAdapterType} adapter
   */
  public addAdapterOnce(
    name: string,
    adapter: AdapterTypes[keyof AdapterTypes],
  ): void {
    if (this.adapters[name as keyof AdapterTypes]) {
      throw new AdapterException(`Adapter ${name} already exists`);
    }

    this.adapters[name as keyof AdapterTypes] = adapter;
  }

  /**
   * @param {keyof AdapterTypes} name
   * @returns {AdapterTypes[keyof AdapterTypes]}
   */
  public getAdapter<K extends keyof AdapterTypes>(name: K): AdapterTypes[K] {
    if (!this.adapters[name]) {
      throw new AdapterException(`Adapter ${name as string} not found`);
    }

    return this.adapters[name];
  }
}
