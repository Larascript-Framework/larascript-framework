export class AppEnvironmentException extends Error {
    public static create(message: string = 'An unknown error occurred'): AppEnvironmentException {
        return new AppEnvironmentException(message)
    }

    public static notCreated(): AppEnvironmentException {
        return new AppEnvironmentException('AppEnvironment has not been created')
    }
    
    public static envNotSet(): AppEnvironmentException {
        return new AppEnvironmentException('Environment is not set')
    }
}