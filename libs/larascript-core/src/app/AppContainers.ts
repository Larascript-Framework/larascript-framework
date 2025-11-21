import { BaseSingleton } from "@/base/BaseSingleton.js";
import { Containers } from "@larascript-framework/contracts/larascript-core";
import { UninitializedContainerError } from "../exceptions/UninitializedContainerError.js";
import { AppProviderState } from "./AppProviderState.js";

export class AppContainers<T extends Containers = Containers> extends BaseSingleton {
    public containers: Map<keyof T, T[keyof T]> = new Map();

  /**
   * Sets a container
   * @param name The name of the container
   * @param container The container to set
   */
  public static setContainer<Name extends keyof Containers & string>(
    name: Name,
    container: Containers[Name],
  ) {
    if (AppProviderState.booted()) {
      throw new Error("Kernel is already booted");
    }
    if (!name || name === "") {
      throw new Error("Container name cannot be empty");
    }
    if (AppContainers.getInstance().containers.has(name)) {
      throw new Error("Container already exists");
    }

    AppContainers.getInstance().containers.set(name, container);
  }

  /**
   * Gets a container
   * @param name The name of the container
   * @returns The container if it exists, or throws an UninitializedContainerError if not
   */
  public static container<T extends Containers, K extends keyof T = keyof T>(
    name: K,
  ): T[K] {
    if (!AppContainers.getInstance().containers.has(name as keyof Containers)) {
      throw new UninitializedContainerError(name as string);
    }

    return AppContainers.getInstance().containers.get(name as keyof Containers) as T[K];
  }

  /**
   * Returns the dependency loader function.
   * This function can be passed into services or classes that require access to application containers
   * for dependency injection. It allows services to retrieve their required dependencies by name.
   *
   * @returns A function that retrieves containers by name.
   */
  public static dependencies() {
    return this.container;
  }

  /**
   * Safely retrieves a container by its name.
   * Attempts to get the specified container from the kernel.
   * If the container is not initialized, it returns undefined.
   * Throws an error for other exceptions.
   *
   * @template K - The type of the container key.
   * @param {K} name - The name of the container to retrieve.
   * @returns {IContainers[K] | undefined} The container if found, otherwise undefined.
   * @throws {Error} If an unexpected error occurs.
   */
  public static safeContainer<K extends keyof Containers = keyof Containers>(
    name: K,
  ): Containers[K] | undefined {
    try {
      return this.container(name);
    } catch (err) {
      if (err instanceof UninitializedContainerError) {
        return undefined;
      }

      throw err;
    }
  }

  /**
   * Checks if a container is ready.
   * A container is considered ready if it has been set using the setContainer method.
   * @template K - The type of the container key.
   * @param {K} name - The name of the container to check.
   * @returns {boolean} Whether the container is ready or not.
   */
  public static containerReady<K extends keyof Containers = keyof Containers>(
    name: K,
  ): boolean {
    return this.safeContainer(name) !== undefined;
  }

  /**
   * Resets the containers
   */
  public static reset() {
    AppContainers.getInstance().containers.clear();
  }
}
