import { IBaseSubscriber } from "../interfaces/index.js";
import BaseEvent from "./BaseEvent.js";

/**
 * Base class for event subscribers
 * Provides a foundation for creating event subscribers that can handle event payloads
 * @template TPayload - The type of payload the subscriber handles
 */
export class BaseEventSubscriber<TPayload = unknown> extends BaseEvent<TPayload> implements IBaseSubscriber<TPayload> {
    /** Type identifier for subscribers */
    type: 'subscriber' = 'subscriber';
}

export default BaseEventSubscriber