/* eslint-disable no-unused-vars */
import { IBaseEvent, IBaseListener, IBaseSubscriber } from "./base.t.js";
import { INameable } from "./types.t.js";

/**
 * Constructor type for event classes
 */
export interface EventConstructor {
    new (...args: any[]): IBaseEvent;
}

/**
 * Constructor type for listener classes
 */
export interface ListenerConstructor {
    new (...args: any[]): IBaseListener;
}

/**
 * Constructor type for subscriber classes
 */
export interface SubscriberConstructor {
    new (...args: any[]): IBaseSubscriber;
}

/**
 * Interface for event listeners that handle event payloads
 * @template TPayload - The type of payload the listener handles
 */
export interface IEventListener<TPayload = unknown> extends INameable, IBaseEvent<TPayload> {

}

/**
 * Configuration option for listeners with their associated subscribers
 */
export type TListenersConfigOption = {
    /** The listener constructor */
    listener: ListenerConstructor;
    /** Array of subscriber constructors */
    subscribers: SubscriberConstructor[]
}

/**
 * Map of event names to listener configuration options
 */
export type TListenersMap = Map<string, TListenersConfigOption[]>

/**
 * Array of listener configuration options
 */
export type IEventListenersConfig = TListenersConfigOption[]

/**
 * Types that can be serialized to JSON
 */
export type TSerializableValues = number | string | boolean | undefined | null;

/**
 * Interface for payloads that can be serialized
 */
export type TISerializablePayload = Record<string | number | symbol, unknown> | TSerializableValues;