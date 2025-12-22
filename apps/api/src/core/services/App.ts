import { Providers } from "@/config/providers.config.js";
import { AppContainer, AppEnvironment } from "@larascript-framework/bootstrap";

/**
 * A short hand for `AppContainer.container().resolve<TokenType>('nameOfToken')`
 * Provides automatic type-hinting
 */
export const app = <K extends keyof Providers = keyof Providers>(name: K): Providers[K] => {
  return AppContainer.container().resolve<Providers[K]>(name as string)
};

/**
 * Short hand for `AppEnvironment.env()`
 */
export const appEnv = (): string | undefined => AppEnvironment.env()
