import { AppSingleton } from "@ben-shepherd/larascript-core-bundle";
import { BaseCastable, TCastableType, TCasts } from "@ben-shepherd/larascript-utils-bundle";
import EventInvalidPayloadException from "@src/core/domains/events/exceptions/EventInvalidPayloadException";
import { IBaseEvent } from "@src/core/domains/events/interfaces/IBaseEvent";
import IEventDriver from "@src/core/domains/events/interfaces/IEventDriver";
import { IEventService } from "@src/core/domains/events/interfaces/IEventService";
import EventRegistry from "@src/core/domains/events/registry/EventRegistry";
import { TClassConstructor } from "@src/core/interfaces/ClassConstructor.t";
import { app } from "@src/core/services/App";

abstract class BaseEvent<TPayload = unknown> extends BaseCastable implements IBaseEvent<TPayload> {

    protected payload: TPayload | null = null;

    protected driver!: TClassConstructor<IEventDriver>;

    protected defaultDriver!: TClassConstructor<IEventDriver>;

    protected namespace: string = '';

    casts: TCasts = {};

    /**
     * Constructor
     * @param payload The payload of the event
     * @param driver The class of the event driver
     */
    constructor(payload: TPayload | null = null, driver?: TClassConstructor<IEventDriver>) {
        super()

        // Auto-register this event type if not already initialized
        if (!EventRegistry.isInitialized()) {
            EventRegistry.register(this.constructor as TClassConstructor<IBaseEvent>);
        }

        this.payload = payload;

        // Use safeContainer here to avoid errors during registering which runs during boot up.
        this.defaultDriver = AppSingleton.safeContainer('events')?.getDefaultDriverCtor() as TClassConstructor<IEventDriver>;
        this.driver = driver ?? this.defaultDriver;

        // Ensure the payload is valid
        if (!this.validatePayload()) {
            throw new EventInvalidPayloadException('Invalid payload. Must be JSON serializable.');
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
     */
    async execute(): Promise<void> {/* Nothing to execute */ }

    /**
     * Validates the payload of the event. Ensures that the payload is an object with types that match:
     * string, number, boolean, object, array, null.
     * @throws {EventInvalidPayloadException} If the payload is invalid.
     */
    validatePayload(): boolean {
        try {
            JSON.stringify(this.payload);
        }
        // eslint-disable-next-line no-unused-vars
        catch (err) {
            return false
        }

        return true
    }

    /**
     * Gets the event service that handles event dispatching and listener registration.
     * @returns The event service.
     */
    getEventService(): IEventService {
        return app('events');
    }

    /**
     * @returns The name of the queue as a string.
     */
    getQueueName(): string {
        return 'default';
    }

    /**
     * @template T The type of the payload to return.
     * @returns The payload of the event.
     */
    getPayload(): TPayload {
        return this.getCastFromObject<TPayload>(this.payload as Record<string, unknown>, this.casts)
    }

    /**
     * Sets the payload of the event.
     * @param payload The payload of the event to set.
     */
    setPayload(payload: TPayload): void {
        this.payload = payload
    }

    /**
     * @returns The name of the event as a string.
     */
    getName(): string {
        const prefix = this.namespace === '' ? '' : (this.namespace + '/')
        return prefix + this.constructor.name
    }

    /**
     * @returns The event driver constructor.
     */
    getDriverCtor(): TClassConstructor<IEventDriver> {
        return this.driver ?? this.defaultDriver;
    }

}

export default BaseEvent