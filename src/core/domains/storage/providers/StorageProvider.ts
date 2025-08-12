import { BaseProvider } from '@ben-shepherd/larascript-core';
import { config } from '@src/config/storage.config';
import { StorageTypes } from "@src/core/domains/storage/enums/StorageTypes";
import AmazonS3StorageService from "@src/core/domains/storage/services/AmazonS3StorageService";
import FileSystemStorageService from "@src/core/domains/storage/services/FileSystemStorageService";
import StorageService from "@src/core/domains/storage/services/StorageService";

class StorageProvider extends BaseProvider {

    async register(): Promise<void> {
        const storage = new StorageService(config);
        storage.addAdapterOnce(StorageTypes.fs, new FileSystemStorageService());
        storage.addAdapterOnce(StorageTypes.s3, new AmazonS3StorageService(config.s3));
        this.bind('storage', storage);       
    }

}

export default StorageProvider;
