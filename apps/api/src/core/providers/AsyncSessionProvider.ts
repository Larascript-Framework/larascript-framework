import { AsyncSessionService } from "@larascript-framework/async-session";
import { BaseProvider } from "@larascript-framework/larascript-core";

class AsyncSessionProvider extends BaseProvider {
  async register(): Promise<void> {
    this.bind("asyncSession", new AsyncSessionService());
  }
}

export default AsyncSessionProvider;
