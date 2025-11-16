 
import { BaseSingleton } from "@larascript-framework/larascript-core";
import { IEloquentQueryBuilderService } from "@larascript-framework/larascript-database";
import { ILoggerService } from "@larascript-framework/larascript-logger";
import { IEventService } from "../../events/index.js";
import { IWorkerService } from "../../worker/index.js";

type InitTypes = {
    workerService: IWorkerService;
    eventService: IEventService;
    eloquentQueryBuilder: IEloquentQueryBuilderService;
    logger?: ILoggerService;
}

/**
 * WorkerServiceProvider class.
 * 
 * A singleton service provider that manages worker services, event services, and logging.
 * This class provides static methods to initialize and access worker-related services
 * throughout the application.
 * 
 * @class WorkerServiceProvider
 * @extends BaseSingleton
 */
export class WorkerServiceProvider extends BaseSingleton {

    protected workerService!: IWorkerService;

    protected eventService!: IEventService;

    protected eloquentQueryBuilder!: IEloquentQueryBuilderService;

    protected logger?: ILoggerService;

    static init(options: InitTypes): void {
        this.getInstance().workerService = options.workerService;
        this.getInstance().eventService = options.eventService;
        this.getInstance().eloquentQueryBuilder = options.eloquentQueryBuilder;
        this.getInstance().logger = options.logger;
    }

    static worker(): IWorkerService {
        return this.getInstance().workerService;
    }

    static events(): IEventService {
        return this.getInstance().eventService;
    }

    static eloquentQueryBuilder(): IEloquentQueryBuilderService {
        return this.getInstance().eloquentQueryBuilder;
    }

    static logger(): ILoggerService | undefined {
        return this.getInstance().logger;
    }
}