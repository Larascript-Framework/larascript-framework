import { AppContainer } from "@/app/AppContainer.js";

export abstract class AbstractProvider {

    /** Allow either method to be optional  */
    async register(): Promise<void> { return Promise.resolve(); }
    async boot(): Promise<void> { return Promise.resolve(); }

    /** Helper for registering services */
    protected bind(key: string, value: unknown): void {
        AppContainer.container().register(key, { useValue: value })   
    }
}