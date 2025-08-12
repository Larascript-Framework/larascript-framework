import { BaseProvider } from "@ben-shepherd/larascript-core";
import { eventConfig } from "@src/config/events.config";
import WorkerCommand from "@src/core/domains/events/commands/WorkerCommand";
import { IEventConfig } from "@src/core/domains/events/interfaces/config/IEventConfig";
import { IEventService } from "@src/core/domains/events/interfaces/IEventService";
import EventRegistry from "@src/core/domains/events/registry/EventRegistry";
import EventService from "@src/core/domains/events/services/EventService";
import { app } from "@src/core/services/App";

class EventProvider extends BaseProvider {

    protected config: IEventConfig = eventConfig;

    async register(): Promise<void> {
        
        // Create the event Service and register the drivers, events and listeners
        const eventService = new EventService(this.config);

        // Register the drivers
        this.registerDrivers(eventService);
        
        // Register all events from the registry
        const registeredEvents = EventRegistry.getEvents();

        for (const event of registeredEvents) {
            eventService.registerEvent(event);
        }

        // Register all listeners
        eventService.registerListeners(this.config.listeners);
        
        // Mark the registry as initialized since event service is now available
        EventRegistry.setInitialized();

        // Bind the event service to the container
        this.bind('events', eventService);

        // Register the worker command
        app('console').registerService().registerAll([
            WorkerCommand
        ])
    }

    /**
     * Registers all event drivers defined in the configuration with the provided event service.
     * @param eventService The event service to register drivers with.
     */
    private registerDrivers(eventService: IEventService) {
        for(const driverKey of Object.keys(this.config.drivers)) {
            eventService.registerDriver(this.config.drivers[driverKey]);
        }
    }

}

export default EventProvider