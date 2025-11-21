import { AppEnvironment } from "@/app/AppEnvironment.js";
import { AppProviderState } from "@/app/AppProviderState.js";
import { BaseSingleton } from "@/base/BaseSingleton.js";
import { IProvider, KernelConfig, KernelOptions } from "@larascript-framework/contracts/larascript-core";
import { AppContainers } from "../app/AppContainers.js";


export class Kernel extends BaseSingleton<KernelConfig> {

  /**
   * Checks if the kernel has been booted
   *
   * @returns True if the kernel has been booted, false otherwise
   */
  public booted(): boolean {
    return AppProviderState.booted();
  }

  /**
   * Boots the kernel
   *
   * @param config The configuration for the kernel
   * @param options Options for booting the kernel
   * @returns A promise that resolves when the kernel is booted
   * @throws {Error} If the kernel is already booted
   * @throws {Error} If the app environment is not set
   */
  public static async boot(
    config: KernelConfig,
    options: KernelOptions,
  ): Promise<void> {

    const kernel = Kernel.getInstance(config);
    
    if (kernel.booted()) {
      throw new Error("Kernel is already booted");
    }
    
    const environment = config?.environment ?? null;

    if (!environment) {
      throw new Error("App environment is not set");
    }

    AppEnvironment.getInstance().setEnvironment(environment);

    await Kernel.bootProviders(config, options);
  }

  /**
   * Boots the providers
   *
   * @param providers The providers to boot
   * @param withoutProviders The providers to exclude from booting
   * @returns A promise that resolves when the providers are booted
   */
  private static async bootProviders(config: KernelConfig, options: KernelOptions) {
    const providers = config?.providers ?? ([] as IProvider[]);
    const withoutProviders = options.withoutProvider ?? [];

    AppProviderState.getInstance().definedProvidersCount = providers.length;

    for (const provider of providers) {
      if (withoutProviders.includes(provider.constructor.name)) {
        continue;
      }

      await provider.register();
      AppProviderState.getInstance().preparedProviders.push(provider.constructor.name);
    }

    for (const provider of providers) {
      if (withoutProviders.includes(provider.constructor.name)) {
        continue;
      }

      await provider.boot();
      AppProviderState.getInstance().readyProviders.push(provider.constructor.name);
    }

    AppProviderState.getInstance().readyProviders = [...AppProviderState.getInstance().preparedProviders];
    AppProviderState.getInstance().booted = true;
  }

  /**
   * Checks if a provider is ready.
   * A provider is considered ready if it has been both registered and booted.
   * @param providerName The name of the provider to check.
   * @returns Whether the provider is ready or not.
   */
  public static isProviderReady(providerName: string): boolean {
    return AppProviderState.isProviderReady(providerName);
  }

  /**
   * Resets the kernel
   */
  public static reset(): void {
    AppContainers.reset();
    AppEnvironment.reset();
    AppProviderState.reset();
  }
  
}
