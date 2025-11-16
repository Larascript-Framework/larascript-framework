import { TClassConstructor } from "@larascript-framework/larascript-utils";
import { EVENT_DRIVERS } from "../consts/drivers.js";
import { IEventService } from "../index.js";
import { IDispatchable, INameable } from "./types.t.js";

/**
 * Interface for event drivers that handle event dispatching
 */
export interface IEventDriver extends INameable, IDispatchable {
    name: keyof typeof EVENT_DRIVERS;
    setEventService(eventService: IEventService): void;
}

/**
 * Constructor type for event drivers
 */
export type EventDriverConstructor = TClassConstructor<IEventDriver>;

/**
 * Configuration option for event drivers
 */
export interface IEventDriversConfigOption {
    /** The driver constructor */
    driver: EventDriverConstructor,
    /** Optional configuration options for the driver */
    options?: Record<string, unknown>;
}

/**
 * Registry of event drivers by name
 */
export type TEventDriversRegister = Record<string, IEventDriversConfigOption>;

/**
 * Configuration for multiple event drivers
 */
export interface IEventDriversConfig
{
    [key: string]: IEventDriversConfigOption
}

