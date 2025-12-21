export type KernelConfigProvider = string

export type KernelConfig = {
    environment: string;
    providers: KernelConfigProvider[];
}

export type KernelOptions = {
    shouldUseProvider?: (provider: KernelConfigProvider) => boolean;
}