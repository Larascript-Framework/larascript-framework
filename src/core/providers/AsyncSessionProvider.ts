import { AsyncSessionService } from "@ben-shepherd/async-session";
import { BaseProvider } from "@ben-shepherd/larascript-core";

class AsyncSessionProvider extends BaseProvider{

    async register(): Promise<void> {
        this.bind('asyncSession', new AsyncSessionService())
    }

}

export default AsyncSessionProvider
