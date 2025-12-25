export type ProviderInterface = {
    boot(): Promise<void>;
    register(): Promise<void>;
}

export type ProviderInterfaceConstructor ={ new(): ProviderInterface }

export type ProviderInterfaceInstanceType = InstanceType<ProviderInterfaceConstructor>