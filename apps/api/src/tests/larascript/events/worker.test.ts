import { app } from "@/core/services/App.js";
import testHelper from "@/tests/testHelper.js";
import { describe } from "@jest/globals";
import {
  BaseEvent,
  EventRegistry,
  EventService,
  FailedWorkerModel,
  IEventService,
  IWorkerModel,
  IWorkerService,
  WorkerModel,
  WorkerService,
} from "@larascript-framework/larascript-events";

jest.setTimeout(100000);

class TestEvent extends BaseEvent<{
  foo: string;
  bar?: object;
  arr?: string[];
}> {
  queueName: string = "testing";

  constructor(payload: { foo: string; bar?: object; arr?: string[] }) {
    super(payload);
    this.useQueableDriver();
  }
}

class TestEventFailed extends BaseEvent<{
  foo: string;
  bar?: object;
  arr?: string[];
}> {
  queueName: string = "testing";

  constructor(payload: { foo: string; bar?: object; arr?: string[] }) {
    super(payload);
    this.useQueableDriver();
  }

  async execute(): Promise<void> {
    throw new Error("Test error");
  }
}

describe("Worker Test Suite", () => {
  let eventService: IEventService;
  let workerService: IWorkerService;

  beforeAll(async () => {
    EventRegistry.register(TestEvent);
    EventRegistry.register(TestEventFailed);

    await testHelper.testBootApp();

    eventService = app("events");
    workerService = app("events.worker");
  });

  beforeEach(async () => {
    await app("db").schema().dropTable(WorkerModel.getTable());
    await app("db").schema().dropTable(FailedWorkerModel.getTable());

    await app("db")
      .schema()
      .createTable(WorkerModel.getTable(), workerService.getSequelizeSchema());
    await app("db")
      .schema()
      .createTable(
        FailedWorkerModel.getTable(),
        workerService.getSequelizeSchema(),
      );
  });

  test("bound services", async () => {
    expect(eventService).toBeInstanceOf(EventService);
    expect(workerService).toBeInstanceOf(WorkerService);
  });

  test("can store event in worker repository", async () => {
    await eventService.dispatch(
      new TestEvent({ foo: "bar", bar: { baz: "qux" }, arr: ["qux", "quux"] }),
    );

    const record = await workerService.getRepository().getWorkers();

    expect(record.length).toBe(1);
    expect(record[0].getWorkerData()?.payload).toEqual({
      foo: "bar",
      bar: { baz: "qux" },
      arr: ["qux", "quux"],
    });
    expect(record[0].getWorkerData()?.attempts).toBe(0);
    expect(record[0].getWorkerData()?.retries).toBe(3);
    expect(record[0].getWorkerData()?.queueName).toBe("testing");
    expect(record[0].getWorkerData()?.eventName).toBe("TestEvent");
  });

  test("should be moved to failed workers repository after multiple attempts", async () => {
    await eventService.dispatch(
      new TestEventFailed({
        foo: "bar",
        bar: { baz: "qux" },
        arr: ["qux", "quux"],
      }),
    );

    let workers: IWorkerModel[] = [];

    for (let i = 0; i < 3; i++) {
      await workerService.runWorker({
        queueName: "testing",
        retries: 3,
      });

      if (i < 2) {
        workers = await workerService.getRepository().getWorkers();
        expect(workers[0].getWorkerData()?.attempts).toBe(i + 1);
      }
    }

    workers = await workerService.getRepository().getWorkers();
    expect(workers.length).toBe(0);

    const failedWorkers = await workerService
      .getRepository()
      .getFailedWorkers();
    expect(failedWorkers.length).toBe(1);
    expect(failedWorkers[0].getWorkerData()?.payload).toEqual({
      foo: "bar",
      bar: { baz: "qux" },
      arr: ["qux", "quux"],
    });
    expect(failedWorkers[0].getWorkerData()?.attempts).toBe(3);
    expect(failedWorkers[0].getWorkerData()?.retries).toBe(3);
  });
});
