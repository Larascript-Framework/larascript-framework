import { InstanceTypePrivateConstructor } from "@/contracts/instance.js";
import { KernelConfig, KernelOptions } from "@/contracts/kernel.js";
import { KernelException } from "@/exceptions/KernelException.js";
import { AppEnvironment } from "./AppEnvironment.js";
import { KernelState } from "./KernelState.js";

export class Kernel
{
    private constructor(
        private config: KernelConfig,
        private options: KernelOptions,
        private locked: boolean = false
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

    static create(config: KernelConfig, options: KernelOptions): Kernel
    {
        if(false === Kernel.instance instanceof Kernel) {
            this.instance = new Kernel(config, options)
        }
        
        return this.instance
    }

    static reset(): void
    {
        this.instance = undefined as InstanceTypePrivateConstructor<Kernel>
        KernelState.reset()
        AppEnvironment.reset()
    }

    public getConfig(): KernelConfig {
        return this.config
    }

    public getOptions(): KernelOptions {
        return this.options
    }

    public isLocked() {
        return this.locked
    }

    public async boot()
    {

    }
}