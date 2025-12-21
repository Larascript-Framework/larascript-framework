import { ProviderInterfaceInstanceType } from "./provider.js";

export type KernelConfigProviderPriotised = {
    priority?: number;
    provider: ProviderInterfaceInstanceType
}

export type KernelConfig = {
    environment: string;
    providers: (ProviderInterfaceInstanceType | KernelConfigProviderPriotised)[];
}

export type KernelOptions = {
    shouldUseProvider?: (provider: ProviderInterfaceInstanceType) => boolean;
}