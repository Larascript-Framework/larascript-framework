import { IStorageFile, IStorageFileOptions } from "../interfaces/index.js";



/**
 * Represents a file stored in the storage system with its URL and source information.
 */
export class StorageFile<Meta extends object = object> implements IStorageFile<Meta> {
  /** The URL where the file can be accessed */
  key: string;

  /** The source identifier or path of the file */
  source!: string | undefined;

  /** The object meta information */
  meta!: Meta | undefined;

  /**
   * Creates a new StorageFile instance
   * @param options - Configuration options for the storage file
   */
  constructor(options: IStorageFileOptions<Meta>) {
    this.key = options?.key;
    this.source = options?.source;
    this.meta = options?.meta;
  }

  /**
   * Sets the URL for the storage file
   * @param key - The URL where the file can be accessed
   * @returns The current StorageFile instance for method chaining
   */
  setKey(key: string) {
    this.key = key;
    return this;
  }

  /**
   * Gets the URL of the storage file
   * @returns The URL where the file can be accessed
   */
  getKey(): string {
    return this.key;
  }

  /**
   * Sets the source identifier for the storage file
   * @param source - The source identifier or path of the file
   * @returns The current StorageFile instance for method chaining
   */
  setSource(source: string) {
    this.source = source;
    return this;
  }

  /**
   * Gets the source identifier of the storage file
   * @returns The source identifier or path of the file, or undefined if not set
   */
  getSource(): string | undefined {
    return this.source;
  }

  /**
   * Sets the meta information for the storage file
   * @param meta - The meta information object to be associated with the file
   * @returns The current StorageFile instance for method chaining
   */
  setMeta(meta: Meta) {
    this.meta = meta;
    return this;
  }

  /**
   * Gets the meta information associated with the storage file
   * @returns The meta information object, or undefined if not set
   */
  getMeta(): Meta | undefined {
    return this.meta as Meta;
  }

  /**
   * Get presigned URL for this file
   * @returns
   */
  getPresignedUrl(): string | undefined {
    if (this.meta) {
      const meta = this.meta as { presignedUrl?: string };

      if (meta.presignedUrl) {
        return meta.presignedUrl;
      }
    }

    return undefined;
  }

  /**
   * Get meta value
   * @param key
   * @returns
   */
  getMetaValue<T>(key: string): T | undefined {
    if (this.meta && this.meta?.[key]) {
      return this.meta[key] as T;
    }

    return undefined;
  }

  /**
   * Converts the StorageFile instance to a plain object representation.
   * @returns An object containing the url and source of the storage file.
   */
  toObject(): IStorageFileOptions<Meta> {
    return {
      key: this.key,
      source: this.source,
      meta: this.meta as Meta,
    }
  }
}

export default StorageFile;
