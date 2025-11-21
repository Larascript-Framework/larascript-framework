/* eslint-disable no-unused-vars */

/**
 * Interface for objects that can be dispatched with arguments
 */
export interface IDispatchable
{
    /**
     * Dispatches the object with the given arguments
     * @param args - Variable number of arguments to pass to the dispatch
     * @returns Promise that resolves to the dispatch result
     */
    dispatch(...args: unknown[]): Promise<unknown>;
}

/**
 * Interface for objects that can be executed with arguments
 */
export interface IExecutable
{
    /**
     * Executes the object with the given arguments
     * @param args - Variable number of arguments to pass to the execution
     * @returns Promise that resolves when execution is complete
     */
    execute(...args: any[]): Promise<void>;
}

/**
 * Interface for objects that have a name
 */
export interface INameable {
    /**
     * Gets the name of the object
     * @returns The name as a string
     */
    getName(): string;
}