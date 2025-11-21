import { BaseCastable, TCastableType, TCasts } from "@larascript-framework/cast-js";
import { TClassConstructor } from "@larascript-framework/larascript-utils";
import assert from "node:assert";
import { EVENT_DRIVERS } from "../consts/drivers.js";
import { EventInvalidPayloadException } from "../exceptions/EventInvalidPayloadException.js";
import { IBaseEvent } from "../interfaces/index.js";
import { EventRegistry } from "../registry/EventRegistry.js";

/**
 * Abstract base class for all events in the system
 * Provides common functionality for event handling, payload validation, and casting
 * @template TPayload - The type of payload the event carries
 */
export abstract class BaseEvent<TPayload = unknown> extends BaseCastable implements IBaseEvent<TPayload> {

    /** The payload data for the event */
    protected payload: TPayload | null = null;

    /** The name of the driver that should handle this event */
    protected driverName?: string;

    /** The namespace for the event */
    protected namespace: string = '';

    /** The name of the queue that should process this event */
    protected queueName: string = 'default';

    /** Whether the event should be processed by the queable driver */
    protected queable?: boolean = false;

    /** Casting configuration for the event */
    casts: TCasts = {};
    /**
     * Creates a new BaseEvent instance
     * @param payload - The payload of the event
     * @param driverName - The name of the driver to use for this event
     * @throws {EventInvalidPayloadException} If the payload is not JSON serializable
     */
    constructor(payload: TPayload | null = null, driverName?: string) {
        super()

        this.payload = payload;
        this.driverName = driverName;

        // Ensure the payload is valid
        if (!this.validatePayload()) {
            throw new EventInvalidPayloadException('Invalid payload. Must be JSON serializable.');
        }

        // Auto-register this event type if not already initialized
        if (!EventRegistry.isInitialized()) {
            EventRegistry.register(this.constructor as TClassConstructor<IBaseEvent>);
        }
    }

    /**
     * Declare HasCastableConcern methods.
     */
    // eslint-disable-next-line no-unused-vars
    declare getCastFromObject: <ReturnType = unknown>(data: Record<string, unknown>, casts: TCasts) => ReturnType;

    // eslint-disable-next-line no-unused-vars
    declare getCast: <T = unknown>(data: unknown, type: TCastableType) => T;

    // eslint-disable-next-line no-unused-vars
    declare isValidType: (type: TCastableType) => boolean;

    /**
     * Executes the event.
     * Override this method in subclasses to provide specific event logic.
     */
    async execute(): Promise<void> {/* Nothing to execute */ }

    /**
     * Validates the payload of the event. Ensures that the payload is JSON serializable.
     * @returns True if the payload is valid, false otherwise
     * @throws {EventInvalidPayloadException} If the payload is invalid.
     */
    validatePayload(): boolean {
        try {
            const result = JSON.stringify(this.payload);
            assert(typeof result === 'string', 'Payload is not serializable');
        }
        // eslint-disable-next-line no-unused-vars
        catch (err) {
            return false
        }

        return true
    }

    /**
     * Gets the name of the queue this event should be processed on
     * @returns The name of the queue as a string
     */
    getQueueName(): string {
        return this.queueName ?? 'default';
    }

    /**
     * Gets the payload of the event with casting applied
     * @template TPayload - The type of the payload to return
     * @returns The payload of the event
     */
    getPayload(): TPayload {
        return this.getCastFromObject<TPayload>(this.payload as Record<string, unknown>, this.casts)
    }

    /**
     * Sets the payload of the event
     * @param payload - The payload of the event to set
     */
    setPayload(payload: TPayload): void {
        this.payload = payload
    }

    /**
     * Gets the name of the event
     * @returns The name of the event as a string, including namespace if set
     */
    getName(): string {
        const prefix = this.namespace === '' ? '' : (this.namespace + '/')
        return prefix + this.constructor.name
    }

    /**
     * Gets the name of the driver that should handle this event
     * @returns The event driver name as a string, or undefined if no specific driver
     */
    getDriverName(): string | undefined {
        return this.driverName;
    }

    /**
     * Use the queable driver for this event
     * @returns True if the queable driver should be used
     */
    useQueableDriver(): boolean {
        this.driverName = EVENT_DRIVERS.QUEABLE;
        return true;
    }
}

export default BaseEvent