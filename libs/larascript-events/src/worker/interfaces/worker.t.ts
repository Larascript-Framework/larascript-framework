import { TSerializableValues } from "../../events/interfaces/event.t.js";
import { IEventService } from "../../events/interfaces/services.t.js";

/**
 * Interface for worker repositories that manage worker data
 */
export interface IWorkerRepository {
    /**
     * Gets all workers from the repository
     * @returns Promise that resolves to an array of worker models
     */
    getWorkers(options?: Record<string, unknown>): Promise<IWorkerModel[]>;

    /**
     * Gets all failed workers from the repository
     * @returns Promise that resolves to an array of failed worker models
     */
    getFailedWorkers(options?: Record<string, unknown>): Promise<IWorkerModel[]>;
}

/**
 * Constructor interface for worker model factories
 */
export interface IWorkerModelFactoryConstructor {
    new (): IWorkerModelFactory;
}

/**
 * Interface for creating worker models
 */
export interface IWorkerModelFactory {
    /**
     * Creates a new worker model with the given attributes
     * @param data - The worker attributes
     * @returns A new worker model instance
     */
    createWorkerModel(data?: Partial<IWorkerAttributes>): IWorkerModel;
    
    /**
     * Creates a new failed worker model with the given attributes
     * @param data - The worker attributes
     * @returns A new failed worker model instance
     */
    createFailedWorkerModel(data?: Partial<IWorkerAttributes>): IWorkerModel;
}

/**
 * Interface for worker model instances
 */
export interface IWorkerModel  {
    /**
     * Creates worker data with the given attributes
     * @param data - The worker attributes
     * @returns Promise that resolves when data is created
     */
    createWorkerData(data: IWorkerAttributes): Promise<void>;
    
    /**
     * Updates worker data with the given attributes
     * @param data - The worker attributes
     * @returns Promise that resolves when data is updated
     */
    updateWorkerData(data: IWorkerAttributes): Promise<void>;
    
    /**
     * Gets the worker data
     * @template T - The type of worker attributes to return
     * @returns The worker attributes or null if not found
     */
    getWorkerData<T extends IWorkerAttributes = IWorkerAttributes>(): T | null;
    
    /**
     * Saves the worker data
     * @returns Promise that resolves when data is saved
     */
    saveWorkerData(): Promise<void>;
    
    /**
     * Deletes the worker data
     * @returns Promise that resolves when data is deleted
     */
    deleteWorkerData(): Promise<void>;
    
}

/**
 * Interface for worker attributes
 */
export interface IWorkerAttributes {
    /** The id of the worker */
    id?: string;
    /** The payload data for the worker */
    payload: TSerializableValues | null;
    /** Number of attempts made */
    attempts: number;
    /** Maximum number of retries */
    retries: number;
    /** Name of the queue */
    queueName: string;
    /** Name of the event */
    eventName: string;
    /** Error message if failed */
    error?: string;
    /** Timestamp when the worker failed */
    failedAt?: Date;
    /** Timestamp when the worker was created */
    createdAt: Date;
    /** Timestamp when the worker was last updated */
    updatedAt: Date;
    /** Timestamp when the worker was deleted */
    deletedAt?: Date;
}

/**
 * Options for event workers
 */
export type TEventWorkerOptions = {
    /** Name of the queue */
    queueName: string;
    /** Number of retry attempts */
    retries: number;
    /** Whether the worker should run only once */
    runOnce?: boolean;
    /** Delay in seconds before running */
    runAfterSeconds?: number;
}

/**
 * Interface for worker services
 */
export interface IWorkerService {
    /**
     * Sets the worker repository
     * @param workerRepository - The repository instance
     */
    setWorkerRepository(workerRepository: IWorkerRepository): void;

    /**
     * Gets the worker repository
     * @returns The repository instance
     */
    getRepository(): IWorkerRepository;

    /**
     * Sets the worker factory
     * @param workerFactory - The factory instance
     */
    setWorkerFactory(workerFactory: IWorkerModelFactory): void;

    /**
     * Gets the worker factory
     * @returns The factory instance
     */
    getFactory(): IWorkerModelFactory;
    
    /**
     * Sets the event service instance
     * @param eventService - The event service instance
     */
    setEventService(eventService: IEventService): void;
    
    /**
     * Runs a worker with the given options
     * @param options - The worker options
     * @returns Promise that resolves when the worker is running
     */
    runWorker(options: TEventWorkerOptions): Promise<void>;

    /**
     * Gets the Sequelize schema for the worker data
     * @returns The Sequelize schema
     */
    getSequelizeSchema(): Record<string, unknown>;
}
