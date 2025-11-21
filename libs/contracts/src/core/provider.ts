/**
 * Interface for providers
 *
 * Providers are responsible for setting up services and configurations
 * for the application. They are registered in the App container and
 * can be booted when the application is ready.
 *
 * @interface IProvider
 */
export interface IProvider {
  /**
   * Registers the provider
   *
   * Called when the provider is being registered
   * Use this method to set up any initial configurations or services
   *
   * @returns {Promise<void>}
   */
  register(): Promise<void>;

  /**
   * Boots the provider
   *
   * Called after all providers have been registered
   * Use this method to perform any actions that require other services to be available
   *
   * @returns {Promise<void>}
   */
  boot(): Promise<void>;
}
