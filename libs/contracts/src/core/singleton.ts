/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * A service is a class that provides a specific functionality to the application.
 * It usually has a single responsibility and can be used by other services or controllers.
 *
 * @template T - The type of the service.
 */
export type ServiceConstructor<T extends IService = IService> = new (
  ...args: any[]
) => T;

/**
 * The base interface for all services.
 * It provides a single method, `getConfig`, which returns the configuration for the service.
 */
export interface IService {
  /**
   * Returns the configuration for the service.
   *
   * @param args - The arguments to pass to the service.
   * @returns The configuration for the service.
   */
  getConfig(...args: any[]): any;
}

export default IService;