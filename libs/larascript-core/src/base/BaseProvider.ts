/* eslint-disable @typescript-eslint/no-explicit-any */
import { IProvider } from "@larascript-framework/contracts/larascript-core";
import { AppSingleton } from "../app/AppSingleton.js";

/**
 * Base class for providers
 *
 * @abstract
 */
export abstract class BaseProvider implements IProvider {
  /**
   * The name of the provider
   *
   * @protected
   */
  protected providerName: string | null = null;

  /**
   * The configuration for the provider
   *
   * @protected
   */
  protected config: any = {};

  /**
   * Bind a value to the container
   *
   * @protected
   * @param {string} key - The key to bind the value to
   * @param {any} value - The value to bind to the key
   */
  protected bind(key: string, value: any): void {
    AppSingleton.setContainer(key, value);
  }

  /**
     * Registers the provider
     *
     * @abstract
     * @returns {Promise<void>}

     */
  register(): Promise<void> {
    return Promise.resolve();
  }

  /**
   * Boots the provider
   *
   * @abstract
   * @returns {Promise<void>}
   */
  boot(): Promise<void> {
    return Promise.resolve();
  }

  /**
   * Logs a message to the console
   *
   * @protected
   * @param {string} message - The message to log
   * @param {...any[]} args - Additional arguments to log
   */
  protected log(message: string, ...args: any[]): void {
    AppSingleton.container("logger").info(message, ...args);
  }
}
