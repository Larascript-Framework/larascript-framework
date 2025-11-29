import {
  BaseEventSubscriber,
  EventRegistry,
} from "@larascript-framework/larascript-events";

class UserCreatedSubscriber extends BaseEventSubscriber {
  protected namespace: string = "auth";

  constructor(payload) {
    super(payload);
  }

  getQueueName(): string {
    return "default";
  }

  async execute(): Promise<void> {
    // const payload = this.getPayload<IUserData>();
    // Handle logic
  }
}

export default EventRegistry.registerSubscriber(UserCreatedSubscriber);
