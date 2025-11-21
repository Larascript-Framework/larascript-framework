import { BaseCommand } from "@larascript-framework/larascript-console";
import { EVENT_DRIVERS, IEventDriversConfigOption, TEventWorkerOptions, WorkerServiceProvider } from "@larascript-framework/larascript-events";
import { z } from "zod";

/**
 * WorkerCommand class.
 * 
 * A console command that runs the worker to process queued event items.
 * This command can be executed from the command line to start background
 * processing of events that have been queued for asynchronous execution.
 * 
 * @class WorkerCommand
 * @extends BaseCommand
 */
export class WorkerCommand extends BaseCommand {

    /**
     * The signature of the command
     */
    signature: string = 'worker';

    description = 'Run the worker to process queued event items. --queue=[queue]';

    /**
     * Whether to keep the process alive after command execution
     */
    public keepProcessAlive = true;

    /**
     * Execute the command
     */

    async execute() {
        const options = this.getWorkerOptions();

        await WorkerServiceProvider.worker().runWorker(options);

        const intervalId = setInterval(async () => {
            await WorkerServiceProvider.worker().runWorker(options);
            WorkerServiceProvider.logger()?.console('Running worker again in ' + options.runAfterSeconds + ' seconds')
        }, 0)

        if (options.runOnce) {
            clearInterval(intervalId);
            WorkerServiceProvider.logger()?.console('runOnce enabled. Quitting...');
        }
    }

    /**
     * Gets the worker options from the CLI arguments or the default value.
     * @returns The worker options.
     */
    private getWorkerOptions(): TEventWorkerOptions {
        const queueName = this.getArguementByKey('queue')?.value ?? 'default';

        const options = WorkerServiceProvider.events().getDriverOptionsByName(EVENT_DRIVERS.QUEABLE)?.options;

        this.validateOptions(EVENT_DRIVERS.QUEABLE, options);

        return { ...options, queueName } as TEventWorkerOptions;
    }

    /**
     * Validates the options for the worker
     * @param driverName The name of the driver
     * @param options The options to validate
     * @throws {Error} If the options are invalid
     * @private
     */
    private validateOptions(driverName: string, options: IEventDriversConfigOption['options'] | undefined) {
        if (!options) {
            throw new Error('Could not find options for driver: ' + driverName);
        }

        const schema = z.object({
            retries: z.number(),
            runAfterSeconds: z.number(),
            runOnce: z.boolean().optional(),
            workerModelCtor: z.any(),
            failedWorkerModelCtor: z.any(),
        })

        const parsedResult = schema.safeParse(options)

        if (!parsedResult.success) {
            throw new Error('Invalid worker options: ' + parsedResult.error.message);
        }
    }
}

export default WorkerCommand;