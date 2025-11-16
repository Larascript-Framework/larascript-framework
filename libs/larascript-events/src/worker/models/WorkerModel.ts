import { TCastableType } from "@larascript-framework/cast-js";
import { IModelAttributes, Model } from "@larascript-framework/larascript-database";
import { IWorkerAttributes, IWorkerModel } from "../../worker/index.js";

export type WorkerModelAttributes = IWorkerAttributes & IModelAttributes

export const initialWorkerModalData: WorkerModelAttributes = {
    queueName: '',
    eventName: '',
    payload: null,
    attempts: 0,
    retries: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
}

/**
 * WorkerModel class.
 *
 * Represents a worker model that stores data for a background job.
 *
 * @class WorkerModel
 * @extends Model<WorkerModelData>
 */
export class WorkerModel extends Model<WorkerModelAttributes> implements IWorkerModel {

    table: string = 'worker_queue';

    static QUEUE_NAME = 'queueName';

    static EVENT_NAME = 'eventName';

    static PAYLOAD = 'payload';

    static ATTEMPTS = 'attempts';

    static RETRIES = 'retries';

    static CREATED_AT = 'createdAt';

    static UPDATED_AT = 'updatedAt';

    static DELETED_AT = 'deletedAt';

    static ERROR = 'error';

    static FAILED_AT = 'failedAt';

    /**
     * The list of date fields.
     *
     * @type {string[]}
     */
    dates = [
        'createdAt',
        'updatedAt',
        'deletedAt',
        'failedAt'
    ]

    /**
     * The list of fields.
     *
     * @type {string[]}
     */
    fields = [
        WorkerModel.QUEUE_NAME,
        WorkerModel.EVENT_NAME,
        WorkerModel.PAYLOAD,
        WorkerModel.ATTEMPTS,
        WorkerModel.RETRIES,
        WorkerModel.CREATED_AT,
        WorkerModel.UPDATED_AT,
        WorkerModel.DELETED_AT,
        WorkerModel.ERROR,
        WorkerModel.FAILED_AT
    ]

    protected casts?: Record<string, TCastableType> | undefined = {
        payload: 'object'
    }

    constructor(data: WorkerModelAttributes) {
        super({...initialWorkerModalData, ...data}); 
    }

    getPayload<T = unknown>(): T | null {
        try {
            const json = this.getAttributeSync('payload');

            if(typeof json === 'string') {
                return JSON.parse(json) as T
            }

            if(typeof json === 'object') {
                return json as T
            }

            throw new Error('Invalid payload')
        }
        // eslint-disable-next-line no-unused-vars
        catch (err) {
            return null
        }
    }

    getWorkerData<T extends IWorkerAttributes = IWorkerAttributes>(): T | null {
        return this.getAttributes() as T | null
    }
    createWorkerData(data: IWorkerAttributes): Promise<void> {
        return new WorkerModel(data as WorkerModelAttributes).save()
    }

    async saveWorkerData(): Promise<void> {
        return await this.save()
    }

    async updateWorkerData(data: IWorkerAttributes): Promise<void> {
        for(const field of Object.keys(data)) {
            this.attrSync(field as keyof WorkerModelAttributes, data[field])
        }
        return await this.save()
    }

    async deleteWorkerData(): Promise<void> {
        return await this.delete()
    }
}

export default WorkerModel;