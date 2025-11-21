export interface IStorageFile<Meta extends object = object> {
  key: string;
  source?: string;
  meta?: Meta;
  getKey(): string;
  getSource(): string | undefined;
  toObject(): IStorageFileOptions<Meta>;
  getPresignedUrl(): string | undefined;
  getMetaValue<T>(key: string): T | undefined;
}

/**
 * Configuration options for creating a StorageFile instance
 */
export type IStorageFileOptions<Meta extends object = object> = {
  key: string;
  source?: string;
  meta?: Meta;
};
