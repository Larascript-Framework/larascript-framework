import { BaseAdapterTypes } from "@ben-shepherd/larascript-core";

export interface StorageAdapters extends BaseAdapterTypes {
    fileSystem: unknown;
    s3: unknown;
}