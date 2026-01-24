import { AppEnvironmentException } from "@/app/AppEnvironmentException.js";
import { InstanceTypePrivateConstructor } from "@/contracts/instanceType.js";
import { KernelConfig, KernelConfigProviderPriotised, KernelOptions } from "@/contracts/kernel.js";
import { ProviderInterfaceInstanceType } from "@/contracts/provider.js";
import { KernelException } from "@/kernel/KernelException.js";
import { AppEnvironment } from "../app/AppEnvironment.js";
import { KernelState } from "./KernelState.js";

export class Kernel
{
    private constructor(
        private _config: KernelConfig
    )
    {
    }

    private static instance: Kernel;

    static getInstance(): Kernel
    {
        if(false === this.instance instanceof Kernel) {
            throw KernelException.kernelNotCreated()
        }
        
        return Kernel.instance
    }

    static create(config: KernelConfig): Kernel
    {
        if(false === Kernel.instance instanceof Kernel) {
            this.instance = new Kernel(config)
        }
        
        return this.instance
    }

    static reset(): void
    {
        this.instance = undefined as InstanceTypePrivateConstructor<Kernel>
        KernelState.reset()
        AppEnvironment.reset()
    }

    static config(): KernelConfig {
        return this.instance._config
    }

    static locked(): boolean {
        return KernelState.locked()
    }

    public async boot(options: KernelOptions): Promise<void>
    {
        if(KernelState.locked()) {
            throw KernelException.locked()
        }

        if(!this._config.environment || typeof this._config.environment !== 'string') {
            throw AppEnvironmentException.envNotSet()
        }

        KernelState.create()
        AppEnvironment.create(this._config.environment)

        await this.bootProviders(options)
    }

    private async bootProviders(options: KernelOptions)
    {
        const providers = this._config.providers
        const { shouldUseProvider = () => true } = options

        let providerInstancesArray = this.orderedProviderInstanceArray()

        KernelState.setDefinedProvidersCount(providers.length)

        providerInstancesArray = providerInstancesArray.filter(providerInstance => {
            if(false === shouldUseProvider(providerInstance)) {
                KernelState.addSkippedProvider(providerInstance.constructor.name)
                return false
            }
            return true
        })

        for(const providerInstance of providerInstancesArray) {
            await providerInstance.register()
            KernelState.addPreparedProvider(providerInstance.constructor.name)
        }

        for(const providerInstance of providerInstancesArray) {
            await providerInstance.boot()
            KernelState.addReadyProvider(providerInstance.constructor.name)
        }

        KernelState.setLocked()
    }

    private orderedProviderInstanceArray(): ProviderInterfaceInstanceType[]
    {
        // Convert the config into an array of `KernelConfigProviderPriotised` objects.
        let kernelProviderConfigPrioritised = this._config.providers.map((objectOrInstance) => {
            if(typeof (objectOrInstance as KernelConfigProviderPriotised)?.provider !== 'undefined') {
                return objectOrInstance
            }
            return {
                provider: objectOrInstance,
                priority: undefined
            }
        }) as KernelConfigProviderPriotised[]

        // Sort them into an ordered priority list by ascending first
        kernelProviderConfigPrioritised = kernelProviderConfigPrioritised.sort((a, b) => {
            if(typeof a.priority !== 'number' && typeof b.priority !== 'number') {
                return 0
            }
            if(typeof a.priority !== 'number') {
                a.priority = Number.POSITIVE_INFINITY
            }
            if(typeof b.priority !== 'number') {
                b.priority = Number.POSITIVE_INFINITY
            }
            return Math.sign(a.priority - b.priority)
        })

        // Return only the instance types
        return kernelProviderConfigPrioritised.map(it => it.provider)
    }
}