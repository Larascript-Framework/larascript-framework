export class AppContainerException extends Error {
    public static create(message: string = 'An unknown error occurred'): AppContainerException {
        return new AppContainerException(message)
    }

    public static isRegistered(name: string) {
        return new AppContainerException(`The container value with name '${name}' is already registered`)
    }

    public static unresolvable(name: string) {
        return new AppContainerException(`The container value with name '${name}' cannot be resolved`)
    }
}