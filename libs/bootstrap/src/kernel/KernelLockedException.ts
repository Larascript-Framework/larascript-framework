export class KernelLockedException extends Error {
    public static create(message: string = 'The kernel cannot be updated as it has been locked.'): KernelLockedException {
        return new KernelLockedException(message)
    }
}