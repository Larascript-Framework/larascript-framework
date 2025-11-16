import { AppSingleton } from "@larascript-framework/larascript-core";
import { IWorkerAttributes, IWorkerModel, WorkerService } from "../../../worker/index.js";
import { InMemoryWorkerRepository } from "../repository/InMemoryWorkerRepository.js";

class TestWorkerModel implements IWorkerModel {

    constructor(private attributes: IWorkerAttributes) {}

    private repository() {
        return (AppSingleton.container('workerService') as WorkerService).getRepository() as InMemoryWorkerRepository;
    }

    async saveWorkerData(): Promise<void> {
        const inMemoryWorkerRepository = this.repository();

        const exists = inMemoryWorkerRepository.getWorker(this.attributes.id ?? '');

        if (exists) {
            await inMemoryWorkerRepository.updateWorker(this);
        } else {
            await inMemoryWorkerRepository.createWorker(this);
        }
    }

    async deleteWorkerData(): Promise<void> {
        const inMemoryWorkerRepository = this.repository();
        await inMemoryWorkerRepository.deleteWorker(this);
    }

    async updateWorkerData(data: IWorkerAttributes): Promise<void> {
        this.attributes = data;
        const inMemoryWorkerRepository = this.repository();
        await inMemoryWorkerRepository.updateWorker(this);
    }

    getWorkerData<T extends IWorkerAttributes = IWorkerAttributes>(): T | null {
        return this.attributes as T;
    }

    createWorkerData(data: IWorkerAttributes): Promise<void> {
        this.attributes = data;
        return Promise.resolve();
    }
}

export default TestWorkerModel;