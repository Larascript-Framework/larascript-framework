import { IGenericStorage } from "./IGenericStorage.js";
import { IStorageConfig } from "./IStorageConfig.js";
import { IStorageFile } from "./IStorageFile.js";
import { IUploadedFile } from "./IUploadedFile.js";
import { FileSystemMeta } from "./meta.js";

/**
 * Interface for a storage service that extends generic storage capabilities.
 * Provides methods for handling uploaded files and managing storage directories.
 * This interface combines generic storage operations with file upload-specific functionality.
 */
export interface IStorageService extends IGenericStorage {
  /**
   * Gets the storage configuration
   * @returns {StorageConfig} The storage configuration object
   */
  getConfig(): IStorageConfig;

  /**
   * Gets a storage driver instance by key.
   * Allows switching between different storage drivers (e.g., local, S3, etc.).
   *
   * @param key - The identifier for the storage driver
   * @returns An instance of IGenericStorage for the specified driver
   */
  driver(key: string): IGenericStorage;

  /**
   * Moves an uploaded file from its temporary location to a permanent destination.
   * This method handles the file transfer and returns a storage file object.
   *
   * @param file - The uploaded file to move
   * @param destination - Optional destination path, if not provided uses default uploads directory
   * @returns A promise that resolves to an IStorageFile representing the moved file
   */
  moveUploadedFile(
    file: IUploadedFile,
    destination?: string,
  ): Promise<IStorageFile>;

  /**
   * Gets the base storage directory path.
   * This is the root directory where all storage operations occur.
   *
   * @returns The absolute path to the storage directory
   */
  getStorageDirectory(): string;

  /**
   * Gets the uploads directory path.
   * This is the default directory where uploaded files are stored.
   *
   * @returns The absolute path to the uploads directory
   */
  getUploadsDirectory(): string;

  /**
   * Converts a full path to a storage file object.
   * @param fullPath - The full path to the file
   * @returns A StorageFile object representing the file
   */
  toStorageFile(fullPath: string): IStorageFile<FileSystemMeta>;

  /**
   * Gets the file system storage service instance.
   * @returns The file system storage service instance
   */
  fileSystem(): IGenericStorage;

  /**
   * Gets the S3 storage service instance.
   * @returns The S3 storage service instance
   */
  s3(): IGenericStorage;
}
