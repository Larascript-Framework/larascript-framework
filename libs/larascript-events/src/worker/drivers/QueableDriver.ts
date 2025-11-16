import { z } from "zod";
import { BaseDriver } from "../../events/base/BaseDriver.js";
import { EVENT_DRIVERS } from "../../events/consts/drivers.js";
import { EventDriverException } from "../../events/exceptions/EventDriverException.js";
import { IBaseEvent } from "../../events/interfaces/index.js";
import { IWorkerAttributes, TEventWorkerOptions } from "../../worker/index.js";
import { WorkerModelFactory } from "../factory/WorkerModelFactory.js";

/**
 * Options for queueable drivers
 * TODO: move to the events-worker package (yet to be created)
 */
export interface IQueableDriverOptions extends TEventWorkerOptions {
    [key: string]: unknown;
    /** Name of the queue to use */
    queueName: string;
    /** Number of retry attempts */
    retries: number;
    /** Delay in seconds before running */
    runAfterSeconds: number;
    /** Whether the worker should run only once */
    runOnce?: boolean;
} 

/**
 * QueueableDriver class.
 * 
 * A driver that handles event dispatching by queuing events for background processing.
 * This driver saves events to a worker queue table where they can be processed
 * asynchronously by worker services.
 * 
 * @class QueueableDriver
 * @extends BaseDriver
 */
export class QueueableDriver extends BaseDriver  {

    name: keyof typeof EVENT_DRIVERS = EVENT_DRIVERS.QUEABLE as keyof typeof EVENT_DRIVERS;

    /**
     * Dispatches an event by saving it to the worker model.
     *
     * First, it retrieves the options for the queue driver using the getOptions method.
     * Then, it validates the options using the validateOptions method.
     * If the options are invalid, it throws an EventDriverException.
     * Finally, it creates a new instance of the worker model using the options.workerModelCtor,
     * and saves it to the database.
     *
     * @param event The event to dispatch.
     * @throws {EventDriverException} If the options are invalid.
     * @returns A promise that resolves once the event has been dispatched.
     */
    async dispatch(event: IBaseEvent): Promise<void> {

        const options = this.getOptions<IQueableDriverOptions>()

        this.validateOptions(options)

        await this.updateWorkerQueueTable(options as IQueableDriverOptions, event)
    }

    /**
     * Updates the worker queue table with the given event.
     *
     * It creates a new instance of the worker model using the options.workerModelCtor,
     * and saves it to the database. This method is used by the dispatch method to
     * save the event to the worker queue table.
     *
     * @param options The options to use when updating the worker queue table.
     * @param event The event to update the worker queue table with.
     * @returns A promise that resolves once the worker queue table has been updated.
     * @throws {EventDriverException} If the options are invalid.
     */
    private async updateWorkerQueueTable(options: IQueableDriverOptions, event: IBaseEvent) {
        const workerModel = new WorkerModelFactory().createWorkerModel({
            queueName: event.getQueueName(),
            eventName: event.getName(),
            retries: options.retries,
            payload: JSON.stringify(event.getPayload() ?? {}),
        } as IWorkerAttributes)

        await workerModel.saveWorkerData()
    }

    /**
     * Validates the options for the queue driver
     * @param options The options to validate
     * @throws {EventDriverException} If the options are invalid
     * @private
     */
    private validateOptions(options: IQueableDriverOptions | undefined) {
        const schema = z.object({
            queueName: z.string(),
            eventName: z.string().optional(),
            retries: z.number(),
            runAfterSeconds: z.number(),
            workerModelCtor: z.any(),
            failedWorkerModelCtor: z.any(),
            runOnce: z.boolean().optional()
        })

        const parsedResult = schema.safeParse(options)

        if(!parsedResult.success) {
            throw new EventDriverException('Invalid queue driver options: '+ parsedResult.error.message);
        }
    }

}

export default QueueableDriver