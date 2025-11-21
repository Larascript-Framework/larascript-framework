import { BaseAdapter } from "@larascript-framework/larascript-core";
import path from "path";
import StorageFile from "../data/StorageFile.js";
import { StorageTypes } from "../enums/StorageTypes.js";
import {
  FileSystemMeta,
  IGenericStorage,
  IStorageAdapters,
  IStorageConfig,
  IStorageFile,
  IStorageService,
  IUploadedFile,
} from "../interfaces/index.js";
import AmazonS3StorageService from "./AmazonS3StorageService.js";
import FileSystemStorageService from "./FileSystemStorageService.js";

/**
 * Service class for handling file storage operations
 * Implements various storage adapters and provides methods for file management
 */
export class StorageService
  extends BaseAdapter<IStorageAdapters>
  implements IStorageService
{
  /**
   * Creates a new instance of StorageService
   * @param {IStorageConfig} config - The storage configuration object
   */
  constructor(protected readonly config: IStorageConfig) {
    super();
    this.config = config;
    this.addAdapterOnce(StorageTypes.fs, new FileSystemStorageService(this));
    this.addAdapterOnce(
      StorageTypes.s3,
      new AmazonS3StorageService(this, config.s3),
    );
  }

  /**
   * Gets the storage service instance
   * @returns {IStorageService} The storage service instance
   */
  getStorageService(): IStorageService {
    return this;
  }

  /**
   * Gets the storage configuration
   * @returns {IStorageConfig} The storage configuration object
   */
  public getConfig(): IStorageConfig {
    return this.config;
  }

  /**
   * Gets the default storage adapter based on the configured driver
   * @returns {IGenericStorage} The configured storage adapter instance
   */
  public getDefaultAdapter(): IGenericStorage {
    return this.getAdapter(this.config.driver) as IGenericStorage;
  }

  /**
   * Gets the specified storage driver
   * @param key
   * @returns
   */
  public driver(key: string): IGenericStorage {
    if (!this.adapters[key]) {
      throw new Error("Invalid driver: " + key);
    }

    return this.adapters[key] as IGenericStorage;
  }

  /**
   * Stores a file in the storage system
   * @param {StorageFile} file - The file to store
   * @param {string} destination - The destination path where the file should be stored
   * @returns {Promise<StorageFile>} The stored file information
   */
  public async put(
    file: StorageFile,
    destination: string,
  ): Promise<IStorageFile> {
    return await this.getDefaultAdapter().put(file, destination);
  }

  /**
   * Retrieves a file from the storage system
   * @param {StorageFile} file - The file to retrieve
   * @returns {Promise<StorageFile>} The retrieved file information
   */
  public async get(file: StorageFile | string): Promise<IStorageFile> {
    return await this.getDefaultAdapter().get(file);
  }

  /**
   * Deletes a file from the storage system
   * @param {StorageFile} file - The file to delete
   * @returns {Promise<void>}
   */
  public async delete(file: StorageFile | string): Promise<void> {
    await this.getDefaultAdapter().delete(file);
  }

  /**
   * Moves an uploaded file to a specified destination
   */
  public async moveUploadedFile(file: IUploadedFile, destination?: string) {
    const fileStorage = this.driver(
      StorageTypes.fs,
    ) as FileSystemStorageService;
    return fileStorage.moveUploadedFile(file, destination);
  }

  /**
   * Gets the base storage directory path
   * @returns {string} The absolute path to the storage directory
   */
  public getStorageDirectory(): string {
    return path.join(process.cwd(), this.config.storageDir);
  }

  /**
   * Gets the uploads directory path
   * @returns {string} The absolute path to the uploads directory
   */
  public getUploadsDirectory(): string {
    return path.join(process.cwd(), this.config.uploadsDir);
  }

  /**
   * Creates a StorageFile instance from a given full file path.
   * @param {string} fullPath - The absolute path to the file.
   * @returns {StorageFile} The created StorageFile instance.
   */
  public toStorageFile(fullPath: string): IStorageFile<FileSystemMeta> {
    return new StorageFile({
      key: fullPath.replace(this.getStorageDirectory(), ""),
      meta: {
        fullPath,
      },
    });
  }

  /**
   * Gets the file system storage service instance
   * @returns {FileSystemStorageService} The file system storage service instance
   */
  public fileSystem(): IGenericStorage {
    return this.driver("fs") as IGenericStorage;
  }

  /**
   * Gets the Amazon S3 storage service instance
   * @returns {AmazonS3StorageService} The Amazon S3 storage service instance
   */
  public s3(): IGenericStorage {
    return this.driver("s3");
  }
}

export default StorageService;
