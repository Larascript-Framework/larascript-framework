export type ProviderInterface = {
    new(): ProviderInterface;
    boot(): Promise<void>;
    register(): Promise<void>;
}

export type ProviderInterfaceInstanceType = InstanceType<ProviderInterface>