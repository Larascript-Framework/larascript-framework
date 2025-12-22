import { config } from "@/config/storage.config.js";
import { AbstractProvider } from "@larascript-framework/bootstrap";
import { StorageService } from "@larascript-framework/larascript-storage";

class StorageProvider extends AbstractProvider {
  async register(): Promise<void> {
    const storage = new StorageService(config);
    this.bind("storage", storage);
  }
}

export default StorageProvider;
