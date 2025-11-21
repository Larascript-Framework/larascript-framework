import AWS from "aws-sdk";
import fs from "fs";
import path from "path";
import { BaseGenericStorage } from "../base/BaseGenericStorage.js";
import { StorageFile } from "../data/index.js";
import { StorageTypes } from "../enums/index.js";
import {
  FileNotFoundException,
  InvalidStorageFileException,
} from "../exceptions/index.js";
import {
  FileSystemMeta,
  IGenericStorage,
  IStorageFile,
  IStorageService,
  S3Meta,
} from "../interfaces/index.js";
import FileSystemStorageFileParser from "../parser/FileSystemStorageFileParser.js";
/**
 * Configuration interface for Amazon S3 storage service
 */
type Config = {
  /** AWS access key ID */
  accessKeyId: string;

  /** AWS secret access key */
  secretAccessKey: string;

  /** S3 bucket name */
  bucket: string;

  /** AWS region */
  region: string;
};

/**
 * Service class for handling file storage operations with Amazon S3
 * Implements the IGenericStorage interface for consistent storage operations
 *
 * @ref https://docs.aws.amazon.com/sdk-for-javascript/v3/developer-guide/javascript_s3_code_examples.html
 */
export class AmazonS3StorageService
  extends BaseGenericStorage
  implements IGenericStorage
{
  parser = new FileSystemStorageFileParser();

  /** Configuration object for AWS S3 */
  config!: Config;

  /**
   * Creates an instance of AmazonS3StorageService
   * @param config - Configuration object containing AWS credentials and bucket information
   */
  constructor(storageService: IStorageService, config: Config) {
    super(storageService);
    this.config = config;
  }

  /**
   * Initializes and returns an AWS S3 client instance with configured credentials
   * @returns {AWS.S3} Configured AWS S3 client instance
   */
  protected getS3(): AWS.S3 {
    AWS.config.update({
      accessKeyId: this.config.accessKeyId,
      secretAccessKey: this.config.secretAccessKey,
      region: this.config.region,
    });
    return new AWS.S3();
  }

  /**
   * Gets the storage directory path (for compatibility with file system operations)
   * @returns {string} The storage directory path
   */
  protected getStorageDirectory(): string {
    return path.join(process.cwd(), "storage");
  }

  /**
   * Retrieves a file from S3 storage
   * @param file - StorageFile object containing file information
   * @returns Promise resolving to the retrieved StorageFile with presigned URL
   */
  async get(
    file: StorageFile | string,
    additionalParams?: object,
  ): Promise<StorageFile<S3Meta>> {
    const Key = this.parseStorageFileOrS3Key(file);

    return new Promise((resolve, reject) => {
      const s3 = this.getS3();
      const params = {
        ...(additionalParams ?? {}),
        Bucket: this.config.bucket,
        Key,
      };

      s3.getSignedUrl("getObject", params, (err, presignedUrl) => {
        if (err) {
          reject(err);
          return;
        }

        resolve(
          this.createStorageFile(Key, {
            meta: { presignedUrl },
          }),
        );
      });
    });
  }

  /**
   * Uploads a file to S3 storage
   * @param file - StorageFile object containing the file to upload
   * @param destination - Optional custom destination path in S3 bucket. If not provided, generates a timestamp-based path with test prefix
   * @returns Promise resolving to the uploaded StorageFile with S3 metadata
   * @throws {FileNotFoundException} When the source file does not exist
   */
  async put(
    file: IStorageFile<FileSystemMeta> | string,
    destination?: string,
  ): Promise<StorageFile<S3Meta>> {
    const parsedFile = this.parser.parseStorageFileOrString(
      file,
      this.getStorageDirectory(),
    );

    if (!destination) {
      destination = `test-uploads/${new Date().getTime().toString()}/${path.basename(parsedFile.getKey())}`;
    }

    return new Promise((resolve, reject) => {
      const filePath = parsedFile.getMetaValue<string>("fullPath");

      if (!filePath) {
        throw new InvalidStorageFileException("fullPath not configured");
      }

      if (!fs.existsSync(filePath)) {
        throw new FileNotFoundException();
      }

      const s3 = this.getS3();
      const fileStream = fs.createReadStream(filePath);

      fileStream.on("error", (err) => {
        reject(err);
      });

      const params = {
        Bucket: this.config.bucket,
        Body: fs.createReadStream(filePath),
        Key: destination,
      };

      s3.upload(params, (err, data) => {
        if (err) {
          reject(err);
          return;
        }
        if (data) {
          const meta = data as S3Meta;

          if (!meta.Key) {
            throw new InvalidStorageFileException(
              "Expected meta.Key to be set",
            );
          }

          resolve(
            this.createStorageFile(meta.Key as string, {
              meta,
            }),
          );
        }
      });
    });
  }

  /**
   * Deletes a file from S3 storage
   * @param file - StorageFile object containing the file to delete
   * @returns Promise that resolves when deletion is complete
   */
  async delete(file: StorageFile<S3Meta> | string): Promise<void> {
    const parsedFile = this.parser.parseStorageFileOrStringS3(file);

    return new Promise((resolve, reject) => {
      const Key = parsedFile.getKey();
      const s3 = this.getS3();
      const params = {
        Bucket: this.config.bucket,
        Key,
      };

      s3.deleteObject(params, (err) => {
        if (err) {
          reject(err);
          return;
        }

        resolve();
      });
    });
  }

  /**
   * Deletes all objects with a specific prefix from S3 storage
   * @param prefix - The prefix to match objects for deletion
   * @returns Promise that resolves when deletion is complete
   */
  async deleteObjectsWithPrefix(prefix: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const s3 = this.getS3();

      // First, list all objects with the prefix
      const listParams = {
        Bucket: this.config.bucket,
        Prefix: prefix,
      };

      s3.listObjectsV2(listParams, (err, data) => {
        if (err) {
          reject(err);
          return;
        }

        if (!data.Contents || data.Contents.length === 0) {
          resolve();
          return;
        }

        // Prepare objects for deletion
        const deleteParams = {
          Bucket: this.config.bucket,
          Delete: {
            Objects: data.Contents.map((obj) => ({ Key: obj.Key! })),
            Quiet: false,
          },
        };

        // Delete all objects
        s3.deleteObjects(deleteParams, (deleteErr) => {
          if (deleteErr) {
            reject(deleteErr);
            return;
          }

          resolve();
        });
      });
    });
  }

  /**
   * Determines the s3 key from the given file parameter.
   * @param file
   * @returns
   */
  protected parseStorageFileOrS3Key(file: StorageFile | string): string {
    if (typeof file === "object") {
      return file.getKey();
    }

    if (typeof file === "string") {
      return file;
    }

    throw new Error(
      "Unable to determine s3 key from parameter. Expected string or object. Got: " +
        typeof file,
    );
  }

  /**
   * Creates a StorageFile instance with S3-specific metadata
   * @param options - Object containing file URL and metadata
   * @returns New StorageFile instance configured for S3 storage
   */
  createStorageFile(key: string, options) {
    return new StorageFile({
      ...options,
      key,
      source: StorageTypes.s3,
    });
  }
}

export default AmazonS3StorageService;
