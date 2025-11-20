import { eventConfig } from "@/config/events.config.js";
import { app } from "@/core/services/App.js";
import { BaseProvider } from "@larascript-framework/larascript-core";
import { EventService, IEventConfig, WorkerModelFactory, WorkerRepository, WorkerService, WorkerServiceProvider } from "@larascript-framework/larascript-events";
import { WorkerCommand } from "../commands/WorkerCommand.js";

class EventProvider extends BaseProvider {

    protected config: IEventConfig = eventConfig;

    async register(): Promise<void> {
        
        // Create the event Service and register the drivers, events and listeners
        const eventService = new EventService(this.config);
        eventService.registerConfig();
        
        // Create the worker service and register the worker repository
        const workerService = new WorkerService();
        workerService.setEventService(eventService);
        workerService.setWorkerRepository(new WorkerRepository());
        workerService.setWorkerFactory(new WorkerModelFactory());
        
        // Bind the services to the container
        this.bind('events', eventService);
        this.bind('events.worker', workerService);

        // Init the worker service provider
        WorkerServiceProvider.init({
            workerService,
            eventService,
            eloquentQueryBuilder: app('query'),
            logger: app('logger')
        })

        // Register the worker command
        app('console').registerService().registerAll([
            WorkerCommand
        ])
    }

}

export default EventProvider