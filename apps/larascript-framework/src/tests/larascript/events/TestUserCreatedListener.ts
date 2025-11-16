
import { BaseEventListener, EventRegistry } from "@larascript-framework/larascript-events";

class TestUserCreatedListener extends BaseEventListener {

    /**
     * Optional method to execute before the subscribers are dispatched.
     */
    async execute(): Promise<void> {

        // const payload = this.getPayload<IUserData>();

        // Handle logic
    }

}

export default EventRegistry.registerListener(TestUserCreatedListener);