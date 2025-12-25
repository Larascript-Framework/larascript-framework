import { AppContainer } from "@/app/AppContainer.js";
import { ProviderInterface } from "@/contracts/provider.js";

export abstract class AbstractProvider implements ProviderInterface {

    /** Allow either method to be optional  */
    async register(): Promise<void> { return Promise.resolve(); }
    async boot(): Promise<void> { return Promise.resolve(); }

    /** Helper for registering services */
    protected bind(key: string, value: unknown): void {
        this.container().register(key, { useValue: value })   
    }

    protected container() {
        return AppContainer.container()
    }
}