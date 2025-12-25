import { AbstractProvider } from "@larascript-framework/bootstrap";
import {
  EVENT_DRIVERS,
  EventConfig,
  IEventConfig,
  IQueableDriverOptions,
  QueueableDriver,
  SyncDriver,
  WorkerModelFactory,
} from "@larascript-framework/larascript-events";

class TestEventProvider extends AbstractProvider {
  protected config: IEventConfig = {
    /**
     * Default Event Driver
     */
    defaultDriver: SyncDriver,

    /**
     * Event Drivers Configuration
     *
     * This object defines the available event drivers and their configurations.
     * Each driver can have its own set of options to customize its behavior.
     */
    drivers: {
      // Synchronous Driver: Processes events immediately
      [EVENT_DRIVERS.SYNC]: EventConfig.createConfigDriver(SyncDriver, {}),

      // Queue Driver: Saves events for background processing
      [EVENT_DRIVERS.QUEABLE]:
        EventConfig.createConfigDriver<IQueableDriverOptions>(QueueableDriver, {
          queueName: "default", // Name of the queue
          retries: 3, // Number of retry attempts for failed events
          runAfterSeconds: 10, // Delay before processing queued events
          workerCreator: WorkerModelFactory, // Constructor for creating worker models
        }),
    },

    /**
     * Event Listeners Configuration
     *
     * This array defines the listeners and their corresponding subscribers.
     * Each listener can have multiple subscribers that will be notified when the listener is triggered.
     */
    listeners: [],
  };
}

export default TestEventProvider;
