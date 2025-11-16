import { FailedWorkerModel, IWorkerModel, IWorkerRepository } from "../../worker/index.js";
import WorkerModel from "../models/WorkerModel.js";
import { WorkerServiceProvider } from "../services/index.js";

export class WorkerRepository implements IWorkerRepository {

    async getFailedWorkers(): Promise<IWorkerModel[]> {
        return (
            await WorkerServiceProvider.eloquentQueryBuilder().builder(FailedWorkerModel)
            .whereNotNull(WorkerModel.FAILED_AT)
            .orderBy(WorkerModel.CREATED_AT, 'asc')
            .get()
        ).toArray() as unknown as IWorkerModel[];
    }
    
    async getWorkers(): Promise<IWorkerModel[]> {
        return (
            await WorkerServiceProvider.eloquentQueryBuilder().builder(WorkerModel)
            .orderBy(WorkerModel.CREATED_AT, 'asc')
            .get()
        ).toArray() as unknown as IWorkerModel[];
    }

}