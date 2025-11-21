import { IWorkerModel, IWorkerRepository } from "../../../worker/index.js";

export class InMemoryWorkerRepository implements IWorkerRepository {
    
    private workers: IWorkerModel[] = [];

    getWorkers(options?: Record<string, unknown>): Promise<IWorkerModel[]> {
        return Promise.resolve(this.workers.filter(w => w.getWorkerData()?.error === undefined));
    }

    getFailedWorkers(options?: Record<string, unknown>): Promise<IWorkerModel[]> {
        return Promise.resolve(this.workers.filter(w => w.getWorkerData()?.error !== undefined));
    }

    getWorker(id: string): IWorkerModel | null {
        return this.workers.find(w => w.getWorkerData()?.id === id) ?? null;
    }

    async createWorker(worker: IWorkerModel): Promise<IWorkerModel> {
        this.workers.push(worker);
        return worker;
    }

    async updateWorker(worker: IWorkerModel): Promise<IWorkerModel> {
        this.workers = this.workers.map(w => {
            if (w.getWorkerData()?.id === worker.getWorkerData()?.id) {
                return worker
            }
            return w;
        });
        return worker;
    }

    async deleteWorker(worker: IWorkerModel): Promise<void> {
        this.workers = this.workers.filter(w => w.getWorkerData()?.id !== worker.getWorkerData()?.id);
    }

    clear(): void {
        this.workers = [];
    }
}