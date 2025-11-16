import { BaseAdapterTypes } from "@larascript-framework/larascript-core";
import { IGenericStorage } from "./IGenericStorage.js";

export interface IStorageAdapters extends BaseAdapterTypes {
  fileSystem: IGenericStorage;
  s3: IGenericStorage;
}
