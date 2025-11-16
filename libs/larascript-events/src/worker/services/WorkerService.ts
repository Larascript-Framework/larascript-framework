import { DataTypes } from "sequelize";
import { EventWorkerException } from "../../events/exceptions/EventWorkerException.js";
import { IEventService } from "../../events/interfaces/services.t.js";
import { IWorkerAttributes, IWorkerModel, IWorkerModelFactory, IWorkerRepository, IWorkerService, TEventWorkerOptions, WorkerModel, WorkerServiceProvider } from "../../worker/index.js";

/**
 * WorkerService class.
 * 
 * Handles the execution of background workers that process queued events.
 * This service manages worker models, processes events, handles retries,
 * and manages failed worker models when events cannot be processed successfully.
 * 
 * @class WorkerService
 * @implements IWorkerService
 */
export class WorkerService implements IWorkerService {

        private workerRepository!: IWorkerRepository;

        private workerFactory!: IWorkerModelFactory;

        private eventService!: IEventService;

        /**
         *  
         * Run the worker to process queued event items
         *
         * Fetches documents from the worker model repository and runs each
         * document through the handleWorkerModel method. This method is
         * responsible for processing the event contained in the document.
         *
         * @param options The options to use when running the worker
         * @returns A promise that resolves once the worker has finished
         *          processing the documents.
         */
        async runWorker(options: TEventWorkerOptions): Promise<void> {

            if (typeof options.runAfterSeconds === 'number') {
                await new Promise(resolve => setTimeout(resolve, (options.runAfterSeconds as number) * 1000))
            }

            const workerModels = await this.workerRepository.getWorkers()

            WorkerServiceProvider.logger()?.console('Queued items: ', workerModels.length)

            if (workerModels.length === 0) {
                WorkerServiceProvider.logger()?.console("No queued items");
                return;
            }

            for (const workerModel of workerModels) {
                await this.handleWorkerModel(workerModel, options)
            }
        }

        getRepository(): IWorkerRepository {
            return this.workerRepository;
        }

        setWorkerRepository(workerRepository: IWorkerRepository): void {
            this.workerRepository = workerRepository;
        }

        setWorkerFactory(workerFactory: IWorkerModelFactory): void {
            this.workerFactory = workerFactory;
        }
        getFactory(): IWorkerModelFactory {
            return this.workerFactory;
        }

        setEventService(eventService: IEventService): void {
            this.eventService = eventService;
        }

        /**
         * Handles a single worker model document
         * @param worker The worker model document to process
         * @param options The options to use when processing the event
         * @private
         */
        private async handleWorkerModel(worker: IWorkerModel, options: TEventWorkerOptions): Promise<void> {
            try {
                const eventName = worker.getWorkerData()?.eventName

                if (typeof eventName !== 'string') {
                    throw new EventWorkerException('Event name must be a string');
                }

                const eventCtor = this.eventService.getEventCtorByName(eventName)

                if (!eventCtor) {
                    throw new EventWorkerException(`Event '${eventName}' not found`);
                }

                const payload = worker.getWorkerData()?.payload
                const eventInstance = new eventCtor(payload);
                await eventInstance.execute();

                await worker.deleteWorkerData();
            }
            catch (err) {
                WorkerServiceProvider.logger()?.error(err)
                await this.handleUpdateWorkerModelAttempts(worker, options, (err as Error))
            }
        }

        /**
         * Handles updating the worker model document with the number of attempts
         * it has made to process the event.
         * @param workerModel The worker model document to update
         * @param options The options to use when updating the worker model document
         * @private
         */
        private async handleUpdateWorkerModelAttempts(worker: IWorkerModel, options: TEventWorkerOptions, error?: Error) {  

            const attempt = worker.getWorkerData()?.attempts ?? 0
            const newAttempt = attempt + 1
            const retries = worker.getWorkerData()?.retries ?? 0

            await worker.updateWorkerData({ 
                ...(worker.getWorkerData() ?? {}),
                attempts: newAttempt 
            } as IWorkerAttributes)

            if (newAttempt >= retries) {
                await this.handleFailedWorkerModel(worker, options, error)
                return;
            }

            await worker.saveWorkerData();
        }

        /**
         * Handles a worker model that has failed to process.
         *
         * Saves a new instance of the failed worker model to the database
         * and deletes the original worker model document.
         *
         * @param workerModel The worker model document to handle
         * @param options The options to use when handling the failed worker model
         * @private
         */
        private async handleFailedWorkerModel(worker: IWorkerModel, options: TEventWorkerOptions, error?: Error) {

            const FailedWorkerModel = this.workerFactory.createFailedWorkerModel({
                attempts: worker.getWorkerData()?.attempts ?? 0,
                retries: worker.getWorkerData()?.retries ?? 0,
                eventName: worker.getWorkerData()?.eventName ?? '',
                queueName: worker.getWorkerData()?.queueName ?? '',
                payload: worker.getWorkerData()?.payload ?? '{}',
                error: (error?.message ?? '') + '\n' + (error?.stack ?? ''),
                createdAt: new Date(),
                updatedAt: new Date(),
                failedAt: new Date()
            } as IWorkerAttributes)

            await FailedWorkerModel.saveWorkerData();
            await worker.deleteWorkerData();
        }

        /**
         * Gets the Sequelize schema for the worker data
         * @returns The Sequelize schema
         */
        getSequelizeSchema(): Record<string, unknown> {
            return {
                [WorkerModel.QUEUE_NAME]: DataTypes.STRING,
                [WorkerModel.EVENT_NAME]: DataTypes.STRING,
                [WorkerModel.PAYLOAD]: DataTypes.JSON,
                [WorkerModel.ATTEMPTS]: DataTypes.INTEGER,
                [WorkerModel.RETRIES]: DataTypes.INTEGER,
                [WorkerModel.ERROR]: DataTypes.TEXT,
                [WorkerModel.CREATED_AT]: DataTypes.DATE,
                [WorkerModel.UPDATED_AT]: DataTypes.DATE,
                [WorkerModel.DELETED_AT]: DataTypes.DATE,
                [WorkerModel.FAILED_AT]: DataTypes.DATE
            }
        }
    }