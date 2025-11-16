import { TClassConstructor } from "@larascript-framework/larascript-utils";
import { IBaseEvent } from "./base.t.js";
import { IEventConfig } from "./config.t.js";
import { IEventDriver, IEventDriversConfigOption } from "./driver.t.js";
import { SubscriberConstructor } from "./event.t.js";
import { IDispatchable } from "./types.t.js";

/**
 * Interface for event services that manage event dispatching and configuration
 */
export interface IEventService extends IDispatchable
{
    /**
     * Gets the current event configuration
     * @returns The event configuration
     */
    getConfig(): IEventConfig;

    /**
     * Registers the event configuration
     */
    registerConfig(): void;
    
    /**
     * Gets the default driver constructor
     * @returns The default driver constructor
     */
    getDefaultDriverCtor(): TClassConstructor<IEventDriver>;

    /**
     * Gets the configuration options for a specific driver
     * @param driver - The driver instance
     * @returns The driver configuration options or undefined if not found
     */
    getDriverOptions(driver: IEventDriver): IEventDriversConfigOption | undefined;

    /**
     * Sets the configuration options for a specific driver
     * @param driver - The driver instance
     * @param options - The driver configuration options
     */
    setDriverOptions(driver: IEventDriver, options: IEventDriversConfigOption): void;

    /**
     * Gets the configuration options for a driver by name
     * @param driverName - The name of the driver
     * @returns The driver configuration options or undefined if not found
     */
    getDriverOptionsByName(driverName: string): IEventDriversConfigOption | undefined;

    /**
     * Gets the event constructor by event name
     * @param eventName - The name of the event
     * @returns The event constructor or undefined if not found
     */
    getEventCtorByName(eventName: string): TClassConstructor<IBaseEvent> | undefined;

    /**
     * Gets the subscribers for a specific event
     * @param eventName - The name of the event
     * @returns Array of subscriber constructors
     */
    getSubscribers(eventName: string): SubscriberConstructor[];

}