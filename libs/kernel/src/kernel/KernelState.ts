import { InstanceTypePrivateConstructor } from "@/contracts/instance.js";
import { KernelException } from "@/exceptions/KernelException.js";
import { KernelLockedException } from "@/exceptions/KernelLockedException.js";

export class KernelState {

    private static instance: KernelState;

    public static getInstance(): KernelState {
        if(false === this.instance instanceof KernelState) {
            throw KernelException.stateNotCreated()
        }
        return this.instance
    }

    public static create(): KernelState {
        if(false === this.instance instanceof KernelState) {
            this.instance = new KernelState()
        }
        
        return this.instance
    }

    private constructor(
        private definedProvidersCount: number = undefined as unknown as number,
        private preparedProviders: string[] = [],
        private readyProviders: string[] = [],
        private locked: boolean = false,
    ) {}

    static reset() {
        this.instance = undefined as InstanceTypePrivateConstructor<KernelState>
    }


    static isProviderReady(providerName: string): boolean {
        return (
            this.getInstance().preparedProviders.includes(providerName) ||
            this.getInstance().readyProviders.includes(providerName)
        );
    }

    static setDefinedProvidersCount(count: number): void {
        if(KernelState.locked()) {
            throw KernelLockedException.create()
        }

        this.instance.definedProvidersCount = count
    }

    static addPreparedProvider(providerName: string): void {
        if(KernelState.locked()) {
            throw KernelLockedException.create()
        }

        this.instance.preparedProviders.push(providerName)
    }

    static addReadyProvider(providerName: string): void {
        if(KernelState.locked()) {
            throw KernelLockedException.create()
        }

        this.instance.readyProviders.push(providerName)
    }

    static setLocked(): void {
        if(KernelState.locked()) {
            throw KernelLockedException.create()
        }
        if(typeof this.instance.definedProvidersCount === 'undefined') {
            throw KernelException.create('Expected definedProvidersCount to be a number')
        }

        this.instance.locked = true
    }

    static readyProviders(): string[] {
        return this.instance.readyProviders
    }

    static preparedProviders(): string[] {
        return this.instance.preparedProviders
    }

    static definedProvidersCount(): number {
        if(typeof this.instance.definedProvidersCount !== 'number') {
            throw KernelException.create('Expected definedProvidersCount to be a number')
        }
        return this.instance.definedProvidersCount
    }

    static locked(): boolean {
        return this.instance.locked
    }
}