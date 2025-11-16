import { IHasConfigConcern } from "@larascript-framework/contracts/larascript-core";
import { TClassConstructor } from "@larascript-framework/larascript-utils";

export const HasConfigConcern = (Base: TClassConstructor) => {
  return class extends Base implements IHasConfigConcern {
    config: unknown;

    /**
     * Retrieves the current configuration.
     *
     * @template T - The expected type of the configuration.
     * @returns {T} The current configuration cast to the specified type.
     */
    getConfig<T = unknown>(): T {
      return this.config as T;
    }

    /**
     * Sets the current configuration.
     *
     * @param {unknown} config - The new configuration.
     */
    setConfig(config: unknown): void {
      this.config = config;
    }
  };
};
