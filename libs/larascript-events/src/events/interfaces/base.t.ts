import { IHasCastableConcern } from "@larascript-framework/cast-js";
import { IExecutable, INameable } from "./types.t.js";

/**
 * Interface for event subscribers that handle event payloads
 * @template TPayload - The type of payload the subscriber handles
 */
export interface IBaseSubscriber<TPayload = unknown> extends IBaseEvent<TPayload> {
    /** Type identifier for subscribers */
    type: 'subscriber';
}

/**
 * Interface for event listeners that handle event payloads
 * @template TPayload - The type of payload the listener handles
 */
export interface IBaseListener<TPayload = unknown> extends IBaseEvent<TPayload> {
    /** Type identifier for listeners */
    type: 'listener';
}

/**
 * Base interface for all events in the system
 * @template TPayload - The type of payload the event carries
 */
export interface IBaseEvent<TPayload = unknown> extends INameable, IExecutable, IHasCastableConcern
{
    /**
     * Gets the name of the queue this event should be processed on
     * @returns The queue name as a string
     */
    getQueueName(): string;

    /**
     * Gets the name of the driver that should handle this event
     * @returns The driver name as a string, or undefined if no specific driver
     */
    getDriverName(): string | undefined;

    /**
     * Gets the payload of the event
     * @returns The event payload
     */
    getPayload(): TPayload;

    /**
     * Sets the payload of the event
     * @param payload - The new payload to set
     */
    setPayload(payload: TPayload): void;

    /**
     * Gets the name of the event
     * @returns The event name as a string
     */
    getName(): string;
}