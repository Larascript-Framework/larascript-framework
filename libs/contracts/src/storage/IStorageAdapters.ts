import { BaseAdapterTypes } from "../core/adapters.js";
import { IGenericStorage } from "./IGenericStorage.js";

export interface IStorageAdapters extends BaseAdapterTypes {
  fileSystem: IGenericStorage;
  s3: IGenericStorage;
}
