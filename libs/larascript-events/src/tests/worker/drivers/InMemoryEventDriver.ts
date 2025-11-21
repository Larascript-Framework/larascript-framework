import { AppSingleton } from "@larascript-framework/larascript-core";
import { generateUuidV4 } from "@larascript-framework/larascript-utils";
import { EVENT_DRIVERS, IBaseEvent, IEventDriver, IEventService, TSerializableValues, WorkerService } from "../../../events/index.js";

class InMemoryEventDriver implements IEventDriver {

    name: keyof typeof EVENT_DRIVERS = EVENT_DRIVERS.SYNC as keyof typeof EVENT_DRIVERS;

    private eventService!: IEventService;

    setEventService(eventService: IEventService): void {
        this.eventService = eventService;
    }

    getName(): string {
        return 'in-memory';
    }

    async dispatch(event: IBaseEvent): Promise<void> {
        
        const worker = (AppSingleton.container('workerService') as WorkerService).getFactory().createWorkerModel({
            id: generateUuidV4(),
            payload: event.getPayload() as TSerializableValues,
            queueName: event.getQueueName(),
            eventName: event.getName(),
            attempts: 0,
            retries: 3,
            createdAt: new Date(),
            updatedAt: new Date(),
        });
        await worker.saveWorkerData();

    }
}

export default InMemoryEventDriver;