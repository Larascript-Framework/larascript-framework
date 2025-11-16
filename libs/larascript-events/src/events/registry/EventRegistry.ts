import { TClassConstructor } from "@larascript-framework/larascript-utils";
import { IBaseEvent, ListenerConstructor, SubscriberConstructor } from "../interfaces/index.js";

/**
 * A static registry for events that can work before the event service is available
 */
export class EventRegistry {

    private static events: Set<TClassConstructor<IBaseEvent>> = new Set();

    private static initialized = false;

    /**
     * Register an event constructor
     */
    static register(eventCtor: TClassConstructor<IBaseEvent>): TClassConstructor<IBaseEvent> {
        this.events.add(eventCtor);
        return eventCtor;
    }

    /**
     * Register a listener constructor
     */
    static registerListener(listener: ListenerConstructor): ListenerConstructor {
        return this.register(listener) as ListenerConstructor;
    }

    /**
     * Register a subscriber constructor
     */
    static registerSubscriber(subscriber: SubscriberConstructor): SubscriberConstructor {
        return this.register(subscriber) as SubscriberConstructor;
    }
    
    /**
     * Register many event constructors
     */
    static registerMany(eventCtors: TClassConstructor<IBaseEvent>[]): void {
        eventCtors.forEach(eventCtor => this.register(eventCtor));
    }

    /**
     * Get all registered events
     */
    static getEvents(): TClassConstructor<IBaseEvent>[] {
        return Array.from(this.events);
    }

    /**
     * Check if registry has been initialized
     */
    static isInitialized(): boolean {
        return this.initialized;
    }

    /**
     * Mark registry as initialized
     */
    static setInitialized(): void {
        this.initialized = true;
    }

    /**
     * Clear the registry
     */
    static clear(): void {
        this.events.clear();
        this.initialized = false;
    }

}

export default EventRegistry; 