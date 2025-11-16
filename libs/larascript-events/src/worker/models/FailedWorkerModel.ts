import WorkerModel from "./WorkerModel.js";

/**
 * FailedWorkerModel class.
 * 
 * Represents a worker model that has failed to process successfully.
 * This model stores failed worker data in a separate table for tracking
 * and debugging purposes.
 * 
 * @class FailedWorkerModel
 * @extends WorkerModel
 */
export class FailedWorkerModel extends WorkerModel {
    table: string = 'failed_worker_queue';
}

export default FailedWorkerModel;