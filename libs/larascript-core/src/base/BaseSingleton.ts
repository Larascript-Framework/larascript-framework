/* eslint-disable @typescript-eslint/no-explicit-any */
import { IService } from "@larascript-framework/contracts/larascript-core";
import { TClassConstructor } from "@larascript-framework/larascript-utils";

/**
 * Singleton pattern implementation for services.
 *
 * @template Config - Type of the configuration object passed to the service.
 */
export abstract class BaseSingleton<
  Config extends Record<any, any> | null = null,
> implements IService
{
  /**
   * Map of instantiated services.
   */
  private static instances: Map<string, BaseSingleton<any>> = new Map();

  /**
   * Service configuration.
   */
  protected config!: Config | null;

  /**
   * Constructor.
   *
   * @param config - Service configuration.
   */
  constructor(config: Config | null = null) {
    this.config = config;
  }

  /**
   * Returns the singleton instance of the service.
   *
   * @template Service - Type of the service.
   * @param this - The service class.
   * @param config - Service configuration.
   * @returns The singleton instance of the service.
   */

  public static getInstance<
    Service extends BaseSingleton<any>,
    Config extends Record<any, any> | null,
  >(this: TClassConstructor<Service>, config: Config | null = null): Service {
    const className = this.name;

    if (!BaseSingleton.instances.has(className)) {
      BaseSingleton.instances.set(className, new this(config));
    }

    return BaseSingleton.instances.get(className) as Service;
  }

  /**
   * Checks if the singleton instance of the service is initialized.
   *
   * @template Service - Type of the service.
   * @param this - The service class.
   * @returns True if the service is initialized, false otherwise.
   */

  public static isInitialized<Service extends BaseSingleton<any>>(
    this: new (config: any) => Service,
  ): boolean {
    const className = this.name;
    return BaseSingleton.instances.has(className);
  }

  /**
   * Returns the service configuration.
   *
   * @returns The service configuration.
   */
  public getConfig(): Config | null {
    return this.config;
  }
}
