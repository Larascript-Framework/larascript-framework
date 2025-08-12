import { AppSingleton } from '@ben-shepherd/larascript-core';
import { Providers } from '@src/config/providers.config';

/**
 * The App service allows you to access kernel containers and configure the app environment
 */
export const app = <K extends keyof Providers = keyof Providers>(name: K): Providers[K] => {
    return AppSingleton.container(name);
}

/**
 * Short hand for App.env()
 */
export const appEnv = (): string | undefined => AppSingleton.env();
