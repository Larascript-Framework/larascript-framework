/* eslint-disable no-undef */
import { AbstractProvider, AppContainer, Kernel } from "@larascript-framework/bootstrap";
import { EnvironmentTesting } from '@larascript-framework/larascript-core';
import { BaseEvent, EventRegistry, EventService, TSerializableValues } from "../../events/index.js";
import { IWorkerAttributes, IWorkerModel, WorkerService } from "../../worker/index.js";
import InMemoryEventDriver from "./drivers/InMemoryEventDriver.js";
import { TestWorkerFactory } from "./factory/TestWorkerFactory.js";
import { InMemoryWorkerRepository } from "./repository/InMemoryWorkerRepository.js";

class TestEvent extends BaseEvent<{ foo: string }> {
    queueName: string = 'testing';

    constructor(payload: { foo: string }) {
        super(payload);
    }
}

class TestEventFailed extends BaseEvent<{ foo: string }> {

    queueName: string = 'testing';

    constructor(payload: { foo: string }) {
        super(payload);
    }

    async execute(): Promise<void> {
        throw new Error('Test error');
    }
}

describe('Worker', () => {

    beforeEach(async () => {
        Kernel.reset();
        
        const providers = [
            new class extends AbstractProvider {
                async register(): Promise<void> {
                    const eventService = new EventService({
                        defaultDriver: InMemoryEventDriver,
                        drivers: {
                            'in-memory': {
                                driver: InMemoryEventDriver,
                            }
                        },
                        listeners: [],
                    })
        
                    EventRegistry.register(TestEvent)
                    EventRegistry.register(TestEventFailed)
                    eventService.registerConfig();
        
                    const workerService = new WorkerService();
                    workerService.setEventService(eventService);
                    workerService.setWorkerRepository(new InMemoryWorkerRepository());
                    workerService.setWorkerFactory(new TestWorkerFactory());
        
                    this.bind('events', eventService);
                    this.bind('workerService', workerService);
                }
            }
        ]

        await Kernel.create({
            environment: EnvironmentTesting,
            providers: providers,
        }).boot({});
    })

    test('bound services', async () => {
        const eventService = AppContainer.container().resolve<EventService>('events');
        const workerService = AppContainer.container().resolve<WorkerService>('workerService');
        expect(eventService).toBeInstanceOf(EventService);
        expect(workerService).toBeInstanceOf(WorkerService);
    })

    test('InMemoryWorkerRepository basic CRUD', async () => {
        const repo = new InMemoryWorkerRepository();
        const date = new Date();

        // Create failed worker model
        const failedWorkerData: IWorkerAttributes = {
            id: 'worker-2',
            payload: { foo: 'bar' } as unknown as TSerializableValues,
            attempts: 0,
            retries: 3,
            queueName: 'test-queue',
            eventName: 'TestEventFailed',
            createdAt: date,
            updatedAt: date,
            error: 'Test error',
            failedAt: date,
        }

        // Create failed worker model
        const failedWorkerModel = AppContainer.container().resolve<WorkerService>('workerService').getFactory().createFailedWorkerModel(failedWorkerData);
        expect(failedWorkerModel.getWorkerData()?.id).toBe('worker-2');
        expect(failedWorkerModel.getWorkerData()?.error).toBe('Test error');

        // Update repo
        await repo.createWorker(failedWorkerModel);

        // Assert failed worker model
        const failedWorkers = await repo.getFailedWorkers();
        expect(failedWorkers.length).toBe(1);
        expect(failedWorkers[0].getWorkerData()?.id).toBe('worker-2');
        expect(failedWorkers[0].getWorkerData()?.error).toBe('Test error');

        repo.clear()

        // Create a mock worker model
        const workerData: IWorkerAttributes = {
            id: 'worker-1',
            payload: { foo: 'bar' } as unknown as TSerializableValues,
            attempts: 0,
            retries: 3,
            queueName: 'test-queue',
            eventName: 'TestEvent',
            createdAt: date,
            updatedAt: date,
        };

        const workerModel = AppContainer.container().resolve<WorkerService>('workerService').getFactory().createWorkerModel(workerData);
        expect(workerModel.getWorkerData()?.id).toBe('worker-1');
        expect(workerModel.getWorkerData()?.payload).toEqual({ foo: 'bar' });
        expect(workerModel.getWorkerData()?.attempts).toBe(0);
        expect(workerModel.getWorkerData()?.retries).toBe(3);
        expect(workerModel.getWorkerData()?.queueName).toBe('test-queue');
        expect(workerModel.getWorkerData()?.eventName).toBe('TestEvent');
        expect(workerModel.getWorkerData()?.createdAt).toEqual(date);
        expect(workerModel.getWorkerData()?.updatedAt).toEqual(date);

        // Create
        await repo.createWorker(workerModel);
        let allWorkers = await repo.getWorkers();
        expect(allWorkers.length).toBe(1);
        expect(allWorkers[0].getWorkerData()?.id).toBe('worker-1');

        // Get
        const found = repo.getWorker('worker-1');
        expect(found).not.toBeNull();
        expect(found?.getWorkerData()?.id).toBe('worker-1');

        // Update
        await workerModel.updateWorkerData({ ...workerData, attempts: 1 });
        await repo.updateWorker(workerModel);
        allWorkers = await repo.getWorkers();
        expect(allWorkers.length).toBe(1);
        expect(allWorkers[0].getWorkerData()?.id).toBe('worker-1');
        expect(allWorkers[0].getWorkerData()?.attempts).toBe(1);

        // Delete
        await repo.deleteWorker(workerModel);
        allWorkers = await repo.getWorkers();
        expect(allWorkers.length).toBe(0);
    });

    test('WorkerService basic run', async () => {
        const workerService = AppContainer.container().resolve('workerService') as WorkerService;
        const eventService = AppContainer.container().resolve('events') as EventService;
        const repo = workerService.getRepository();

        await eventService.dispatch(
            new TestEvent({ foo: 'bar' })
        )
        
        // Assert worker has been created
        const workers = await repo.getWorkers();
        expect(workers.length).toBe(1);
        expect(workers[0].getWorkerData()?.payload).toEqual({ foo: 'bar' });
        expect(workers[0].getWorkerData()?.attempts).toBe(0);
        expect(workers[0].getWorkerData()?.retries).toBe(3);
        expect(workers[0].getWorkerData()?.queueName).toBe('testing');
        expect(workers[0].getWorkerData()?.eventName).toBe('TestEvent');
        expect(workers[0].getWorkerData()?.createdAt).toBeDefined();
        expect(workers[0].getWorkerData()?.updatedAt).toBeDefined();
        expect(workers[0].getWorkerData()?.failedAt).toBeUndefined();

        // Run worker
        await workerService.runWorker({
            queueName: 'testing',
            retries: 3
        })

        // Assert worker is no longer in the repository
        const workersAfterRun = await repo.getWorkers();
        expect(workersAfterRun.length).toBe(0);
    })

    test('WorkerService basic run with failed worker', async () => {
        const workerService = AppContainer.container().resolve('workerService') as WorkerService;
        const eventService = AppContainer.container().resolve('events') as EventService;
        const repo = workerService.getRepository();

        await eventService.dispatch(
            new TestEventFailed({ foo: 'bar' })
        )
        
        // Assert worker has been created
        const workers = await repo.getWorkers();
        expect(workers.length).toBe(1);
        expect(workers[0].getWorkerData()?.payload).toEqual({ foo: 'bar' });
        expect(workers[0].getWorkerData()?.attempts).toBe(0);
        expect(workers[0].getWorkerData()?.retries).toBe(3);
        expect(workers[0].getWorkerData()?.queueName).toBe('testing');
        expect(workers[0].getWorkerData()?.eventName).toBe('TestEventFailed');
        

        // Run worker
        await workerService.runWorker({
            queueName: 'testing',
            retries: 3
        })

        // Assert attempt has been incremented
        const workersAfterRun = await repo.getWorkers();
        expect(workersAfterRun.length).toBe(1);
    })

    test('WorkerService basic run with failed worker and retries', async () => {
        const workerService = AppContainer.container().resolve('workerService') as WorkerService;
        const eventService = AppContainer.container().resolve('events') as EventService;
        const repo = workerService.getRepository();

        await eventService.dispatch(
            new TestEventFailed({ foo: 'bar' })
        )
        
        // Assert worker has been created
        const workers = await repo.getWorkers();
        expect(workers.length).toBe(1);
        expect(workers[0].getWorkerData()?.payload).toEqual({ foo: 'bar' });
        expect(workers[0].getWorkerData()?.attempts).toBe(0);
        expect(workers[0].getWorkerData()?.retries).toBe(3);
        expect(workers[0].getWorkerData()?.queueName).toBe('testing');
        expect(workers[0].getWorkerData()?.eventName).toBe('TestEventFailed');

        // Run worker (1st time)
        await workerService.runWorker({
                queueName: 'testing',
                retries: 3
        })

        // Assert worker has been updated
        let workersAfterRun: IWorkerModel[] = await repo.getWorkers();
        expect(workersAfterRun.length).toBe(1);
        expect(workersAfterRun[0].getWorkerData()?.attempts).toBe(1);

        // Run worker (2nd time)
        await workerService.runWorker({
            queueName: 'testing',
            retries: 3
        })

        // Assert worker has been updated
        workersAfterRun = await repo.getWorkers();
        expect(workersAfterRun.length).toBe(1);
        expect(workersAfterRun[0].getWorkerData()?.attempts).toBe(2);

        // Run worker (3rd time)
        await workerService.runWorker({
            queueName: 'testing',
            retries: 3
        })

        // Assert worker has been deleted
        workersAfterRun = await repo.getWorkers();
        expect(workersAfterRun.length).toBe(0);

        // Assert failed worker has been created
        const failedWorkers = await repo.getFailedWorkers();
        expect(failedWorkers.length).toBe(1);
        expect(failedWorkers[0].getWorkerData()?.eventName).toBe('TestEventFailed');
        expect(failedWorkers[0].getWorkerData()?.error).toContain('Test error');
        expect(failedWorkers[0].getWorkerData()?.attempts).toBe(3);
        expect(failedWorkers[0].getWorkerData()?.retries).toBe(3);
        expect(failedWorkers[0].getWorkerData()?.queueName).toBe('testing');
        expect(failedWorkers[0].getWorkerData()?.payload).toEqual({ foo: 'bar' });
        expect(failedWorkers[0].getWorkerData()?.createdAt).toBeDefined();
        expect(failedWorkers[0].getWorkerData()?.updatedAt).toBeDefined();
        expect(failedWorkers[0].getWorkerData()?.failedAt).toBeDefined();
    })

    test('WorkerService basic run with runAfterSeconds', async () => {
        const workerService = AppContainer.container().resolve('workerService') as WorkerService;
        const eventService = AppContainer.container().resolve('events') as EventService;

        await eventService.dispatch(
            new TestEvent({ foo: 'bar' })
        )

        // Run worker
        const timeStart = Date.now();
        await workerService.runWorker({
            queueName: 'testing',
            runAfterSeconds: 1,
            retries: 3
        })

        const timeEnd = Date.now();
        expect(timeEnd - timeStart).toBeGreaterThan(1000);
    })
})