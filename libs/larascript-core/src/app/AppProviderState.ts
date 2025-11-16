import { BaseSingleton } from "@/base/BaseSingleton.js";

export class AppProviderState extends BaseSingleton {
    public definedProvidersCount: number | undefined = undefined;
    public preparedProviders: string[] = [];
    public readyProviders: string[] = [];
    public booted: boolean = false;

    static reset() {
        AppProviderState.getInstance().preparedProviders = [];
        AppProviderState.getInstance().readyProviders = [];
        AppProviderState.getInstance().definedProvidersCount = undefined;
        AppProviderState.getInstance().booted = false;
    }

    static booted(): boolean {
        const definedProvidersCount = this.getInstance().definedProvidersCount;

        if(definedProvidersCount === undefined) {
            return false;
        }

        return this.getInstance().booted;
    }

    public static isProviderReady(providerName: string): boolean {
        return (
            this.getInstance().preparedProviders.includes(providerName) ||
            this.getInstance().readyProviders.includes(providerName)
        );
    }
}