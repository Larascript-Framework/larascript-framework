import { BaseAdapter } from "@ben-shepherd/larascript-core";
import { TUploadedFile } from "@src/core/domains/http/interfaces/UploadedFile";
import StorageFile from "@src/core/domains/storage/data/StorageFile";
import { StorageTypes } from "@src/core/domains/storage/enums/StorageTypes";
import { IGenericStorage } from "@src/core/domains/storage/interfaces/IGenericStorage";
import { IStorageFile } from "@src/core/domains/storage/interfaces/IStorageFile";
import { IStorageService } from "@src/core/domains/storage/interfaces/IStorageService";
import { FileSystemMeta } from "@src/core/domains/storage/interfaces/meta";
import { StorageAdapters } from "@src/core/domains/storage/interfaces/StorageAdapters";
import { StorageConfig } from "@src/core/domains/storage/interfaces/StorageConfig";
import AmazonS3StorageService from "@src/core/domains/storage/services/AmazonS3StorageService";
import FileSystemStorageService from "@src/core/domains/storage/services/FileSystemStorageService";
import { app } from "@src/core/services/App";
import path from "path";

/**
 * Helper function to get the storage service instance from the application container
 * @returns {StorageService} The storage service instance
 */
export const storage = () => app('storage');

/**
 * Service class for handling file storage operations
 * Implements various storage adapters and provides methods for file management
 */
class StorageService extends BaseAdapter<StorageAdapters> implements IStorageService {

    /** Configuration for the storage service */
    config!: StorageConfig;

    /**
     * Creates a new instance of StorageService
     * @param {StorageConfig} config - The storage configuration object
     */
    constructor(config: StorageConfig) {
        super()
        this.config = config
    }

    /**
     * Gets the default storage adapter based on the configured driver
     * @returns {IGenericStorage} The configured storage adapter instance
     */
    public getDefaultAdapter(): IGenericStorage {
        return this.getAdapter(this.config.driver) as IGenericStorage
    }

    /**
     * Gets the specified storage driver
     * @param key 
     * @returns 
     */
    public driver(key: string): IGenericStorage {
        if(!this.adapters[key]) {
            throw new Error('Invalid driver: '+key)
        }

        return this.adapters[key] as IGenericStorage
    }

    /**
     * Stores a file in the storage system
     * @param {StorageFile} file - The file to store
     * @param {string} destination - The destination path where the file should be stored
     * @returns {Promise<StorageFile>} The stored file information
     */
    public async put(file: StorageFile, destination: string): Promise<IStorageFile> {
        return await this.getDefaultAdapter().put(file, destination)
    }

    /**
     * Retrieves a file from the storage system
     * @param {StorageFile} file - The file to retrieve
     * @returns {Promise<StorageFile>} The retrieved file information
     */
    public async get(file: StorageFile | string): Promise<IStorageFile> {
        return await this.getDefaultAdapter().get(file)
    }

    /**
     * Deletes a file from the storage system
     * @param {StorageFile} file - The file to delete
     * @returns {Promise<void>}
     */
    public async delete(file: StorageFile | string): Promise<void> {
        await this.getDefaultAdapter().delete(file)
    }

    /**
     * Moves an uploaded file to a specified destination
     */
    public async moveUploadedFile(file: TUploadedFile, destination?: string) {
        const fileStorage =  this.driver(StorageTypes.fs) as FileSystemStorageService
        return fileStorage.moveUploadedFile(file, destination)
    }

    /**
     * Gets the base storage directory path
     * @returns {string} The absolute path to the storage directory
     */
    public getStorageDirectory(): string {
        return path.join(process.cwd(), this.config.storageDir)
    }

    /**
     * Gets the uploads directory path
     * @returns {string} The absolute path to the uploads directory
     */
    public getUploadsDirectory(): string {
        return path.join(process.cwd(), this.config.uploadsDir)
    }

    /**
     * Creates a StorageFile instance from a given full file path.
     * @param {string} fullPath - The absolute path to the file.
     * @returns {StorageFile} The created StorageFile instance.
     */
    public toStorageFile(fullPath: string): StorageFile<FileSystemMeta> {
        return new StorageFile({
            key: fullPath.replace(this.getStorageDirectory(), ''),
            meta: {
                fullPath
            }
        })
    }

    /**
     * Gets the file system storage service instance
     * @returns {FileSystemStorageService} The file system storage service instance
     */
    public fileSystem(): FileSystemStorageService {
        return this.driver('fs') as FileSystemStorageService
    }

    /**
     * Gets the Amazon S3 storage service instance
     * @returns {AmazonS3StorageService} The Amazon S3 storage service instance
     */
    public s3(): AmazonS3StorageService {
        return this.driver('s3') as AmazonS3StorageService
    }

}

export default StorageService;

