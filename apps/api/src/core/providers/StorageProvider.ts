import { config } from "@/config/storage.config.js";
import { BaseProvider } from '@larascript-framework/larascript-core';
import { StorageService } from '@larascript-framework/larascript-storage';


class StorageProvider extends BaseProvider {

    async register(): Promise<void> {
        const storage = new StorageService(config);
        this.bind('storage', storage);       
    }

}

export default StorageProvider;
