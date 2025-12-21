export class KernelException extends Error {
    public static create(message: string = 'An unknown error occurred'): KernelException {
        return new KernelException(message)
    }

    public static locked(): KernelException {
        return new KernelException('Kernel is locked and cannot be modified')
    }
    
    public static kernelNotCreated(): KernelException {
        return new KernelException('Kernel has not been created')
    }

    public static stateNotCreated(): KernelException {
        return new KernelException('KernelState has not been created')
    }
}