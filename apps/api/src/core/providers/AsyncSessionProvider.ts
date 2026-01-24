import { AsyncSessionService } from "@larascript-framework/async-session";
import { AbstractProvider } from "@larascript-framework/bootstrap";

class AsyncSessionProvider extends AbstractProvider {
  async register(): Promise<void> {
    this.bind("asyncSession", new AsyncSessionService());
  }
}

export default AsyncSessionProvider;
