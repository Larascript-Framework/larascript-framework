import { IBaseListener, IEventListener } from "../interfaces/index.js";
import BaseEvent from "./BaseEvent.js";

/**
 * Base class for event listeners
 * Provides a foundation for creating event listeners that can handle event payloads
 * @template TPayload - The type of payload the listener handles
 */
export class BaseEventListener<TPayload = unknown> extends BaseEvent<TPayload> implements IEventListener<TPayload>, IBaseListener<TPayload> {

    /** Type identifier for listeners */
    type: 'listener' = 'listener';

    /**
     * Creates a new instance of the event listener
     * @param payload - The payload of the event to dispatch
     * @param driverName - The name of the driver to use for this event
     */
    constructor(payload?: TPayload, driverName?: string) {
        super(payload, driverName);
    }

}

export default BaseEventListener